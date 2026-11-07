// A tool's link-preview card (/api/og/tool/<slug>): the tool's own name and look as the main field,
// one Hoplight band along the bottom. Whit, 2026-11-07: "i want image preview to visually have the
// app or app branding. but also something that speaks to hoplight consistently as the shop behind it."
//
// Reading order, by size: the tool's name first (the largest thing on the card), "by Hoplight" second
// (the band, identical on every card: same height, same lockup, same place). Nothing else is typed on
// the card; the one-line description travels as og:description, which every preview shows under it.
//
// The band uses only the site's tokens and the seed lockup from marks.ts, unchanged. The main field's
// colours and font come from the tool's own entry in src/data/tools.ts, which is the point: the field
// is the tool's brand, not Hoplight's. Written with createElement so a Node script can render it too.

import { createElement as h, type ReactElement } from 'react';
import type { Tool, ToolBrand } from '../../data/tools.ts';
import { LOCKUP_H, LOCKUP_W, seedLockup } from './marks.ts';

export const CARD_W = 1200;
export const CARD_H = 630;

// The band: navy, its lockup in white with the gold seed, a gold rule along its top edge (the brand's
// horizontal rule) so it stays its own strip on a navy or a white field alike.
const BAND = '#0F1B2D';
const ON_BAND = '#FFFFFF';
const ON_BAND_MUTED = '#C9D3E0';
const RULE = '#D4950A';
const DANGER = '#9C3327';
export const BAND_H = 112;
const RULE_H = 4;
const PAD = 72;

const LOCK_H = 48;
const LOCK_W = Math.round((LOCK_H * LOCKUP_W) / LOCKUP_H);
const LOCKUP = seedLockup({ word: ON_BAND, seen: 22 });

const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

/** The name's size: the longest line sets it, so a short name fills the field and a long one wraps. */
export function nameSize(lines: string[], hasGlyph: boolean): number {
  const n = Math.max(...lines.map((l) => Array.from(l).length));
  const scale = hasGlyph ? 1 : 1.12;
  const base = n <= 8 ? 144 : n <= 10 ? 128 : n <= 13 ? 108 : n <= 17 ? 88 : n <= 24 ? 76 : 64;
  return Math.round(base * scale);
}

// ---- The glyphs: each tool's own visual idea, drawn small beside its name ----------------------

const GLYPH = 280;

/** Revenge or Justice: the result rows' centre line, revenge running left in red, justice right in navy. */
function barsGlyph(b: ToolBrand): string {
  const rows: number[] = [-0.62, 0.86, 0.4, -0.28];
  const mid = GLYPH / 2;
  const rowH = 52;
  const top = (GLYPH - rows.length * rowH) / 2;
  const parts = rows.map((v, i) => {
    const y = top + i * rowH + rowH / 2;
    const w = Math.abs(v) * (mid - 8);
    const x = v < 0 ? mid - w : mid;
    const fill = v < 0 ? DANGER : b.ink;
    const rx = 5;
    return `<line x1="8" y1="${y}" x2="${GLYPH - 8}" y2="${y}" stroke="${b.ink}" stroke-opacity="0.16" stroke-width="2"/>`
      + `<rect x="${x.toFixed(1)}" y="${y - 13}" width="${w.toFixed(1)}" height="26" rx="${rx}" fill="${fill}"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GLYPH} ${GLYPH}">${parts.join('')}`
    + `<line x1="${mid}" y1="${top - 10}" x2="${mid}" y2="${top + rows.length * rowH + 10}" stroke="${b.ink}" stroke-width="3"/></svg>`;
}

/** The Undo List: the signature field, outlined squares, the first stretch signed in gold. */
function fieldGlyph(b: ToolBrand): string {
  const cols = 8;
  const cell = 26;
  const gap = 8;
  const size = cols * cell + (cols - 1) * gap;
  const off = (GLYPH - size) / 2;
  const signed = 27;
  const cells: string[] = [];
  for (let k = 0; k < cols * cols; k++) {
    const x = off + (k % cols) * (cell + gap);
    const y = off + Math.floor(k / cols) * (cell + gap);
    cells.push(k < signed
      ? `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="${b.accent}"/>`
      : `<rect x="${x + 1.75}" y="${y + 1.75}" width="${cell - 3.5}" height="${cell - 3.5}" rx="2.5" fill="none" stroke="${b.ink}" stroke-width="3.5"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GLYPH} ${GLYPH}">${cells.join('')}</svg>`;
}

/** Gut Check: one card at a time, the top card lit. */
function cardsGlyph(b: ToolBrand): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GLYPH} ${GLYPH}">`
    + `<rect x="62" y="44" width="156" height="204" rx="18" fill="none" stroke="${b.ink}" stroke-opacity="0.35" stroke-width="4" transform="rotate(-9 140 146)"/>`
    + `<rect x="62" y="40" width="156" height="204" rx="18" fill="${b.accent}" transform="rotate(5 140 142)"/>`
    + `<rect x="92" y="96" width="96" height="10" rx="5" fill="${b.ground}" fill-opacity="0.85" transform="rotate(5 140 142)"/>`
    + `<rect x="92" y="122" width="64" height="10" rx="5" fill="${b.ground}" fill-opacity="0.55" transform="rotate(5 140 142)"/></svg>`;
}

/** Letters: a stroke's start, its direction and its order, as the app draws a "b". */
function strokeGlyph(b: ToolBrand): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GLYPH} ${GLYPH}">`
    + `<circle cx="158" cy="178" r="62" fill="none" stroke="${b.ink}" stroke-opacity="0.14" stroke-width="40"/>`
    + `<rect x="78" y="24" width="40" height="236" rx="20" fill="${b.ink}"/>`
    + `<path d="M176 92 L214 112 L176 132 Z" fill="${b.accent}"/>`
    + `<circle cx="98" cy="190" r="30" fill="${b.accent}"/></svg>`;
}

