// The live link-preview cards (src/lib/brand/tool-card.ts) carry the navy frame of
// public/mockups/card-frames.html (treatment 3) with lockup b of public/mockups/card-lockup.html in
// its foot. Whit, 2026-11-07: "let’s do lock up b", after "we don’t need to say product every time".
// A portfolio tile (band off) stays frameless. Revenge or Justice's picture is the balance scale, with
// no blade (CARDMARK2's brief: "no blade, no guillotine and nothing that evokes violence").
// Run: node --test scripts/tool-card.test.mjs (part of npm test).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOOLS, TOOL_BY_SLUG } from '../src/data/tools.ts';
import { pictureSvg } from '../src/data/tool-pictures.ts';
import * as card from '../src/lib/brand/tool-card.ts';

const { toolCard, PORTFOLIO_CARD, CARD_W, CARD_H } = card;
// Absent before the polish fixes; the tests that need them fail rather than the whole file.
const HAIRLINE_CONTRAST = card.HAIRLINE_CONTRAST ?? 0;
const contrastWithMat = card.contrastWithMat ?? (() => Infinity);
const LIBRARY = card.LIBRARY ?? [];
import { bloomLockup } from '../src/lib/brand/marks.ts';

const FONTS = { display: null, body: null };

/** Every element and string in a createElement tree, depth first. */
function walk(node, out = { els: [], text: [] }) {
  if (node == null || node === false) return out;
  if (typeof node === 'string' || typeof node === 'number') {
    out.text.push(String(node));
    return out;
  }
  if (Array.isArray(node)) {
    for (const c of node) walk(c, out);
    return out;
  }
  out.els.push(node);
  walk(node.props?.children, out);
  return out;
}

const NAVY = '#0F1B2D';
const isWindow = (el) => el.props?.style?.position === 'absolute' && el.props.style.left === '28px' && el.props.style.top === '28px';
const isLockup = (el) => el.type === 'img' && el.props.alt === 'Hoplight';

function framed(card, label, brand) {
  const root = card.props.style;
  assert.equal(root.width, `${CARD_W}px`, `${label}: card width`);
  assert.equal(root.height, `${CARD_H}px`, `${label}: card height`);
  assert.equal(root.backgroundColor, NAVY, `${label}: the mat is solid navy`);
  const { els, text } = walk(card);
  const win = els.filter(isWindow);
  assert.equal(win.length, 1, `${label}: one window inside the mat`);
  const w = win[0].props.style;
  assert.equal(w.width, '1144px', `${label}: window 1144 wide (28 of mat each side)`);
  assert.equal(w.height, '494px', `${label}: window 494 tall (28 of mat on top, 108 at the foot)`);
  assert.equal(w.borderRadius, '8px', `${label}: window corners 8`);
  const lock = els.filter(isLockup);
  assert.equal(lock.length, 1, `${label}: one Hoplight lockup`);
  const ls = lock[0].props.style;
  assert.equal(ls.left, '96px', `${label}: lockup starts at 96, the window's content edge`);
  assert.equal(ls.top, '522px', `${label}: lockup sits in the foot, from 522`);
  assert.equal(lock[0].props.height, 108, `${label}: the foot is 108 tall`);
  assert.ok(!text.some((s) => /^\s*by\s*$/i.test(s)), `${label}: no "by" on the card`);
  // The only typed text is the tool's own name: no "by", no kind word ("product", "report").
  assert.deepEqual(text, brand.wordmark.map((w) => w.text), `${label}: nothing typed but the tool's name`);
}

test('card: a band-on link-preview card draws the navy frame and lockup b, and no "by"', () => {
  for (const t of TOOLS) framed(toolCard(t, FONTS), t.slug, t.brand);
});

