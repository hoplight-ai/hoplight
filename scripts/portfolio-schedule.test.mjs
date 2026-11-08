// The portfolio's release schedule (src/data/tools.ts), tested with an injected clock. Whit,
// 2026-11-07: "launch portfolio page w 3 builds and i keep adding on a posting schedule." An entry
// shows only when its day has come in America/Los_Angeles AND it has passed the go-public checklist.
// Run: node --test scripts/portfolio-schedule.test.mjs (part of npm test).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { TOOLS, releaseInstant, visibleTools, portfolioClock } from '../src/data/tools.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const at = (iso) => Date.parse(iso);
const slugs = (list) => list.map((t) => t.slug);
// The eight pieces of the 2026-10-21 gallery, every one still in the list so old links and cards work.
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
// Held off the portfolio whatever their date and clearance (PORTHOLD1). Whit, 2026-11-07: "cut bet apetit,
// make letters live now, hide agis and lets plan a post to announce it w analogy as partner in december.
// gut check should be an announcment too so hide that."
const HELD = {
  'bet-appetit': 'cut by Whit, 2026-11-07',
  'agis-policy-search-aria': 'held for its December announcement with Analogy as partner (Whit, 2026-11-07)',
  'gut-check': 'held for its own announcement (Whit, 2026-11-07)',
  // LETTERSOFF1. Whit, 2026-11-07: "And I’m honestly not certain that letters as its own standalone thing
  // that was supposed to just be a feature of roomie.", then "1 yes." to taking it off today.
  letters: 'folded into Rumi, its letter tracing ships there (Whit, 2026-11-07)',
};
const SHOWN_GALLERY = GALLERY.filter((s) => !(s in HELD));
// Letters went live on 2026-11-07 (LETTERSON1) and came off the same day, held as a feature of Rumi
// (LETTERSOFF1), so from 2026-11-07 the page shows the gallery pieces not held, and nothing else.
const SHOWN_NOW = SHOWN_GALLERY;

test('schedule: before and after 2026-11-07 the page shows the gallery pieces not held, in their old order, and no Letters', () => {
  assert.deepEqual(slugs(visibleTools(at('2026-11-06T23:59:00-08:00'))), SHOWN_GALLERY);
  assert.deepEqual(slugs(visibleTools(at('2026-11-07T00:00:00-08:00'))), SHOWN_NOW);
  assert.deepEqual(slugs(visibleTools(at('2026-11-07T12:00:00-08:00'))), SHOWN_NOW);
  for (const iso of ['2026-11-07T12:00:00-08:00', '2026-11-10T09:00:00-08:00', '2026-11-24T09:00:00-08:00', '2027-01-06T08:00:00-08:00']) {
    for (const opts of [{}, { includeUncleared: true }]) {
      assert.ok(!slugs(visibleTools(at(iso), TOOLS, opts)).includes('letters'), `letters shows at ${iso}`);
    }
  }
});

test('letters: released 2026-11-07 and cleared, and held as a feature of Rumi (LETTERSOFF1)', () => {
  const letters = TOOLS.find((t) => t.slug === 'letters');
  assert.equal(letters.releaseAt, '2026-11-07');
  assert.equal(letters.cleared, true);
  assert.equal(letters.hold, 'folded into Rumi, its letter tracing ships there (Whit, 2026-11-07)');
  assert.equal(letters.shelf, 'product');
});

test('hold: a held entry never shows, even released, cleared, or in an uncleared preview', () => {
  const base = TOOLS.find((t) => t.slug === 'what-s-human');
  const held = { ...base, slug: 'held-probe', releaseAt: '2026-01-01', cleared: true, hold: 'probe' };
  const list = [...TOOLS, held];
  const now = at('2026-11-07T12:00:00-08:00');
  assert.ok(!slugs(visibleTools(now, list)).includes('held-probe'));
  assert.ok(!slugs(visibleTools(now, list, { includeUncleared: true })).includes('held-probe'));
  assert.ok(slugs(visibleTools(now, [...TOOLS, { ...held, hold: undefined }])).includes('held-probe'), 'the same entry shows unheld');
});

