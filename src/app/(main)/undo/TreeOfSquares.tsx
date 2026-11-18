'use client';

import { useRef } from 'react';
import type { KeyboardEvent, MouseEvent, ReactNode, RefObject } from 'react';
import { COPY } from '@/lib/undo/copy';
import type { TreeLayout } from '@/lib/undo/field';
import type { ThemeKey } from '@/lib/undo/themes';

/** One square of the tree, placed: its action, theme, order and where it sits in the tree. */
export interface PlacedSquare {
  id: string;
  title: string;
  theme: ThemeKey;
  order: string;
  x: number;
  y: number;
}

// The tree of lit squares: one rectangle per signing order, one square per executive action, all
// squares one size. A square opens its action; a rectangle's name opens its order. A tap in the
// gaps snaps to the nearest square, so a 12px square on a phone still answers a thumb. Divs and
// buttons only: no chart library, no SVG.
export default function TreeOfSquares({
  layout,
  squares,
  boxRef,
  signed,
  theme,
  litOrder,
  open,
  focusId,
  onOpen,
  onOrder,
  onMove,
  children,
}: {
  layout: TreeLayout;
  squares: PlacedSquare[];
  boxRef: RefObject<HTMLDivElement | null>;
  signed: ReadonlySet<string>;
  theme: ThemeKey | null;
  /** The order whose squares are lit, from a square or a rectangle. */
  litOrder: string | null;
  open: string | null;
  /** The one square the Tab key reaches. */
  focusId: string | null;
  /** Opens a square; a second press closes it, a focus never does. */
  onOpen: (id: string, focus?: boolean) => void;
  onOrder: (id: string) => void;
  onMove: (id: string, dir: 'left' | 'right' | 'up' | 'down') => void;
  children?: ReactNode;
}) {
  const { cell } = layout;
  // A press focuses a button before its click lands; that focus must not open what the click will.
  const pressing = useRef(false);

  // A press in a gap, or beside a small square, opens the nearest square within reach.
  function snap(e: MouseEvent<HTMLDivElement>) {
    const t = e.target as HTMLElement;
    if (t.closest('.undo-sq, .undo-rect-name, .undo-pop')) return;
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    let best: PlacedSquare | null = null;
    let bestD = Infinity;
    for (const s of squares) {
      const dx = px - (s.x + cell / 2);
      const dy = py - (s.y + cell / 2);
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    if (best && Math.sqrt(bestD) <= Math.max(22, cell)) onOpen(best.id);
  }

  function key(e: KeyboardEvent<HTMLButtonElement>, id: string) {
    const dir = ({ ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' } as const)[e.key as 'ArrowLeft'];
    if (!dir) return;
    e.preventDefault();
    onMove(id, dir);
  }

  return (
    <div
      ref={boxRef}
      className={`undo-tree${litOrder || theme ? ' is-picked' : ''}`}
      style={{ height: layout.height }}
      role="group"
      aria-label={COPY.tree.label}
      onClick={snap}
    >
      {layout.rects.map((r) => {
        const done = r.ids.filter((id) => signed.has(id)).length;
        return (
          <div
            key={r.id}
            className={`undo-rect${litOrder === r.id ? ' is-lit' : ''}`}
            style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
          >
            <button
              type="button"
              className="undo-rect-name"
              data-order={r.id}
              aria-pressed={litOrder === r.id && open === null}
              aria-label={COPY.tree.rect(r.frame, r.ids.length, done)}
              onClick={() => onOrder(r.id)}
            >
              <span className="undo-rect-frame">{r.frame}</span>
              <span className="undo-rect-count">{COPY.tree.count(r.ids.length)}</span>
            </button>
          </div>
        );
      })}
      {squares.map((s) => {
        const on = signed.has(s.id);
        const inOrder = litOrder === null || s.order === litOrder;
        const inTheme = theme === null || s.theme === theme;
        const tint = !(inOrder && inTheme);
        const lit = litOrder !== null && s.order === litOrder && s.id !== open;
        return (
          <button
            key={s.id}
            type="button"
            data-id={s.id}
            className={`undo-sq t-${s.theme}${on ? ' is-signed' : ''}${tint ? ' is-tint' : ''}${lit ? ' is-lit' : ''}${s.id === open ? ' is-me' : ''}`}
            style={{ left: s.x, top: s.y, width: cell, height: cell }}
            tabIndex={s.id === focusId ? 0 : -1}
            aria-label={s.title}
            aria-expanded={s.id === open}
            onPointerDown={() => {
              pressing.current = true;
            }}
            onClick={() => {
              pressing.current = false;
              onOpen(s.id);
            }}
            onFocus={() => {
              if (!pressing.current && open !== s.id) onOpen(s.id, true);
            }}
            onKeyDown={(e) => key(e, s.id)}
          />
        );
      })}
      {children}
    </div>
  );
}