test('card: no tool card fills its window with the mat\'s own navy, so the frame always shows', () => {
  // CARDLIVE1 finding 1, 2026-11-07: Gut Check's ground was the mat's navy, so its window and the mat
  // read as one block. Its live app is white with navy type and gold, as card-frames.html draws it.
  for (const t of TOOLS) assert.notEqual(t.brand.ground.toUpperCase(), NAVY, `${t.slug}: ground is the mat's navy`);
  const gut = TOOL_BY_SLUG['gut-check'].brand;
  assert.equal(gut.ground.toUpperCase(), '#FFFFFF', 'gut-check: white ground, as the live app');
  assert.equal(gut.ink.toUpperCase(), NAVY, 'gut-check: navy type, as the live app');
});

// The card review of 2026-11-07, polish fix 1: What's Human's near-black window merged with the navy
// mat at 300px. A ground within HAIRLINE_CONTRAST of the mat gets a light hairline at the window's
// edge; every other card has none, and What's Human keeps its own ground.
const isHairline = (el) => el.props?.style?.position === 'absolute' && typeof el.props.style.border === 'string';

test('card: a ground too close to the mat gets a light hairline at the window edge, as a rule', () => {
  assert.ok(HAIRLINE_CONTRAST > 1 && HAIRLINE_CONTRAST <= 2, 'the threshold is a contrast ratio');
  const wh = TOOL_BY_SLUG['what-s-human'];
  assert.equal(wh.brand.ground.toUpperCase(), '#0D1017', "what-s-human keeps its own ground");
  assert.ok(contrastWithMat(wh.brand.ground) < HAIRLINE_CONTRAST, "what-s-human is within the threshold");
  for (const t of TOOLS) {
    const lines = walk(toolCard(t, FONTS)).els.filter(isHairline);
    const close = contrastWithMat(t.brand.ground) < HAIRLINE_CONTRAST;
    assert.equal(lines.length, close ? 1 : 0, `${t.slug}: ${close ? 'one hairline' : 'no hairline'}`);
    if (close) {
      const s = lines[0].props.style;
      assert.equal(s.left, '0px', `${t.slug}: hairline on the window's edge`);
      assert.equal(s.top, '0px');
      assert.equal(s.width, '1144px');
      assert.equal(s.height, '494px');
      assert.equal(s.borderRadius, '8px', `${t.slug}: hairline follows the window's corners`);
    }
    // A band-off tile never draws one.
    assert.equal(walk(toolCard(t, FONTS, { band: false })).els.filter(isHairline).length, 0, `${t.slug} tile: no hairline`);
  }
  const close = TOOLS.filter((t) => contrastWithMat(t.brand.ground) < HAIRLINE_CONTRAST).map((t) => t.slug);
  assert.deepEqual(close, ['what-s-human'], 'today only What\'s Human is that dark');
});

// Polish fix 2: the portfolio card shows the launch-day three, drawn larger, so they read at 300px. Which three is main's:
// Gut Check is held (PORTHOLD1), so Rumi takes its place (merge of main, 2026-11-08).
test('card: the portfolio card shows Revenge or Justice, The Undo List and Rumi as large tiles', () => {
  assert.deepEqual(LIBRARY, ['revenge-or-justice', 'undo', 'rumi']);
  const { els } = walk(toolCard(PORTFOLIO_CARD, FONTS));
  const tiles = els.filter((el) => el.props?.style?.borderRadius && el.props.style.width === el.props.style.height && el.key && LIBRARY.includes(el.key));
  assert.deepEqual(tiles.map((el) => el.key), LIBRARY, 'three tiles, in launch order');
  for (const el of tiles) assert.ok(parseInt(el.props.style.width, 10) >= 160, `${el.key}: tile at least 160px (40px at 300 wide)`);
});

test('card: the portfolio card takes the same frame', () => {
  framed(toolCard(PORTFOLIO_CARD, FONTS), 'portfolio', PORTFOLIO_CARD.brand);
});

