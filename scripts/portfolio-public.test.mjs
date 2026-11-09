// The portfolio is public on the rebuilt site (HOPSITE2, 2026-11-07). The October rebuild put /portfolio
// behind the one-password sign-in; the newer ask is the portfolio "live w the rebuild and dialed in for
// public sharing" (Whit, 2026-11-07), so /portfolio opens to anyone, and so do the portfolio pieces its
// own list links to. Every other path the rebuild gated stays gated.
//
//   node --test scripts/portfolio-public.test.mjs      (also part of `npm test`)
//
// What it proves:
//   1. The portfolio page source carries none of the cut lines ("open in your browser", "proofs of concept",
//      the production subline), and nor does its built HTML when a build is present.
//   2. /portfolio answers without the cookie, passed straight through, with no noindex from the proxy, and
//      its built HTML carries no robots noindex.
//   3. Every nav route, the Contact button and the home page answer without the cookie.
//   4. Every path the rebuild gated, other than /portfolio and the pieces the portfolio lists, still lands
//      a browser on the sign-in page, and so do the DNC and GE reports, locked on 2026-11-07 (LOCKREPORTS1).
//   5. Every product link that points into /portfolio/ is open; a report link may be gated only when it is
//      listed on /insights, whose row draws the lock. /portfolio is in the sitemap and in the nav.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { NextRequest } from 'next/server.js';
import { proxy } from '../src/proxy.ts';
import { isGated, MOVED_TOOLS, opensSignIn } from '../src/lib/gate.ts';
import { NAV_LINKS, CONTACT_LINK } from '../src/lib/nav-links.ts';
import { TOOLS } from '../src/data/tools.ts';
import sitemap from '../src/app/sitemap.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');
const ORIGIN = 'http://localhost:8793';
const BROWSER = { accept: 'text/html,application/xhtml+xml' };
const req = (p) => new NextRequest(`${ORIGIN}${p}`, { headers: BROWSER });
const passedThrough = (res) => res.headers.get('x-middleware-next') === '1';

// The env pair is set for the whole file, so "open" below means open to a browser with no cookie while
// the gate is armed, not open because the gate failed closed the other way.
process.env.PRIVATE_SITE_USER = 'portfolio-public-test-user';
process.env.PRIVATE_SITE_PASSWORD = 'portfolio-public-test-pass';

const CUT_LINES = [
  /open in your browser/i,
  /proofs? of concept/i,
  /running these tools in production/i,
  /A tool other teams can run themselves/i,
];

// The built page, when `npm run build` has run: the portfolio revalidates hourly, so the build writes it.
const BUILT = ['.next/server/app/portfolio.html', '.next/server/app/(main)/portfolio.html']
  .map((rel) => path.join(ROOT, rel))
  .find((p) => existsSync(p));

// Every path the rebuild gated, one or more per entry on its list, with /portfolio itself left out.
const STILL_GATED = [
  '/persuasion', '/research', '/hoplight-rct-research-brief.pdf', '/rayli', '/rayli/x',
  '/pme-lever.html', '/hoplight-brand-tokens-2026-09-20.html', '/shelf-options/a.html', '/mockups/a-discretion/index.html',
  '/portfolio/thumbs/x.png',
  // the pieces that left the gallery on 2026-10-21, and the two the Insights page lists
  '/portfolio/pdi-trust-dilution-model.html', '/portfolio/where-political-money-actually-works.html',
  '/portfolio/redistricting-seat-shifts.html', '/portfolio/hoplight-persuasion-story-page.html',
  '/portfolio/every-political-dollar-buys-less.html', '/portfolio/cba-win-pattern-playbook.html',
  '/portfolio/federal-agency-ai-inventory.html', '/portfolio/ai-lobbyist-player-map.html',
  '/portfolio/ai-governance-checklist.html',
  // the two reports locked on 2026-11-07 (LOCKREPORTS1), still listed on /insights with the lock
  '/portfolio/dnc-autopsy-taken-apart.html', '/portfolio/worker-equity-dilution-at-ge.html',
  // the Oregon report, locked on 2026-11-08 (LOCKOREGON1), still listed on /insights with the lock
  '/portfolio/oregon-school-budget-report.html',
  ...MOVED_TOOLS.flatMap((t) => [`/${t.name}`, `/${t.name}/x`]),
];

test('the portfolio page source carries none of the cut lines', () => {
  const src = read('src/app/(main)/portfolio/page.tsx');
  for (const re of CUT_LINES) assert.ok(!re.test(src), `the portfolio source still carries ${re}`);
});