function glyphSvg(b: ToolBrand): string | null {
  switch (b.glyph) {
    case 'bars': return barsGlyph(b);
    case 'field': return fieldGlyph(b);
    case 'cards': return cardsGlyph(b);
    case 'stroke': return strokeGlyph(b);
    default: return null;
  }
}

// ---- The card ---------------------------------------------------------------------------------

export interface CardFonts {
  /** The family name registered for the tool's display face, or null if it did not load. */
  display: string | null;
  /** Inter for "by", or null. */
  body: string | null;
}

/** The text a card draws, per font, so the route can fetch only those characters. */
export function cardText(brand: ToolBrand): { display: string; body: string } {
  return { display: brand.wordmark.map((w) => w.text).join(' '), body: 'by' };
}

export function toolCard(tool: Pick<Tool, 'brand'>, fonts: CardFonts, opts: { band?: boolean } = {}): ReactElement {
  const b = tool.brand;
  const band = opts.band !== false;
  const glyph = glyphSvg(b);
  const lines = b.wordmark.map((w) => w.text);
  const size = nameSize(lines, Boolean(glyph));
  const fieldH = band ? CARD_H - BAND_H - RULE_H : CARD_H;

  const field = h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: `${CARD_W}px`,
        height: `${fieldH}px`,
        padding: `0 ${PAD}px`,
        backgroundColor: b.ground,
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          maxWidth: glyph ? `${CARD_W - PAD * 2 - GLYPH - 48}px` : `${CARD_W - PAD * 2}px`,
          fontFamily: fonts.display ?? 'sans-serif',
          fontWeight: b.display.weight,
          fontSize: `${size}px`,
          lineHeight: 1.02,
          letterSpacing: '-0.025em',
        },
      },
      ...b.wordmark.map((w, i) => h('div', { key: i, style: { display: 'flex', color: w.accent ? b.accent : b.ink } }, w.text)),
    ),
    glyph ? h('img', { src: svgUri(glyph), width: GLYPH, height: GLYPH, alt: '' }) : null,
  );

  if (!band) return h('div', { style: { display: 'flex', width: `${CARD_W}px`, height: `${CARD_H}px` } }, field);

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', width: `${CARD_W}px`, height: `${CARD_H}px`, backgroundColor: b.ground } },
    field,
    h('div', { style: { display: 'flex', width: `${CARD_W}px`, height: `${RULE_H}px`, backgroundColor: RULE } }),
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          width: `${CARD_W}px`,
          height: `${BAND_H}px`,
          padding: `0 ${PAD}px`,
          backgroundColor: BAND,
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            fontFamily: fonts.body ?? 'sans-serif',
            fontWeight: 400,
            fontSize: '34px',
            color: ON_BAND_MUTED,
            marginRight: '18px',
            marginTop: '-2px',
          },
        },
        'by',
      ),
      h('img', { src: svgUri(LOCKUP), width: LOCK_W, height: LOCK_H, alt: 'Hoplight' }),
    ),
  );
}

// The portfolio's own card: the page's headline on the site's white ground, the same band below.
export const PORTFOLIO_CARD: Pick<Tool, 'brand'> = {
  brand: {
    ground: '#FFFFFF',
    accent: '#996D00',
    ink: '#0F1B2D',
    display: { family: 'Albert Sans', weight: 600 },
    wordmark: [{ text: 'Systems we’ve' }, { text: 'shipped.' }],
    glyph: 'none',
  },
};
