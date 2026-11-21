import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shapeProfile } from '../src/github.mjs';
import { STYLES } from '../src/styles/index.mjs';
import { LABELS } from '../src/i18n.mjs';

const user = { login: 'ana', name: null, bio: '<script>x</script>', blog: 'ana.dev', html_url: 'https://github.com/ana', created_at: '2020-01-01' };
const repo = (name, stars, language, extra = {}) => ({ name, stargazers_count: stars, forks_count: 0, language, html_url: `u/${name}`, pushed_at: '2025-01-01', description: 'd', ...extra });

test('shapeProfile filters forks/profile repo, sorts by stars, computes languages', () => {
  const p = shapeProfile(user, [repo('a', 1, 'JS'), repo('b', 5, 'Go'), repo('f', 99, 'JS', { fork: true }), repo('ana', 50, 'MD')], null);
  assert.deepEqual(p.repos.map((r) => r.name), ['b', 'a']);
  assert.deepEqual(p.languages, [{ name: 'Go', percent: 50 }, { name: 'JS', percent: 50 }]);
  assert.equal(p.name, 'ana');
  assert.equal(p.blog, 'https://ana.dev');
  assert.equal(p.stars, 6);
});

test('every style escapes GitHub text and returns html + markdown', () => {
  const p = shapeProfile(user, [repo('a', 1, 'JS')], null);
  for (const s of Object.values(STYLES)) {
    const html = s.resume(p, { extra: {}, labels: LABELS.en });
    assert.ok(html.includes('<html'), s.id);
    assert.ok(!html.includes('<script>x'), `${s.id} must escape`);
    assert.equal(typeof s.readme(p), 'string');
  }
});
