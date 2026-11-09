#!/usr/bin/env node
// The Undo List is executive actions only (lane undopen1, 2026-11-08). Whit, 2026-11-08: "wait yes
// the undo list is supposed ot be just exec orders." These tests pin the narrowing: /undo and
// /undo/all draw only rows the classifier places in the pen bucket, every count is taken over those
// rows, every pen row still standing sits in exactly one signing order, and the one sort control
// orders the list as its labels say. Pure: no network, no server.
// Run: `node --test scripts/undo-pen.test.mjs`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
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
  assert.equal(COPY.all.link(275), 'Open all 275 executive actions');
  assert.equal(COPY.all.intro(275), 'The 275 executive actions still standing, one row each, with the exact sentence that undoes each. Search them, filter them by who feels it, sort them.');
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

// ROUND 2 (2026-11-08): the visual-sociologist review of the first pass failed it on seven points.
// The unit tests below pin the copy and the counting; the built-page tests read the prerendered
// HTML and skip until `npm run build` has run.

test('round 2: the key counts by document type only, so no kind contradicts an order', async () => {
  const { penKinds } = await pen();
  const rows = [
    { id: '1', instrument: 'executive_order', bucket: 'pen', status: 'in-force', title: 'A', reviewed: true },
    { id: '2', instrument: 'proclamation', bucket: 'pen', status: 'in-force', title: 'B', reviewed: true },
    { id: '3', instrument: 'memorandum', bucket: 'pen', status: 'in-force', title: 'C', reviewed: true },
    { id: '4', instrument: 'treaty', bucket: 'pen', status: 'in-force', title: 'D', reviewed: true },
    { id: '5', instrument: 'tariff', bucket: 'pen', status: 'in-force', title: 'E', reviewed: true },
    { id: '6', instrument: 'personnel', bucket: 'pen', status: 'in-force', title: 'F', reviewed: true },
  ];
  assert.deepEqual(penKinds(rows).map((k) => [k.label, k.count]), [
    ['Executive orders', 1],
    ['Proclamations', 1],
    ['Memoranda', 1],
    ['Withdrawals', 1],
    ['Other', 2],
  ]);
});

test('round 2: plain group names with the count beside them, no coined labels', () => {
  assert.equal(COPY.groups.standing, 'To undo');
  assert.equal(COPY.groups.done, 'Already undone');
  assert.equal(COPY.groups.justIn, 'Not yet written up');
  assert.equal(COPY.groups.leave, 'Worth keeping');
  assert.equal(COPY.groups.ceremonial, 'Ceremonial');
  assert.equal(COPY.groups.titled('To undo', 275), 'To undo (275)');
  const coined = /Before lunch|Already done for you|Just in\b|Leave these|Things America quit/;
  for (const [path, text] of copyStrings()) assert.doesNotMatch(text, coined, `${path}: ${text}`);
});

test('round 2: one count, the 275, on the link and the list; the ticks legend is gone', () => {
  assert.equal(COPY.all.link(275), 'Open all 275 executive actions');
  assert.ok(!('legendTicks' in COPY.land), 'the ticks legend line is gone');
  assert.match(read('src/app/(main)/undo/page.tsx'), /COPY\.all\.link\(data\.penInForce\)/, 'the /undo link counts the standing rows');
  assert.doesNotMatch(read('src/app/(main)/undo/IssueBars.tsx'), /undo-legend/, 'no legend under the bars');
});

const built = (name) => ['.next/server/app', '.next/server/app/(main)'].map((d) => join(ROOT, d, name)).find((p) => existsSync(p));
const UNDO_HTML = built('undo.html');
const ALL_HTML = built('undo/all.html');
const noBuild = UNDO_HTML && ALL_HTML ? false : 'no build present';
// The live feed moves the numbers hourly, so the built tests read the standing count off the hero.
const standingOf = () => Number(text(readFileSync(UNDO_HTML, 'utf8')).match(/undo (\d+) executive actions\./)[1]);
const text = (html) => html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');

test('round 2, built /undo/all: the 275 are open with rows showing, the other 313 behind one tap', { skip: noBuild }, () => {
  const html = readFileSync(ALL_HTML, 'utf8');
  const firstRow = html.indexOf('undo-item-check');
  const rest = html.indexOf('undo-rest');
  assert.ok(firstRow > 0, 'standing rows render');
  assert.ok(rest > firstRow, 'the standing rows come before the fold of the rest');
  assert.ok((html.match(/undo-item-check/g) ?? []).length >= 25, 'a first page of rows shows');
  assert.doesNotMatch(html.slice(0, firstRow), /<details[^>]*class="undo-fold/, 'no closed fold above the standing rows');
  assert.match(html, /<details class="undo-fold undo-rest"(?![^>]*open)/, 'the rest is one closed fold');
  const t = text(html);
  const n = standingOf();
  assert.ok(t.includes(`To undo (${n})`), `the list heading says To undo (${n})`);
  assert.ok(t.includes(`${n} of ${n} executive actions.`), 'the counter counts the standing rows');
  const total = Number(t.match(/the pen reached (\d+) in all/)[1]);
  assert.ok(t.indexOf(String(total)) > t.search(/The other \d+ executive actions/), 'the whole pen count shows only inside the fold');
  assert.match(html, /class="undo-fchips-toggle"[^>]*aria-expanded="false"/, 'the issue filters sit behind one control');
});

test('round 2, built pages agree: the link, the chips and the bars count the same 275', { skip: noBuild }, () => {
  const undo = readFileSync(UNDO_HTML, 'utf8');
  const all = readFileSync(ALL_HTML, 'utf8');
  const n = standingOf();
  assert.ok(text(undo).includes(`Open all ${n} executive actions`), 'the link counts the standing rows');
  const total = Number(text(all).match(/the pen reached (\d+) in all/)[1]);
  assert.ok(!new RegExp(`\\b${total}\\b`).test(text(undo)), '/undo shows no second count');
  const bars = new Map([...undo.matchAll(/undo-bar-name">([^<]+)<\/span>[\s\S]*?undo-bar-count"[^>]*>(\d+)</g)].map((m) => [m[1].replace(/&#x27;/g, "'"), Number(m[2])]));
  const chips = new Map([...all.matchAll(/class="undo-fchip"[^>]*>([^<]+)<span class="undo-fchip-n">(\d+)</g)].map((m) => [m[1].replace(/&#x27;/g, "'"), Number(m[2])]));
  assert.ok(bars.size >= 5 && chips.size >= 5);
  for (const [label, n] of bars) assert.equal(chips.get(label), n, `${label}: bar ${n}, chip ${chips.get(label)}`);
});

test('round 2, built /undo: the key is sideways bars with counts, no swatches, no stacked bar, no ticks line', { skip: noBuild }, () => {
  const undo = readFileSync(UNDO_HTML, 'utf8');
  assert.doesNotMatch(undo, /undo-keyswatch|undo-keybar/);
  assert.doesNotMatch(text(undo), /how far your ticks have gone/);
  const kinds = [...undo.matchAll(/undo-kind-name">([^<]+)<[\s\S]*?undo-kind-count">(\d+)</g)].map((m) => [m[1], Number(m[2])]);
  assert.deepEqual(kinds.map(([l]) => l), ['Executive orders', 'Proclamations', 'Memoranda', 'Withdrawals', 'Other'].filter((l) => kinds.some(([k]) => k === l)));
  assert.ok(kinds.length >= 4);
  assert.equal(kinds.reduce((n, [, c]) => n + c, 0), Number(text(undo).match(/(\d+) executive actions, by kind/)[1]));
});
