// The Flower of Life field from the Hoplight Design System's Geometry component, ported line for line
// from its components/bundle.js (read 2026-10-11) so the link-preview cards draw the same lattice the
// system draws. "Structured serendipity": a seed (the page or card title) picks this surface's window
// onto one infinite lattice (a radius in the tone's range, an angle, an offset), so the same title
// always gets the same crop and no two titles share one.
//
// The system's fades are CSS masks; an image renderer (Satori for /api/og, Chrome for og.png) needs
// them inside the SVG, so each fade here is the same gradient written as an SVG mask.
//
// Art, never data: nothing on a card depends on the field, and a card still reads with it removed.

export type Tone = 'band' | 'surface';
export type Fade = 'none' | 'right' | 'left' | 'corner' | 'soft';

// geometry-field-band and geometry-field-surface (light theme), and the radius range per tone.
const STROKE: Record<Tone, string> = { band: 'rgba(232,194,104,0.14)', surface: 'rgba(15,27,45,0.075)' };
const RANGE: Record<Tone, [number, number]> = { band: [150, 230], surface: [110, 170] };

const SQ3 = Math.sqrt(3);
const ANGLES = [0, 30, -26, 13, -13, 26];

function geoHash(str: string): number {
  let x = 2166136261;
  for (let i = 0; i < str.length; i++) {
    x ^= str.charCodeAt(i);
    x = Math.imul(x, 16777619);
  }
  return x >>> 0;
}

function geoRng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function geoWindow(seed: string, rmin: number, rmax: number) {
  const r = geoRng(geoHash(String(seed || 'hoplight')));
  const R = rmin + (rmax - rmin) * r();
  return { r: R, rot: ANGLES[Math.floor(r() * ANGLES.length)], ox: r() * R, oy: (r() * R * SQ3) / 2 };
}

function geoCircles(w: number, h: number, o: ReturnType<typeof geoWindow>): string {
  const dy = (o.r * SQ3) / 2;
  const D = Math.sqrt(w * w + h * h) / 2 + 2 * o.r;
  const cols = Math.ceil(D / o.r) + 1;
  const rows = Math.ceil(D / dy) + 1;
  let out = '';
  for (let j = -rows; j <= rows; j++) {
    const off = j & 1 ? o.r / 2 : 0;
    for (let i = -cols; i <= cols; i++) {
      out += `<circle cx="${(i * o.r + off).toFixed(1)}" cy="${(j * dy).toFixed(1)}" r="${o.r.toFixed(1)}"/>`;
    }
  }
  return `<g transform="translate(${(w / 2 + o.ox).toFixed(1)} ${(h / 2 + o.oy).toFixed(1)}) rotate(${o.rot})">${out}</g>`;
}

// The system's .hl-geo-fade-* masks: right and left are linear (opaque 15%, gone by 80%), corner is an
// ellipse 80% by 120% from the top right (gone by 75%), soft an ellipse 70% by 90% from the centre
// (gone by 85%). White is visible in an SVG mask.
function fadeMask(fade: Fade, id: string, w: number, h: number): string {
  const stops = (to: number) => `<stop offset="0" stop-color="#FFFFFF"/><stop offset="${to}" stop-color="#FFFFFF" stop-opacity="0"/>`;
  let grad: string;
  if (fade === 'right' || fade === 'left') {
    const [x1, x2] = fade === 'right' ? [1, 0] : [0, 1];
    grad = `<linearGradient id="${id}-g" x1="${x1}" y1="0" x2="${x2}" y2="0"><stop offset="0.15" stop-color="#FFFFFF"/><stop offset="0.8" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>`;
  } else if (fade === 'corner') {
    grad = `<radialGradient id="${id}-g" cx="1" cy="0" r="1" gradientTransform="translate(1 0) scale(0.8 1.2) translate(-1 0)">${stops(0.75)}</radialGradient>`;
  } else {
    grad = `<radialGradient id="${id}-g" cx="0.5" cy="0.5" r="1" gradientTransform="translate(0.5 0.5) scale(0.7 0.9) translate(-0.5 -0.5)">${stops(0.85)}</radialGradient>`;
  }
  return `${grad}<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="url(#${id}-g)"/></mask>`;
}

export interface FieldOptions {
  width: number;
  height: number;
  seed: string;
  tone?: Tone;
  fade?: Fade;
  /** Prefix for the mask ids, so two fields (or a field and a mark) can share one SVG. */
  id?: string;
}

/** The field as SVG markup to place inside another SVG: its defs and its drawing. */
export function fieldMarkup({ width, height, seed, tone = 'band', fade = 'right', id = 'hl-geo' }: FieldOptions) {
  const [rmin, rmax] = RANGE[tone];
  const lattice = geoCircles(width, height, geoWindow(seed, rmin, rmax));
  const defs = fade === 'none' ? '' : fadeMask(fade, `${id}-fade`, width, height);
  const mask = fade === 'none' ? '' : ` mask="url(#${id}-fade)"`;
  const body = `<g fill="none" stroke="${STROKE[tone]}" stroke-width="1"${mask}>${lattice}</g>`;
  return { defs, body };
}

/** The field as a standalone SVG document, for an <img>. */
export function fieldSvg(opts: FieldOptions): string {
  const { defs, body } = fieldMarkup(opts);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${opts.width} ${opts.height}" width="${opts.width}" height="${opts.height}"><defs>${defs}</defs>${body}</svg>`;
}
