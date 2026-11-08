// The nine reports open only with the password (LOCKREPORTS1, 2026-11-07). Whit that day, answering whether
// to lock nine charts that were public on purpose: "hide them all the dnc after action report, the electoral
// cost, the dilution models  can remain a report but locked up."
//
//   node --test scripts/reports-locked.test.mjs      (also part of `npm test`)
//
// Read that way: all nine are behind the one-password sign-in. Four stay listed as reports, with the lock
// drawn: the DNC after-action report, the electoral cost piece and the two dilution models. The other five
// are hidden and listed nowhere: the CBA playbook, the federal agency AI inventory, the AI governance
// checklist, the AI lobbyist player map and the investment dashboard.
//
// What it proves:
//   1. Every one of the nine is gated, and a browser without the cookie gets the sign-in page for each,
//      while the gate is armed.
//   2. The hidden five are linked from no page source under src/ (comments aside) and from no sitemap row.
//   3. Any of the nine that the site lists is listed on the Insights Reports list, where the row draws the
//      lock (opensSignIn), never as a portfolio product.
//   4. The DNC and GE reports are still listed on Insights, still on the report shelf, cleared and not held.
//   5. In the built Insights page, the DNC and GE rows carry the lock and the CBA and checklist rows are gone.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { NextRequest } from 'next/server.js';
import { proxy } from '../src/proxy.ts';
import { isGated, opensSignIn } from '../src/lib/gate.ts';
import { TOOLS } from '../src/data/tools.ts';
import sitemap from '../src/app/sitemap.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');
const req = (p) => new NextRequest(`http://localhost:8794${p}`, { headers: { accept: 'text/html,application/xhtml+xml' } });
const passedThrough = (res) => res.headers.get('x-middleware-next') === '1';

process.env.PRIVATE_SITE_USER = 'reports-locked-test-user';
process.env.PRIVATE_SITE_PASSWORD = 'reports-locked-test-pass';

const piece = (slug) => `/portfolio/${slug}.html`;

// The four Whit kept as reports, and the five he hid. Which file is which: the dispatch's done-file
// for LOCKREPORTS1 maps each by its title.
const KEPT = [
  'dnc-autopsy-taken-apart', // DNC 2024 After Action Report
  'every-political-dollar-buys-less', // electoral cost: cost per vote, 2000 to 2024
  'worker-equity-dilution-at-ge', // dilution model, GE
  'pdi-trust-dilution-model', // dilution model, Predistribution Initiative worker trust
];
const HIDDEN = [
  'cba-win-pattern-playbook',
  'federal-agency-ai-inventory',
  'ai-governance-checklist',
  'ai-lobbyist-player-map',
  'where-political-money-actually-works', // the investment dashboard: what the same money buys, state against federal
];
const NINE = [...KEPT, ...HIDDEN];

// The Insights links, read from the content file's source (its @/ imports do not load under plain node).
const INSIGHTS = read('src/lib/insights-content.ts');
const REPORTS_SRC = INSIGHTS.slice(INSIGHTS.indexOf('export const REPORTS'));
const REPORT_HREFS = [...REPORTS_SRC.matchAll(/href: '([^']+)'/g)].map((m) => m[1]);

function sourceFiles(dir) {
  const out = [];
  for (const name of readdirSync(path.join(ROOT, dir))) {
    const rel = path.join(dir, name);
    if (statSync(path.join(ROOT, rel)).isDirectory()) out.push(...sourceFiles(rel));
    else if (/\.(tsx?|mjs|js)$/.test(name)) out.push(rel);
  }
  return out;
}
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

test('1. every one of the nine reports is gated, and a stranger gets the sign-in page', async () => {
  for (const slug of NINE) {
    const p = piece(slug);
    assert.ok(existsSync(path.join(ROOT, 'public', p)), `${p} is not in public/`);
    assert.ok(isGated(p), `${p} is open to anyone`);
    const res = await proxy(req(p));
    assert.equal(passedThrough(res), false, `${p} passed through to a stranger`);
    assert.match(await res.text(), /type="password"/, `${p} did not show the sign-in`);
  }
});

test('2. the hidden five are linked from no page source and no sitemap row', () => {
  const urls = sitemap().map((e) => new URL(e.url).pathname);
  for (const slug of NINE) assert.ok(!urls.includes(piece(slug)), `the sitemap lists ${slug}`);
  for (const rel of sourceFiles('src')) {
    const code = stripComments(read(rel));
    for (const slug of HIDDEN) assert.ok(!code.includes(slug), `${rel} still links ${slug}`);
  }
});

test('3. any of the nine the site lists is an Insights report row that draws the lock, never a product', () => {
  for (const slug of NINE) {
    const p = piece(slug);
    if (REPORT_HREFS.includes(p)) assert.equal(opensSignIn(p), true, `${slug} is listed on Insights with no lock`);
    for (const t of TOOLS.filter((x) => x.href === p)) {
      assert.equal(t.shelf, 'report', `${slug} is on the product shelf`);
      assert.ok(REPORT_HREFS.includes(p), `${slug} is on the report shelf but not listed on Insights, where the lock is drawn`);
    }
  }
});

test('4. the DNC and GE reports stay listed: on Insights, on the report shelf, cleared and not held', () => {
  for (const slug of ['dnc-autopsy-taken-apart', 'worker-equity-dilution-at-ge']) {
    const t = TOOLS.find((x) => x.slug === slug);
    assert.ok(t, `${slug} left the tool list`);
    assert.equal(t.shelf, 'report', slug);
    assert.equal(t.cleared, true, slug);
    assert.ok(!t.hold, `${slug} is held`);
    assert.ok(REPORT_HREFS.includes(piece(slug)), `${slug} left the Insights Reports list`);
  }
});

const BUILT = ['.next/server/app/insights.html', '.next/server/app/(main)/insights.html']
  .map((rel) => path.join(ROOT, rel))
  .find((p) => existsSync(p));

test('5. built Insights: the DNC and GE rows carry the lock, the CBA and checklist rows are gone', { skip: BUILT ? false : 'no build present' }, () => {
  const html = readFileSync(BUILT, 'utf8');
  const rows = new Map([...html.matchAll(/<a class="(?:rep|ptile)" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => [m[1], m[2]]));
  for (const slug of ['dnc-autopsy-taken-apart', 'worker-equity-dilution-at-ge']) {
    assert.ok(rows.has(piece(slug)), `${slug} is not on the built Insights page`);
    assert.match(rows.get(piece(slug)), /aria-label="sign-in required"/, `${slug} draws no lock`);
  }
  for (const slug of HIDDEN) assert.ok(!html.includes(slug), `${slug} is on the built Insights page`);
});
