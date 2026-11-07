// Products is folded into Portfolio (HOPSITE2, 2026-11-07). Whit answered yes ("yes to 2 and 1") to:
// "Fold Products into Portfolio? Both pages list your tools. Yes: one tool page, and the home page's
// Products tile goes straight to it, which also puts a tool one tap from a phone's first screen."
//
//   node --test scripts/products-folded.test.mjs      (also part of `npm test`)
//
// What it proves:
//   1. /products is a permanent redirect to /portfolio, and the Products page file is gone.
//   2. No nav, Contact or footer link, and no home tile, points at /products; the sitemap does not name it.
//   3. The home page's first screen (its tiles) links to /portfolio, and when a build is present the built
//      home and portfolio pages carry no link to /products.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import nextConfig from '../next.config.ts';
import { NAV_LINKS, CONTACT_LINK, FOOTER_LINKS } from '../src/lib/nav-links.ts';
import sitemap from '../src/app/sitemap.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');
const built = (name) => ['.next/server/app', '.next/server/app/(main)']
  .map((dir) => path.join(ROOT, dir, name))
  .find((p) => existsSync(p));
const HOME_HTML = built('index.html');
const PORTFOLIO_HTML = built('portfolio.html');
const linksToProducts = (html) => /href="\/products(?:[/?#"])/.test(html);

test('/products is a permanent redirect to /portfolio, and the Products page file is gone', async () => {
  const redirects = await nextConfig.redirects();
  const r = redirects.find((x) => x.source === '/products' && !x.has);
  assert.ok(r, 'no redirect for /products');
  assert.equal(r.destination, '/portfolio');
  assert.equal(r.permanent, true, 'the redirect is not permanent');
  assert.ok(!existsSync(path.join(ROOT, 'src/app/(main)/products/page.tsx')), 'the Products page file is still there');
});

test('no nav, Contact or footer link points at /products, and the sitemap does not name it', () => {
  for (const { href, label } of [...NAV_LINKS, CONTACT_LINK, ...FOOTER_LINKS]) {
    assert.ok(!href.startsWith('/products'), `${label} still points at ${href}`);
    assert.notEqual(label, 'Products', 'a link is still labelled Products');
  }
  const urls = sitemap().map((e) => e.url);
  assert.ok(!urls.some((u) => /\/products(?:$|\/)/.test(u)), '/products is still in the sitemap');
});

test('the home tiles link to /portfolio and not to /products', () => {
  const home = read('src/app/(main)/page.tsx');
  const tiles = home.slice(home.indexOf('const TILES'), home.indexOf('];', home.indexOf('const TILES')));
  assert.ok(tiles.includes("href: '/portfolio'"), 'no home tile goes to /portfolio');
  assert.ok(tiles.includes("name: 'Portfolio'"), 'no home tile says Portfolio');
  assert.ok(!tiles.includes('/products'), 'a home tile still goes to /products');
});

test('the built home page links to /portfolio from its tiles, and neither built page links to /products', { skip: HOME_HTML && PORTFOLIO_HTML ? false : 'no build present' }, () => {
  const home = readFileSync(HOME_HTML, 'utf8');
  const tiles = home.slice(home.indexOf('class="hero-tiles"'));
  assert.ok(/<a class="hero-tile" href="\/portfolio"/.test(tiles), 'the home first screen has no tile to /portfolio');
  assert.ok(!linksToProducts(home), 'the built home page still links to /products');
  assert.ok(!linksToProducts(readFileSync(PORTFOLIO_HTML, 'utf8')), 'the built portfolio still links to /products');
});