test('card: a band-off portfolio tile has no frame and no lockup', () => {
  for (const t of TOOLS) {
    const card = toolCard(t, FONTS, { band: false });
    const { els } = walk(card);
    assert.equal(els.filter(isWindow).length, 0, `${t.slug}: no window`);
    assert.equal(els.filter(isLockup).length, 0, `${t.slug}: no lockup`);
    const field = card.props.children;
    assert.equal(field.props.style.width, `${CARD_W}px`, `${t.slug}: the field fills the tile's width`);
    assert.equal(field.props.style.height, `${CARD_H}px`, `${t.slug}: the field fills the tile's height`);
  }
});

test('lockup b: the bloom is the height of the H on the baseline, 1.8px line, half weight inside, 20px to the word', () => {
  const L = bloomLockup();
  const near = (got, want, tol, what) => assert.ok(Math.abs(got - want) <= tol, `${what}: ${got} is not ${want}`);
  assert.equal(L.height, 108);
  near(L.baseline, 73.6, 0.001, 'baseline in the foot (54 + cap/2)');
  near(L.g.h, 39.98, 0.01, 'bloom height (0.714 em at 56)');
  near(L.g.cy + L.g.h / 2, L.baseline + 0.007 * 56, 0.01, 'bloom foot at the baseline plus the round overshoot');
  near(L.g.s, 1.79, 0.01, 'line');
  near(L.g.si, L.g.s / 2, 1e-9, 'inner line');
  near(L.g.gap, 19.99, 0.01, 'bloom to word');
  assert.ok(L.svg.includes('scale(0.56)'), 'the word at 56px (the outline is drawn at 100)');
  assert.equal((L.svg.match(/<path d="M[^"]*A[^"]*"\/>/g) || []).length, 12, 'six inner and six outer arcs');
});

// A blade is any straight-sided shape with a point sharper than 30 degrees.
function sharpestCorner(points) {
  let min = 180;
  for (let i = 0; i < points.length; i++) {
    const a = points[(i + points.length - 1) % points.length], b = points[i], c = points[(i + 1) % points.length];
    const u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]];
    const cos = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v));
    min = Math.min(min, (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI);
  }
  return min;
}

test('picture: revenge-or-justice (glyph bars) is the balance scale and has no blade shape', () => {
  const brand = TOOL_BY_SLUG['revenge-or-justice'].brand;
  assert.equal(brand.glyph, 'bars');
  const svg = pictureSvg(brand);
  assert.ok(svg, 'a picture is drawn');
  assert.ok(svg.includes('viewBox="0 0 340 320"'), 'the scale is drawn in its 340 by 320 box');
  assert.ok(svg.includes('rotate(8 170 60)'), 'the beam tips 8 degrees about the pivot');
  assert.ok(/<path d="M3 194 Q48 252 93 194 Z" fill="#9C3327"\/>/.test(svg), 'the revenge pan, red');
  assert.ok(/<path d="M247 194 Q292 252 337 194 Z" fill="#D4950A"\/>/.test(svg), 'the justice pan, gold');
  assert.ok(!/blade|sword|guillotine|knife|axe/i.test(svg), 'nothing named as a blade');
  assert.ok(!/<polygon|<polyline/.test(svg), 'no polygon');
  for (const m of svg.matchAll(/<path d="([^"]*)"/g)) {
    const d = m[1];
    if (/[QCASTqcast]/.test(d)) continue;
    const pts = [...d.matchAll(/[ML]\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/g)].map((p) => [Number(p[1]), Number(p[2])]);
    if (pts.length >= 3) assert.ok(sharpestCorner(pts) >= 30, `a sharp straight-sided shape: ${d}`);
  }
  assert.ok(!/height="26"/.test(svg), 'none of the old bar rows');
});

