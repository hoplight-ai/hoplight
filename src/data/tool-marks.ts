// The mark a /portfolio tile draws in its corner, for the tools whose mark Whit picked: the scales of justice
// for Revenge or Justice, the stroke of a pen for The Undo List, and a path forking three ways with the chosen
// way rising in gold to an arrow for Which AI should I use? (MARKSLIVE1, 2026-11-07). Whit, 2026-11-07:
// "revenge of justice is supposed to use the scales of justice. The undo list should have a pen right it
// should be the stroke of a pen.", then "which AI looks like a broken umbrella upside down, no flow vibes at
// all. the rest work.", then "this" on the fork with the gold arrow.
//
// Each string is the mark exactly as the tile mockup draws it (lane TILEVALUE1, public/mockups/tile-value.html
// on branch tilevalue1-each-tile-says at 382e574, row two), copied from the mockup's own script output with
// no change to a shape, colour or stroke weight. scripts/tool-marks.test.mjs pins each by its hash.
//
// The marks are the tile's only. The link-preview cards and the Revenge or Justice page keep drawing
// src/data/tool-pictures.ts, the tool's own screen (Whit, 2026-10-22: "people will have greater trust if the
// formatting of the output loks like the toolkit they recieved"). A tile with no mark here shows its card as
// it is.
//
// Each mark is drawn in the card's 280 by 280 picture box and first paints that box in the card's white
// ground, so the card's own drawing under it is covered and nothing else on the tile moves. The colours are
// the tools' own, which is why this file sits beside tool-pictures.ts and not under src/lib/brand.
//
// Imported by node scripts as well as the app, so relative imports only and erasable TypeScript only.

/** The approved marks, keyed by tool slug: one 280 by 280 SVG each, as the mockup draws it. */
export const TOOL_MARKS: Readonly<Record<string, string>> = {
  // The scales of justice, in its own navy, revenge red and justice gold; justice's pan sits lower, the
  // one that weighs.
  'revenge-or-justice':
    '<svg viewBox="0 0 280 280" aria-hidden="true"><rect width="280" height="280" fill="#FFFFFF"/><g fill="none" stroke="#0F1B2D" stroke-linecap="round"><path d="M140 64 V230 M36 88 L244 112" stroke-width="14"/><path d="M36 88 L8 166 M36 88 L64 166 M244 112 L216 190 M244 112 L272 190" stroke-width="8"/></g><circle cx="140" cy="56" r="13" fill="#0F1B2D"/><rect x="86" y="226" width="108" height="18" rx="9" fill="#0F1B2D"/><path d="M2 166 H70 A34 26 0 0 1 2 166 Z" fill="#9C3327"/><path d="M210 190 H278 A34 26 0 0 1 210 190 Z" fill="#996D00"/></svg>',
  // The stroke of a pen: a signature on its line, the gold nib at its end.
  undo:
    '<svg viewBox="0 0 280 280" aria-hidden="true"><rect width="280" height="280" fill="#FFFFFF"/><path d="M20 216 H252" stroke="#0F1B2D" stroke-opacity="0.35" stroke-width="8" stroke-linecap="round"/><path d="M24 186 C38 128 74 96 88 120 C102 146 62 206 84 200 C106 194 112 128 132 136 C152 144 124 192 146 190 C164 188 168 166 182 162" fill="none" stroke="#0F1B2D" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><g transform="translate(184 160) rotate(40)"><path d="M0 0 L-22 -48 L-22 -82 L22 -82 L22 -48 Z" fill="#D4950A"/><path d="M0 -8 V-50" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="-56" r="7" fill="#FFFFFF"/><rect x="-24" y="-136" width="48" height="50" rx="9" fill="#0F1B2D"/></g></svg>',
  // One path forks three ways in smooth curves; the two not taken thin out, the gold one curves up and runs
  // on to an arrowhead.
  'which-ai-should-i-use':
    '<svg viewBox="0 0 280 280" aria-hidden="true"><rect width="280" height="280" fill="#FFFFFF"/><g fill="#0F1B2D"><path d="M92.0 162.0 L99.1 162.4 L106.3 163.7 L113.7 165.9 L121.1 168.9 L128.6 172.6 L136.1 176.9 L143.6 181.6 L151.1 186.5 L158.6 191.6 L166.1 196.8 L173.6 201.7 L181.0 206.4 L188.4 210.7 L195.8 214.4 L203.3 217.3 L210.8 219.4 A5.5 5.5 0 0 0 213.2 208.6 L207.1 206.7 L200.8 203.9 L194.3 200.3 L187.5 196.1 L180.6 191.3 L173.5 186.2 L166.3 180.9 L158.9 175.5 L151.3 170.1 L143.5 164.9 L135.6 160.0 L127.4 155.6 L119.0 151.8 L110.3 148.8 L101.3 146.8 L92.0 146.0 Z"/><path d="M92.0 162.0 L100.9 161.8 L109.5 161.7 L117.8 161.5 L125.9 161.4 L133.9 161.2 L141.6 161.1 L149.1 160.9 L156.5 160.8 L163.7 160.6 L170.9 160.4 L177.9 160.3 L184.8 160.1 L191.7 160.0 L198.5 159.8 L205.2 159.7 L212.0 159.5 A5.5 5.5 0 0 0 212.0 148.5 L205.2 148.3 L198.5 148.2 L191.7 148.0 L184.8 147.9 L177.9 147.7 L170.9 147.6 L163.7 147.4 L156.5 147.3 L149.1 147.1 L141.6 146.9 L133.9 146.8 L125.9 146.6 L117.8 146.5 L109.5 146.3 L100.9 146.2 L92.0 146.0 Z"/></g><path d="M92 154 C152 154 160 76 222 76" fill="none" stroke="#D4950A" stroke-width="16" stroke-linecap="round"/><path d="M218 50 L266 76 L218 102 Z" fill="#D4950A" stroke="#D4950A" stroke-width="8" stroke-linejoin="round"/><path d="M16 154 H100" stroke="#0F1B2D" stroke-width="16" stroke-linecap="round"/></svg>',
};

/** The card's picture box, in card pixels of the 1200 by 630 card: 72 in from the right edge, centred top
 *  to bottom (src/lib/brand/tool-card.ts draws a 280 square picture there for every marked tool). */
export const MARK_BOX = { x: 848, y: 175, size: 280 } as const;

const OPEN = '<svg viewBox="0 0 280 280" aria-hidden="true">';

/**
 * The mark laid over a tile's card, or null when the tool has none. The outer SVG has the card's own shape
 * and fills the tile's picture the way the card image does (whole at its own shape, cropped from the middle
 * on a phone), so the mark lands on the card's picture box at every width.
 */
export function tileMarkSvg(slug: string): string | null {
  const mark = Object.prototype.hasOwnProperty.call(TOOL_MARKS, slug) ? TOOL_MARKS[slug] : undefined;
  if (!mark || !mark.startsWith(OPEN)) return null;
  const { x, y, size } = MARK_BOX;
  const inner = `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 280 280">` + mark.slice(OPEN.length);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${inner}</svg>`;
}
