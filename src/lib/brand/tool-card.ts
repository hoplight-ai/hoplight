// A tool's link-preview card (/api/og/tool/<slug>): the tool's own name, colours and one picture from
// its first screen as the main field, one Hoplight band along the bottom. Whit, 2026-11-07: "i want
// image preview to visually have the app or app branding. but also something that speaks to hoplight
// consistently as the shop behind it."
//
// Reading order, by size: the tool's name first (the largest thing on the card, the same size on every
// card), "by Hoplight" second (the band, identical on every card: same height, same lockup, same
// place, a thick gold rule along its top so it reads as its own strip even on a dark field). Nothing
// else is typed on the card; the one-line description travels as og:description.
//
// The band uses only the site's tokens and the seed lockup from marks.ts. The field's colours, face
// and picture come from the tool's own entry (src/data/tools.ts, src/data/tool-pictures.ts), which is
// the point: the field is the tool's look, not Hoplight's. Written with createElement so a Node script
// can render it too.

import { createElement as h, type ReactElement } from 'react';
import { TOOL_BY_SLUG, type ToolBrand } from '../../data/tools.ts';
import { pictureSvg } from '../../data/tool-pictures.ts';
import { LOCKUP_H, LOCKUP_W, seedLockup } from './marks.ts';

export const CARD_W = 1200;
export const CARD_H = 630;

// The band: navy, "by" and the lockup in white with the gold seed, a 10px gold rule along its top.
const BAND = '#0F1B2D';
const ON_BAND = '#FFFFFF';
const ON_BAND_MUTED = '#C9D3E0';
const RULE = '#D4950A';
export const BAND_H = 118;
export const RULE_H = 10;
const PAD = 72;

// The lockup at 50px tall: the seed's square is 50, the word "Hoplight" is set at 40px (the lockup
// draws the word at 0.8 of the mark's height). "by" is set at the same 40px, lighter.
const LOCK_H = 50;
const LOCK_W = Math.round((LOCK_H * LOCKUP_W) / LOCKUP_H);
const WORD_PX = Math.round((LOCK_H * 100) / LOCKUP_H);
const LOCKUP = seedLockup({ word: ON_BAND, seen: 24 });

/** Every tool name on every card is set at this size; a long name takes two lines, never a smaller size. */
export const NAME_PX = 112;
const LINE_H = 1.02;
// The picture: 280 square beside a short name, 176 square in the top corner above a long one.
const PIC_SIDE = 280;
const PIC_STACK = 176;
const GAP = 48;

const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

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

function nameBlock(b: ToolBrand, fonts: CardFonts, maxWidth: number): ReactElement {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        maxWidth: `${maxWidth}px`,
        fontFamily: fonts.display ?? 'sans-serif',
        fontWeight: b.display.weight,
        fontSize: `${NAME_PX}px`,
        lineHeight: LINE_H,
        letterSpacing: '-0.02em',
      },
    },
    ...b.wordmark.map((w, i) =>
      h(
        'div',
        {
          key: i,
          style: {
            display: 'flex',
            color: w.accent ? b.accent : b.ink,
            ...(w.mark ? { backgroundColor: w.mark, padding: '0 10px', marginLeft: '-10px' } : {}),
          },
        },
        w.text,
      ),
    ),
  );
}

function picture(svg: string, size: number): ReactElement {
  return h('img', { src: svgUri(svg), width: size, height: size, alt: '' });
}

/** The portfolio's own card: "Tool library" and a row of the tools' pictures, each on its own ground. */
const LIBRARY = ['revenge-or-justice', 'undo', 'gut-check', 'rumi', 'letters'];
const TILE = 96;

function libraryRow(): ReactElement {
  return h(
    'div',
    { style: { display: 'flex', gap: '14px' } },
    ...LIBRARY.map((slug) => {
      const t = TOOL_BY_SLUG[slug];
      const svg = t ? pictureSvg(t.brand) : null;
      return h(
        'div',
        {
          key: slug,
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${TILE}px`,
            height: `${TILE}px`,
            borderRadius: '18px',
            backgroundColor: t ? t.brand.ground : BAND,
            border: '2px solid rgba(15,27,45,0.18)',
          },
        },
        svg ? picture(svg, TILE - 16) : null,
      );
    }),
  );
}

export interface CardSubject {
  brand: ToolBrand;
  /** Set on the portfolio's card only: draw the row of tool pictures instead of one picture. */
  library?: boolean;
}

export function toolCard(tool: CardSubject, fonts: CardFonts, opts: { band?: boolean } = {}): ReactElement {
  const b = tool.brand;
  const band = opts.band !== false;
  const svg = tool.library ? null : pictureSvg(b);
  const stack = b.layout === 'stack';
  const fieldH = band ? CARD_H - BAND_H - RULE_H : CARD_H;
  const inner = CARD_W - PAD * 2;

  let field: ReactElement;
  if (tool.library) {
    field = h(
      'div',
      { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: `${CARD_W}px`, height: `${fieldH}px`, padding: `0 ${PAD}px`, backgroundColor: b.ground } },
      nameBlock(b, fonts, inner - (LIBRARY.length * (TILE + 14)) - GAP),
      libraryRow(),
    );
  } else if (stack) {
    field = h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: `${CARD_W}px`, height: `${fieldH}px`, padding: `40px ${PAD}px 46px`, backgroundColor: b.ground } },
      h('div', { style: { display: 'flex', justifyContent: 'flex-end', width: `${inner}px` } }, svg ? picture(svg, PIC_STACK) : null),
      nameBlock(b, fonts, inner),
    );
  } else {
    field = h(
      'div',
      { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: `${CARD_W}px`, height: `${fieldH}px`, padding: `0 ${PAD}px`, backgroundColor: b.ground } },
      nameBlock(b, fonts, svg ? inner - PIC_SIDE - GAP : inner),
      svg ? picture(svg, PIC_SIDE) : null,
    );
  }

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
            fontSize: `${WORD_PX}px`,
            color: ON_BAND_MUTED,
            marginRight: '16px',
            marginTop: '-3px',
          },
        },
        'by',
      ),
      h('img', { src: svgUri(LOCKUP), width: LOCK_W, height: LOCK_H, alt: 'Hoplight' }),
    ),
  );
}

// The portfolio's own card: "Tool library" (Whit's words for it: "engage w my tool library") on the
// site's white, with the row of tool pictures, the same band below.
export const PORTFOLIO_CARD: CardSubject = {
  library: true,
  brand: {
    ground: '#FFFFFF',
    accent: '#996D00',
    ink: '#0F1B2D',
    display: { family: 'Albert Sans', weight: 600 },
    wordmark: [{ text: 'Tool' }, { text: 'library' }],
    glyph: 'none',
  },
};

