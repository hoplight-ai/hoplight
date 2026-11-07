// The Insights rows that land on the one-password sign-in carry a small lock mark, and no open row does
// (HOPSITE2, 2026-11-07). The October rebuild brief asked for it: the page says in one line that these
// open with a password. The mark is that line, drawn as an icon with the label "sign-in required".
//
//   node --test scripts/insights-lock.test.mjs      (also part of `npm test`)
//
// What it proves:
//   1. opensSignIn() in the gate file agrees with the gate for every Insights link, and the page has both
//      kinds of row. The links are read from the content file's source, since its @/ imports do not load
//      under plain node.
//   2. In the built Insights page, every card and row whose path is gated carries the mark, and no open
//      card or row does.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { isGated, opensSignIn } from '../src/lib/gate.ts';
import { TOOLS } from '../src/data/tools.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = readFileSync(path.join(ROOT, 'src/lib/insights-content.ts'), 'utf8');
// Plain-quoted hrefs are the site's own paths; the Substack ones are template strings to another site.
// Since PORTSPLIT1 round two (2026-11-07) the public reports come from the tool list (shelf 'report') and
// Writing comes from the Substack feed, so the page's links are the content file's site paths, the tool
// list's reports, and however many posts the feed gave at build time.
const REPORT_HREFS = TOOLS.filter((t) => t.shelf === 'report').map((t) => t.href);
const LOCAL = [...[...SRC.matchAll(/href: '([^']+)'/g)].map((m) => m[1]), ...REPORT_HREFS];
const gatedHref = (href) => href.startsWith('/') && isGated(href);
const MARK = /aria-label="sign-in required"/;

const BUILT = ['.next/server/app/insights.html', '.next/server/app/(main)/insights.html']
  .map((rel) => path.join(ROOT, rel))
  .find((p) => existsSync(p));

test('opensSignIn agrees with the gate on every Insights link', () => {
  assert.ok(LOCAL.length > 0, 'no site paths read from the Insights content');
  for (const href of LOCAL) assert.equal(opensSignIn(href), gatedHref(href), href);
  assert.equal(opensSignIn(undefined), false);
  assert.equal(opensSignIn('https://whitpendergast.substack.com/p/x'), false);
  assert.ok(LOCAL.some(gatedHref), 'no Insights link is gated, so the test proves nothing');
  assert.ok(LOCAL.some((h) => !gatedHref(h)), 'every Insights link is gated, so the test proves nothing');
});

test('in the built Insights page, gated rows carry the lock and open rows do not', { skip: BUILT ? false : 'no build present' }, () => {
  const html = readFileSync(BUILT, 'utf8');
  const anchors = [...html.matchAll(/<a class="(?:rep|ptile)" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  const hrefs = anchors.map(([, href]) => href.replace(/&amp;/g, '&'));
  for (const href of LOCAL) assert.equal(hrefs.filter((h) => h === href).length, 1, `${href}: not one card or row`);
  assert.ok(hrefs.some((h) => h.startsWith('https://whitpendergast.substack.com/p/')), 'no Writing card');
  let locked = 0;
  for (const [, href, inner] of anchors) {
    const want = gatedHref(href.replace(/&amp;/g, '&'));
    assert.equal(MARK.test(inner), want, `${href}: ${want ? 'gated but carries no lock' : 'open but carries the lock'}`);
    if (want) locked += 1;
  }
  assert.ok(locked > 0, 'no row carries the lock');
  assert.equal((html.match(/aria-label="sign-in required"/g) || []).length, locked, 'a lock outside a gated row');
});
