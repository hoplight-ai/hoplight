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
      { threshold: 0.4 }
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

export default function ProofBand() {
  return (
    <div className="proof">
      <div className="proof-lead">
        <div className="pnum-xl"><CountNum target={26} suffix=" pts" /></div>
        <div className="pcap">net lift with religious conservatives, over messaging written by a skilled human communicator</div>
      </div>
      <div className="proof-ledger">
        <div className="pledger-row">
          <span className="pl-num">11–26 pts</span>
          <span className="pl-cap">net across conservative segments</span>
        </div>
        <div className="pledger-row">
          <span className="pl-num">Base held</span>
          <span className="pl-cap">no erosion on the left</span>
        </div>
        <div className="pledger-row">
          <span className="pl-num"><CountNum target={3006} /></span>
          <span className="pl-cap">person RCT, voter-file matched</span>
        </div>
      </div>
    </div>
  );
}
