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

// /api/revenge-or-justice (2026-11-06): its own buckets, its own ceilings, nothing shared with intake.
import { checkLimitIn } from '../src/lib/rate-limit.ts';

test('the grader allows six readings an hour from one address and refuses the seventh', () => {
  const now = Date.now();
  for (let i = 0; i < 6; i += 1) assert.equal(checkLimitIn('grade-ip', '198.51.100.7', 6, 3600000, now + i), true, `reading ${i + 1}`);
  assert.equal(checkLimitIn('grade-ip', '198.51.100.7', 6, 3600000, now + 6), false, 'the seventh in the hour is refused');
  assert.equal(checkLimitIn('grade-ip', '198.51.100.7', 6, 3600000, now + 3600001), true, 'an hour later the window has moved on');
});

test('the grader’s buckets do not touch the intake limiter', () => {
  const now = Date.now();
  for (let i = 0; i < 6; i += 1) checkLimitIn('grade-ip', '198.51.100.8', 6, 3600000, now + i);
  assert.equal(checkRateLimit('198.51.100.8', now + 10), true, 'the same address can still send the intake form');
});

test('the day ceiling counts every address together', () => {
  const now = Date.now();
  for (let i = 0; i < 3; i += 1) assert.equal(checkLimitIn('day-test', 'all', 3, 86400000, now + i), true);
  assert.equal(checkLimitIn('day-test', 'all', 3, 86400000, now + 3), false, 'the fourth reading of the day is refused');
});
