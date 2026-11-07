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
import { toolCard, PORTFOLIO_CARD, CARD_W, CARD_H } from '../src/lib/brand/tool-card.ts';
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