test('hold: the four held entries stay in the list with their reasons, and none shows at 2026-11-07 noon', () => {
  const byslug = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));
  for (const [s, why] of Object.entries(HELD)) {
    assert.ok(byslug[s], `${s} was deleted; it must stay so old links and cards work`);
    assert.equal(byslug[s].hold, why, s);
  }
  assert.deepEqual(TOOLS.filter((t) => t.hold).map((t) => t.slug).sort(), Object.keys(HELD).sort());
  const now = at('2026-11-07T12:00:00-08:00');
  for (const opts of [{}, { includeUncleared: true }]) {
    const shown = slugs(visibleTools(now, TOOLS, opts));
    for (const s of Object.keys(HELD)) assert.ok(!shown.includes(s), `${s} shows`);
  }
});

test('hold: the portfolio preview card draws no held tool', () => {
  const src = readFileSync(path.join(ROOT, 'src/lib/brand/tool-card.ts'), 'utf8');
  const m = /const LIBRARY = \[([^\]]*)\]/.exec(src);
  assert.ok(m, 'LIBRARY not found in tool-card.ts');
  const library = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  assert.ok(library.length > 0);
  assert.ok(!library.includes('letters'), 'letters is held and still drawn on the portfolio card');
  for (const s of library) {
    assert.ok(TOOLS.some((t) => t.slug === s), `${s} is not a tool`);
    assert.ok(!TOOLS.find((t) => t.slug === s).hold, `${s} is held but drawn on the portfolio card`);
  }
});

test('schedule: the eight gallery pieces keep their words exactly', () => {
  const byslug = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));
  assert.equal(byslug['dnc-autopsy-taken-apart'].line, 'The party’s own 2024 after-action report, argued from its own numbers.');
  assert.equal(byslug['what-s-human'].href, 'https://whatshuman.vercel.app');
  assert.equal(byslug['bet-appetit'].line, 'Bet tracker skinned as the Michelin Guide. Bets paid in dinners. Demo copy with invented data.');
  for (const s of GALLERY) assert.equal(byslug[s].cleared, true, s); // held entries keep cleared: true
});

test('schedule: a day starts at midnight Los Angeles time, standard and daylight', () => {
  assert.equal(releaseInstant('2026-11-10'), at('2026-11-10T00:00:00-08:00'));
  assert.equal(releaseInstant('2026-07-04'), at('2026-07-04T00:00:00-07:00'));
  assert.equal(releaseInstant('not a date'), Number.POSITIVE_INFINITY);
});

test('schedule: an uncleared entry never shows, even on its day', () => {
  const list = visibleTools(at('2026-11-10T09:00:00-08:00'));
  assert.ok(slugs(list).includes('undo'), 'the Undo List is cleared (security PASS, 2026-11-07) and shows on its day');
  assert.ok(!slugs(list).includes('revenge-or-justice'));
});

test('schedule: a cleared entry shows from the first minute of its day, newest first', () => {
  const cleared = TOOLS.map((t) => (['undo', 'revenge-or-justice'].includes(t.slug) ? { ...t, cleared: true } : t));
  assert.deepEqual(slugs(visibleTools(at('2026-11-09T23:59:00-08:00'), cleared)), SHOWN_NOW);
  const day = slugs(visibleTools(at('2026-11-10T00:00:00-08:00'), cleared));
  assert.deepEqual(day.slice(0, 2), ['revenge-or-justice', 'undo']);
  assert.deepEqual(day.slice(2), SHOWN_NOW);
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
  assert.equal(byslug['letters'].releaseAt, '2026-11-07');
  assert.ok(byslug['letters'].hold, 'Letters is on the posting calendar again; it ships inside Rumi');
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
  assert.deepEqual(preview.slice(0, 3), ['revenge-or-justice', 'undo', ...SHOWN_NOW.slice(0, 1)]);
  assert.ok(!preview.includes('gut-check'), 'a held entry shows in a preview render');
  assert.ok(!preview.includes('letters'), 'Letters shows in a preview render');
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
