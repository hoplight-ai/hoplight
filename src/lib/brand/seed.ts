// The Seed of Life, Hoplight's mark since round four of the design system (2026-10-15). Whit picked it
// ("the seed is working") and asked that its lines "thin out as the icon shrinks". Ported line for line
// from seedAt() in visualizations/private/hoplight/hoplight-design-system-round-four-2026-10-15.html:
// seven circles of radius 17 in a 100 by 100 box, the line about 1.6% of the drawn size, never under
// 0.9px or over 3.4px, so it gets finer as the mark shrinks; at 18px and below the seven circles would
// fill in, so the mark becomes its scalloped outline. The gold dot at the centre is always gold.
//
// One geometry, three renderers: SeedMark (the site's React lockups), seedSvg (favicons, the og card)
// and the canvas masthead, which draws the same lattice at hero scale.

export const SEED_GOLD = '#E8A820';
export const SEED_INK = '#0F1B2D';

const SQ3 = Math.sqrt(3);
const R = 17; // the seed's circle radius in the 100-unit box
const R_OUTLINE = 14; // the outline form's scallop radius

/** One decimal, trailing ".0" dropped: the mock's f(). */
export function f(n: number): string {
  return (+n).toFixed(1).replace(/\.0$/, '');
}

function ring6(r: number, start: number): Array<[number, number]> {
  const p: Array<[number, number]> = [];
  for (let k = 0; k < 6; k++) {
    const a = ((start + k * 60) * Math.PI) / 180;
    p.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]);
  }
  return p;
}

export type SeedShape =
  | { kind: 'seed'; circles: Array<[number, number]>; r: number; sw: number; op: number; dot: number }
  | { kind: 'outline'; d: string; sw: number; dot: number };

/** The seed as drawn for a mark shown `px` CSS pixels wide. */
export function seedGeometry(px: number): SeedShape {
  const swpx = Math.max(0.9, Math.min(3.4, px * 0.016));
  const sw = (swpx * 100) / px;
  if (px <= 18) {
    let d = '';
    for (let k = 0; k < 6; k++) {
      const a0 = ((k * 60 - 120) * Math.PI) / 180;
      const a1 = ((k * 60 - 60) * Math.PI) / 180;
      d += `${k ? 'L' : 'M'}${f(50 + SQ3 * R_OUTLINE * Math.cos(a0))} ${f(50 + SQ3 * R_OUTLINE * Math.sin(a0))}`;
      d += `A${R_OUTLINE} ${R_OUTLINE} 0 1 1 ${f(50 + SQ3 * R_OUTLINE * Math.cos(a1))} ${f(50 + SQ3 * R_OUTLINE * Math.sin(a1))}`;
    }
    return { kind: 'outline', d: `${d}Z`, sw: sw * 1.05, dot: 8.5 };
  }
  const dot = Math.max(4.2, (1.9 * 100) / px);
  return { kind: 'seed', circles: [[50, 50] as [number, number], ...ring6(R, -90)], r: R, sw, op: 0.95, dot };
}

/** The mark's inner markup for a `viewBox="0 0 100 100"` box. */
export function seedMarkup(px: number, color: string = SEED_GOLD): string {
  const g = seedGeometry(px);
  const dot = `<circle cx="50" cy="50" r="${f(g.dot)}" fill="${SEED_GOLD}"/>`;
  if (g.kind === 'outline') {
    return `<path d="${g.d}" fill="none" stroke="${color}" stroke-width="${f(g.sw)}" stroke-linejoin="round"/>${dot}`;
  }
  const circles = g.circles.map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(g.r)}"/>`).join('');
  return `<g fill="none" stroke="${color}" stroke-width="${g.sw.toFixed(2)}" stroke-opacity="${g.op}">${circles}</g>${dot}`;
}

export interface SeedSvgOptions {
  color?: string;
  /** Paint the mark on a navy tile. 'rounded' is the browser-tab tile; 'square' fills the box edge to
   *  edge, for the home-screen icon, which iOS and Android round themselves. */
  tile?: 'rounded' | 'square';
  /** Rendered width and height, written on the root element. */
  size?: number;
}

/** A standalone SVG of the seed drawn for `px`. */
export function seedSvg(px: number, { color = SEED_GOLD, tile, size }: SeedSvgOptions = {}): string {
  const dims = size ? ` width="${size}" height="${size}"` : '';
  const ground = tile === 'rounded'
    ? `<rect width="100" height="100" rx="22" fill="${SEED_INK}"/>`
    : tile === 'square'
      ? `<rect width="100" height="100" fill="${SEED_INK}"/>`
      : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${dims} role="img" aria-label="Hoplight">${ground}${seedMarkup(px, color)}</svg>`;
}
