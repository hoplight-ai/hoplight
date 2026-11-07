// The sign-in route refuses a flood of password guesses from one address (src/app/api/grant/route.ts).
// Security check SITESEC1, 2026-11-07. Run: node --test scripts/grant-ratelimit.test.mjs.
//
// The route file itself needs Next's module graph, so this test pins two things: the limiter the
// route calls behaves as the route expects (a 21st try in the window is refused, the window passes),
// and the route's text still calls it on the sign-in bucket before the password is checked.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkLimitIn } from '../src/lib/rate-limit.ts';

const ROUTE = fileURLToPath(new URL('../src/app/api/grant/route.ts', import.meta.url));
const MAX = 20;
const WINDOW = 15 * 60 * 1000;

test('grant: twenty tries from one address pass, the twenty-first is refused, and the window passes', () => {
  const t0 = 1_800_000_000_000;
  for (let i = 0; i < MAX; i += 1) assert.equal(checkLimitIn('grant-test', '203.0.113.9', MAX, WINDOW, t0 + i), true, `try ${i + 1}`);
  assert.equal(checkLimitIn('grant-test', '203.0.113.9', MAX, WINDOW, t0 + MAX), false);
  assert.equal(checkLimitIn('grant-test', '198.51.100.4', MAX, WINDOW, t0 + MAX), true, 'another address is not held by the first');
  assert.equal(checkLimitIn('grant-test', '203.0.113.9', MAX, WINDOW, t0 + WINDOW + 1), true, 'the window passes');
});

test('grant: the route checks the limit on its own bucket before the password', () => {
  const src = readFileSync(ROUTE, 'utf8');
  const limit = src.indexOf("checkLimitIn('grant-ip'");
  const grant = src.indexOf('grantFromForm(request');
  assert.ok(limit > 0, 'the route calls checkLimitIn on the grant-ip bucket');
  assert.ok(grant > limit, 'the limit is checked before the password');
  assert.match(src, /status: 429/);
  assert.match(src, /GRANT_LIMIT = \{ max: 20, windowMs: 15 \* 60 \* 1000 \}/);
});