// Merge of main, 2026-11-08: main's portfolio tiles lay each approved mark (src/data/tool-marks.ts) over the
// tile's 280 square picture box (MARK_BOX). The framed card draws the balance scale at the mockup's 340 by 320,
// but a frameless tile must keep the 280 box, or the scale shows round the edge of the scales mark.
test('tile: a marked tool\'s frameless tile draws its picture inside the 280 mark box', async () => {
  const { TOOL_MARKS, MARK_BOX } = await import('../src/data/tool-marks.ts');
  for (const slug of Object.keys(TOOL_MARKS)) {
    const t = TOOL_BY_SLUG[slug];
    const imgs = walk(toolCard(t, FONTS, { band: false })).els.filter((el) => el.type === 'img');
    assert.equal(imgs.length, 1, `${slug} tile: one picture`);
    assert.ok(imgs[0].props.width <= MARK_BOX.size && imgs[0].props.height <= MARK_BOX.size, `${slug} tile picture ${imgs[0].props.width} by ${imgs[0].props.height} spills past the ${MARK_BOX.size} mark box`);
  }
  // The framed card keeps the mockup's size for the scale.
  const rojCard = walk(toolCard(TOOL_BY_SLUG['revenge-or-justice'], FONTS)).els.filter((el) => el.type === 'img' && el.props.width === 340);
  assert.equal(rojCard.length, 1, 'the framed Revenge or Justice card draws the scale at 340 by 320');
  assert.equal(rojCard[0].props.height, 320);
});

// UNDOPEN2, 2026-11-17. Whit: "the preview icon for the undo list is the pen not what happens now. need
// that fixed". The Undo List's link-preview card draws its approved pen mark (src/data/tool-marks.ts)
// in place of the signature field's grid, at the grid's size, inside the same frame. Every other card,
// the undo tile (band off, which the portfolio already covers with the pen) and the portfolio card's
// library row keep drawing src/data/tool-pictures.ts.
const decode = (src) => Buffer.from(src.replace(/^data:image\/svg\+xml;base64,/, ''), 'base64').toString('utf8');
const fieldPicture = (el) => el.type === 'img' && el.props.alt !== 'Hoplight';
const GRID_CELL = /<rect x="[\d.]+" y="[\d.]+" width="26" height="26" rx="3"/;

test('undo card: the framed card draws the pen mark, not the field grid, at the grid\'s size', async () => {
  const { TOOL_MARKS } = await import('../src/data/tool-marks.ts');
  const { pictureSize } = await import('../src/data/tool-pictures.ts');
  const t = TOOL_BY_SLUG.undo;
  const imgs = walk(toolCard(t, FONTS)).els.filter(fieldPicture);
  assert.equal(imgs.length, 1, 'one picture beside the name');
  const svg = decode(imgs[0].props.src);
  const nib = TOOL_MARKS.undo.match(/<path d="M24 186 C[^"]+"/);
  assert.ok(nib, 'the pen mark carries its signature stroke');
  assert.ok(svg.includes(nib[0]), 'the card draws the pen mark\'s signature stroke');
  assert.ok(svg.includes('fill="#D4950A"'), 'the gold nib');
  assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'), 'a standalone SVG the renderer can read');
  assert.doesNotMatch(svg, GRID_CELL, 'none of the grid\'s squares');
  // Round two (UNDOPEN2, 2026-11-17, the stranger's read of the deployed card): at 300 wide the pen read
  // as a small scribble in an empty half, so the card draws it at 1.5 times the grid's square.
  const size = pictureSize(t.brand, true);
  assert.equal(imgs[0].props.width, size.w * 1.5, 'one and a half times the grid\'s width');
  assert.equal(imgs[0].props.height, size.h * 1.5, 'one and a half times the grid\'s height');
  framed(toolCard(t, FONTS), 'undo', t.brand);
});

