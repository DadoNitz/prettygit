#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';
import { fetchProfile } from '../src/github.mjs';
import { htmlToPdf } from '../src/pdf.mjs';
import { STYLES, getStyle } from '../src/styles/index.mjs';
import { LABELS } from '../src/i18n.mjs';

const USAGE = `prettygit <command> <user|profile.json> [options]

  fetch   <user>                 save GitHub data to out/<user>/profile.json
  readme  <user|json> --style S  write a profile README draft
  resume  <user|json> --style S  build resume HTML + PDF
  styles                         list styles

options: --style professional|aesthetic|direct|noir (default professional)
         --extra resume.json     extra data (resume: experience/education; readme: links/about/stack)
         --lang pt|en            resume labels (default pt)
         --out dir               output dir (default out/<user>)`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { style: { type: 'string', default: 'professional' }, extra: { type: 'string' }, lang: { type: 'string', default: 'pt' }, out: { type: 'string' } },
});
const [cmd, target] = positionals;

async function load(t) {
  if (!t) throw new Error('missing <user>\n\n' + USAGE);
  return t.endsWith('.json') ? JSON.parse(readFileSync(t, 'utf8')) : fetchProfile(t);
}

try {
  if (cmd === 'styles') {
    for (const s of Object.values(STYLES)) console.log(`${s.id.padEnd(14)} ${s.label}`);
  } else if (['fetch', 'readme', 'resume'].includes(cmd)) {
    const profile = await load(target);
    const out = values.out || join('out', profile.login);
    mkdirSync(out, { recursive: true });
    const save = (name, data) => { const p = join(out, name); writeFileSync(p, data); console.log(p); return p; };
    if (cmd === 'fetch') save('profile.json', JSON.stringify(profile, null, 2));
    const extra = values.extra ? JSON.parse(readFileSync(values.extra, 'utf8')) : {};
    if (cmd === 'readme') {
      const style = getStyle(values.style);
      save(`README.${values.style}.md`, style.readme(profile, { extra }));
      // Asset paths are relative to the README, so publish them next to it in <user>/<user>.
      for (const [path, data] of Object.entries(style.assets?.(profile, { extra }) || {})) {
        mkdirSync(join(out, dirname(path)), { recursive: true });
        save(path, data);
      }
    }
    if (cmd === 'resume') {
      const labels = LABELS[values.lang] || LABELS.pt;
      const html = getStyle(values.style).resume(profile, { extra, labels });
      save(`resume-${values.style}.html`, html);
      const pdf = join(out, `resume-${values.style}.pdf`);
      htmlToPdf(html, pdf);
      console.log(pdf);
    }
  } else {
    console.log(USAGE);
    process.exitCode = cmd ? 1 : 0;
  }
} catch (e) {
  console.error(`prettygit: ${e.message}`);
  process.exitCode = 1;
}
