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
  'src/app/(main)/undo/TreeOfSquares.tsx',
  'src/app/(main)/undo/TreePopup.tsx',
  'src/app/(main)/undo/UndoTable.tsx',
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

test('the counts equal the pen rows: hero, kinds, the tree and the link to the list', async () => {
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
  assert.equal(COPY.all.link(275), 'Open all 275 executive actions');
  assert.equal(COPY.all.intro(275), 'The 275 executive actions still standing, one row each, with the exact sentence that undoes each. Search them, filter them by who feels it, sort them.');
  assert.equal(COPY.tree.chip('The world', 82), 'The world: 82 executive actions. Show only these.');
  assert.equal(COPY.table.shown(275), '275 shown');
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
    ['Newest', 'Oldest', 'By order'],
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
  assert.ok(!('key' in COPY), 'the key by kind, and the Congress notes it once carried, left /undo (UNDOTREE1)');
  const off = /five kinds|simple majority|sixty votes|sixty senators|nothing undoes|Congressional Review|a new rule for each/i;
  for (const [path, text] of copyStrings()) assert.doesNotMatch(text, off, `${path}: ${text}`);
  for (const [path, text] of [
    ['tree.label', COPY.tree.label],
    ['cta.body', COPY.cta.body],
  ]) assert.match(text, /executive action/, `${path} says executive actions`);
});

test('the page metadata and the method note say executive actions', () => {
  // /undo builds its link-preview words from the live counts (UNDOPEN2, 2026-11-17), so its
  // og:description is COPY.share.description, tested below; its plain description stays typed.
  const shared = COPY.share ? COPY.share.description(13, 275) : '';
  for (const f of ['src/app/(main)/undo/page.tsx', 'src/app/(main)/undo/all/page.tsx']) {
    const src = read(f);
    const desc = src.match(/description:\s*'([^']+)'/);
    const og = f.endsWith('undo/page.tsx') ? [null, shared] : src.match(/ogDescription:\s*'([^']+)'/);
    assert.ok(desc && og && og[1], `${f} carries a description and a link-preview description`);
    assert.match(desc[1], /executive action/i, `${f}: ${desc[1]}`);
    for (const text of [desc[1], og[1]]) {
      if (text === shared) {
        assert.doesNotMatch(text, /majority|sixty|nothing at all|Everything Trump did|—/, `${f}: ${text}`);
        continue;
      }
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
    // Round 3: no Withdrawals kind; a row whose source names no presidential document is Other.
    ['Other', 3],
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
  assert.ok(!('land' in COPY), 'the issue bars and their ticks legend are gone from /undo (UNDOTREE1)');
  assert.match(read('src/app/(main)/undo/page.tsx'), /COPY\.all\.link\(data\.penInForce\)/, 'the /undo link counts the standing rows');
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
  assert.ok(t.includes(`${n} of ${n} executive actions.`), 'the counter counts the standing rows');
  const total = Number(t.match(/the pen reached (\d+) in all/)[1]);
  assert.ok(t.indexOf(String(total)) > t.search(/Off the to-undo list \(\d+\)/), 'the whole pen count shows only inside the fold');
  assert.match(html, /class="undo-fchips-toggle"[^>]*aria-expanded="false"/, 'the issue filters sit behind one control');
});

