// Products and reports (PORTSPLIT1, 2026-11-07). Every entry in src/data/tools.ts carries `shelf`.
// Round one, Whit, 2026-11-07: "we had previously split out reports from apps and dashboards and I think we
// need that sort of division ... like dilution at GE is a report."
// Round two, Whit, the same day, after seeing round one: "the reports need to live more as ... a research
// section of the website or something may be tied into my writings or like a blog or a Substack
// connection." So /portfolio shows products only. /insights keeps its own hand-kept list, which already
// names the three reports (round six, below).
// Run: node --test scripts/portfolio-shelf.test.mjs (part of npm test).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { TOOLS, onShelf, visibleTools } from '../src/data/tools.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');
const at = (iso) => Date.parse(iso);
const slugs = (list) => list.map((t) => t.slug);
const built = (name) => [`.next/server/app/${name}.html`, `.next/server/app/(main)/${name}.html`]
  .map((rel) => path.join(ROOT, rel))
  .find((p) => existsSync(p));
const BUILT_PORTFOLIO = built('portfolio');
const BUILT_INSIGHTS = built('insights');

const REPORTS = ['dnc-autopsy-taken-apart', 'oregon-school-budget-report', 'worker-equity-dilution-at-ge'];
const reportTools = () => TOOLS.filter((t) => t.shelf === 'report');

test('shelf: every entry says product or report', () => {
  for (const t of TOOLS) assert.ok(t.shelf === 'product' || t.shelf === 'report', `${t.slug} shelf ${t.shelf}`);
});

test('shelf: the three reports are DNC, Oregon and GE, and everything else is a product', () => {
  assert.deepEqual(slugs(reportTools()).sort(), [...REPORTS].sort());
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

test('onShelf: keeps the schedule order and only that shelf', () => {
  const now = at('2026-11-07T12:00:00-08:00');
  const all = visibleTools(now);
  assert.deepEqual(slugs(onShelf('report', all)), ['dnc-autopsy-taken-apart', 'oregon-school-budget-report', 'worker-equity-dilution-at-ge']);
  assert.deepEqual(slugs(onShelf('product', all)), slugs(all).filter((s) => !REPORTS.includes(s)));
  assert.deepEqual(onShelf('report', TOOLS.filter((t) => t.shelf === 'product')), []);
});

test('onShelf: at 2026-11-07 noon /portfolio shows exactly these products (PORTHOLD1)', () => {
  // Whit, 2026-11-07: Bet Appetit cut; AGIS and Gut Check held for their own announcements; Letters held
  // the same day as a feature of Rumi (LETTERSOFF1; Whit, 2026-11-07: "1 yes.").
  const now = at('2026-11-07T12:00:00-08:00');
  assert.deepEqual(slugs(onShelf('product', visibleTools(now))), ['ai-election-errors', 'what-s-human', 'which-ai-should-i-use']);
});

test('page: /portfolio draws products only and carries no Reports part', () => {
  const src = read('src/app/(main)/portfolio/page.tsx').replace(/\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  assert.match(src, /onShelf\('product'/, 'the portfolio does not keep to products');
  assert.ok(!/Reports/.test(src), 'the portfolio still draws a Reports heading');
  assert.ok(!/report-list|report-row/.test(src), 'the portfolio still draws the report list');
  assert.ok(!/RESTATES_NAME/.test(src), 'the hidden-line list is back on the page');
});

test('built: no report renders on /portfolio, and every product showing draws its line', { skip: BUILT_PORTFOLIO ? false : 'no build present' }, () => {
  const html = readFileSync(BUILT_PORTFOLIO, 'utf8');
  for (const t of reportTools()) assert.ok(!html.includes(`href="${t.href}"`), `${t.slug} renders on /portfolio`);
  assert.ok(!/>Reports</.test(html), 'a Reports heading renders on /portfolio');
  const showing = TOOLS.filter((t) => html.includes(`href="${t.href}"`));
  assert.ok(showing.length > 0);
  for (const t of showing) {
    assert.equal(t.shelf, 'product', t.slug);
    assert.ok(html.includes(t.line), `${t.slug} line missing`);
  }
});

// Round six, Whit, 2026-11-07, after seeing both: "The insights page the before version is the winner and the
// products page ... the after version is the winner". So /insights is back as it was, hand-kept, and lists
// the three reports itself; the tool list's shelf field only keeps them off /portfolio. This test keeps every
// report reachable from /insights once it has left /portfolio.
test('built: every report is listed once on /insights', { skip: BUILT_INSIGHTS ? false : 'no build present' }, () => {
  const html = readFileSync(BUILT_INSIGHTS, 'utf8');
  for (const t of reportTools()) {
    assert.equal(html.split(`href="${t.href}"`).length - 1, 1, `${t.slug} is not listed exactly once on /insights`);
  }
});
