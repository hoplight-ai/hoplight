'use client';

import { useState } from 'react';
import { COPY } from '@/lib/undo/copy';
import type { IssueKey } from '@/lib/undo/issues';
import type { IssueBar } from '@/lib/undo/progress';

type SegmentKey = 'pen' | 'process' | 'congress' | 'locked';
const SEGMENTS: SegmentKey[] = ['pen', 'process', 'congress', 'locked'];
const FIRST = 5;

// The filter: one HTML/CSS bar per issue, biggest first, the first five shown and the rest on a
// tap. The track is as wide as the biggest issue needs, and each bar is a share of that; the
// segments are the shares of that issue's own items. Tapping a bar narrows the field and the
// orders to that issue; tapping it again clears. No chart library, no SVG. (Reshaped 2026-10-19:
// this replaced a separate chip row, so one label carries one count on the page.)
export default function IssueBars({
  bars,
  active,
  onPick,
}: {
  bars: IssueBar[];
  active: IssueKey | null;
  onPick: (key: IssueKey) => void;
}) {
  const [all, setAll] = useState(false);
  if (bars.length === 0) return null;
  const max = Math.max(...bars.map((b) => b.total));
  const activeIndex = active === null ? -1 : bars.findIndex((b) => b.key === active);
  // The active bar stays visible even when it sits past the first five.
  const shown = all ? bars : bars.filter((b, i) => i < FIRST || b.key === active);
  const hidden = bars.length - shown.length;

  return (
    <section className="undo-section undo-section-ruled undo-who" aria-labelledby="undo-land-h" id="undo-land">
      <div className="wrap">
        <h2 id="undo-land-h" className="undo-h2">
          {COPY.land.title}
        </h2>
        <p className="undo-intro">{COPY.land.intro}</p>
        <ul className="undo-land">
          {shown.map((b) => (
            <li key={b.key}>
              <button
                type="button"
                className={`undo-bar${active === b.key ? ' is-active' : ''}`}
                aria-pressed={active === b.key}
                aria-label={COPY.land.bar(b.label, b.total, b.pen, b.process, b.congress, b.locked, b.signedPen)}
                onClick={() => onPick(b.key)}
              >
                <span className="undo-bar-label" aria-hidden="true">
                  <span className="undo-bar-name">{b.label}</span>
                  <span className="undo-bar-line">{b.line}</span>
                </span>
                <span className="undo-bar-track" aria-hidden="true">
                  <span className="undo-bar-fill" style={{ width: `${(b.total / max) * 100}%` }}>
                    {SEGMENTS.filter((k) => b[k] > 0).map((k) => (
                      <span key={k} className={`undo-seg undo-seg-${k}`} style={{ flexGrow: b[k] }} />
                    ))}
                    {b.signedPen > 0 ? (
                      <span className="undo-bar-mark" style={{ left: `${(b.signedPen / b.total) * 100}%` }} />
                    ) : null}
                  </span>
                </span>
                <span className="undo-bar-count" aria-hidden="true">
                  {COPY.land.countLabel(b.pen, b.total)}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="undo-land-foot">
          {hidden > 0 ? (
            <button type="button" className="undo-more" onClick={() => setAll(true)}>
              {COPY.land.more(hidden)}
            </button>
          ) : all && bars.length > FIRST ? (
            <button type="button" className="undo-more" onClick={() => setAll(false)}>
              {COPY.land.fewer}
            </button>
          ) : null}
          {active !== null ? (
            <button type="button" className="undo-clear" onClick={() => onPick(active)}>
              {COPY.issues.clear}
              <span className="sr-only">
                {' '}
                ({bars[activeIndex]?.label})
              </span>
            </button>
          ) : null}
        </div>
        <p className="undo-legend" aria-hidden="true">
          {COPY.land.legend.map((l) => (
            <span key={l.key} className="undo-legend-item">
              <span className={`undo-legend-swatch undo-seg-${l.key}`} />
              {l.label}
            </span>
          ))}
          <span className="undo-legend-item">
            <span className="undo-legend-mark" />
            {COPY.land.legendTicks}
          </span>
        </p>
      </div>
    </section>
  );
}
