// A tool's link-preview card (/api/og/tool/<slug>): the tool's own name, colours and one picture from
// its first screen as the field, held in one Hoplight frame. Whit, 2026-11-07: "i want image preview
// to visually have the app or app branding. but also something that speaks to hoplight consistently
// as the shop behind it."
//
// The frame is treatment 3 of public/mockups/card-frames.html with lockup b of
// public/mockups/card-lockup.html in its foot (Whit, 2026-11-07: "The frame is strongest, but we
// don’t need to say product every time", then "let’s do lock up b"): a solid navy mat, 28px at the
// top and sides and 108px at the foot, a window of 1144 by 494 with 8px corners, and the bloom and
// the word Hoplight in the foot at the window's content edge (x 96), the word's cap height centred in
// the foot. No "by" and no kind word. Nothing else is typed on the card; the one-line description
// travels as og:description.
//
// The frame uses only the site's tokens and the lockup from marks.ts. The field's colours, face and
// picture come from the tool's own entry (src/data/tools.ts, src/data/tool-pictures.ts), which is the
// point: the field is the tool's look, not Hoplight's. A portfolio tile (band off) is the field alone,
// frameless, because the portfolio page is already Hoplight's. Written with createElement so a Node
// script can render it too.

import { createElement as h, type ReactElement } from 'react';
import { TOOL_BY_SLUG, type ToolBrand } from '../../data/tools.ts';
import { pictureSize, pictureSvg } from '../../data/tool-pictures.ts';
import { bloomLockup } from './marks.ts';

export const CARD_W = 1200;
export const CARD_H = 630;

// The frame, card-frames.html's .c, .win and .foot rules: the mat, the window inside it, the foot.
const MAT = '#0F1B2D';
export const MAT_EDGE = 28;
export const MAT_FOOT = 108;
const WIN_W = CARD_W - MAT_EDGE * 2; // 1144
const WIN_H = CARD_H - MAT_EDGE - MAT_FOOT; // 494
const WIN_R = 8;
// Inside the window the content runs 68px from its sides (the mockup's .win padding), so the field's
// content edge and the lockup's left edge share x 96 on the card.
const WIN_PAD = 68;
// A portfolio tile has no frame; its field keeps the old 72px margin.
const PAD = 72;

const LOCKUP = bloomLockup({ height: MAT_FOOT, word: '#FFFFFF' });

// The hairline (card review, 2026-11-07, polish fix 1): a tool whose own ground is within this
// contrast ratio of the mat (What's Human's near-black is 1.1) would merge with the mat at text-message
// size, so its window gets a light line on its edge, over the field. The tool keeps its own ground.
// 3px on the 1200 card is 0.75px at 300 wide, about two device pixels on a 3x phone; the colour is
// the site's on-band-muted at half strength, so it reads as an edge and not as a second frame.
export const HAIRLINE_CONTRAST = 1.5;
const HAIRLINE = '3px solid rgba(201,211,224,0.5)';

