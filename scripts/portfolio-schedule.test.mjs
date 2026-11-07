// The portfolio's release schedule (src/data/tools.ts), tested with an injected clock. Whit,
// 2026-11-07: "launch portfolio page w 3 builds and i keep adding on a posting schedule." An entry
// shows only when its day has come in America/Los_Angeles AND it has passed the go-public checklist.
// Run: node --test scripts/portfolio-schedule.test.mjs (part of npm test).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOOLS, releaseInstant, visibleTools, portfolioClock } from '../src/data/tools.ts';

const at = (iso) => Date.parse(iso);
const slugs = (list) => list.map((t) => t.slug);
const GALLERY = [
  'dnc-autopsy-taken-apart',
  'agis-policy-search-aria',
  'ai-election-errors',
  'bet-appetit',
  'oregon-school-budget-report',
  'what-s-human',
  'which-ai-should-i-use',
  'worker-equity-dilution-at-ge',
];

test('schedule: from 2026-11-07 the page shows Gut Check first, then the eight gallery pieces in their old order', () => {
  // Whit, 2026-11-07: "get gut punch up early" (Gut Check, moved up from 2026-11-10).
  assert.deepEqual(slugs(visibleTools(at('2026-11-06T23:59:00-08:00'))), GALLERY);
  assert.deepEqual(slugs(visibleTools(at('2026-11-07T12:00:00-08:00'))), ['gut-check', ...GALLERY]);
});

test('schedule: the eight gallery pieces keep their words exactly', () => {
  const byslug = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));
  assert.equal(byslug['dnc-autopsy-taken-apart'].line, 'The party’s own 2024 after-action report, argued from its own numbers.');
  assert.equal(byslug['what-s-human'].href, 'https://whatshuman.vercel.app');
  assert.equal(byslug['bet-appetit'].line, 'Bet tracker skinned as the Michelin Guide. Bets paid in dinners. Demo copy with invented data.');
  for (const s of GALLERY) assert.equal(byslug[s].cleared, true, s);
});

test('schedule: a day starts at midnight Los Angeles time, standard and daylight', () => {
  assert.equal(releaseInstant('2026-11-10'), at('2026-11-10T00:00:00-08:00'));
  assert.equal(releaseInstant('2026-07-04'), at('2026-07-04T00:00:00-07:00'));
  assert.equal(releaseInstant('not a date'), Number.POSITIVE_INFINITY);
});

test('schedule: an uncleared entry never shows, even on its day', () => {
  const list = visibleTools(at('2026-11-10T09:00:00-08:00'));
  assert.ok(!slugs(list).includes('undo'));
  assert.ok(!slugs(list).includes('revenge-or-justice'));
});

test('schedule: a cleared entry shows from the first minute of its day, newest first', () => {
  const cleared = TOOLS.map((t) => (['undo', 'revenge-or-justice'].includes(t.slug) ? { ...t, cleared: true } : t));
  assert.deepEqual(slugs(visibleTools(at('2026-11-09T23:59:00-08:00'), cleared)), ['gut-check', ...GALLERY]);
  const day = slugs(visibleTools(at('2026-11-10T00:00:00-08:00'), cleared));
  assert.deepEqual(day.slice(0, 2), ['revenge-or-justice', 'undo']);
  assert.deepEqual(day.slice(2), ['gut-check', ...GALLERY]);
});

test('schedule: an entry that replaces another takes its place once it shows, never both', () => {
  const next = { ...TOOLS.find((t) => t.slug === 'which-ai-should-i-use'), slug: 'which-ai-next', releaseAt: '2027-01-06', cleared: true, replaces: 'which-ai-should-i-use' };
  const list = [...TOOLS, next];
  const before = slugs(visibleTools(at('2027-01-05T12:00:00-08:00'), list));
  assert.ok(before.includes('which-ai-should-i-use') && !before.includes('which-ai-next'));
  const after = slugs(visibleTools(at('2027-01-06T08:00:00-08:00'), list));
  assert.ok(after.includes('which-ai-next') && !after.includes('which-ai-should-i-use'));
});

test('schedule: Which AI is one tool with one preview card (visual review, 2026-11-07)', () => {
  const which = TOOLS.filter((t) => /which ai/i.test(t.name));
  assert.deepEqual(which.map((t) => t.slug), ['which-ai-should-i-use']);
});

test('cards: every tool card carries one picture from its own first screen, and no thumbnail is left', () => {
  for (const t of TOOLS) {
    assert.notEqual(t.brand.glyph, 'none', t.slug);
    assert.ok(!('thumb' in t), `${t.slug} still has a thumb`);
  }
  const grounds = new Set(TOOLS.map((t) => t.brand.ground));
  assert.ok(!TOOLS.some((t) => t.brand.ground === '#0F1B2D' && t.slug !== 'gut-check'), 'only Gut Check is navy, as its app is');
  assert.ok(grounds.size >= 6, `${grounds.size} distinct grounds`);
});

test('schedule: the posting calendar dates', () => {
  const byslug = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));
  assert.equal(byslug['rumi'].releaseAt, '2026-11-24');
  assert.equal(byslug['letters'].releaseAt, '2026-12-09');
  for (const s of ['revenge-or-justice', 'undo']) assert.equal(byslug[s].releaseAt, '2026-11-10');
  assert.equal(byslug['gut-check'].releaseAt, '2026-11-07');
  assert.equal(byslug['gut-check'].cleared, true);
});

test('schedule: the preview clock is ignored in production and honoured elsewhere', () => {
  const real = at('2026-11-07T12:00:00-08:00');
  const env = { PORTFOLIO_NOW: '2026-11-10T09:00:00-08:00', PORTFOLIO_SHOW_UNCLEARED: '1' };
  assert.deepEqual(portfolioClock({ ...env, VERCEL_ENV: 'production' }, real), { now: real, includeUncleared: false });
  assert.deepEqual(portfolioClock({ ...env, VERCEL_ENV: 'preview' }, real), { now: at('2026-11-10T09:00:00-08:00'), includeUncleared: true });
  assert.deepEqual(portfolioClock({ PORTFOLIO_NOW: 'garbage' }, real), { now: real, includeUncleared: false });
  const preview = slugs(visibleTools(at('2026-11-10T09:00:00-08:00'), TOOLS, { includeUncleared: true }));
  assert.deepEqual(preview.slice(0, 3), ['revenge-or-justice', 'undo', 'gut-check']);
});

test('schedule: every slug is unique and every date is a real day', () => {
  const seen = new Set();
  for (const t of TOOLS) {
    assert.ok(!seen.has(t.slug), `duplicate slug ${t.slug}`);
    seen.add(t.slug);
    assert.ok(Number.isFinite(releaseInstant(t.releaseAt)), `${t.slug} releaseAt ${t.releaseAt}`);
    assert.match(t.slug, /^[a-z0-9-]{1,40}$/);
  }
});
