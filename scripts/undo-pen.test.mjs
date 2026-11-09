#!/usr/bin/env node
// The Undo List is executive actions only (lane undopen1, 2026-11-08). Whit, 2026-11-08: "wait yes
// the undo list is supposed ot be just exec orders." These tests pin the narrowing: /undo and
// /undo/all draw only rows the classifier places in the pen bucket, every count is taken over those
// rows, every pen row still standing sits in exactly one signing order, and the one sort control
// orders the list as its labels say. Pure: no network, no server.
// Run: `node --test scripts/undo-pen.test.mjs`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyRulings } from '../src/lib/undo/classify.ts';
import { applyIssues } from '../src/lib/undo/issues-merge.ts';
import { forwardOrderView } from '../src/lib/undo/forward-text.ts';
import { countPenInForce, isPenInForce } from '../src/lib/undo/sections.ts';
import { COPY, copyStrings } from '../src/lib/undo/copy.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const readJson = (rel) => JSON.parse(read(rel));

// pen.ts is new in this lane; loading it lazily lets every test report its own failure.
async function pen() {
  try {
    return await import('../src/lib/undo/pen.ts');
  } catch {
    return {};
  }
}

// The merged rows the way src/lib/undo/load.ts builds them, without the live feed: rulings, curated
// rows, then the headline files in the order headlines/index.ts lists them, then the issue tags.
function headlineFiles() {
  const index = read('src/data/undo/headlines/index.ts');
  return [...index.matchAll(/from '\.\/([^']+\.json)'/g)].map((m) => m[1]);
}
function issueFiles() {
  const index = read('src/data/undo/issues/index.ts');
  return [...index.matchAll(/from '\.\/([^']+\.json)'/g)].map((m) => m[1]);
}
const headlines = headlineFiles().flatMap((f) => readJson(`src/data/undo/headlines/${f}`));
const issueTags = issueFiles().flatMap((f) => readJson(`src/data/undo/issues/${f}`));
const merged = applyIssues(
  applyRulings([], [...readJson('src/data/undo/rulings.json'), ...readJson('src/data/undo/curated.json'), ...headlines]),
  issueTags,
);
const forward = readJson('src/data/undo/forward.json');

const PAGE_FILES = [
  'src/app/(main)/undo/page.tsx',
  'src/app/(main)/undo/all/page.tsx',
  'src/app/(main)/undo/UndoList.tsx',
  'src/app/(main)/undo/UndoAll.tsx',
  'src/app/(main)/undo/IssueBars.tsx',
];

test('penRows keeps only the pen bucket, and the merged data has rows in every other bucket to drop', async () => {
  const { penRows } = await pen();
  assert.equal(typeof penRows, 'function', 'src/lib/undo/pen.ts exports penRows');
  for (const b of ['pen-process', 'majority', 'sixty', 'locked']) {
    assert.ok(merged.some((r) => r.bucket === b), `the curated data carries a ${b} row, so the narrowing is tested`);
  }
  const kept = penRows(merged);
  assert.ok(kept.length > 0);
  assert.ok(kept.every((r) => r.bucket === 'pen'), 'no non-pen row survives');
  assert.equal(kept.length, merged.filter((r) => r.bucket === 'pen').length, 'every pen row survives');
});