test('round 2, built pages agree: the link, the theme chips, the tree and the table count the same standing rows', { skip: noBuild }, () => {
  const undo = readFileSync(UNDO_HTML, 'utf8');
  const all = readFileSync(ALL_HTML, 'utf8');
  const n = standingOf();
  assert.ok(text(undo).includes(`Open all ${n} executive actions`), 'the link counts the standing rows');
  const total = Number(text(all).match(/the pen reached (\d+) in all/)[1]);
  assert.ok(!new RegExp(`\\b${total}\\b`).test(text(undo)), '/undo shows no second count');
  const chips = [...undo.matchAll(/undo-chip-name">([^<]+)<\/span><span class="undo-chip-n[^"]*">(\d+)</g)].map((m) => [m[1], Number(m[2])]);
  assert.equal(chips.length, 5, 'five theme chips');
  assert.equal(chips.reduce((t, [, c]) => t + c, 0), n, 'the chips add up to the hero count');
  assert.equal((undo.match(/class="undo-sq /g) ?? []).length, n, 'one square per standing row');
  const rects = [...undo.matchAll(/undo-rect-count">(\d+) actions?</g)].map((m) => Number(m[1]));
  assert.equal(rects.reduce((t, c) => t + c, 0), n, 'the rectangles add up to the hero count');
  assert.ok(text(undo).includes(`${n} shown`), 'the table says how many it shows');
  assert.equal((undo.match(/<tr[ >]/g) ?? []).length - 1, n, 'the table draws every standing row');
});

test('round 2, built /undo: no key by kind, no swatch bar, no ticks line; the table carries the kind', { skip: noBuild }, () => {
  const undo = readFileSync(UNDO_HTML, 'utf8');
  assert.doesNotMatch(undo, /undo-keyswatch|undo-keybar|undo-kind-name|undo-bar-name/);
  assert.doesNotMatch(text(undo), /how far your ticks have gone|by kind/);
  const kinds = new Set([...undo.matchAll(/<td class="c-kind">([^<]+)</g)].map((m) => m[1]));
  for (const k of kinds) assert.ok(['Executive order', 'Proclamation', 'Memorandum', 'Other'].includes(k), `kind ${k}`);
  assert.ok(kinds.size >= 3);
});

// ROUND 3 (2026-11-08): the second review failed round 2 on nine points.

test('round 3: withdrawals count under the document that issued them; no Withdrawals kind', async () => {
  const { penKinds } = await pen();
  const base = { bucket: 'pen', status: 'in-force', reviewed: true, title: 'W' };
  const rows = [
    { ...base, id: '1', instrument: 'treaty', sources: [{ label: 'Federal Register: Memorandum of January 7, 2026', url: 'https://x' }] },
    { ...base, id: '2', instrument: 'treaty', number: 'Under EO 14199', sources: [{ label: 'Federal Register: Executive Order 14199', url: 'https://x' }] },
    { ...base, id: '3', instrument: 'treaty', sources: [{ label: 'ABC17 News: US to withdraw from UNESCO again', url: 'https://x' }] },
    { ...base, id: '4', instrument: 'executive_order', sources: [] },
  ];
  assert.deepEqual(penKinds(rows).map((k) => [k.label, k.count]), [
    ['Executive orders', 2],
    ['Memoranda', 1],
    ['Other', 1],
  ]);
});

test('round 3: one unit, executive actions, everywhere; short sort labels; plain names', async () => {
  const { ISSUE_BY_KEY } = await import('../src/lib/undo/issues.ts');
  for (const [path, s] of copyStrings()) assert.doesNotMatch(s, /\bitems?\b/i, `${path}: ${s}`);
  assert.equal(COPY.tree.count(25), '25 actions', 'one form for every rectangle\'s count (UNDOTREE1)');
  assert.ok(COPY.tree.rect('Born here means American', 18, 2).includes('18 executive actions, 2 signed'));
  for (const s of Object.values(COPY.sort)) assert.ok(s.length <= 8, `sort label "${s}" fits a phone`);
  assert.equal(ISSUE_BY_KEY.allies.label, 'Allies, treaties and aid');
  // Whit's own words, kept: "America isn't a Quitter" (2026-10-19, quoted in hoplight-site/CLAUDE.md).
  assert.ok(forward.some((o) => o.title === "America isn't a quitter"));
  assert.equal(COPY.groups.rest(313), 'Off the to-undo list (313)');
  assert.equal(COPY.groups.restLine, 'Already undone, not yet written up, worth keeping, or ceremonial. None needs a signature now.');
  assert.ok(!('standingIntro' in COPY.groups), 'the subline under the list heading is gone');
});

test('round 3: the issue filters sit behind the one control at every width; rows carry no mechanism chip', () => {
  const css = read('src/app/globals.css');
  assert.match(css, /^\.undo-filters:not\(\.is-open\) #undo-fchips \{ display: none; \}$/m, 'the filters hide until opened, outside any media query');
  assert.doesNotMatch(css, /\.undo-fchips-toggle \{[^}]*display: none/, 'the control shows at every width');
  const all = read('src/app/(main)/undo/UndoAll.tsx');
  assert.doesNotMatch(all, /tagOf|undo-tag/, 'no "one signature" chip on a row');
  assert.match(css, /:is\(button, input, select, textarea\) \{ font-family: inherit; \}/, 'undo controls take the page font, never the browser default');
});

test('round 3, built pages: rows first, one count form on every rectangle, no items unit', { skip: noBuild }, () => {
  const undo = readFileSync(UNDO_HTML, 'utf8');
  const all = readFileSync(ALL_HTML, 'utf8');
  assert.doesNotMatch(text(all), /To undo \(/, 'no second heading over the list');
  assert.doesNotMatch(all, /class="undo-tag"/);
  assert.doesNotMatch(text(undo), /Withdrawals/);
  const rects = (undo.match(/class="undo-rect[ "]/g) ?? []).length;
  const counts = (undo.match(/undo-rect-count">\d+ actions?</g) ?? []).length;
  const names = (undo.match(/undo-rect-frame">[^<]+</g) ?? []).length;
  assert.ok(rects >= 13, 'thirteen rectangles');
  assert.equal(counts, rects, 'each rectangle says its count in one form');
  assert.equal(names, rects, 'each rectangle carries its frame name');
  assert.doesNotMatch(text(undo), /\b\d+ items?\b/, 'no "items" unit on /undo');
});

test('round 3: the 2026-01-07 withdrawals count as memoranda on the real data, read from every source', async () => {
  const { penRows, penKinds } = await pen();
  const kinds = Object.fromEntries(penKinds(penRows(merged)).map((k) => [k.label, k.count]));
  // Counted 2026-11-08 without the feed: 64 of the curated withdrawals cite the memorandum; the six
  // left (UNESCO, a tariff probe, four agency moves) cite no presidential document.
  assert.ok(kinds.Memoranda >= 64, `Memoranda ${kinds.Memoranda}`);
  assert.ok((kinds.Other ?? 0) <= 6, `Other ${kinds.Other}`);
  assert.match(read('src/lib/undo/load.ts'), /kinds: penKinds\(pen\)/, 'the loader counts the kinds on the server');
});

// Lane undotidy1, 2026-11-08. The rows used deferred drawing (content-visibility: auto) with a 150px
// placeholder, about twice a one-line row, so a full-page render showed blank rows and the scroll bar
// jumped as rows drew. The list already pages by 25, so no row waits to be drawn.
test('undotidy1: every list row draws at its real height; the list pages by 25 instead', () => {
  const css = read('src/app/globals.css');
  const rule = css.match(/\.undo-item \{[^}]*\}/);
  assert.ok(rule, 'the .undo-item rule exists');
  assert.doesNotMatch(rule[0], /content-visibility/, 'list rows are not drawn late');
  assert.doesNotMatch(rule[0], /contain-intrinsic-size/, 'no placeholder height on list rows');
  assert.match(read('src/app/(main)/undo/UndoAll.tsx'), /const PAGE = 25;/, 'the list pages by 25');
});

// UNDOPEN2, 2026-11-17. Whit: "need a cat nippy preview description for it". The link-preview title
// and description are built from the same two counts as the hero headline (the signing orders and the
// executive actions still standing), never typed numbers, and carry no em dash.
test('undopen2: the link-preview title and description carry the headline\'s two counts', () => {
  assert.ok(COPY.share, 'COPY.share holds the link-preview words');
  assert.equal(COPY.share.title(13, 275), "Thirteen signatures undo 275 of Trump's executive actions");
  assert.equal(
    COPY.share.description(13, 275),
    'What a pen did, a pen can undo. 13 signatures on January 20, 2029 could undo 275 actions. Find the ones that touch your life.',
  );
  assert.equal(COPY.share.title(21, 1), "21 signatures undo 1 of Trump's executive actions");
  assert.match(COPY.share.description(1, 1), /^What a pen did, a pen can undo\. 1 signature on January 20, 2029 could undo 1 action\./);
  for (const s of [COPY.share.title(13, 275), COPY.share.description(13, 275)]) assert.ok(!s.includes('—'), `em dash in ${s}`);
});

test('undopen2: /undo builds its metadata from loadUndo, with no typed og words', () => {
  const page = read('src/app/(main)/undo/page.tsx');
  assert.match(page, /export async function generateMetadata\(/, 'the page builds its metadata at render');
  assert.doesNotMatch(page, /export const metadata\b/, 'no static metadata left');
  const gen = page.slice(page.indexOf('export async function generateMetadata('));
  const body = gen.slice(0, gen.indexOf('\n}\n'));
  assert.match(body, /await loadUndo\(\)/, 'it reads the loader');
  assert.match(body, /COPY\.share\.title\(data\.orders\.length, data\.penInForce\)/, 'the title takes the headline\'s counts');
  assert.match(body, /COPY\.share\.description\(data\.orders\.length, data\.penInForce\)/, 'the description takes the headline\'s counts');
  assert.doesNotMatch(body, /ogDescription:\s*'/, 'no typed link-preview description');
  assert.doesNotMatch(body, /\b\d{2,}\b/, 'no typed count');
  // The plain description stays as it was.
  assert.match(body, /description:\s*'Every executive action of the second Trump administration that the next president can undo with a signature, filterable by who feels it, sortable, and bundled into signing orders\.'/);
  assert.match(read('src/app/(main)/undo/UndoList.tsx'), /COPY\.hero\.headline\(orders\.length, penInForce\)/, 'the headline takes the same two counts');
});

test('undopen2: with the Federal Register feed down, the preview words still carry real counts', async () => {
  // `merged` above is the loader's failure path: no feed rows, the curated files only.
  const { penRows } = await pen();
  const rows = penRows(merged);
  const orders = forward.map((o) => forwardOrderView(o, rows)).filter((o) => o.ids.length > 0).length;
  const standing = countPenInForce(rows);
  assert.ok(orders > 0, 'at least one signing order survives a dead feed');
  assert.ok(standing > 0, 'at least one standing action survives a dead feed');
  const title = COPY.share.title(orders, standing);
  const desc = COPY.share.description(orders, standing);
  assert.ok(title.includes(` ${standing} of Trump's`), title);
  assert.ok(desc.includes(`${standing} action`) && desc.includes(`${orders} signature`), desc);
  assert.doesNotMatch(`${title} ${desc}`, /\b0 (action|signature)|Zero signatures/, 'never a zero count');
});

test('undopen2, built /undo: og and twitter carry the hero\'s counts; the plain description is unchanged', { skip: noBuild }, () => {
  const html = readFileSync(UNDO_HTML, 'utf8');
  const meta = (attr, name) => {
    const m = html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`));
    return m ? m[1].replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&') : null;
  };
  const hero = text(html).match(/(\S+) signatures undo (\d+) executive actions\./);
  assert.ok(hero, 'the hero headline is on the built page');
  const standing = Number(hero[2]);
  const orderWord = hero[1];
  for (const [attr, name] of [['property', 'og:title'], ['name', 'twitter:title']]) {
    assert.equal(meta(attr, name), `${orderWord} signatures undo ${standing} of Trump's executive actions`, name);
  }
  for (const [attr, name] of [['property', 'og:description'], ['name', 'twitter:description']]) {
    const d = meta(attr, name);
    assert.ok(d && d.startsWith('What a pen did, a pen can undo. ') && d.includes(` signatures on January 20, 2029 could undo ${standing} actions. `), `${name}: ${d}`);
  }
  assert.match(meta('name', 'description') ?? '', /^Every executive action of the second Trump administration/);
  assert.equal(meta('property', 'og:image'), 'https://hoplight.ai/api/og/tool/undo?v=pen-2026-11-17', 'og:image is absolute and versioned');
});

// The pen went live on 2026-11-17 at the same address the grid had held, so every app that had already
// saved the Undo List's preview (iMessage, LinkedIn, Slack) kept showing the grid. Whit, 2026-11-18: "why
// tf is my undo list preview STILL NOT A FUCKING PEN". A card whose picture changes gets a new address,
// so a fresh fetch of the page fetches the new picture; the other cards keep their plain address.
test('a changed card carries a version in its address; an unchanged card does not', async () => {
  const { toolCardUrl } = await import('../src/lib/metadata.ts');
  assert.equal(toolCardUrl('undo'), 'https://hoplight.ai/api/og/tool/undo?v=pen-2026-11-17');
  assert.equal(toolCardUrl('revenge-or-justice'), 'https://hoplight.ai/api/og/tool/revenge-or-justice');
});
