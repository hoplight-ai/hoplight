// The portfolio tiles carry their marks (MARKSLIVE1, 2026-11-07). On /portfolio the corner drawing of
// three tiles is the mark Whit approved in the tile mockup (lane TILEVALUE1, public/mockups/tile-value.html
// on branch tilevalue1-each-tile-says at 382e574, row two): the scales of justice for Revenge or Justice,
// the stroke of a pen for The Undo List, and the fork with the gold arrow for Which AI should I use?.
// Whit, 2026-11-07: "revenge of justice is supposed to use the scales of justice. The undo list should have
// a pen right it should be the stroke of a pen.", then "which AI looks like a broken umbrella upside down,
// no flow vibes at all. the rest work.", then "this" on the fork with the gold arrow.
//
// The marks are the tile's only. The link-preview cards, which draw src/data/tool-pictures.ts, keep the
// tool's own screen (Whit, 2026-10-22: "people will have greater trust if the formatting of the output loks
// like the toolkit they recieved"), so every pictureSvg string is pinned here as it stood before the marks.
// Run: node --test scripts/tool-marks.test.mjs (part of npm test).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { TOOLS } from '../src/data/tools.ts';
import { pictureSize, pictureSvg } from '../src/data/tool-pictures.ts';
import { CARD_H, CARD_W } from '../src/lib/brand/tool-card.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');
const sha = (s) => createHash('sha256').update(s).digest('hex');
const MARKS_FILE = path.join(ROOT, 'src/data/tool-marks.ts');
const marks = async () => import('../src/data/tool-marks.ts');
const noMarks = existsSync(MARKS_FILE) ? false : 'src/data/tool-marks.ts is missing';
const built = [`.next/server/app/portfolio.html`, `.next/server/app/(main)/portfolio.html`]
  .map((rel) => path.join(ROOT, rel))
  .find((p) => existsSync(p));

// The four approved marks, each the exact string the mockup's script draws for row two, hashed. Counted
// 2026-11-07 by running the mockup's own script at 382e574 in node and hashing MARK[slug]. The fourth, the
// kids Wonder Cards deck's fanned hand of three cards with the question on the front one, joined with the
// deck (WCKIDS2, 2026-11-07); Whit, 2026-11-07, of the mockup's marks: "the rest work."
const APPROVED = {
  'revenge-or-justice': '286f28bbe021bf82d1fff206bdccda02e0f4e34efac7e7221388f5b580051f27',
  undo: '77882aaa6940515e7fff6d26dbe88da7c21b876411d6f780bbddbbdf7fc01dcb',
  'which-ai-should-i-use': 'f687685e6c95ba7da780bb503885830a6d0ba39a1ec9224d06255f742bec9136',
  'wonder-cards': '56af4780ce5b74b2061fc0d3fd81c8aa841c45316c7c57b9db6bd6b93672de91',
};

// Each mark's colours, from the mockup's token plan: only the tool's own.
const COLOURS = {
  'revenge-or-justice': ['#FFFFFF', '#0F1B2D', '#9C3327', '#996D00'],
  undo: ['#FFFFFF', '#0F1B2D', '#D4950A'],
  'which-ai-should-i-use': ['#FFFFFF', '#0F1B2D', '#D4950A'],
  'wonder-cards': ['#3B3560', '#FFFDF8', '#FFD166', '#FFAA5C'],
};

