// A quiet Flower of Life lattice for a navy band's background, as the home masthead's field reads at
// rest: hairlines everywhere and a soft light in the top right, away from the content. It is an SVG
// <pattern> of one lattice tile, so it costs a few hundred bytes at any width. Opaque cards cover it;
// it shows only in the gutters and around the section's heading.

import { f } from '@/lib/brand/seed';

const SQ3 = Math.sqrt(3);
const GOLD = '#E8A820';

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

export default function QuietLattice({ id, r = 36 }: { id: string; r?: number }) {
  return (
    <svg className="pf-field" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={`${id}-tile`} width={f(r)} height={f(r * SQ3)} patternUnits="userSpaceOnUse">
          <g fill="none" stroke={GOLD} strokeWidth="0.8" strokeOpacity="0.11">
            {tileCircles(r).map(([x, y]) => (
              <circle key={`${f(x)},${f(y)}`} cx={f(x)} cy={f(y)} r={f(r)} />
            ))}
          </g>
        </pattern>
        <radialGradient id={`${id}-glow`} cx="0.86" cy="0.02" r="0.5">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.12" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}-glow)`} />
      <rect width="100%" height="100%" fill={`url(#${id}-tile)`} />
    </svg>
  );
}
