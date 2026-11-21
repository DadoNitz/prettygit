import { execFileSync } from 'node:child_process';
import { fetchProfile as fetchWithToken } from './profile.mjs';

export { shapeProfile } from './profile.mjs';

// Token: GITHUB_TOKEN env, else the gh CLI login, else anonymous (60 req/h).
function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try { return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim(); } catch { return null; }
}

export const fetchProfile = (login) => fetchWithToken(login, token());
