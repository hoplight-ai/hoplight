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

// Round two of the owner's notes, 2026-10-21 ("the subheading on the landing page arent necessary...
// horrificly unprofessional and sausage making shit. just cut all the sub headers"; "like a sniveling
// groveling overshare"; "where is the About page mock up and the FAQ?"; the Insights page "could actually
// also highlight my substack writings"). The two review routes are insights-b and insights-c.
const REVIEW_FILES = ['src/app/(main)/insights-b/page.tsx', 'src/app/(main)/insights-c/page.tsx'];
const OWNER_PAGES = [...PAGE_FILES, ...REVIEW_FILES];

test('the groveling sentence and the cut sub-lines never come back to a page source', () => {
  const cut = [
    'perpetual fees',
    'run it without us',
    'we can stay',
    'open in a browser',
    'open in your browser',
    'ten reports',
    'with a password',
  ];
  // The portfolio page is behind the sign-in and is not one of the pages the owner named, so it is not read.
  for (const rel of OWNER_PAGES) {
    const text = read(rel).toLowerCase();
    for (const phrase of cut) assert.ok(!text.includes(phrase), `${rel} carries "${phrase}"`);
  }
});

test('the home page carries the vetted hero from main and four tiles with no line under them', () => {
  const home = read('src/app/(main)/page.tsx');
  assert.ok(home.includes('Most organizations are bushwhacking their way through AI.'), 'the vetted H1 is missing');
  assert.ok(!home.includes('You have valuable data'), 'the unvetted headline came back');
  assert.ok(!/line:\s*['"`]/.test(home), 'a tile carries a line under its title');
  assert.ok(!home.includes('<p>{t.'), 'a tile renders a line under its title');
  for (const name of ['Products', 'Insights', 'Services', 'FAQ']) assert.ok(home.includes(`name: '${name}'`), `${name} tile is missing`);
});

test('About and FAQ render in the new frame: the page masthead', () => {
  for (const rel of ['src/app/(main)/about/page.tsx', 'src/app/(main)/faq/page.tsx']) {
    const text = read(rel);
    assert.ok(/<Masthead[^>]*variant="page"/.test(text), `${rel} is not in the page masthead`);
    assert.ok(!text.includes('page-hero'), `${rel} still uses the old page-hero band`);
  }
});

test('the two Insights review routes are noindex, out of the sitemap and out of the nav', () => {
  for (const rel of REVIEW_FILES) {
    assert.ok(existsSync(path.join(ROOT, rel)), `${rel} is missing`);
    assert.ok(/robots:\s*\{\s*index:\s*false/.test(read(rel)), `${rel} is not marked noindex`);
  }
  const urls = sitemap().map((e) => e.url);
  const links = [...NAV_LINKS, CONTACT_LINK, ...FOOTER_LINKS];
  for (const route of ['/insights-b', '/insights-c']) {
    assert.ok(!urls.includes(`https://hoplight.ai${route}`), `${route} is in the sitemap`);
    assert.ok(!links.some((l) => l.href === route), `${route} is in the nav or footer`);
    assert.equal(isGated(route), false, `${route} must stay open so the owner can compare it`);
  }
});

test('every Insights variant lists the Substack essays, the forthcoming CPR essay with no link, and the research pages', () => {
  const content = read('src/lib/insights-content.ts');
  assert.ok(content.includes('https://whitpendergast.substack.com'), 'the Substack is not named');
  assert.ok(content.includes('Pacing is political'), 'the CPR Hub Insight is missing');
  assert.ok(content.includes('/research') && content.includes('/persuasion'), 'a research page is missing');
  assert.ok(/Pacing is political[\s\S]{0,400}forthcoming:\s*true/.test(content), 'the CPR essay is not marked forthcoming');
  assert.ok(!/Pacing is political[\s\S]{0,200}href:/.test(content), 'the CPR essay carries a link');
});

test('the restructured pages, the nav and the footer carry no banned word and no em dash', () => {
  const files = [...PAGE_FILES.slice(0, 4), ...REVIEW_FILES, 'src/lib/insights-content.ts', 'src/components/Nav.tsx', 'src/components/Footer.tsx', 'src/lib/nav-links.ts'];
  const banned = /\b(doors?|rooms?|builds|tiers?|lanes?)\b/i;
  for (const rel of files) {
    // The home sentence under the vetted headline stays exactly as the live site has it (Whit, 2026-10-21:
    // "kept exactly as main has them"), and it says "builds"; that one phrase is the only exemption.
    const text = read(rel).replace('Hoplight builds the ones that do:', 'Hoplight delivers the ones that do:');
    assert.ok(!/\bIP\b/.test(text), `${rel} uses the word IP`);
    const hit = text.match(banned);
    assert.ok(!hit, `${rel} uses "${hit && hit[0]}"`);
    assert.ok(!text.includes('—'), `${rel} carries an em dash`);
  }
});
