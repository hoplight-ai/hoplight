'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { INSTRUMENT_LABEL } from '@/lib/undo/types';
import type { Instrument } from '@/lib/undo/types';
import { COPY } from '@/lib/undo/copy';
import { orderText } from '@/lib/undo/order-text';
import {
  groupByInstrument,
  groupPen,
  howOf,
  footnoteOf,
  isAlreadyDone,
  isCeremonial,
  isLeave,
  isJustIn,
  isPenInForce,
  matchesQuery,
  tagOf,
  whyOf,
} from '@/lib/undo/sections';
import type { SlimRow } from '@/lib/undo/sections';
import CopyButton from './CopyButton';

const STORAGE_KEY = 'undo-signed-v1';
const ORDER_INSTRUMENTS: Instrument[] = ['executive_order', 'proclamation', 'memorandum'];

type Variant = 'check' | 'hollow' | 'flat' | 'done';

function readSigned(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function writeSigned(ids: string[] | null) {
  try {
    if (ids === null || ids.length === 0) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage is a convenience. The page works the same without it.
  }
}

function safeId(id: string): string {
  return id.replace(/[^\w-]/g, '_');
}

function OrderDisclosure({ row }: { row: SlimRow }) {
  const [open, setOpen] = useState(false);
  const text = orderText(row);
  if (!text) return null;
  const panelId = `undo-order-${safeId(row.id)}`;
  return (
    <div className="undo-order">
      <button
        type="button"
        className="undo-disclose"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        {open ? COPY.order.hide : COPY.order.show}
      </button>
      {open ? (
        <div id={panelId}>
          <div className="undo-order-box">
            <p className="undo-order-text">{text}</p>
            <CopyButton
              text={text}
              label={COPY.order.copy}
              copiedLabel={COPY.order.copied}
              className="undo-copy"
            />
          </div>
          <p className="undo-order-note">{COPY.order.footnote}</p>
        </div>
      ) : null}
    </div>
  );
}

function Item({
  row,
  variant,
  signed,
  onToggle,
}: {
  row: SlimRow;
  variant: Variant;
  signed?: boolean;
  onToggle?: (id: string) => void;
}) {
  const href = row.sources[0]?.url;
  const titleId = `undo-t-${safeId(row.id)}`;
  const showStatus = row.status !== 'in-force';
  const hasOrder = variant === 'check' && ORDER_INSTRUMENTS.includes(row.instrument);
  const tag = variant === 'check' || variant === 'hollow' ? tagOf(row.bucket) : null;

  return (
    <li
      className={`undo-item undo-item-${variant}${signed ? ' is-signed' : ''}`}
      data-bucket={row.bucket}
    >
      {variant === 'check' ? (
        <span className="undo-checkwrap">
          <input
            type="checkbox"
            className="undo-check"
            checked={!!signed}
            onChange={() => onToggle?.(row.id)}
            aria-labelledby={titleId}
          />
          <span className="undo-box" aria-hidden="true" />
        </span>
      ) : variant === 'hollow' ? (
        <span className="undo-glyph" aria-hidden="true" />
      ) : null}
      <div className="undo-item-body">
        <p className="undo-title" id={titleId}>
          {href ? <a href={href}>{row.title}</a> : row.title}
        </p>
        {variant === 'check' || variant === 'hollow' ? (
          <p className="undo-how">
            {howOf(row)}
            {tag ? <span className="undo-tag">{tag}</span> : null}
          </p>
        ) : null}
        <p className="undo-foot">
          {footnoteOf(row)}
          {showStatus ? (
            <>
              {' · '}
              <span className="undo-status">
                <span className="sr-only">Status: </span>
                {row.status}
              </span>
            </>
          ) : null}
        </p>
        {hasOrder ? <OrderDisclosure row={row} /> : null}
        <p className="undo-why">{whyOf(row)}</p>
        {row.unsure ? (
          <p className="undo-auto">{COPY.unconfirmed}</p>
        ) : !row.reviewed ? (
          <p className="undo-auto">{COPY.auto}</p>
        ) : null}
      </div>
    </li>
  );
}

function SubHead({ label, count }: { label: string; count: number }) {
  return (
    <h3 className="undo-subhead">
      {label} <span className="undo-subcount">{count.toLocaleString('en-US')}</span>
    </h3>
  );
}

export default function UndoList({
  rows,
  penInForce,
}: {
  rows: SlimRow[];
  penInForce: number;
}) {
  const [query, setQuery] = useState('');
  const [signed, setSigned] = useState<Set<string>>(() => new Set());
  const [stripOn, setStripOn] = useState(false);
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

  function reset() {
    setSigned(new Set());
    writeSigned(null);
  }

  const view = useMemo(() => {
    const hit = rows.filter((r) => matchesQuery(r, query));
    return {
      shown: hit.length,
      lunch: groupPen(hit.filter(isPenInForce)),
      year: hit.filter((r) => r.bucket === 'pen-process' && !isAlreadyDone(r) && !isLeave(r)),
      majority: hit.filter((r) => r.bucket === 'majority' && !isLeave(r)),
      sixty: hit.filter((r) => r.bucket === 'sixty' && !isLeave(r)),
      locked: groupByInstrument(
        hit.filter((r) => r.bucket === 'locked' && !isLeave(r)),
        INSTRUMENT_LABEL,
      ),
      lockedCount: hit.filter((r) => r.bucket === 'locked' && !isLeave(r)).length,
      done: hit.filter(isAlreadyDone),
      // A commemorative proclamation stays in its own group even if a ruling marks it leave.
      leave: hit.filter((r) => isLeave(r) && !isCeremonial(r)),
      justIn: hit.filter(isJustIn),
      ceremonial: hit.filter(isCeremonial),
    };
  }, [rows, query]);

  const activeIds = useMemo(() => new Set(rows.filter(isPenInForce).map((r) => r.id)), [rows]);
  let signedCount = 0;
  for (const id of signed) if (activeIds.has(id)) signedCount += 1;
  const pct = penInForce > 0 ? Math.min(100, (signedCount / penInForce) * 100) : 0;

  const congressCount = view.majority.length + view.sixty.length;

  return (
    <>
      {/* STICKY PROGRESS STRIP */}
      <div ref={stripRef} className={`undo-strip${stripOn ? ' is-on' : ''}`}>
        <div className="wrap undo-strip-inner">
          <p className="undo-strip-text" role="status">
            {COPY.strip.signedOf(signedCount, penInForce)}
          </p>
          <div className="undo-strip-track" aria-hidden="true">
            <div className="undo-strip-fill" style={{ width: `${pct}%` }} />
          </div>
          <button type="button" className="undo-strip-reset" onClick={reset}>
            {COPY.strip.reset}
          </button>
        </div>
      </div>

      {/* BEFORE LUNCH */}
      <section className="undo-section" aria-labelledby="undo-lunch-h">
        <div className="wrap">
          <h2 id="undo-lunch-h" className="undo-h2">
            {COPY.lunch.title}
          </h2>
          <p className="undo-intro">{COPY.lunch.intro}</p>

          <div className="undo-search">
            <label htmlFor="undo-search-input" className="undo-filter-legend">
              {COPY.search.label}
            </label>
            <input
              id="undo-search-input"
              type="search"
              className="undo-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={COPY.search.placeholder}
              autoComplete="off"
            />
          </div>
          <p className="undo-count" role="status" aria-live="polite">
            {COPY.search.count(view.shown, rows.length)}
          </p>

          {rows.length === 0 ? (
            <p className="undo-empty">{COPY.search.noRows}</p>
          ) : view.shown === 0 ? (
            <p className="undo-empty">{COPY.search.empty}</p>
          ) : null}

          {view.lunch.map((g) => (
            <div key={g.key} className="undo-group">
              <SubHead label={g.label} count={g.rows.length} />
              <ul className="undo-items">
                {g.rows.map((r) => (
                  <Item key={r.id} row={r} variant="check" signed={signed.has(r.id)} onToggle={toggle} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* THIS YEAR */}
      {view.year.length > 0 ? (
        <section className="undo-section undo-section-ruled" aria-labelledby="undo-year-h">
          <div className="wrap">
            <h2 id="undo-year-h" className="undo-h2">
              {COPY.thisYear.title}
            </h2>
            <p className="undo-intro">{COPY.thisYear.intro}</p>
            <ul className="undo-items">
              {view.year.map((r) => (
                <Item key={r.id} row={r} variant="hollow" />
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* NEEDS CONGRESS */}
      {congressCount > 0 ? (
        <section className="undo-section undo-section-ruled" aria-labelledby="undo-congress-h">
          <div className="wrap">
            <h2 id="undo-congress-h" className="undo-h2">
              {COPY.congress.title}
            </h2>
            {view.majority.length > 0 ? (
              <div className="undo-group">
                <SubHead label={COPY.congress.majority.title} count={view.majority.length} />
                <p className="undo-intro">{COPY.congress.majority.intro}</p>
                <ul className="undo-items">
                  {view.majority.map((r) => (
                    <Item key={r.id} row={r} variant="hollow" />
                  ))}
                </ul>
              </div>
            ) : null}
            {view.sixty.length > 0 ? (
              <div className="undo-group">
                <SubHead label={COPY.congress.sixty.title} count={view.sixty.length} />
                <p className="undo-intro">{COPY.congress.sixty.intro}</p>
                <ul className="undo-items">
                  {view.sixty.map((r) => (
                    <Item key={r.id} row={r} variant="hollow" />
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* NOTHING UNDOES THESE */}
      {view.lockedCount > 0 ? (
        <section className="undo-section undo-section-ruled" aria-labelledby="undo-locked-h">
          <div className="wrap">
            <h2 id="undo-locked-h" className="undo-h2">
              {COPY.locked.title}
            </h2>
            <p className="undo-intro">{COPY.locked.intro}</p>
            {view.locked.map((g) => (
              <div key={g.key} className="undo-group">
                <SubHead label={g.label} count={g.rows.length} />
                <ul className="undo-items">
                  {g.rows.map((r) => (
                    <Item key={r.id} row={r} variant="flat" />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ALREADY DONE FOR YOU */}
      {view.done.length > 0 ? (
        <section className="undo-section undo-section-ruled" aria-labelledby="undo-done-h">
          <div className="wrap">
            <details className="undo-done">
              <summary className="undo-done-summary">
                <h2 id="undo-done-h" className="undo-h2">
                  {COPY.done.title}
                </h2>
                <span className="undo-subcount">{view.done.length.toLocaleString('en-US')}</span>
              </summary>
              <p className="undo-intro">{COPY.done.intro}</p>
              <ul className="undo-items">
                {view.done.map((r) => (
                  <Item key={r.id} row={r} variant="done" />
                ))}
              </ul>
            </details>
          </div>
        </section>
      ) : null}

      {/* JUST IN */}
      {view.justIn.length > 0 ? (
        <section className="undo-section undo-section-ruled" aria-labelledby="undo-justin-h">
          <div className="wrap">
            <details className="undo-done">
              <summary className="undo-done-summary">
                <h2 id="undo-justin-h" className="undo-h2">
                  {COPY.justIn.title}
                </h2>
                <span className="undo-subcount">{view.justIn.length.toLocaleString('en-US')}</span>
              </summary>
              <p className="undo-intro">{COPY.justIn.intro}</p>
              <ul className="undo-items">
                {view.justIn.map((r) => (
                  <Item key={r.id} row={r} variant="done" />
                ))}
              </ul>
            </details>
          </div>
        </section>
      ) : null}

      {/* LEAVE THESE */}
      {view.leave.length > 0 ? (
        <section className="undo-section undo-section-ruled" aria-labelledby="undo-leave-h">
          <div className="wrap">
            <details className="undo-done">
              <summary className="undo-done-summary">
                <h2 id="undo-leave-h" className="undo-h2">
                  {COPY.leave.title}
                </h2>
                <span className="undo-subcount">{view.leave.length.toLocaleString('en-US')}</span>
              </summary>
              <p className="undo-intro">{COPY.leave.intro}</p>
              <ul className="undo-items">
                {view.leave.map((r) => (
                  <Item key={r.id} row={r} variant="done" />
                ))}
              </ul>
            </details>
          </div>
        </section>
      ) : null}

      {/* COMMEMORATIVE PROCLAMATIONS */}
      {view.ceremonial.length > 0 ? (
        <section className="undo-section undo-section-ruled" aria-labelledby="undo-ceremonial-h">
          <div className="wrap">
            <details className="undo-done">
              <summary className="undo-done-summary">
                <h2 id="undo-ceremonial-h" className="undo-h2">
                  {COPY.ceremonial.title}
                </h2>
                <span className="undo-subcount">{view.ceremonial.length.toLocaleString('en-US')}</span>
              </summary>
              <p className="undo-intro">{COPY.ceremonial.intro}</p>
              <ul className="undo-items">
                {view.ceremonial.map((r) => (
                  <Item key={r.id} row={r} variant="done" />
                ))}
              </ul>
            </details>
          </div>
        </section>
      ) : null}
    </>
  );
}
