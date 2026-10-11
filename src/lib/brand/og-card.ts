// The per-route link-preview card that src/app/api/og/route.tsx renders, on the Hoplight Design System
// (2026-10-11): a navy band with its seeded Flower of Life field, the gold wordmark drawing (never
// typed), the route's title in Inter 600 in on-band white and its line in on-band-muted. No gradient
// ground, no gold body text, no tracked caps, no weight above 600. Written with createElement rather
// than JSX so a Node script can render it too.

import { createElement as h, type ReactElement } from 'react';
import { fieldSvg } from './geometry.ts';
import { WORDMARK_GOLD } from './marks.ts';

export const CARD_W = 1200;
export const CARD_H = 630;

// Design-system tokens, light theme.
const BAND = '#0F1B2D';
const ON_BAND = '#FFFFFF';
const ON_BAND_MUTED = '#C9D3E0';

// The gold wordmark's own viewBox is 786.2 by 196.8.
const MARK_H = 44;
const MARK_W = Math.round((MARK_H * 786.2) / 196.8);

const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

// Display steps down for long titles so five lines of title never push the line off the card.
function titleSize(title: string): number {
  const n = Array.from(title).length;
  return n > 70 ? 52 : n > 40 ? 60 : 72;
}

export function ogCard(title: string, sub: string, hasInter: boolean): ReactElement {
  const family = hasInter ? 'Inter' : 'sans-serif';
  return h(
    'div',
    {
      style: {
        position: 'relative',
        width: `${CARD_W}px`,
        height: `${CARD_H}px`,
        display: 'flex',
        flexDirection: 'column',
        padding: '72px',
        backgroundColor: BAND,
        fontFamily: family,
      },
    },
    // The band's field, seeded by the title: the same route always gets the same crop.
    h('img', {
      src: svgUri(fieldSvg({ width: CARD_W, height: CARD_H, seed: title, tone: 'band', fade: 'right' })),
      width: CARD_W,
      height: CARD_H,
      style: { position: 'absolute', left: 0, top: 0 },
    }),
    h('img', { src: svgUri(WORDMARK_GOLD), width: MARK_W, height: MARK_H, alt: 'Hoplight' }),
    h('div', { style: { display: 'flex', flexGrow: 1 } }),
    h(
      'div',
      {
        style: {
          display: 'flex',
          fontSize: `${titleSize(title)}px`,
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: ON_BAND,
          maxWidth: '1000px',
        },
      },
      title,
    ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          fontSize: '32px',
          fontWeight: 400,
          lineHeight: 1.35,
          color: ON_BAND_MUTED,
          marginTop: '24px',
          maxWidth: '940px',
        },
      },
      sub,
    ),
  );
}
