'use client';

import { COPY } from '@/lib/undo/copy';
import type { IssueKey } from '@/lib/undo/issues';
import type { IssueBar } from '@/lib/undo/progress';

type SegmentKey = 'pen' | 'process' | 'congress' | 'locked';
const SEGMENTS: SegmentKey[] = ['pen', 'process', 'congress', 'locked'];

// "Where it lands": one HTML/CSS bar per issue. The track is as wide as the biggest issue needs,
// and each bar is a share of that. The segments are the shares of that issue's own items. No chart
// library, no SVG: divs with widths, each bar a button that says its numbers in words.
export default function IssueBars({
  bars,
  active,
  onPick,
}: {
  bars: IssueBar[];
  active: IssueKey | null;
  onPick: (key: IssueKey) => void;
}) {
  if (bars.length === 0) return null;
  const max = Math.max(...bars.map((b) => b.total));

  return (
    <section className="undo-section" aria-labelledby="undo-land-h" id="undo-land">
      <div className="wrap">
        <h2 id="undo-land-h" className="undo-h2">
          {COPY.land.title}
        </h2>
        <p className="undo-intro">{COPY.land.intro}</p>
        <ul className="undo-land">
          {bars.map((b) => (
            <li key={b.key}>
              <button
                type="button"
                className={`undo-bar${active === b.key ? ' is-active' : ''}`}
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
