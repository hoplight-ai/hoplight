// The portfolio splits products from reports (PORTSPLIT1, 2026-11-07). Whit, 2026-11-07: "we had previously
// split out reports from apps and dashboards and I think we need that sort of division ... my DNC and Oregon
// school reports thing belong and reports part of the portfolio ... like dilution at GE is a report."
// Every entry in src/data/tools.ts carries `shelf`, and /portfolio draws Products first, then Reports, each
// part only when it has an entry showing that day.
// Run: node --test scripts/portfolio-shelf.test.mjs (part of npm test).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { TOOLS, shelves, visibleTools } from '../src/data/tools.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');
const at = (iso) => Date.parse(iso);
const slugs = (list) => list.map((t) => t.slug);

const REPORTS = ['dnc-autopsy-taken-apart', 'oregon-school-budget-report', 'worker-equity-dilution-at-ge'];

test('shelf: every entry says product or report', () => {
  for (const t of TOOLS) assert.ok(t.shelf === 'product' || t.shelf === 'report', `${t.slug} shelf ${t.shelf}`);
});

test('shelf: the three reports are DNC, Oregon and GE, and everything else is a product', () => {
  assert.deepEqual(TOOLS.filter((t) => t.shelf === 'report').map((t) => t.slug).sort(), [...REPORTS].sort());
  for (const s of ['revenge-or-justice', 'undo', 'gut-check', 'rumi', 'letters', 'agis-policy-search-aria',
    'ai-election-errors', 'bet-appetit', 'what-s-human', 'which-ai-should-i-use']) {
    assert.equal(TOOLS.find((t) => t.slug === s).shelf, 'product', s);
  }
});

test('shelf: the type requires the field, so a drop cannot be added without one', () => {
  const src = read('src/data/tools.ts');
  assert.match(src, /^\s*shelf: Shelf;$/m, 'Tool.shelf is optional or missing');
  assert.match(src, /export type Shelf = 'product' \| 'report';/);
});

test('shelves: Products first, then Reports, each keeping the schedule order', () => {
  const now = at('2026-11-07T12:00:00-08:00');
  const parts = shelves(visibleTools(now));
  assert.deepEqual(parts.map((p) => p.shelf), ['product', 'report']);
  assert.deepEqual(parts.map((p) => p.heading), ['Products', 'Reports']);
  assert.deepEqual(slugs(parts[1].tools), ['dnc-autopsy-taken-apart', 'oregon-school-budget-report', 'worker-equity-dilution-at-ge']);
  assert.ok(!parts[0].tools.some((t) => t.shelf === 'report'), 'a report sits under Products');
  assert.ok(!parts[1].tools.some((t) => t.shelf === 'product'), 'a product sits under Reports');
  // Same order as the one list: the split only partitions it.
  const all = slugs(visibleTools(now));
  assert.deepEqual(slugs(parts[0].tools), all.filter((s) => !REPORTS.includes(s)));
});

test('shelves: a part with nothing showing that day is left out', () => {
  const noReports = TOOLS.filter((t) => t.shelf === 'product');
  assert.deepEqual(shelves(noReports).map((p) => p.shelf), ['product']);
  const noProducts = TOOLS.filter((t) => t.shelf === 'report');
  assert.deepEqual(shelves(noProducts).map((p) => p.shelf), ['report']);
  assert.deepEqual(shelves([]), []);
});

test('page: /portfolio draws its parts from shelves(), one heading word each and no sentence under it', () => {
  const src = read('src/app/(main)/portfolio/page.tsx');
  assert.match(src, /shelves\(/, 'the page does not split by shelf');
  assert.match(src, /data-shelf=\{/, 'each part is not marked with its shelf');
});

// The built page, when `npm run build` has run.
const BUILT = ['.next/server/app/portfolio.html', '.next/server/app/(main)/portfolio.html']
  .map((rel) => path.join(ROOT, rel))
  .find((p) => existsSync(p));

test('built: the three reports render under Reports and no product does', { skip: BUILT ? false : 'no build present' }, () => {
  const html = readFileSync(BUILT, 'utf8');
  const part = (shelf) => {
    const m = html.match(new RegExp(`<section[^>]*data-shelf="${shelf}"[^>]*>([\\s\\S]*?)</section>`));
    assert.ok(m, `no ${shelf} part in the built page`);
    return m[1];
  };
  const products = part('product');
  const reports = part('report');
  assert.match(products, />Products</);
  assert.match(reports, />Reports</);
  for (const t of TOOLS) {
    const href = `href="${t.href}"`;
    if (t.shelf === 'report') {
      assert.ok(reports.includes(href), `${t.slug} is not under Reports`);
      assert.ok(!products.includes(href), `${t.slug} is under Products`);
    } else {
      assert.ok(!reports.includes(href), `${t.slug} is under Reports`);
    }
  }
  assert.ok(html.indexOf('data-shelf="product"') < html.indexOf('data-shelf="report"'), 'Reports comes before Products');
});

// Design review of the split, 2026-11-07: fix 1 (blocking) puts a quiet "Read it" under each report's
// title, matching the products' "Open it"; fix 2 shows Oregon's one line, as DNC and GE show theirs.
test('page: Oregon is not on the hidden-line list', () => {
  const src = read('src/app/(main)/portfolio/page.tsx');
  const set = src.match(/const RESTATES_NAME = new Set\(\[([^\]]*)\]\)/);
  assert.ok(set, 'RESTATES_NAME not found');
  assert.ok(!/oregon-school-budget-report/.test(set[1]), 'Oregon’s line is still hidden');
});

test('built: every report row carries its line and a "Read it" label', { skip: BUILT ? false : 'no build present' }, () => {
  const html = readFileSync(BUILT, 'utf8');
  const reports = html.match(/<section[^>]*data-shelf="report"[^>]*>([\s\S]*?)<\/section>/)[1];
  for (const t of TOOLS.filter((x) => x.shelf === 'report')) {
    assert.ok(reports.includes(t.line), `${t.slug} line missing`);
  }
  assert.equal((reports.match(/Read it/g) ?? []).length, TOOLS.filter((x) => x.shelf === 'report').length, 'one Read it per report');
});
