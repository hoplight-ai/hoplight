'use client';
import { useEffect, useRef, useState } from 'react';

// Democratic nominee electoral votes won, 2008–2024 (public record).
const data = [
  { year: '2008', ev: 365 },
  { year: '2012', ev: 332 },
  { year: '2016', ev: 232 },
  { year: '2020', ev: 306 },
  { year: '2024', ev: 226 },
];

const W = 460;
const H = 170;
const PAD_X = 34;
const TOP = 28;
const PLOT = 96; // vertical plot height
const DOM_MIN = 200;
const DOM_MAX = 380;

const x = (i: number) => PAD_X + (i * (W - PAD_X * 2)) / (data.length - 1);
const y = (ev: number) => TOP + ((DOM_MAX - ev) / (DOM_MAX - DOM_MIN)) * PLOT;

export default function EvTrajectory() {
  const ref = useRef<SVGSVGElement | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setShow(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShow(true); obs.disconnect(); } },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const line = data.map((d, i) => `${x(i)},${y(d.ev)}`).join(' ');

  return (
    <div className="evo">
      <div className="evo-head">
        365 <span className="evo-arrow" aria-hidden="true">→</span> 226
        <span className="evo-unit">electoral votes</span>
      </div>
      <svg
        ref={ref}
        className={`evo-svg${show ? ' show' : ''}`}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Democratic electoral votes by year: 2008, 365; 2012, 332; 2016, 232; 2020, 306; 2024, 226."
      >
        <polyline className="evo-line" points={line} fill="none" stroke="#E3AC42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={d.year} className="evo-pt" style={{ transitionDelay: `${300 + i * 140}ms` }}>
            <circle cx={x(i)} cy={y(d.ev)} r="5" fill="#151C26" stroke="#E3AC42" strokeWidth="2" />
            <text className="evo-ev" x={x(i)} y={y(d.ev) - 12} textAnchor="middle">{d.ev}</text>
            <text className="evo-yr" x={x(i)} y={H - 8} textAnchor="middle">{d.year}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
