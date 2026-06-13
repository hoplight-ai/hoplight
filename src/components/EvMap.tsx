'use client';
import { useEffect, useRef, useState } from 'react';

// Democratic nominee results, 2008–2024. Statewide winner per state.
// Verified so each cycle's blue-state count reconciles to the real EV total.
// Maine/Nebraska single-district splits are not shown (whole-state coloring).
const YEARS = [
  { year: '2008', ev: 365, d: 28 },
  { year: '2012', ev: 332, d: 26 },
  { year: '2016', ev: 232, d: 20 },
  { year: '2020', ev: 306, d: 25 },
  { year: '2024', ev: 226, d: 19 },
];

// ab, col, row, winners for [2008,2012,2016,2020,2024]
const STATES: [string, number, number, string][] = [
  ['ME', 10, 0, 'DDDDD'],
  ['AK', 0, 1, 'RRRRR'], ['VT', 8, 1, 'DDDDD'], ['NH', 9, 1, 'DDDDD'],
  ['WA', 0, 2, 'DDDDD'], ['ID', 1, 2, 'RRRRR'], ['MT', 2, 2, 'RRRRR'], ['ND', 3, 2, 'RRRRR'], ['MN', 4, 2, 'DDDDD'], ['WI', 5, 2, 'DDRDR'], ['MI', 7, 2, 'DDRDR'], ['NY', 8, 2, 'DDDDD'], ['MA', 9, 2, 'DDDDD'],
  ['OR', 0, 3, 'DDDDD'], ['NV', 1, 3, 'DDDDR'], ['WY', 2, 3, 'RRRRR'], ['SD', 3, 3, 'RRRRR'], ['IA', 4, 3, 'DDRRR'], ['IL', 5, 3, 'DDDDD'], ['IN', 6, 3, 'DRRRR'], ['OH', 7, 3, 'DDRRR'], ['PA', 8, 3, 'DDRDR'], ['NJ', 9, 3, 'DDDDD'], ['CT', 10, 3, 'DDDDD'], ['RI', 11, 3, 'DDDDD'],
  ['CA', 0, 4, 'DDDDD'], ['UT', 1, 4, 'RRRRR'], ['CO', 2, 4, 'DDDDD'], ['NE', 3, 4, 'RRRRR'], ['MO', 4, 4, 'RRRRR'], ['KY', 5, 4, 'RRRRR'], ['WV', 6, 4, 'RRRRR'], ['VA', 7, 4, 'DDDDD'], ['MD', 8, 4, 'DDDDD'], ['DE', 9, 4, 'DDDDD'],
  ['AZ', 1, 5, 'RRRDR'], ['NM', 2, 5, 'DDDDD'], ['KS', 3, 5, 'RRRRR'], ['AR', 4, 5, 'RRRRR'], ['TN', 5, 5, 'RRRRR'], ['NC', 6, 5, 'DRRRR'], ['SC', 7, 5, 'RRRRR'], ['DC', 8, 5, 'DDDDD'],
  ['OK', 3, 6, 'RRRRR'], ['LA', 4, 6, 'RRRRR'], ['MS', 5, 6, 'RRRRR'], ['AL', 6, 6, 'RRRRR'], ['GA', 7, 6, 'RRRDR'],
  ['HI', 0, 7, 'DDDDD'], ['TX', 3, 7, 'RRRRR'], ['FL', 7, 7, 'DDRRR'],
];

const S = 38;
const STEP = 43;
const D_COLOR = '#46679A';
const R_COLOR = '#A8443A';

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
  const w = 11 * STEP + S;
  const h = 7 * STEP + S;

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
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={`Electoral map ${cur.year}: Democrats won ${cur.d} states plus DC, ${cur.ev} electoral votes.`}
      >
        {STATES.map(([ab, c, r, winners]) => {
          const dem = winners[yi] === 'D';
          return (
            <g key={ab} transform={`translate(${c * STEP}, ${r * STEP})`}>
              <rect width={S} height={S} rx={5} fill={dem ? D_COLOR : R_COLOR} style={{ transition: 'fill 550ms ease' }} />
              <text x={S / 2} y={S / 2 + 4} textAnchor="middle" className="evmap-lbl">{ab}</text>
            </g>
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
