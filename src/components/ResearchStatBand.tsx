'use client';
import { useEffect, useRef, useState } from 'react';

function CountUp({ to, format }: { to: number; format?: (n: number) => string }) {
  const [val, setVal] = useState(0);
  const spanRef = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const fmt = format ?? ((n: number) => String(n));

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
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
          <div className="rstat-card">
            <div className="rstat-num">
              <CountUp to={26} />
              <span className="rstat-unit"> pts</span>
            </div>
            <p className="rstat-label">net lift with religious conservatives</p>
          </div>
          <div className="rstat-card">
            <div className="rstat-num">
              11&ndash;<CountUp to={26} />
              <span className="rstat-unit"> pts</span>
            </div>
            <p className="rstat-label">net across conservative segments</p>
          </div>
          <div className="rstat-card">
            <div className="rstat-num rstat-text-stat">Base held</div>
            <p className="rstat-label">no erosion on the left</p>
          </div>
          <div className="rstat-card">
            <div className="rstat-num">
              <CountUp to={3006} format={(n) => n.toLocaleString()} />
            </div>
            <p className="rstat-label">person RCT, voter-file matched</p>
          </div>
        </div>
      </div>
    </section>
  );
}
