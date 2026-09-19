'use client';
import { useEffect, useRef, useState } from 'react';
import { FACTS } from '@/lib/facts';

function CountUp({ to, format }: { to: number; format?: (n: number) => string }) {
  // Starts at the real value so the server-rendered HTML (what crawlers, link previews and
  // reduced-motion readers see) carries the number, not "0". The count-up runs only in a browser
  // that allows motion, and only once the band scrolls into view.
  const [val, setVal] = useState(to);
  const spanRef = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const fmt = format ?? ((n: number) => String(n));

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setVal(0);
          const dur = 1300;
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - t0) / dur, 1);
            const eased = 1 - (1 - p) ** 3;
            setVal(Math.round(eased * to));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);

  return <span ref={spanRef}>{fmt(val)}</span>;
}

export default function ResearchStatBand() {
  return (
    <section className="slate">
      <div className="wrap">
        <div className="rstat-grid">
          {/* CORRECTED 2026-09-19 under Whit's ruling. Card 1 carried "26 pts net lift with
              religious conservatives", which was the wrong segment: the 26 is enterprising
              conservatives against the placebo. Card 2 carried "11-26", which was never the
              frame-to-frame range. Card 3 carried "Base held / no erosion on the left", which
              the union-support numbers do not support. */}
          <div className="rstat-card">
            <div className="rstat-num">
              55 to <CountUp to={71} />
            </div>
            <p className="rstat-label">union support among religious conservatives, placebo to Personal Safety frame</p>
          </div>
          <div className="rstat-card">
            <div className="rstat-num">
              10&ndash;<CountUp to={23} />
              <span className="rstat-unit"> pts</span>
            </div>
            <p className="rstat-label">over the staff-written frame on officer pay, conservative segments</p>
          </div>
          <div className="rstat-card">
            <div className="rstat-num rstat-text-stat">About even</div>
            <p className="rstat-label">AI frames against the staff-written frame with liberals and Democrats</p>
          </div>
          <div className="rstat-card">
            <div className="rstat-num">
              <CountUp to={3006} format={(n) => n.toLocaleString()} />
            </div>
            <p className="rstat-label">person {FACTS.rct.method}, {FACTS.rct.matchRate} voter-file match</p>
          </div>
        </div>
      </div>
    </section>
  );
}