test('the loader hands both pages pen rows only, and resolves the orders against them', () => {
  const load = read('src/lib/undo/load.ts');
  assert.match(load, /penRows\(/, 'load.ts narrows with penRows');
  assert.doesNotMatch(load, /\brows\.map\(slimRow\)/, 'load.ts no longer ships every row');
  assert.doesNotMatch(load, /forwardOrderView\(o, rows\)/, 'orders resolve against the pen rows');
  assert.doesNotMatch(load, /countLocked/, 'nothing counts the locked bucket');
});

test('no component of /undo or /undo/all draws a bucket other than the pen', () => {
  const nonPen = /'pen-process'|'majority'|'sixty'|'locked'|'congress'|'process'|COPY\.(congress|thisYear|locked)\b|BUCKETS\[/;
  for (const f of PAGE_FILES) assert.doesNotMatch(read(f), nonPen, `${f} names a bucket a pen does not undo`);
});

test('the counts equal the pen rows: hero, key, bars and the link to the list', async () => {
  const { penRows, penKinds } = await pen();
  assert.equal(typeof penKinds, 'function', 'src/lib/undo/pen.ts exports penKinds');
  const rows = penRows(merged);
  const kinds = penKinds(rows);
  assert.equal(
    kinds.reduce((n, k) => n + k.count, 0),
    countPenInForce(rows),
    'the key sums to the pen rows still standing',
  );
  assert.ok(kinds.every((k) => k.count > 0 && k.label), 'no empty kind, every kind named');
  assert.equal(COPY.hero.headline(13, 275), 'Thirteen signatures undo 275 executive actions.');
  assert.equal(COPY.key.title(275), '275 executive actions, by kind');
  assert.equal(COPY.all.link(588), 'Open all 588 executive actions');
  assert.equal(COPY.all.intro(588, 275), 'All 588 executive actions a pen reaches, one row each. The 275 still standing come first; the rest are already undone, just in, worth keeping, or ceremonial.');
  assert.equal(COPY.land.countLabel(41), '41');
  assert.equal(
    COPY.land.bar('Your health care', 7, 2),
    'Your health care: 7 executive actions. You have signed 2 of them. Show these.',
  );
});

test('every pen row still standing belongs to exactly one signing order', async () => {
  const { penRows, bundleCoverage } = await pen();
  assert.equal(typeof bundleCoverage, 'function', 'src/lib/undo/pen.ts exports bundleCoverage');
  // The function itself: a row in none and a row in two are both caught.
  const probe = bundleCoverage(['a', 'b', 'c'], [{ id: 'o1', ids: ['a', 'b'] }, { id: 'o2', ids: ['b'] }]);
  assert.deepEqual(probe, { inNone: ['c'], inTwo: ['b'] });
  // The real data, without the feed: every curated pen row in force is in one order.
  const rows = penRows(merged);
  const orders = forward.map((o) => forwardOrderView(o, rows)).filter((o) => o.ids.length > 0);
  const penIds = rows.filter(isPenInForce).map((r) => r.id);
  assert.ok(penIds.length > 0);
  assert.deepEqual(bundleCoverage(penIds, orders), { inNone: [], inTwo: [] });
});

test('the sort control orders as named: newest first by default, oldest first, by signing order', async () => {
  const { PEN_SORTS, sortByDate, groupByBundle } = await pen();
  assert.deepEqual(PEN_SORTS, ['newest', 'oldest', 'bundle'], 'three orders, newest first as the default');
  assert.deepEqual(
    PEN_SORTS.map((s) => COPY.sort[s]),
    ['Newest first', 'Oldest first', 'By signing order'],
  );
  const rows = [
    { id: 'a', date: '2025-03-01' },
    { id: 'b', date: '2026-01-15' },
    { id: 'c', date: '2025-01-20' },
    { id: 'd', date: '2025-07-04' },
    { id: 'e', date: '2025-07-04' },
  ];
  assert.deepEqual(sortByDate(rows, 'newest').map((r) => r.id), ['b', 'd', 'e', 'a', 'c']);
  assert.deepEqual(sortByDate(rows, 'oldest').map((r) => r.id), ['c', 'a', 'd', 'e', 'b']);
  assert.deepEqual(rows.map((r) => r.id), ['a', 'b', 'c', 'd', 'e'], 'sorting never changes its input');
  const groups = groupByBundle(
    rows,
    [
      { id: 'o1', title: 'One', ids: ['a', 'd'] },
      { id: 'o2', title: 'Two', ids: ['x'] },
      { id: 'o3', title: 'Three', ids: ['c', 'b', 'a'] },
    ],
    'Not yet in an order',
  );
  // Orders in their own sequence, newest first inside each, a row once, strays last, empties dropped.
  assert.deepEqual(groups.map((g) => [g.key, g.label, g.rows.map((r) => r.id)]), [
    ['o1', 'One', ['d', 'a']],
    ['o3', 'Three', ['b', 'c']],
    ['unbundled', 'Not yet in an order', ['e']],
  ]);
  const all = read('src/app/(main)/undo/UndoAll.tsx');
  assert.match(all, /PEN_SORTS/, '/undo/all draws its sort control from PEN_SORTS');
  assert.doesNotMatch(all, /'issue'/, 'the old by-issue sort is gone; the issue filter stays');
});

test('the copy says executive actions and nothing about Congress or the locked bucket', () => {
  for (const k of ['congress', 'thisYear', 'locked']) assert.ok(!(k in COPY), `COPY.${k} is gone`);
  assert.ok(!('reconciliation' in COPY.key) && !('cra' in COPY.key), 'the Congress notes left the key');
  const off = /five kinds|simple majority|sixty votes|sixty senators|nothing undoes|Congressional Review|a new rule for each/i;
  for (const [path, text] of copyStrings()) assert.doesNotMatch(text, off, `${path}: ${text}`);
  for (const [path, text] of [
    ['hero.read', COPY.hero.read],
    ['land.intro', COPY.land.intro],
    ['cta.body', COPY.cta.body],
  ]) assert.match(text, /executive action/, `${path} says executive actions`);
});

test('the page metadata and the method note say executive actions', () => {
  for (const f of ['src/app/(main)/undo/page.tsx', 'src/app/(main)/undo/all/page.tsx']) {
    const src = read(f);
    const desc = src.match(/description:\s*'([^']+)'/);
    const og = src.match(/ogDescription:\s*'([^']+)'/);
    assert.ok(desc && og, `${f} carries a description and a link-preview description`);
    for (const text of [desc[1], og[1]]) {
      assert.match(text, /executive action/i, `${f}: ${text}`);
      assert.doesNotMatch(text, /majority|sixty|nothing at all|Everything Trump did|—/, `${f}: ${text}`);
    }
  }
  const page = read('src/app/(main)/undo/page.tsx');
  assert.doesNotMatch(page, /Statutes, Congressional Review Act repeals/, 'the method note no longer lists what a pen cannot reach as rows');
});

test('every undo test file is in npm test', () => {
  const pkg = readJson('package.json');
  for (const f of readdirSync(join(ROOT, 'scripts')).filter((n) => /^undo-.*\.test\.mjs$/.test(n))) {
    assert.ok(pkg.scripts.test.includes(`scripts/${f}`), `${f} is not in npm test`);
  }
});