// Round three (UNDOPEN2, 2026-11-17): the signature line under the stroke was navy at 35% opacity, which
// draws grey, the only grey mark on the card. Whit, 2026-11-07, on grey marks: "it must die". On the card
// it is a solid light tint of the gold, and nothing in the card's mark is drawn at a reduced opacity or in
// a colour without hue.
test('undo card: no grey mark; the signature line is a light tint of the gold', () => {
  const svg = decode(walk(toolCard(TOOL_BY_SLUG.undo, FONTS)).els.filter(fieldPicture)[0].props.src);
  assert.doesNotMatch(svg, /(stroke|fill)-opacity=/, 'nothing drawn see-through, which reads as grey on white');
  const line = svg.match(/<path d="M20 216 H252" stroke="(#[0-9A-Fa-f]{6})"/);
  assert.ok(line, 'the signature line is still drawn where it was');
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(line[1].slice(i, i + 2), 16));
  assert.ok(r > g && g > b && r - b >= 60, `${line[1]} is a warm gold tint, not a grey`);
  assert.ok(r >= 0xE0, `${line[1]} is light`);
  for (const m of svg.matchAll(/(?:stroke|fill)="(#[0-9A-Fa-f]{6})"/g)) {
    const [R, G, B] = [1, 3, 5].map((i) => parseInt(m[1].slice(i, i + 2), 16));
    const white = R === 255 && G === 255 && B === 255;
    const navy = m[1].toUpperCase() === '#0F1B2D';
    assert.ok(white || navy || Math.max(R, G, B) - Math.min(R, G, B) >= 40, `${m[1]} is a grey`);
  }
});

// Round two, fix 2: the navy cap sat apart from the gold nib and read as a separate block. On the card a
// navy barrel runs straight on from the nib's top edge (y -82 in the pen's own frame), as wide as the nib,
// so the pen is one object, and every corner of it stays inside the mark's 280 square (the old cap's
// corner was cut off by the square's right edge).
test('undo card: the pen is one object, a navy barrel joined to the gold nib, inside its square', async () => {
  const imgs = walk(toolCard(TOOL_BY_SLUG.undo, FONTS)).els.filter(fieldPicture);
  const svg = decode(imgs[0].props.src);
  const g = svg.match(/<g transform="translate\((\d+) (\d+)\) rotate\((\d+)\)">([\s\S]*?)<\/g>/);
  assert.ok(g, 'the pen is drawn in its own rotated frame');
  const [tx, ty, deg] = [Number(g[1]), Number(g[2]), (Number(g[3]) * Math.PI) / 180];
  assert.doesNotMatch(g[4], /y="-136"/, 'the old cap, apart from the nib, is gone');
  const navy = [...g[4].matchAll(/<rect x="(-?[\d.]+)" y="(-?[\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*fill="#0F1B2D"/g)]
    .map((m) => ({ x: +m[1], y: +m[2], w: +m[3], h: +m[4] }));
  assert.equal(navy.length, 1, 'one navy barrel');
  const b = navy[0];
  assert.ok(b.y < -82 && b.y + b.h >= -82, `the barrel meets the nib's top edge (${b.y} to ${b.y + b.h})`);
  assert.equal(b.x, -22, 'the barrel runs straight on from the nib, as wide as it');
  assert.equal(b.w, 44);
  for (const [px, py] of [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]]) {
    const X = tx + px * Math.cos(deg) - py * Math.sin(deg);
    const Y = ty + px * Math.sin(deg) + py * Math.cos(deg);
    assert.ok(X >= 0 && X <= 280 && Y >= 0 && Y <= 280, `barrel corner at ${X.toFixed(1)}, ${Y.toFixed(1)} is outside the square`);
  }
});

test('undo card: every other card, the undo tile and the portfolio row still draw tool-pictures.ts', () => {
  const uri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  for (const t of TOOLS) {
    const want = pictureSvg(t.brand);
    if (!want) continue;
    for (const band of t.slug === 'undo' ? [false] : [true, false]) {
      const imgs = walk(toolCard(t, FONTS, { band })).els.filter(fieldPicture);
      assert.equal(imgs.length, 1, `${t.slug} band ${band}: one picture`);
      assert.equal(imgs[0].props.src, uri(want), `${t.slug} band ${band}: its own tool-pictures.ts picture`);
    }
  }
  const row = walk(toolCard(PORTFOLIO_CARD, FONTS)).els.filter(fieldPicture);
  assert.ok(row.some((el) => el.props.src === uri(pictureSvg(TOOL_BY_SLUG.undo.brand))), 'the portfolio row keeps the undo field');
});
