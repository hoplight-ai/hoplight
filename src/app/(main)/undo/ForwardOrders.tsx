'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { COPY } from '@/lib/undo/copy';
import { forwardOrderText } from '@/lib/undo/forward-text';
import type { ForwardOrderView } from '@/lib/undo/forward-text';
import type { SlimRow } from '@/lib/undo/sections';
import CopyButton from './CopyButton';
import IssueChips from './IssueChips';

function OrderCard({
  index,
  order,
  rows,
  signed,
  onToggle,
}: {
  index: number;
  order: ForwardOrderView;
  rows: SlimRow[];
  signed: ReadonlySet<string>;
  onToggle: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLInputElement>(null);
  const done = order.ids.filter((id) => signed.has(id)).length;
  const all = order.ids.length > 0 && done === order.ids.length;
  const some = done > 0 && !all;

  useEffect(() => {
    if (boxRef.current) boxRef.current.indeterminate = some;
  }, [some]);

  // The document is written only when someone opens it. The page already matched each item to a
  // row, so the items here are plain ids.
  const text = useMemo(
    () => (open ? forwardOrderText({ title: order.title, purpose: order.purpose, items: order.ids.map((id) => ({ id })) }, rows) : ''),
    [open, order, rows],
  );
  const numeral = String(index + 1).padStart(2, '0');
  const draftId = `undo-draft-${order.id}`;
  const titleId = `undo-forward-t-${order.id}`;

  return (
    <li className={`undo-forward${all ? ' is-signed' : ''}`}>
      <span className="undo-forward-num" aria-hidden="true">
        {numeral}
      </span>
      <div className="undo-forward-body">
        <h3 className="undo-forward-title" id={titleId}>
          {order.title}
        </h3>
        <p className="undo-forward-purpose">{order.purpose}</p>
        <IssueChips keys={order.issues} />
        <p className="undo-forward-count">{COPY.forward.undoes(order.ids.length)}</p>
        <label className="undo-forward-sign">
          <span className="undo-checkwrap">
            <input
              ref={boxRef}
              type="checkbox"
              className="undo-check"
              checked={all}
              onChange={() => onToggle(order.ids)}
            />
            <span className="undo-box" aria-hidden="true" />
          </span>
          <span className="undo-forward-sign-text">
            {COPY.forward.sign}
            <span className="sr-only">: {order.title}</span>
          </span>
        </label>
        <div className="undo-order">
          <button
            type="button"
            className="undo-disclose"
            aria-expanded={open}
            aria-controls={draftId}
            onClick={() => setOpen(!open)}
          >
            {open ? COPY.forward.draftHide : COPY.forward.draftShow}
          </button>
          {open ? (
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
    </li>
  );
}

// "Twelve orders, one afternoon": omnibus orders, each revoking a bundle of items in one signature.
export default function ForwardOrders({
  orders,
  rows,
  signed,
  onToggle,
}: {
  orders: ForwardOrderView[];
  rows: SlimRow[];
  signed: ReadonlySet<string>;
  onToggle: (ids: string[]) => void;
}) {
  if (orders.length === 0) return null;
  return (
    <section className="undo-section undo-section-ruled" aria-labelledby="undo-forward-h" id="undo-forward">
      <div className="wrap">
        <h2 id="undo-forward-h" className="undo-h2">
          {COPY.forward.title(orders.length)}
        </h2>
        <p className="undo-intro">{COPY.forward.intro}</p>
        <ol className="undo-forward-list">
          {orders.map((o, i) => (
            <OrderCard key={o.id} index={i} order={o} rows={rows} signed={signed} onToggle={onToggle} />
          ))}
        </ol>
      </div>
    </section>
  );
}
