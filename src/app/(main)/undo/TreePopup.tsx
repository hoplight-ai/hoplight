'use client';

import type { CSSProperties, RefObject } from 'react';
import { COPY } from '@/lib/undo/copy';
import type { ForwardOrderView } from '@/lib/undo/forward-text';
import type { SlimRow } from '@/lib/undo/sections';
import type { ThemeKey } from '@/lib/undo/themes';

/** Up to three bundle-mates, spread through the order, so the popup samples the whole bundle. */
export function pickMates(ids: readonly string[], self: string | null, n = 3): string[] {
  const mates = ids.filter((id) => id !== self);
  if (mates.length <= n) return mates;
  const step = mates.length / n;
  return Array.from({ length: n }, (_, k) => mates[Math.floor(k * step)]);
}

// The popup a square or a rectangle opens: the order's frame set large and the line that teaches it
// first, then the action, then up to three bundle-mates, then the order's own two actions. On the
// desktop it sits beside the lit rectangle inside the tree's height; on the phone it is a bottom
// sheet of about 40 percent of the screen, with previous and next.
export default function TreePopup({
  popRef,
  order,
  orderIds,
  row,
  kind,
  rowById,
  themeOf,
  allSigned,
  draftOpen,
  phone,
  style,
  onSign,
  onDraft,
  onClose,
  onStep,
}: {
  popRef: RefObject<HTMLDivElement | null>;
  order: ForwardOrderView | { id: string; title: string; frame: string; line: string };
  orderIds: string[];
  row: SlimRow | null;
  kind: string | null;
  rowById: ReadonlyMap<string, SlimRow>;
  themeOf: ReadonlyMap<string, ThemeKey>;
  allSigned: boolean;
  draftOpen: boolean;
  phone: boolean;
  style: CSSProperties;
  onSign: () => void;
  onDraft: () => void;
  onClose: () => void;
  onStep: (dir: -1 | 1) => void;
}) {
  const mates = pickMates(orderIds, row?.id ?? null);
  const rest = orderIds.length - (row ? 1 : 0) - mates.length;
  return (
    <div
      ref={popRef}
      className={`undo-pop${phone ? ' is-sheet' : ''}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="undo-pop-frame"
      style={style}
    >
      <button type="button" className="undo-plain undo-pop-x" onClick={onClose}>
        {COPY.tree.close}
      </button>
      <p className="undo-pop-frame" id="undo-pop-frame">
        {order.frame}
      </p>
      {order.title !== order.frame ? <p className="undo-pop-title">{order.title}</p> : null}
      <p className="undo-pop-teach">{COPY.tree.teach(order.line, orderIds.length, row !== null)}</p>
      {row ? (
        <div className="undo-pop-act">
          <p className="undo-pop-head">{row.title}</p>
          <p className="undo-pop-meta">{COPY.tree.signedOn(kind ?? COPY.table.kind.other, row.date)}</p>
        </div>
      ) : null}
      {mates.length > 0 ? (
        <>
          <p className="undo-pop-bw">{COPY.tree.bundled}</p>
          <ul className="undo-pop-mates">
            {mates.map((id) => (
              <li key={id}>
                <i className={`t-${themeOf.get(id) ?? 'gov'}`} aria-hidden="true" />
                {rowById.get(id)?.title}
              </li>
            ))}
            {rest > 0 ? <li className="undo-pop-more">{COPY.tree.more(rest)}</li> : null}
          </ul>
        </>
      ) : null}
      <div className="undo-pop-do">
        <button type="button" className="undo-plain" aria-pressed={allSigned} onClick={onSign}>
          {allSigned ? COPY.forward.signed : COPY.forward.sign}
        </button>
        <button type="button" className="undo-plain" aria-expanded={draftOpen} aria-controls="undo-draft-panel" onClick={onDraft}>
          {draftOpen ? COPY.forward.draftHide : COPY.forward.draftShow}
        </button>
        {phone && row ? (
          <span className="undo-pop-step">
            <button type="button" className="undo-plain" onClick={() => onStep(-1)}>
              {COPY.tree.prev}
            </button>
            <button type="button" className="undo-plain" onClick={() => onStep(1)}>
              {COPY.tree.next}
            </button>
          </span>
        ) : null}
      </div>
    </div>
  );
}
