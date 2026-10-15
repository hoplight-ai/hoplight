import { f, seedGeometry, SEED_GOLD } from '@/lib/brand/seed';

// The seed drawn for the size it is shown at (src/lib/brand/seed.ts): pass the rendered width in CSS
// pixels and the line weight follows it. Decorative wherever it sits beside the word "Hoplight".
export default function SeedMark({ px, color = SEED_GOLD, className }: { px: number; color?: string; className?: string }) {
  const g = seedGeometry(px);
  return (
    <svg className={className} viewBox="0 0 100 100" width={px} height={px} aria-hidden="true" focusable="false">
      {g.kind === 'outline' ? (
        <path d={g.d} fill="none" stroke={color} strokeWidth={f(g.sw)} strokeLinejoin="round" />
      ) : (
        <g fill="none" stroke={color} strokeWidth={g.sw.toFixed(2)} strokeOpacity={g.op}>
          {g.circles.map(([x, y]) => (
            <circle key={`${f(x)},${f(y)}`} cx={f(x)} cy={f(y)} r={f(g.r)} />
          ))}
        </g>
      )}
      <circle cx="50" cy="50" r={f(g.dot)} fill={SEED_GOLD} />
    </svg>
  );
}
