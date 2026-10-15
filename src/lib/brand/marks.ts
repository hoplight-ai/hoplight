// The Hoplight lockup for the link-preview cards: the seed (src/lib/brand/seed.ts) beside the word
// "Hoplight" in Albert Sans 600, as round four of the design system draws it (2026-10-15; Whit: "the
// seed is working"). It replaces the torchband lockup and the metallic wordmark of 2026-10-11.
//
// On the site the word is live text in Albert Sans (Nav.tsx, Footer.tsx). On a card it is a drawing,
// so the card renders the same in any renderer with no font to fetch: WORDMARK_PATH is the word
// outlined from Albert Sans 600 (Google Fonts, albertsans v4, 1000 units per em) at font-size 100,
// letter-spacing -0.02em, kerned, baseline at y 0, read with opentype.js on 2026-10-15.
// scripts/check-claims-and-palette.mjs (guard 5) fails the build if the outline stops matching the
// sha256 recorded there, so a hand edit cannot slip in.

import { seedMarkup, SEED_GOLD } from './seed.ts';

// Albert Sans 600, "Hoplight", font-size 100: the cap height is 70, the descenders reach 20, the last
// glyph ends at x 378.1.
export const WORDMARK_PATH = String.raw`M7.30 0L7.30-70L19.20-70L19.20-40.40L52.20-40.40L52.20-70L64-70L64 0L52.20 0L52.20-30.50L19.20-30.50L19.20 0L7.30 0ZM98.40 0.70L98.40 0.70Q91.20 0.70 85.50-2.45Q79.80-5.60 76.60-11.35Q73.40-17.10 73.40-24.90L73.40-24.90Q73.40-32.80 76.70-38.60Q80-44.40 85.80-47.55Q91.60-50.70 98.70-50.70L98.70-50.70Q105.90-50.70 111.65-47.55Q117.40-44.40 120.80-38.65Q124.20-32.90 124.20-25.10L124.20-25.10Q124.20-17.20 120.75-11.40Q117.30-5.60 111.45-2.45Q105.60 0.70 98.40 0.70ZM98.30-9.40L98.30-9.40Q101.80-9.40 104.95-11.10Q108.10-12.80 110.10-16.25Q112.10-19.70 112.10-25.10L112.10-25.10Q112.10-30.30 110.20-33.75Q108.30-37.20 105.20-38.90Q102.10-40.60 98.50-40.60L98.50-40.60Q95-40.60 92.05-38.90Q89.10-37.20 87.30-33.75Q85.50-30.30 85.50-24.90L85.50-24.90Q85.50-19.70 87.25-16.25Q89-12.80 91.90-11.10Q94.80-9.40 98.30-9.40ZM142.80-7.40L142.80-7.40L144.10-7.70L144.10 20L132.80 20L132.80-50L143-50L143.80-43.80Q146.30-46.70 150.30-48.70Q154.30-50.70 160-50.70L160-50.70Q166.50-50.70 171.55-47.50Q176.60-44.30 179.45-38.55Q182.30-32.80 182.30-25L182.30-25Q182.30-17.30 179.45-11.50Q176.60-5.70 171.60-2.50Q166.60 0.70 160 0.70L160 0.70Q154 0.70 149.60-1.65Q145.20-4 142.80-7.40ZM170.20-25L170.20-25Q170.20-31.90 166.55-36.20Q162.90-40.50 157.20-40.50L157.20-40.50Q153.60-40.50 150.65-38.70Q147.70-36.90 145.90-33.50Q144.10-30.10 144.10-25L144.10-25Q144.10-20 145.90-16.55Q147.70-13.10 150.65-11.30Q153.60-9.50 157.20-9.50L157.20-9.50Q162.90-9.50 166.55-13.80Q170.20-18.10 170.20-25ZM190.90 0L190.90-72L202.20-72L202.20 0L190.90 0ZM215.00 0L215.00-50L226.30-50L226.30 0L215.00 0ZM220.70-57.60L220.70-57.60Q217.60-57.60 215.50-59.70Q213.40-61.80 213.40-64.70L213.40-64.70Q213.40-67.80 215.50-69.90Q217.60-72 220.70-72L220.70-72Q223.70-72 225.80-69.90Q227.90-67.80 227.90-64.70L227.90-64.70Q227.90-61.80 225.80-59.70Q223.70-57.60 220.70-57.60ZM275-43.80L275.80-50L286-50L286-7.50Q286 1 281.80 7.15Q277.60 13.30 269.70 16.65Q261.80 20 250.70 20L250.70 20L249.00 10.30Q261.60 10 268.15 5.50Q274.70 1 274.70-7.40L274.70-7.40L274.70-7.50L276-7.50Q273.70-4.10 269.35-1.70Q265 0.70 259 0.70L259 0.70Q252.40 0.70 247.30-2.50Q242.20-5.70 239.35-11.50Q236.50-17.30 236.50-25L236.50-25Q236.50-32.70 239.35-38.50Q242.20-44.30 247.30-47.50Q252.40-50.70 259-50.70L259-50.70Q262.70-50.70 265.75-49.75Q268.80-48.80 271.15-47.25Q273.50-45.70 275-43.80L275-43.80ZM248.60-25L248.60-25Q248.60-18.10 252.20-13.80Q255.80-9.50 261.80-9.50L261.80-9.50Q265.30-9.50 268.20-11.35Q271.10-13.20 272.90-16.70Q274.70-20.20 274.70-25L274.70-25Q274.70-30 272.90-33.45Q271.10-36.90 268.15-38.70Q265.20-40.50 261.80-40.50L261.80-40.50Q255.80-40.50 252.20-36.25Q248.60-32 248.60-25ZM297.30 0L297.30-72L308.60-72L308.60-45.40Q311-47.80 314.50-49.25Q318-50.70 322.30-50.70L322.30-50.70Q327.90-50.70 332.15-48.25Q336.40-45.80 338.75-41.05Q341.10-36.30 341.10-29.20L341.10-29.20L341.10 0L329.40 0L329.40-27.70Q329.40-34 326.85-37.20Q324.30-40.40 319.20-40.40L319.20-40.40Q314-40.40 311.30-37.10Q308.60-33.80 308.60-27.50L308.60-27.50L308.60 0L297.30 0ZM347.90-50L354.90-50L354.90-64L366.40-64L366.40-50L378.10-50L378.10-40.10L366.40-40.10L366.40-17.90Q366.40-13.40 368.10-11.65Q369.80-9.90 372.55-9.75Q375.30-9.60 378.10-10L378.10-10L378.10-0.40Q373.80 0.50 369.65 0.15Q365.50-0.20 362.20-2.15Q358.90-4.10 356.90-7.90Q354.90-11.70 354.90-17.90L354.90-17.90L354.90-40.10L347.90-40.10L347.90-50Z`;

