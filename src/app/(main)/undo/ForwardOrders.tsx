'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { COPY } from '@/lib/undo/copy';
import { forwardOrderText } from '@/lib/undo/forward-text';
import type { ForwardOrderView } from '@/lib/undo/forward-text';
import { ISSUE_BY_KEY } from '@/lib/undo/issues';
import type { IssueKey } from '@/lib/undo/issues';
import { footnoteOf, howOf } from '@/lib/undo/sections';
import type { SlimRow } from '@/lib/undo/sections';
import CopyButton from './CopyButton';
import IssueChips from './IssueChips';

/** A request from the field: open this order and bring it into view. `at` changes on every tap so
 *  the same block can be tapped twice. */
export interface OrderPick {
  id: string;
  at: number;
}

function safeId(id: string): string {
  return id.replace(/[^\w-]/g, '_');
}

function OrderRow({
  index,
  order,
  rows,
  rowById,
  signed,
  issue,
  pick,
  onToggle,
  onToggleOne,
}: {
  index: number;
  order: ForwardOrderView;
  rows: SlimRow[];
  rowById: ReadonlyMap<string, SlimRow>;
  signed: ReadonlySet<string>;
  issue: IssueKey | null;
  pick: OrderPick | null;
  onToggle: (ids: string[]) => void;
  onToggleOne: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  const items = useMemo(() => order.ids.map((id) => rowById.get(id)).filter((r): r is SlimRow => !!r), [order.ids, rowById]);
  const shown = useMemo(() => (issue === null ? items : items.filter((r) => r.issues?.includes(issue))), [items, issue]);
  const done = order.ids.filter((id) => signed.has(id)).length;
  const all = order.ids.length > 0 && done === order.ids.length;

  // The field asked for this order: open it and bring it to the top of the screen.
  useEffect(() => {
    if (!pick || pick.id !== order.id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
    window.requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ block: 'start' });
      ref.current?.querySelector<HTMLButtonElement>('.undo-forward-open')?.focus({ preventScroll: true });
    });
  }, [pick, order.id]);

  const text = useMemo(
    () => (draft ? forwardOrderText({ title: order.title, purpose: order.purpose, items: order.ids.map((id) => ({ id })) }, rows) : ''),
    [draft, order, rows],
  );
  const numeral = String(index + 1).padStart(2, '0');
  const bodyId = `undo-forward-b-${safeId(order.id)}`;
  const draftId = `undo-draft-${safeId(order.id)}`;
  const titleId = `undo-forward-t-${safeId(order.id)}`;
  const countLine =
    issue === null ? COPY.forward.items(order.ids.length) : COPY.forward.itemsFor(shown.length, order.ids.length, ISSUE_BY_KEY[issue].label);

  return (
    <li ref={ref} id={`undo-order-${safeId(order.id)}`} className={`undo-forward${all ? ' is-signed' : ''}${open ? ' is-open' : ''}`}>
      <div className="undo-forward-head">
        <span className="undo-forward-num" aria-hidden="true">
          {numeral}
        </span>
        <button
          type="button"
          className="undo-forward-open"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen(!open)}
        >
          <span className="undo-forward-title" id={titleId}>
            {order.title}
          </span>
          <span className="undo-forward-count">{countLine}</span>
          <span className="sr-only">{open ? COPY.forward.close : COPY.forward.open}</span>
        </button>
        <span className="undo-forward-meter" aria-hidden="true">
          <span className="undo-forward-meter-fill" style={{ width: `${order.ids.length ? (done / order.ids.length) * 100 : 0}%` }} />
        </span>
        <button
          type="button"
          className={`undo-sign${all ? ' is-signed' : ''}`}
          aria-pressed={all}
          onClick={() => onToggle(order.ids)}
        >
          {all ? COPY.forward.signed : COPY.forward.sign}
          <span className="sr-only">: {order.title}</span>
        </button>
      </div>
      {open ? (
        <div id={bodyId} className="undo-forward-body">
          <p className="undo-forward-purpose">{order.purpose}</p>
          <IssueChips keys={order.issues} />
          <ul className="undo-forward-items">
            {shown.map((r) => {
              const on = signed.has(r.id);
              const id = `undo-fi-${safeId(order.id)}-${safeId(r.id)}`;
              return (
                <li key={r.id} className={`undo-forward-item${on ? ' is-signed' : ''}`}>
                  <span className="undo-checkwrap">
                    <input type="checkbox" className="undo-check" id={id} checked={on} onChange={() => onToggleOne(r.id)} />
                    <span className="undo-box" aria-hidden="true" />
                  </span>
                  <label htmlFor={id} className="undo-forward-item-body">
                    <span className="undo-forward-item-title">{r.title}</span>
                    <span className="undo-forward-item-how">{howOf(r)}</span>
                    <span className="undo-forward-item-foot">{footnoteOf(r)}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          {shown.length === 0 && issue !== null ? <p className="undo-empty">{COPY.forward.noneFor(ISSUE_BY_KEY[issue].label)}</p> : null}
          <div className="undo-order">
            <button
              type="button"
              className="undo-disclose"
              aria-expanded={draft}
              aria-controls={draftId}
              onClick={() => setDraft(!draft)}
            >
              {draft ? COPY.forward.draftHide : COPY.forward.draftShow}
            </button>
            {draft ? (
              <div id={draftId}>
                <div className="undo-order-box">
                  <pre className="undo-draft" tabIndex={0} role="region" aria-labelledby={titleId}>
                    {text}
                  </pre>
                  <CopyButton text={text} label={COPY.forward.copy} copiedLabel={COPY.forward.copied} className="undo-copy" />
                </div>
                <p className="undo-order-note">{COPY.forward.footnote(order.ids.length)}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}

// "Thirteen orders, one afternoon": one compact row per omnibus order. The row carries the title,
// the count, a meter of how much of it is signed, and the Sign button; everything else opens on
// request. With an issue picked, rows no item of which carries it drop out.
export default function ForwardOrders({
  orders,
  rows,
  rowById,
  signed,
  issue,
  pick,
  onToggle,
  onToggleOne,
}: {
  orders: ForwardOrderView[];
  rows: SlimRow[];
  rowById: ReadonlyMap<string, SlimRow>;
  signed: ReadonlySet<string>;
  issue: IssueKey | null;
  pick: OrderPick | null;
  onToggle: (ids: string[]) => void;
  onToggleOne: (id: string) => void;
}) {
  if (orders.length === 0) return null;
  const shown =
    issue === null ? orders : orders.filter((o) => o.ids.some((id) => rowById.get(id)?.issues?.includes(issue)));
  return (
    <section className="undo-section undo-section-ruled" aria-labelledby="undo-forward-h" id="undo-forward">
      <div className="wrap">
        <h2 id="undo-forward-h" className="undo-h2">
          {COPY.forward.title(orders.length)}
        </h2>
        <p className="undo-intro">{COPY.forward.intro}</p>
        {shown.length === 0 && issue !== null ? <p className="undo-empty">{COPY.forward.noneFor(ISSUE_BY_KEY[issue].label)}</p> : null}
        <ol className="undo-forward-list">
          {orders.map((o, i) =>
            shown.includes(o) ? (
              <OrderRow
                key={o.id}
                index={i}
                order={o}
                rows={rows}
                rowById={rowById}
                signed={signed}
                issue={issue}
                pick={pick}
                onToggle={onToggle}
                onToggleOne={onToggleOne}
              />
            ) : null,
          )}
        </ol>
      </div>
    </section>
  );
}
