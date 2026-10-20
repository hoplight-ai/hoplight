'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BUCKETS } from '@/lib/undo/types';
import type { Bucket } from '@/lib/undo/types';
import { COPY } from '@/lib/undo/copy';
import { fieldBlocks } from '@/lib/undo/field';
import type { IssueKey } from '@/lib/undo/issues';
import { issueBars } from '@/lib/undo/progress';
import type { ForwardOrderView } from '@/lib/undo/forward-text';
import { isAlreadyDone, isJustIn, isLeave, isPenInForce } from '@/lib/undo/sections';
import type { SlimRow } from '@/lib/undo/sections';
import ForwardOrders from './ForwardOrders';
import type { OrderPick } from './ForwardOrders';
import IssueBars from './IssueBars';
import SignatureField from './SignatureField';
import { readSigned, writeSigned } from './signed';

// The front page of The Undo List: the headline over the field, the key, the one filter, the
// thirteen orders. Every row on its own is /undo/all (UndoAll.tsx); the two pages share the
// reader's ticks through one storage key.
export default function UndoList({
  rows,
  penInForce,
  locked,
  orders,
}: {
  rows: SlimRow[];
  penInForce: number;
  locked: number;
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
    setIssue(issue === key ? null : key);
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

  // The counts the key prints, over the whole list, never the filtered one.
  const whole = useMemo(
    () => ({
      rule: rows.filter((r) => r.bucket === 'pen-process' && !isAlreadyDone(r) && !isLeave(r) && !isJustIn(r)).length,
      majority: rows.filter((r) => r.bucket === 'majority' && !isLeave(r)).length,
      sixty: rows.filter((r) => r.bucket === 'sixty' && !isLeave(r)).length,
    }),
    [rows],
  );
  const keyRows: [Bucket, number][] = [
    ['pen', penInForce],
    ['pen-process', whole.rule],
    ['majority', whole.majority],
    ['sixty', whole.sixty],
    ['locked', locked],
  ];
  const keyTotal = keyRows.reduce((n, [, c]) => n + c, 0);

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

      {/* THE KEY: one bar of everything, five kinds of undo, each with its count and one line */}
      <section className="undo-section undo-key" aria-labelledby="undo-key-h">
        <div className="wrap">
          <h2 id="undo-key-h" className="undo-h2">
            {COPY.key.title(keyTotal)}
          </h2>
          <p className="undo-intro">{COPY.key.intro}</p>
          <div className="undo-keybar" aria-hidden="true">
            {keyRows.map(([b, n]) =>
              n > 0 ? <span key={b} className={`undo-keyseg undo-keyseg-${b}`} style={{ flexGrow: n }} /> : null,
            )}
          </div>
          <dl className="undo-keylist">
            {keyRows.map(([b, n]) => (
              <div key={b} className="undo-keyrow">
                <dt>
                  <span className={`undo-keyswatch undo-keyseg-${b}`} aria-hidden="true" />
                  <span className="undo-keyname">{BUCKETS[b].label}</span>
                  <span className="undo-keycount">{n.toLocaleString('en-US')}</span>
                </dt>
                <dd>{BUCKETS[b].line}</dd>
              </div>
            ))}
          </dl>
          <details className="undo-keymore">
            <summary className="undo-disclose">{COPY.key.more}</summary>
            <div className="undo-prose">
              <p>{COPY.key.reconciliation}</p>
              <p>{COPY.key.cra}</p>
            </div>
          </details>
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
