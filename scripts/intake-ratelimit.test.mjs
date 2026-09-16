#!/usr/bin/env node
// Test-first (L8, in force 2026-08-09): written and observed FAILING before
// src/lib/rate-limit.ts existed, because there was nothing to import. Once the limiter landed
// this passed. Run: `npm run test` or `node --test scripts/intake-ratelimit.test.mjs`.
//
// Exercises the in-memory sliding-window limiter used by /api/intake directly (no HTTP, no
// server) — see src/lib/rate-limit.ts for what this is and is not a substitute for.
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit } from '../src/lib/rate-limit.ts';

test('the sixth submission from the same IP inside the 10-minute window is rejected', () => {
  const ip = '203.0.113.10';
  const now = Date.now();
  for (let i = 0; i < 5; i += 1) {
    assert.equal(checkRateLimit(ip, now + i), true, `submission ${i + 1} should be allowed`);
  }
  assert.equal(checkRateLimit(ip, now + 5), false, 'the 6th submission in the window should be rejected');
});

test('a different IP is unaffected by another IP exhausting its window', () => {
  const busyIp = '203.0.113.20';
  const freshIp = '203.0.113.21';
  const now = Date.now();
  for (let i = 0; i < 5; i += 1) checkRateLimit(busyIp, now + i);
  assert.equal(checkRateLimit(busyIp, now + 5), false, 'busyIp should be exhausted');
  assert.equal(checkRateLimit(freshIp, now + 5), true, 'freshIp should still be allowed');
});
