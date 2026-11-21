import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickTarget } from '../bot/run.mjs';

test('pickTarget rotates by day and skips repos with an open bot PR', () => {
  const repos = ['a/1', 'a/2', 'a/3'];
  assert.equal(pickTarget(repos, [], 0), 'a/1');
  assert.equal(pickTarget(repos, [], 4), 'a/2');
  assert.equal(pickTarget(repos, ['a/2'], 4), 'a/3');
  assert.equal(pickTarget(repos, repos, 0), null);
});