// Every tool's pictureSvg as it stood on 2026-11-07 before this lane, hashed (counted at c9fbfd1).
const PICTURES = {
  'revenge-or-justice': '28d1562bc6ec3f4b5913feea07e920387f058e46ff9b215fefc4f6d0d7a2ea08',
  undo: '2d595a1c55944d0c9eddc227b47f947123cc9ea17730337fd0767ca45cd77c38',
  'gut-check': '892266dedfb60e6de342062087a93e9f75a648793b1d73634502c2b05d7d1eed',
  rumi: 'b45af9d91bc428222bd3eb610869b951b4ad583c22a1d19a4582a9e58354afe4',
  letters: 'bd0a392e0404d625e01167d132893387d6db13e5ac1f2d23cff6611a97bdf00d',
  'dnc-autopsy-taken-apart': '5d8b94fadb821b46b73ab37698fc72d66cb2aea0108ad02d33a5393a54f0f7ce',
  'agis-policy-search-aria': '153502b19e56bcc62cc4937a8d6a9fe9e29003c140c53dac95de1d768952f137',
  'ai-election-errors': '55d840dd5c4d8780881bc4d50cb223fff50a5572f53466a518c04b803f7da22e',
  'bet-appetit': '4ad8ac463b980082fc63ecef32be6e35acffe21f01c59aa67c866b3bf9a1ff59',
  'oregon-school-budget-report': '268d5539935c138e10398a0dc4044a61a7881fcc16131fa7d02ce89f0b1b0bfb',
  'what-s-human': '59158fab00a52180531232b327b19b495210909a53b93edee99e7e95bd3169ce',
  'which-ai-should-i-use': 'fce1f9e1cf6f31c6cc2e6a602f2ab4d21c32790ddc280fbeec9da1c2468f63f9',
  'worker-equity-dilution-at-ge': '1a5be396dd469d309863f25e8c8adb4e313d5ecfc011ce2b68da062e57eb1833',
  // Added with the deck (WCKIDS2, 2026-11-07): the existing cards picture in the deck's colours, the way the
  // mockup's first row draws its tile (docs/renders/tilevalue1-2026-11-07/today-wonder-cards.html at 382e574).
  'wonder-cards': '490b2b7497b2ba0acd9ff7b4d4edad95794ded8d64d386fbbb933b7da17c4494',
};

test('marks: the marks file exists', () => {
  assert.ok(existsSync(MARKS_FILE), 'src/data/tool-marks.ts is missing');
});

test('marks: exactly the four approved slugs have a mark, each the mockup string unchanged', { skip: noMarks }, async () => {
  const { TOOL_MARKS } = await marks();
  assert.deepEqual(Object.keys(TOOL_MARKS).sort(), Object.keys(APPROVED).sort());
  for (const [slug, hash] of Object.entries(APPROVED)) {
    assert.equal(typeof TOOL_MARKS[slug], 'string', `${slug} has no mark`);
    assert.equal(sha(TOOL_MARKS[slug]), hash, `${slug} mark differs from the mockup at 382e574`);
  }
});