// The lockup in units of the word's font-size F = 100, laid out as the mock's .lock rule lays it out:
// the mark a 1.25em square, a 0.42em gap, the word on a line box 1em tall (line-height 1) centred on
// the mark. Albert Sans's ascender is 950 and descender 250 per 1000, so the baseline sits 0.85em
// below the line box's top, which puts the middle of the capitals on the middle of the seed.
const MARK = 125;
const WORD_X = 167;
const BASELINE = (MARK - 100) / 2 + 85;
export const LOCKUP_W = WORD_X + 378.1;
export const LOCKUP_H = MARK;

/**
 * The lockup as a standalone SVG. `seen` is the width the seed will be seen at once the card is shown
 * (a 1200px card is usually seen at 500 to 600px), which sets its line weight, as everywhere else.
 */
export function seedLockup({ word = '#FFFFFF', seen = 36, width }: { word?: string; seen?: number; width?: number } = {}): string {
  const dims = width ? ` width="${width}" height="${((width * LOCKUP_H) / LOCKUP_W).toFixed(1)}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOCKUP_W} ${LOCKUP_H}"${dims} role="img" aria-label="Hoplight">`
    + `<svg x="0" y="0" width="${MARK}" height="${MARK}" viewBox="0 0 100 100">${seedMarkup(seen, SEED_GOLD)}</svg>`
    + `<path transform="translate(${WORD_X} ${BASELINE})" fill="${word}" d="${WORDMARK_PATH}"/>`
    + '</svg>';
}
