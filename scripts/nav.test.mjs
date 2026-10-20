// The restructured site's front door: Whit, 2026-10-19 and 2026-10-20 ("i like the products page, the
// services page, the FAQ, the home page", "Insights is fine for now"). The nav is Products, Insights,
// Services, FAQ, About and the Contact button. Research, Rayli, Persuasion and Portfolio left the nav and
// the footer because they sit behind the one-password sign-in now (src/lib/gate.ts).
//
//   node --test scripts/nav.test.mjs      (also part of `npm test`)
//
// What it proves:
//   1. The nav holds exactly the six items, in order, with the paths the owner named.
//   2. None of the six, and nothing in the footer, is a gated path (the list is read from gate.ts).
//   3. Each page of the new structure has its page file, and the sitemap names /products and /insights.
//   4. The words the owner banned from the site (doors, rooms, builds, IP, tiers, lane) and the em dash
//      appear in none of the restructured pages, the nav or the footer.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { isGated } from '../src/lib/gate.ts';
import { NAV_LINKS, CONTACT_LINK, FOOTER_LINKS } from '../src/lib/nav-links.ts';
import sitemap from '../src/app/sitemap.ts';

// fileURLToPath rather than `new URL(...).pathname`, which mangles the space in the folder name.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');

const PAGE_FILES = [
  'src/app/(main)/page.tsx',
  'src/app/(main)/products/page.tsx',
  'src/app/(main)/insights/page.tsx',
  'src/app/(main)/services/page.tsx',
  'src/app/(main)/faq/page.tsx',
  'src/app/(main)/about/page.tsx',
  'src/app/(main)/contact/page.tsx',
];

test('the nav holds exactly Products, Insights, Services, FAQ and About, and a Contact button', () => {
  assert.deepEqual(
    NAV_LINKS.map((l) => [l.label, l.href]),
    [
      ['Products', '/products'],
      ['Insights', '/insights'],
      ['Services', '/services'],
      ['FAQ', '/faq'],
      ['About', '/about'],
    ],
  );
  assert.deepEqual([CONTACT_LINK.label, CONTACT_LINK.href], ['Contact', '/contact']);
});

test('no nav item and no footer link is a gated path', () => {
  for (const { href, label } of [...NAV_LINKS, CONTACT_LINK, ...FOOTER_LINKS]) {
    if (!href.startsWith('/')) continue; // mailto: and https: links are not site paths
    assert.equal(isGated(href), false, `${label} (${href}) sits behind the sign-in and must not be in the nav or footer`);
  }
});

test('Research, Rayli, Persuasion and Portfolio are in neither the nav nor the footer', () => {
  const links = [...NAV_LINKS, CONTACT_LINK, ...FOOTER_LINKS];
  for (const gone of ['/research', '/rayli', '/persuasion', '/portfolio']) {
    assert.ok(!links.some((l) => l.href === gone || l.href.startsWith(`${gone}/`)), `${gone} came back`);
  }
  for (const word of ['Research', 'Rayli', 'Persuasion', 'Portfolio']) {
    assert.ok(!links.some((l) => l.label === word), `${word} came back as a label`);
  }
});

test('every page of the new structure has its page file', () => {
  for (const rel of PAGE_FILES) assert.ok(existsSync(path.join(ROOT, rel)), `${rel} is missing`);
});

test('the sitemap lists /products and /insights', () => {
  const urls = sitemap().map((e) => e.url);
  assert.ok(urls.includes('https://hoplight.ai/products'), '/products is not in the sitemap');
  assert.ok(urls.includes('https://hoplight.ai/insights'), '/insights is not in the sitemap');
});

test('the restructured pages, the nav and the footer carry no banned word and no em dash', () => {
  const files = [...PAGE_FILES.slice(0, 4), 'src/components/Nav.tsx', 'src/components/Footer.tsx', 'src/lib/nav-links.ts'];
  const banned = /\b(doors?|rooms?|builds|tiers?|lanes?)\b/i;
  for (const rel of files) {
    const text = read(rel);
    assert.ok(!/\bIP\b/.test(text), `${rel} uses the word IP`);
    const hit = text.match(banned);
    assert.ok(!hit, `${rel} uses "${hit && hit[0]}"`);
    assert.ok(!text.includes('—'), `${rel} carries an em dash`);
  }
});
