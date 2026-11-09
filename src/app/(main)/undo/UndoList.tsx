'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { COPY } from '@/lib/undo/copy';
import { track } from '@/lib/track';
import { fieldBlocks } from '@/lib/undo/field';
import type { IssueKey } from '@/lib/undo/issues';
import { issueBars } from '@/lib/undo/progress';
import type { ForwardOrderView } from '@/lib/undo/forward-text';
import { isPenInForce } from '@/lib/undo/sections';
import type { SlimRow } from '@/lib/undo/sections';
import ForwardOrders from './ForwardOrders';
import type { OrderPick } from './ForwardOrders';
import IssueBars, { BAR_SPAN } from './IssueBars';
import SignatureField from './SignatureField';
import { readSigned, writeSigned } from './signed';

// The front page of The Undo List: the headline over the field, the key, the one filter, the
// thirteen orders. Executive actions only (2026-11-08): the rows that arrive are the pen rows. Every row on its own is /undo/all (UndoAll.tsx); the two pages share the
// reader's ticks through one storage key.
export default function UndoList({
  rows,
  penInForce,
  kinds,
  orders,
}: {
  rows: SlimRow[];
  penInForce: number;
  kinds: { key: string; label: string; count: number }[];
  orders: ForwardOrderView[];
}) {
  // The issue filter is never stored: a reload starts from the whole list.
  const [issue, setIssue] = useState<IssueKey | null>(null);
  const [signed, setSigned] = useState<Set<string>>(() => new Set());
  const [stripOn, setStripOn] = useState(false);
  const [pick, setPick] = useState<OrderPick | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // Ticks: the server renders everything unticked; the browser fills them in after hydration.
  useEffect(() => {
    // Reading storage must wait for the browser, so this one setState in an effect is deliberate.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSigned(new Set(readSigned()));
  }, []);

  // The strip appears once the hero has scrolled out of view, and sits under the site header.
  useEffect(() => {
    const hero = document.getElementById('undo-hero');
    if (!hero) return;
    const obs = new IntersectionObserver(([entry]) => {
      setStripOn(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    });
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>('header.site');
    const strip = stripRef.current;
    if (!header || !strip) return;
    const place = () => strip.style.setProperty('--undo-top', `${header.offsetHeight}px`);
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, []);

  function toggle(id: string) {
    const next = new Set(signed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSigned(next);
    writeSigned([...next]);
  }

  // Signing an order ticks every item it revokes, in the same set the strip counts. If they are
  // all ticked already, it unticks them.
  function toggleMany(ids: string[]) {
    const next = new Set(signed);
    const all = ids.length > 0 && ids.every((id) => next.has(id));
    for (const id of ids) {
      if (all) next.delete(id);
      else next.add(id);
    }
    setSigned(next);
    writeSigned([...next]);
  }

  // A bar sets the issue; the field, the orders and the strip all read it.
  function pickIssue(key: IssueKey) {
    const next = issue === key ? null : key;
    setIssue(next);
    track('undo', 'filter', { issue: next ?? 'all', page: 'undo' });
  }

  // A block in the field, or the hero button, opens one order.
  function pickOrder(id: string) {
    setPick({ id, at: Date.now() });
  }

  function reset() {
    setSigned(new Set());
    writeSigned(null);
  }

  const rowById = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);
  const penIds = useMemo(() => rows.filter(isPenInForce).map((r) => r.id), [rows]);
  const blocks = useMemo(() => fieldBlocks(orders, penIds, COPY.field.unbundled), [orders, penIds]);

  // The key: the pen rows still standing, by the document that issued each, over the whole list,
  // never the filtered one. Counted on the server, where every row still carries all its sources.
  const kindMax = Math.max(1, ...kinds.map((k) => k.count));

  const bars = useMemo(() => issueBars(rows, signed), [rows, signed]);

  const activeIds = useMemo(() => new Set(penIds), [penIds]);
  let signedCount = 0;
  for (const id of signed) if (activeIds.has(id)) signedCount += 1;

  return (
    <>
      {/* HERO: the headline, one line, one button, the field */}
      <div className="page-hero undo-hero" id="undo-hero">
        <div className="wrap">
          <span className="label">{COPY.hero.label}</span>
          <h1>{COPY.hero.headline(orders.length, penInForce)}</h1>
          <p className="undo-hero-read">{COPY.hero.read}</p>
          <div className="undo-hero-row">
            <button type="button" className="btn btn-primary" onClick={() => orders[0] && pickOrder(orders[0].id)}>
              {COPY.hero.cta}
            </button>
          </div>
          <SignatureField blocks={blocks} rowById={rowById} signed={signed} issue={issue} onPick={pickOrder} />
        </div>
      </div>

      {/* THE KEY: the executive actions a pen undoes by document type, one sideways bar each with its
          count, the same form as "Who feels it" below (round 2, 2026-11-08) */}
      <section className="undo-section undo-key" aria-labelledby="undo-key-h">
        <div className="wrap">
          <h2 id="undo-key-h" className="undo-h2">
            {COPY.key.title(penInForce)}
          </h2>
          <p className="undo-intro">{COPY.key.intro}</p>
          <ul className="undo-land undo-kinds">
            {kinds.map((k) => (
              <li key={k.key}>
                <div className="undo-bar undo-bar-static">
                  <span className="undo-bar-label">
                    <span className="undo-bar-name undo-kind-name">{k.label}</span>
                  </span>
                  <span className="undo-bar-track">
                    <span className="undo-bar-fill" aria-hidden="true" style={{ width: `${(k.count / kindMax) * BAR_SPAN}%` }}>
                      <span className="undo-seg undo-seg-pen" style={{ flexGrow: 1 }} />
                    </span>
                    <span className="undo-bar-count undo-kind-count">{k.count.toLocaleString('en-US')}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* STICKY PROGRESS STRIP: one segment per order */}
      <div ref={stripRef} className={`undo-strip${stripOn ? ' is-on' : ''}`}>
        <div className="wrap undo-strip-inner">
          <p className="undo-strip-text" role="status">
            {COPY.strip.signedOf(signedCount, penInForce)}
          </p>
          <div className="undo-strip-track" aria-hidden="true">
            {blocks.map((b) => {
              const done = b.ids.filter((id) => signed.has(id)).length;
              return (
                <span key={b.id} className="undo-strip-seg" style={{ flexGrow: b.ids.length }}>
                  <span className="undo-strip-fill" style={{ width: `${(done / b.ids.length) * 100}%` }} />
                </span>
              );
            })}
          </div>
          <button type="button" className="undo-strip-reset" onClick={reset}>
            {COPY.strip.reset}
          </button>
        </div>
      </div>

      {/* THE FILTER: who feels it, one bar per issue, tap to narrow */}
      <IssueBars bars={bars} active={issue} onPick={pickIssue} />

      {/* THE ORDERS */}
      <ForwardOrders
        orders={orders}
        rows={rows}
        rowById={rowById}
        signed={signed}
        issue={issue}
        pick={pick}
        onToggle={toggleMany}
        onToggleOne={toggle}
      />
    </>
  );
}
