// The magnified lattice as a still SVG, for surfaces that cannot run the canvas masthead (the og card).
// Ported from sMag() and veil() in visualizations/private/hoplight/hoplight-design-system-round-four-2026-10-15.html,
// the same soft bulge as src/lib/brand/masthead.ts: g = (1 + d²/S²)^-2, B = 1.3, lifted toward the upper
// left, a soft shadow beneath, no edge ring.

import { f, SEED_GOLD, SEED_INK } from './seed.ts';

const SQ3 = Math.sqrt(3);
const SHADOW = '#03070E';

function lattice(r: number, w: number, h: number, cx: number, cy: number, margin: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  const dy = (r * SQ3) / 2;
  const D = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 2 * r;
  const cols = Math.ceil(D / r) + 1;
  const rows = Math.ceil(D / dy) + 1;
  for (let j = -rows; j <= rows; j++) {
    for (let i = -cols; i <= cols; i++) {
      const x = cx + i * r + (j & 1 ? r / 2 : 0);
      const y = cy + j * dy;
      if (x > -margin && x < w + margin && y > -margin && y < h + margin) pts.push([x, y]);
    }
  }
  return pts;
}

export interface MagnifyOptions {
  width: number;
  height: number;
  /** The lattice's circle radius. */
  r: number;
  /** The lens centre. */
  focus: [number, number];
  /** The lens's soft radius. */
  S: number;
  id?: string;
}

/** The lattice with the lens over it: `defs` go in the card's <defs>, `body` after its navy ground. */
export function magnifiedField({ width: w, height: h, r, focus: F, S, id = 'mag' }: MagnifyOptions) {
  const B = 1.3;
  const L = S * 0.12;
  const S2 = S * S;
  const R = S * 2.0;
  const gg = (dx: number, dy: number) => Math.pow(1 + (dx * dx + dy * dy) / S2, -2);
  const warp = (x: number, y: number): [number, number] => {
    const dx = x - F[0];
    const dy = y - F[1];
    const g = gg(dx, dy);
    return [F[0] + dx * (1 + B * g) - L * 0.4 * g, F[1] + dy * (1 + B * g) - L * g];
  };
  let s = '';
  for (const c of lattice(r, w, h, F[0], F[1], r * 2)) {
    const ex = c[0] - F[0];
    const ey = c[1] - F[1];
    const dd = Math.hypot(ex, ey);
    const v = Math.exp(-(dd * dd) / (R * R));
    const gc = gg(ex, ey);
    const lit = 1 + 0.4 * gc * (dd ? -(ex * 0.55 + ey * 0.83) / dd : 0);
    const op = Math.min(0.95, (0.1 + 0.8 * v) * lit).toFixed(2);
    if (dd > S * 2.6) {
      const q = warp(c[0], c[1]);
      s += `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(r * (1 + B * gc))}" stroke-opacity="${op}"/>`;
      continue;
    }
    let d = '';
    for (let i = 0; i <= 44; i++) {
      const a = (i / 44) * 2 * Math.PI;
      const q = warp(c[0] + r * Math.cos(a), c[1] + r * Math.sin(a));
      d += `${i ? 'L' : 'M'}${f(q[0])} ${f(q[1])}`;
    }
    s += `<path d="${d}Z" stroke-opacity="${op}" stroke-width="${f(1.3 + 0.6 * gc)}"/>`;
  }
  const defs =
    `<radialGradient id="${id}-s" cx="${f(F[0] + S * 0.16)}" cy="${f(F[1] + S * 0.32)}" r="${f(S * 2.1)}" gradientUnits="userSpaceOnUse">`
    + `<stop offset="0" stop-color="${SHADOW}" stop-opacity=".55"/><stop offset=".55" stop-color="${SHADOW}" stop-opacity=".22"/><stop offset="1" stop-color="${SHADOW}" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="${id}-g" cx="${f(F[0] - S * 0.25)}" cy="${f(F[1] - S * 0.32)}" r="${f(S * 1.6)}" gradientUnits="userSpaceOnUse">`
    + `<stop offset="0" stop-color="${SEED_GOLD}" stop-opacity=".16"/><stop offset="1" stop-color="${SEED_GOLD}" stop-opacity="0"/></radialGradient>`;
  const body =
    `<rect width="${w}" height="${h}" fill="url(#${id}-s)"/><rect width="${w}" height="${h}" fill="url(#${id}-g)"/>`
    + `<g fill="none" stroke="${SEED_GOLD}" stroke-width="1.4">${s}</g>`;
  return { defs, body };
}

/** A navy veil over the left of the card, so the words sit on calm ground (the mock's veil()). */
export function leftVeil(w: number, h: number, from: number, to: number, id = 'veil') {
  return {
    defs: `<linearGradient id="${id}" x1="0" y1="0" x2="${w}" y2="0" gradientUnits="userSpaceOnUse">`
      + `<stop offset="0" stop-color="${SEED_INK}" stop-opacity=".96"/><stop offset="${from}" stop-color="${SEED_INK}" stop-opacity=".9"/><stop offset="${to}" stop-color="${SEED_INK}" stop-opacity="0"/></linearGradient>`,
    body: `<rect width="${w}" height="${h}" fill="url(#${id})"/>`,
  };
}
