#!/usr/bin/env node
// prettygit polish bot: picks an allowlisted repo, lets Claude Code polish its front-end, opens a DRAFT PR.
//   node bot/run.mjs [owner/repo] [--dry-run]   polish one repo (default: next from bot/targets.json)
//   node bot/run.mjs --discover                 list candidate repos (never opens PRs)
// Needs: gh (logged in, or GH_TOKEN), git, and Claude Code auth (ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN, or a local login).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BRANCH = `prettygit/polish-${new Date().toISOString().slice(0, 10)}`;
const sh = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], ...opts }).trim();
const gh = (...args) => sh('gh', args);

/** Pure: rotate through the allowlist by day, skipping repos that already have an open bot PR. */
export function pickTarget(repos, busy, day = Math.floor(Date.now() / 864e5)) {
  for (let i = 0; i < repos.length; i++) {
    const r = repos[(day + i) % repos.length];
    if (!busy.includes(r)) return r;
  }
  return null;
}

function openBotPrRepos(repos) {
  return repos.filter((r) => gh('pr', 'list', '-R', r, '--author', '@me', '--state', 'open', '--json', 'headRefName', '--jq', '[.[] | select(.headRefName | startswith("prettygit/polish"))] | length') !== '0');
}

function discover() {
  // Suggestions only: a human reviews them and adds welcoming repos to targets.json.
  const out = gh('search', 'repos', '--topic', 'landing-page', '--good-first-issues=>0', '--updated=>2026-01-01',
    '--stars=10..2000', '--sort', 'updated', '--limit', '20', '--json', 'fullName,description,stargazersCount,url');
  for (const r of JSON.parse(out)) console.log(`${r.fullName.padEnd(40)} ★${String(r.stargazersCount).padEnd(5)} ${r.description || ''}`);
  console.log('\nRead each repo\'s CONTRIBUTING first. Add only the ones that welcome UI PRs to bot/targets.json.');
}

function polish(repo, dryRun) {
  const { repos } = JSON.parse(readFileSync(join(ROOT, 'bot/targets.json'), 'utf8'));
  if (!repos.includes(repo)) throw new Error(`${repo} is not in bot/targets.json (allowlist).`);
  const me = gh('api', 'user', '--jq', '.login');
  const own = repo.split('/')[0].toLowerCase() === me.toLowerCase();
  const dir = join(ROOT, 'out/bot', repo.replace('/', '__'));
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dirname(dir), { recursive: true });
  gh('repo', 'clone', repo, dir, '--', '--depth', '50', '-q');
  const git = (...a) => sh('git', ['-C', dir, ...a]);
  git('checkout', '-q', '-b', BRANCH);

  console.log(`polishing ${repo} ...`);
  const env = { ...process.env };
  delete env.GH_TOKEN; delete env.GITHUB_TOKEN; // the agent never gets push rights
  // Uses an installed `claude` CLI (CI installs it with npm i -g @anthropic-ai/claude-code).
  execFileSync('claude', ['-p',
    `Follow the skill at ${join(ROOT, 'skills/frontend-polish/SKILL.md')} on the repository in the current directory.`,
    '--permission-mode', 'acceptEdits',
    '--allowedTools', 'Read,Edit,Write,Glob,Grep,Bash(npm ci),Bash(npm install),Bash(npm run *),Bash(npx *),Bash(node *),Bash(ls *),Bash(git diff*),Bash(git status*)',
  ], { cwd: dir, env, stdio: 'inherit', timeout: 30 * 60e3 });

  const titleFile = join(dir, '.prettygit/pr-title.txt');
  const title = existsSync(titleFile) ? readFileSync(titleFile, 'utf8').trim() : '';
  const body = join(dir, '.prettygit/pr-body.md');
  if (!title || title.startsWith('NO_CHANGE')) return console.log(`no PR: ${title || 'agent wrote no title'}`);
  const bodyText = readFileSync(body, 'utf8');
  rmSync(join(dir, '.prettygit'), { recursive: true, force: true });
  git('add', '-A');
  if (!git('status', '--porcelain')) return console.log('no PR: no file changes');
  git('commit', '-q', '-m', title);
  console.log(git('show', '--stat', '--oneline', 'HEAD'));
  if (dryRun) return console.log(`dry run: review the branch in ${dir}`);

  let head = BRANCH;
  if (!own) {
    gh('repo', 'fork', repo, '--clone=false');
    git('remote', 'add', 'fork', `https://github.com/${me}/${repo.split('/')[1]}.git`);
    git('push', '-q', 'fork', BRANCH);
    head = `${me}:${BRANCH}`;
  } else {
    git('push', '-q', 'origin', BRANCH);
  }
  console.log(gh('pr', 'create', '-R', repo, '--draft', '--head', head, '--title', title, '--body', bodyText));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  try {
    if (args.includes('--discover')) discover();
    else {
      const { repos } = JSON.parse(readFileSync(join(ROOT, 'bot/targets.json'), 'utf8'));
      const repo = args.find((a) => !a.startsWith('--')) || pickTarget(repos, openBotPrRepos(repos));
      if (!repo) console.log('every target already has an open bot PR; nothing to do');
      else polish(repo, args.includes('--dry-run'));
    }
  } catch (e) {
    console.error(`polish-bot: ${e.message}`);
    process.exitCode = 1;
  }
}