test('marks: each mark uses only its tool\'s own colours and carries no text', { skip: noMarks }, async () => {
  const { TOOL_MARKS } = await marks();
  for (const [slug, svg] of Object.entries(TOOL_MARKS)) {
    const used = [...new Set(svg.match(/#[0-9A-Fa-f]{6}\b/g))].map((c) => c.toUpperCase()).sort();
    assert.deepEqual(used, [...COLOURS[slug]].sort(), slug);
    assert.ok(!/<text\b/.test(svg), `${slug} mark carries text`);
  }
});

test('marks: every marked tool is on the tool list, its mark box painted in the card\'s own ground, with the 280 square picture', { skip: noMarks }, async () => {
  // The mark first paints the card's 280 by 280 picture box in a ground: white for the three on white cards,
  // the deck's blueberry for Wonder Cards. It is only right where the card draws that box on that ground.
  const { TOOL_MARKS } = await marks();
  for (const slug of Object.keys(TOOL_MARKS)) {
    const t = TOOLS.find((x) => x.slug === slug);
    assert.ok(t, `${slug} is not on the tool list`);
    const box = /^<svg viewBox="0 0 280 280" aria-hidden="true"><rect width="280" height="280" fill="(#[0-9A-Fa-f]{6})"\/>/.exec(TOOL_MARKS[slug]);
    assert.ok(box, `${slug} mark does not paint its box first`);
    assert.equal(box[1].toUpperCase(), t.brand.ground.toUpperCase(), slug);
    assert.equal(t.brand.pic, undefined, `${slug} draws a picture of its own size`);
    assert.equal(t.brand.tileOnWhite, undefined, `${slug} tile is redrawn on white`);
    assert.deepEqual(pictureSize(t.brand), { w: 280, h: 280 }, slug);
  }
});

test('marks: the tile mark sits on the card\'s picture box, 72 in from the right and centred', { skip: noMarks }, async () => {
  const { MARK_BOX, tileMarkSvg } = await marks();
  assert.deepEqual(MARK_BOX, { x: CARD_W - 72 - 280, y: (CARD_H - 280) / 2, size: 280 });
  const svg = tileMarkSvg('undo');
  assert.ok(svg.startsWith(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}" preserveAspectRatio="xMidYMid slice"`), svg.slice(0, 160));
  assert.ok(svg.includes(`<svg x="${MARK_BOX.x}" y="${MARK_BOX.y}" width="280" height="280" viewBox="0 0 280 280">`));
  assert.equal(tileMarkSvg('ai-election-errors'), null);
  assert.equal(tileMarkSvg('no-such-tool'), null);
});

test('marks: the tile mark draws the approved mark\'s shapes unchanged', { skip: noMarks }, async () => {
  const { TOOL_MARKS, tileMarkSvg } = await marks();
  for (const [slug, svg] of Object.entries(TOOL_MARKS)) {
    const body = svg.replace(/^<svg viewBox="0 0 280 280" aria-hidden="true">/, '').replace(/<\/svg>$/, '');
    assert.ok(body.length < svg.length - 20, `${slug} mark does not open as the mockup's box`);
    assert.ok(tileMarkSvg(slug).includes(body), `${slug} tile mark changed the mark`);
  }
});

test('pictures: every tool\'s preview-card picture is unchanged', () => {
  assert.deepEqual(TOOLS.map((t) => t.slug).sort(), Object.keys(PICTURES).sort());
  for (const t of TOOLS) {
    const s = pictureSvg(t.brand);
    assert.equal(s === null ? null : sha(s), PICTURES[t.slug], `${t.slug} picture changed`);
  }
});

test('page: every tile keeps its preview card and draws its mark over the picture when it has one', () => {
  const src = read('src/app/(main)/portfolio/page.tsx');
  assert.match(src, /import \{ tileMarkSvg \} from '@\/data\/tool-marks';/);
  assert.ok(src.includes('src={`/api/og/tool/${p.slug}?band=0`}'), 'the tile no longer shows its preview card');
  assert.ok(src.includes('const mark = tileMarkSvg(p.slug);'), 'the tile does not look up its mark');
  const img = src.indexOf('className="wcard-img wcard-img-card"');
  const mark = src.indexOf('{mark && <div className="wcard-mark" aria-hidden="true" dangerouslySetInnerHTML={{ __html: mark }} />}');
  const body = src.indexOf('className="wcard-body"');
  assert.ok(img > 0 && mark > img && mark < body, 'the mark is not drawn inside the tile\'s picture');
});

test('css: the mark covers the tile picture exactly', () => {
  const css = read('src/app/globals.css');
  assert.match(css, /\.gallery-grid \.wcard-img \.wcard-mark \{[^}]*position: absolute;[^}]*inset: 0;/);
  assert.match(css, /\.gallery-grid \.wcard-img \.wcard-mark svg \{[^}]*width: 100%;[^}]*height: 100%;/);
});

test('built: each marked tile on /portfolio draws its mark, and no other tile does', { skip: built ? false : 'no build present' }, async () => {
  const { TOOL_MARKS, tileMarkSvg } = await marks();
  const html = readFileSync(built, 'utf8');
  const tiles = html.split('<li>').slice(1);
  const showing = TOOLS.filter((t) => html.includes(`href="${t.href}"`));
  assert.ok(showing.length > 0);
  for (const t of showing) {
    const tile = tiles.find((x) => x.includes(`href="${t.href}"`));
    assert.ok(tile.includes(`/api/og/tool/${t.slug}?band=0`), `${t.slug} lost its preview card`);
    if (TOOL_MARKS[t.slug]) assert.ok(tile.includes(tileMarkSvg(t.slug)), `${t.slug} tile does not draw its mark`);
    else assert.ok(!tile.includes('wcard-mark'), `${t.slug} tile draws a mark it does not have`);
  }
});

// UNDONOW1, 2026-11-08. Whit, 2026-11-08: "The undo list is supposed to be one of the products. And I want you
// to make this live." A build from 2026-11-08 on draws The Undo List's tile with its pen mark.
test('built: The Undo List tile shows on /portfolio with its pen mark (UNDONOW1)', { skip: built ? false : 'no build present' }, async () => {
  const { tileMarkSvg } = await marks();
  const html = readFileSync(built, 'utf8');
  const undo = TOOLS.find((t) => t.slug === 'undo');
  const tile = html.split('<li>').slice(1).find((x) => x.includes(`href="${undo.href}"`));
  assert.ok(tile, 'The Undo List has no tile on the built /portfolio');
  assert.ok(tile.includes(tileMarkSvg('undo')), 'The Undo List tile does not draw its pen mark');
});