function luminance(hex: string): number {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The WCAG contrast ratio between a ground and the mat's navy. */
export function contrastWithMat(ground: string): number {
  const a = luminance(ground);
  const m = luminance(MAT);
  return (Math.max(a, m) + 0.05) / (Math.min(a, m) + 0.05);
}

/** Every tool name on every card is set at this size; a long name takes two lines, never a smaller size. */
export const NAME_PX = 112;
const LINE_H = 1.02;
// The picture sits beside the name on every card, at its own size (280 square for most), centred on the
// name block with its right edge on the card's right margin. A long name takes more lines in a narrower
// column rather than pushing the picture into a corner (re-review, 2026-11-07).
const GAP = 48;

const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

export interface CardFonts {
  /** The family name registered for the tool's display face, or null if it did not load. */
  display: string | null;
}

/** The text a card types, so the route can fetch only those characters. The lockup is a drawing. */
export function cardText(brand: ToolBrand): { display: string } {
  return { display: brand.wordmark.map((w) => w.text).join(' ') };
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
        fontSize: `${b.namePx ?? NAME_PX}px`,
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

function picture(svg: string, w: number, hh: number = w): ReactElement {
  return h('img', { src: svgUri(svg), width: w, height: hh, alt: '' });
}

/** The portfolio's own card: "Tool library" and a row of the tools' pictures, each on its own ground.
 *  Which three is main's call: Gut Check is held for its announcement (PORTHOLD1) and Letters is a
 *  feature of Rumi (LETTERSOFF1). Drawn large so each reads as a tool at text-message size (card review,
 *  2026-11-07: five tiles of 96 were 24px each at 300 wide; three of 180 are 45px). */
export const LIBRARY = ['revenge-or-justice', 'undo', 'rumi'];
const TILE = 180;
const TILE_GAP = 20;

function libraryRow(): ReactElement {
  return h(
    'div',
    { style: { display: 'flex', gap: `${TILE_GAP}px` } },
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
            borderRadius: '28px',
            backgroundColor: t ? t.brand.ground : MAT,
            border: '3px solid rgba(15,27,45,0.18)',
          },
        },
        svg ? picture(svg, TILE - 36) : null,
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
  const band = opts.band !== false;
  const raw = tool.brand;
  // A portfolio tile (no band) of a loud-ground tool: white top, the brand colour on the name, the
  // picture on its own ground in a rounded square. The link-preview card keeps the full ground.
  const onWhite = !band && !tool.library && raw.tileOnWhite === true;
  const b: ToolBrand = onWhite ? { ...raw, ground: '#FFFFFF', ink: raw.ground, accent: raw.ground } : raw;
  const svg = tool.library ? null : pictureSvg(raw);
  const size = b.pic ? { w: b.pic, h: b.pic } : pictureSize(b, band);
  // A smaller picture sits a little closer to its name, so a two-line long name keeps its lines.
  const gap = b.pic ? 32 : GAP;
  // Framed, the field is the window; frameless, it is the whole tile.
  const fieldW = band ? WIN_W : CARD_W;
  const fieldH = band ? WIN_H : CARD_H;
  const pad = band ? WIN_PAD : PAD;
  const inner = fieldW - pad * 2;
  const fieldStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: `${fieldW}px`, height: `${fieldH}px`, padding: `0 ${pad}px`, backgroundColor: b.ground };

  let field: ReactElement;
  if (tool.library) {
    field = h(
      'div',
      { style: fieldStyle },
      nameBlock(b, fonts, inner - (LIBRARY.length * (TILE + TILE_GAP)) - GAP),
      libraryRow(),
    );
  } else {
    field = h(
      'div',
      { style: fieldStyle },
      nameBlock(b, fonts, svg ? inner - size.w - gap : inner),
      svg
        ? onWhite
          ? h(
              'div',
              { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: `${size.w}px`, height: `${size.h}px`, borderRadius: '28px', backgroundColor: raw.ground } },
              picture(svg, size.w - 40, size.h - 40),
            )
          : picture(svg, size.w, size.h)
        : null,
    );
  }

  if (!band) return h('div', { style: { display: 'flex', width: `${CARD_W}px`, height: `${CARD_H}px` } }, field);

  return h(
    'div',
    { style: { display: 'flex', position: 'relative', width: `${CARD_W}px`, height: `${CARD_H}px`, backgroundColor: MAT } },
    h(
      'div',
      {
        style: {
          display: 'flex',
          position: 'absolute',
          left: `${MAT_EDGE}px`,
          top: `${MAT_EDGE}px`,
          width: `${WIN_W}px`,
          height: `${WIN_H}px`,
          borderRadius: `${WIN_R}px`,
          overflow: 'hidden',
        },
      },
      field,
      contrastWithMat(b.ground) < HAIRLINE_CONTRAST
        ? h('div', {
            style: {
              display: 'flex',
              position: 'absolute',
              left: '0px',
              top: '0px',
              width: `${WIN_W}px`,
              height: `${WIN_H}px`,
              borderRadius: `${WIN_R}px`,
              border: HAIRLINE,
            },
          })
        : null,
    ),
    h('img', {
      src: svgUri(LOCKUP.svg),
      width: LOCKUP.width,
      height: LOCKUP.height,
      alt: 'Hoplight',
      style: { position: 'absolute', left: `${MAT_EDGE + WIN_PAD}px`, top: `${CARD_H - MAT_FOOT}px` },
    }),
  );
}

// The portfolio's own card: "Tool library" (Whit's words for it: "engage w my tool library") on the
// site's white, with the row of tool pictures, in the same frame.
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

