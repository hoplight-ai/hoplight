'use client';
import { useEffect, useRef, useState } from 'react';

function useInView<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setInView(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function CountNum({ target, suffix = '' }: { target: number; suffix?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setVal(target); return; }
    const dur = 1100;
    let raf = 0;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return <span ref={ref}>{val.toLocaleString('en-US')}{suffix}</span>;
}

// Net support of the AI-generated frame over the human-generated frame (baseline = 0).
// Scale: 26 pts = full width. Only the fixed RCT figures are used here.
const rows = [
  { seg: 'Religious conservatives', val: '+26 pts', left: 0, width: 100 },
  { seg: 'Conservative segments', val: '+11 to +26 pts', left: 42, width: 58 },
  { seg: 'Progressive base', val: 'Held', left: 0, width: 3, held: true },
];

function FrameChart() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div className="rct" ref={ref}>
      <div className="rct-baseline">
        <span className="rb-name">Human-generated frame</span>
        <span className="rb-tag">baseline</span>
      </div>
      {rows.map((r) => (
        <div className="rct-row" key={r.seg}>
          <div className="rct-seg">
            <span>{r.seg}</span>
            <span className="rs-val">{r.val}</span>
          </div>
          <div className="rct-track">
            <div
              className={`rct-fill${r.held ? ' held' : ''}`}
              style={{ left: `${r.left}%`, width: inView ? `${r.width}%` : '0%' }}
            />
          </div>
        </div>
      ))}
      <p className="rct-cap">Bars: AI-generated frame, net support over the human-generated frame written by a skilled communicator. 3,006-person RCT, voter-file matched.</p>
    </div>
  );
}

export default function ProofBand() {
  return (
    <div className="proof">
      <div className="proof-lead">
        <div className="pnum-xl">+<CountNum target={26} /> pts</div>
        <div className="pcap">net lift with religious conservatives, AI-generated frame over a skilled human communicator&apos;s</div>
      </div>
      <FrameChart />
    </div>
  );
}
