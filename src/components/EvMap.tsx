'use client';
import { useEffect, useRef, useState } from 'react';
import mapData from '@/data/us-state-paths.json';

// Democratic nominee statewide winner per state, [2008,2012,2016,2020,2024].
// Verified so each cycle's blue-state count reconciles to the real EV total.
// Maine/Nebraska single-district splits are not shown (whole-state coloring).
const WINNERS: Record<string, string> = {
  AK: 'RRRRR', AL: 'RRRRR', AR: 'RRRRR', AZ: 'RRRDR', CA: 'DDDDD', CO: 'DDDDD', CT: 'DDDDD',
  DC: 'DDDDD', DE: 'DDDDD', FL: 'DDRRR', GA: 'RRRDR', HI: 'DDDDD', IA: 'DDRRR', ID: 'RRRRR',
  IL: 'DDDDD', IN: 'DRRRR', KS: 'RRRRR', KY: 'RRRRR', LA: 'RRRRR', MA: 'DDDDD', MD: 'DDDDD',
  ME: 'DDDDD', MI: 'DDRDR', MN: 'DDDDD', MO: 'RRRRR', MS: 'RRRRR', MT: 'RRRRR', NC: 'DRRRR',
  ND: 'RRRRR', NE: 'RRRRR', NH: 'DDDDD', NJ: 'DDDDD', NM: 'DDDDD', NV: 'DDDDR', NY: 'DDDDD',
  OH: 'DDRRR', OK: 'RRRRR', OR: 'DDDDD', PA: 'DDRDR', RI: 'DDDDD', SC: 'RRRRR', SD: 'RRRRR',
  TN: 'RRRRR', TX: 'RRRRR', UT: 'RRRRR', VA: 'DDDDD', VT: 'DDDDD', WA: 'DDDDD', WV: 'RRRRR',
  WI: 'DDRDR', WY: 'RRRRR',
};

const YEARS = [
  { year: '2008', ev: 365, d: 28 },
  { year: '2012', ev: 332, d: 26 },
  { year: '2016', ev: 232, d: 20 },
  { year: '2020', ev: 306, d: 25 },
  { year: '2024', ev: 226, d: 19 },
];

const D_COLOR = '#46679A';
const R_COLOR = '#A8443A';
const states = mapData.states as Record<string, string>;

export default function EvMap() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [yi, setYi] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer: ReturnType<typeof setInterval> | null = null;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !manual && !reduce) {
        let i = 0;
        setYi(0);
        timer = setInterval(() => {
          i += 1;
          if (i > YEARS.length - 1) { if (timer) clearInterval(timer); return; }
          setYi(i);
        }, 1500);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => { obs.disconnect(); if (timer) clearInterval(timer); };
  }, [manual]);

  const cur = YEARS[yi];

  return (
    <div className="evmap" ref={ref}>
      <div className="evmap-controls">
        <div className="evmap-tabs" role="tablist" aria-label="Election year">
          {YEARS.map((y, i) => (
            <button
              key={y.year}
              role="tab"
              aria-selected={i === yi}
              className={`evmap-tab${i === yi ? ' on' : ''}`}
              onClick={() => { setManual(true); setYi(i); }}
            >
              {y.year}
            </button>
          ))}
        </div>
        <div className="evmap-readout" aria-live="polite">
          <span className="er-ev">{cur.ev}</span> electoral votes
          <span className="er-sub"> · {cur.d} states + DC</span>
        </div>
      </div>

      <svg
        className="evmap-svg"
        viewBox={mapData.viewBox}
        role="img"
        aria-label={`Electoral map ${cur.year}: Democrats won ${cur.d} states plus DC, ${cur.ev} electoral votes.`}
      >
        {Object.entries(states).map(([ab, d]) => {
          const dem = (WINNERS[ab] ?? 'RRRRR')[yi] === 'D';
          return (
            <path
              key={ab}
              d={d}
              fill={dem ? D_COLOR : R_COLOR}
              stroke="#151C26"
              strokeWidth={0.6}
              style={{ transition: 'fill 550ms ease' }}
            >
              <title>{`${ab} — ${dem ? 'Democratic' : 'Republican'} (${cur.year})`}</title>
            </path>
          );
        })}
      </svg>

      <div className="evmap-foot">
        <span className="evmap-legend"><i style={{ background: D_COLOR }} />Democratic <i style={{ background: R_COLOR }} />Republican</span>
        <span className="evmap-note">Statewide winner. Maine and Nebraska district splits not shown.</span>
      </div>
    </div>
  );
}