test('the built portfolio HTML carries none of the cut lines and no noindex', { skip: BUILT ? false : 'no build present' }, () => {
  const html = readFileSync(BUILT, 'utf8');
  for (const re of CUT_LINES) assert.ok(!re.test(html), `the built portfolio still carries ${re}`);
  assert.ok(!/<meta[^>]+name="robots"[^>]+noindex/i.test(html), 'the built portfolio is marked noindex');
});

// The design review of 2026-11-07, fix 1 (blocking): the router is a one-off and is never surfaced, so
// the portfolio carries no Pandora's Router block, no router button and no link to its code.
const ROUTER = [/Pandora/i, /router\.hoplight\.ai/i, /pandoras-router/i];
test('no Pandora’s Router block renders on /portfolio', { skip: BUILT ? false : 'no build present' }, () => {
  const src = read('src/app/(main)/portfolio/page.tsx').replace(/\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  const html = readFileSync(BUILT, 'utf8');
  for (const re of ROUTER) {
    assert.ok(!re.test(src), `the portfolio source still renders ${re}`);
    assert.ok(!re.test(html), `the built portfolio still carries ${re}`);
  }
});

test('/portfolio answers without the cookie and the proxy adds no noindex', async () => {
  for (const p of ['/portfolio', '/portfolio/']) {
    assert.equal(isGated(p), false, `${p} is gated`);
    const res = await proxy(req(p));
    assert.equal(res.status, 200, p);
    assert.ok(passedThrough(res), `${p} should pass straight through`);
    assert.equal(res.headers.get('x-robots-tag'), null, `${p} is marked noindex`);
  }
});

test('every nav route, the Contact button and the home page answer without the cookie', async () => {
  for (const { href } of [{ href: '/' }, ...NAV_LINKS, CONTACT_LINK]) {
    const res = await proxy(req(href));
    assert.equal(res.status, 200, href);
    assert.ok(passedThrough(res), `${href} should pass straight through`);
  }
});

test('the nav carries Portfolio and the sitemap lists /portfolio', () => {
  assert.ok(NAV_LINKS.some((l) => l.href === '/portfolio' && l.label === 'Portfolio'), 'Portfolio is not in the nav');
  assert.ok(sitemap().some((e) => e.url === 'https://hoplight.ai/portfolio'), '/portfolio is not in the sitemap');
});

// LOCKREPORTS1, 2026-11-07: a product tile never lands a stranger on the sign-in. A report may link to a
// gated piece only when the row that lists it draws the lock: reports are listed on /insights, whose rows
// draw it through opensSignIn() (scripts/insights-lock.test.mjs), so a gated report must be on that list.
const INSIGHTS_SRC = read('src/lib/insights-content.ts');
const REPORT_HREFS = [...INSIGHTS_SRC.slice(INSIGHTS_SRC.indexOf('export const REPORTS')).matchAll(/href: '([^']+)'/g)].map((m) => m[1]);

async function linkProblem(t) {
  const open = passedThrough(await proxy(req(t.href)));
  if (open) return null;
  if (t.shelf === 'product') return `${t.name} (${t.href}) is a product and lands on the sign-in`;
  if (!REPORT_HREFS.includes(t.href)) return `${t.name} (${t.href}) is gated and listed nowhere that draws the lock`;
  if (!opensSignIn(t.href)) return `${t.name} (${t.href}) is gated but its row would draw no lock`;
  return null;
}

test('every product link into /portfolio/ is open, and a gated report link draws the lock', async () => {
  const inside = TOOLS.filter((t) => t.cleared && t.href.startsWith('/portfolio/'));
  assert.ok(inside.length > 0);
  for (const t of inside) assert.equal(await linkProblem(t), null);
});

test('the rule refuses a product linking to a gated piece, and a gated report listed nowhere', async () => {
  const gated = '/portfolio/dnc-autopsy-taken-apart.html';
  assert.match(await linkProblem({ name: 'probe', href: gated, shelf: 'product' }), /is a product/);
  assert.match(await linkProblem({ name: 'probe', href: '/portfolio/federal-agency-ai-inventory.html', shelf: 'report' }), /listed nowhere/);
  assert.equal(await linkProblem({ name: 'probe', href: gated, shelf: 'report' }), null);
});

test('every other path the rebuild gated still lands a browser on the sign-in page', async () => {
  for (const p of STILL_GATED) {
    assert.ok(isGated(p), `${p} is no longer gated`);
    const res = await proxy(req(p));
    assert.equal(passedThrough(res), false, `${p} passed through`);
    assert.match(await res.text(), /type="password"/, `${p} did not show the sign-in`);
  }
});
