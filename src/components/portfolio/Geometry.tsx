// The Flower of Life studies the portfolio page draws for depth (round four of the design system,
// 2026-10-15): the engraved field on navy, its lines swelling toward the one lit place; the 20x quiet
// arcs under open space; the bloom, one flower in ink off the edge of a white section.
//
// The field is an SVG <pattern> of one lattice tile rather than hundreds of circles, so the page ships a
// few hundred bytes of markup for it, and it draws at any width.

import { f } from '@/lib/brand/seed';

const SQ3 = Math.sqrt(3);
const GOLD = '#E8A820';
const INK = '#0F1B2D';

// Every lattice circle whose disc reaches into one r by r√3 tile: the tile repeats into the whole field.
function tileCircles(r: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const dy = (r * SQ3) / 2;
  for (let j = -2; j <= 4; j++) {
    for (let i = -2; i <= 3; i++) {
      const x = i * r + (j & 1 ? r / 2 : 0);
      const y = j * dy;
      if (x > -r && x < 2 * r && y > -r && y < r * SQ3 + r) out.push([x, y]);
    }
  }
  return out;
}

function LatticePattern({ id, r, stroke, width, opacity, rotate = 0 }: { id: string; r: number; stroke: string; width: number; opacity: number; rotate?: number }) {
  return (
    <pattern id={id} width={f(r)} height={f(r * SQ3)} patternUnits="userSpaceOnUse" patternTransform={rotate ? `rotate(${rotate})` : undefined}>
      <g fill="none" stroke={stroke} strokeWidth={width} strokeOpacity={opacity}>
        {tileCircles(r).map(([x, y]) => (
          <circle key={`${f(x)},${f(y)}`} cx={f(x)} cy={f(y)} r={f(r)} />
        ))}
      </g>
    </pattern>
  );
}

/**
 * The engraved field: a hairline lattice everywhere, and the same lattice drawn heavy and bright inside
 * a soft circle around `lit` (fractions of the box), so the lines swell toward the light.
 */
export function EngravedField({ id, r = 38, lit, reach = 0.55 }: { id: string; r?: number; lit: [number, number]; reach?: number }) {
  return (
    <svg className="pf-field" aria-hidden="true" focusable="false">
      <defs>
        <LatticePattern id={`${id}-thin`} r={r} stroke={GOLD} width={0.8} opacity={0.16} />
        <LatticePattern id={`${id}-bold`} r={r} stroke={GOLD} width={1.8} opacity={0.85} />
        <radialGradient id={`${id}-light`} cx={lit[0]} cy={lit[1]} r={reach}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx={lit[0]} cy={lit[1]} r={reach * 0.7}>
          <stop offset="0" stopColor={GOLD} stopOpacity="0.16" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-mask`} maskContentUnits="objectBoundingBox">
          <rect width="1" height="1" fill={`url(#${id}-light)`} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}-glow)`} />
      <rect width="100%" height="100%" fill={`url(#${id}-thin)`} />
      <rect width="100%" height="100%" fill={`url(#${id}-bold)`} mask={`url(#${id}-mask)`} />
    </svg>
  );
}

/**
 * The 20x quiet study: the seed drawn so large that only a few arcs cross the band, with its centre
 * marked. Drawn in a 1440 by 900 box that covers the section.
 */
export function QuietArcs({ center = [1080, 380], scale = 1.15, opacity = 0.22 }: { center?: [number, number]; scale?: number; opacity?: number }) {
  const R = 1440 * scale;
  const pts: Array<[number, number]> = [center];
  for (let k = 0; k < 6; k++) {
    const a = ((k * 60 - 90 + 8) * Math.PI) / 180;
    pts.push([center[0] + R * Math.cos(a), center[1] + R * Math.sin(a)]);
  }
  return (
    <svg className="pf-field" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="pf-quiet-glow" cx={center[0]} cy={center[1]} r="260" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.2" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#pf-quiet-glow)" />
      <g fill="none" stroke={GOLD} strokeWidth="1.4" strokeOpacity={opacity}>
        {pts.map(([x, y]) => (
          <circle key={`${f(x)},${f(y)}`} cx={f(x)} cy={f(y)} r={f(R)} />
        ))}
      </g>
      <circle cx={center[0]} cy={center[1]} r="3.5" fill={GOLD} fillOpacity="0.8" />
    </svg>
  );
}

/** The bloom: one Flower of Life (nineteen circles) in ink, faint, set off the edge of a white section. */
export function Bloom({ r = 92 }: { r?: number }) {
  const pts: Array<[number, number]> = [];
  const dy = (r * SQ3) / 2;
  for (let j = -2; j <= 2; j++) {
    for (let i = -2; i <= 2; i++) {
      const x = i * r + (j & 1 ? r / 2 : 0);
      const y = j * dy;
      if (Math.hypot(x, y) <= 2 * r + 0.01) pts.push([x, y]);
    }
  }
  const box = 3 * r + 4;
  return (
    <svg className="pf-bloom" viewBox={`${-box} ${-box} ${2 * box} ${2 * box}`} aria-hidden="true" focusable="false">
      <g fill="none" stroke={INK} strokeWidth="1.2" strokeOpacity="0.09">
        {pts.map(([x, y]) => (
          <circle key={`${f(x)},${f(y)}`} cx={f(x)} cy={f(y)} r={f(r)} />
        ))}
        <circle cx="0" cy="0" r={f(3 * r)} />
      </g>
    </svg>
  );
}
