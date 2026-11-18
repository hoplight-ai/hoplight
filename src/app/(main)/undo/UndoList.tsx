'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { COPY } from '@/lib/undo/copy';
import { track } from '@/lib/track';
import { cellAt, fieldBlocks, treeLayout, TREE_DESKTOP, TREE_PHONE } from '@/lib/undo/field';
import { forwardOrderText } from '@/lib/undo/forward-text';
import type { ForwardOrderView } from '@/lib/undo/forward-text';
import { isPenInForce } from '@/lib/undo/sections';
import type { SlimRow } from '@/lib/undo/sections';
import { THEME_BY_KEY, THEME_RANK, THEMES, themeOfRow } from '@/lib/undo/themes';
import type { ThemeKey } from '@/lib/undo/themes';
import CopyButton from './CopyButton';
import TreeOfSquares from './TreeOfSquares';
import type { PlacedSquare } from './TreeOfSquares';
import TreePopup from './TreePopup';
import UndoTable, { sortRows } from './UndoTable';
import type { SortKey } from './UndoTable';
import { readSigned, writeSigned } from './signed';

/** The width the server lays the tree out at, before the browser measures its own. */
const SERVER_WIDTH = 1276;
const PHONE_BELOW = 600;
const POP_W = 360;

// The front page of The Undo List (UNDOTREE1, 2026-11-18): the headline and its one button, the five
// theme chips that are the picture's key and its filter, the tree of lit squares, and under it the
// sortable table of every standing executive action. A square opens its action with its order's
// frame and lights every square of the bundle; a rectangle's name opens the order; a chip keeps its
// theme's squares and tints the rest. Executive actions only: the rows that arrive are pen rows.
export default function UndoList({
  rows,
  penInForce,
  orders,
  rowKind,
}: {
  rows: SlimRow[];
  penInForce: number;
  orders: ForwardOrderView[];
  rowKind: Record<string, string>;
}) {
  const [signed, setSigned] = useState<Set<string>>(() => new Set());
  const [theme, setTheme] = useState<ThemeKey | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [orderSel, setOrderSel] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [dir, setDir] = useState<1 | -1>(-1);
  const [width, setWidth] = useState(SERVER_WIDTH);
  const [popPos, setPopPos] = useState<{ left: number; top: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Ticks: the server renders everything unsigned; the browser fills them in after hydration.
  useEffect(() => {
    // Reading storage must wait for the browser, so this one setState in an effect is deliberate.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSigned(new Set(readSigned()));
  }, []);

  // The tree is laid out at its own measured width, again whenever that width changes.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(280, Math.floor(el.clientWidth)));
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const phone = width < PHONE_BELOW;
  const opts = phone ? TREE_PHONE : TREE_DESKTOP;

  const rowById = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);
  const standing = useMemo(() => rows.filter(isPenInForce), [rows]);
  const penIds = useMemo(() => standing.map((r) => r.id), [standing]);
  const orderById = useMemo(() => new Map(orders.map((o) => [o.id, o])), [orders]);

  const blocks = useMemo(() => fieldBlocks(orders, penIds, COPY.field.unbundled), [orders, penIds]);
  const orderOfId = useMemo(() => {
    const m = new Map<string, string>();
    for (const b of blocks) for (const id of b.ids) m.set(id, b.id);
    return m;
  }, [blocks]);
  const themeOf = useMemo(() => {
    const m = new Map<string, ThemeKey>();
    for (const b of blocks) for (const id of b.ids) m.set(id, themeOfRow(rowById.get(id) ?? {}, b.issues));
    return m;
  }, [blocks, rowById]);
  // Inside each rectangle the squares sort by theme, newest first within a theme, so a bundle that
  // crosses themes shows as runs of colour, never as stray single squares.
  const sorted = useMemo(
    () =>
      blocks.map((b) => ({
        ...b,
        ids: [...b.ids].sort(
          (x, y) =>
            THEME_RANK[themeOf.get(x) ?? 'gov'] - THEME_RANK[themeOf.get(y) ?? 'gov'] ||
            ((rowById.get(y)?.date ?? '') < (rowById.get(x)?.date ?? '') ? -1 : 1),
        ),
      })),
    [blocks, themeOf, rowById],
  );
  const layout = useMemo(() => treeLayout(sorted, width, opts), [sorted, width, opts]);
  const squares = useMemo<PlacedSquare[]>(() => {
    const out: PlacedSquare[] = [];
    for (const r of layout.rects) {
      r.ids.forEach((id, k) => {
        const at = cellAt(r, k, opts);
        out.push({ id, title: rowById.get(id)?.title ?? id, theme: themeOf.get(id) ?? 'gov', order: r.id, x: r.x + at.x, y: r.y + at.y });
      });
    }
    return out;
  }, [layout, opts, rowById, themeOf]);
  const squareById = useMemo(() => new Map(squares.map((s, i) => [s.id, { s, i }])), [squares]);

  // The chips count the squares by theme, so the key always adds up to the tree.
  const themeCount = useMemo(() => {
    const c: Record<string, number> = {};
    for (const id of penIds) {
      const t = themeOf.get(id) ?? 'gov';
      c[t] = (c[t] ?? 0) + 1;
    }
    return c;
  }, [penIds, themeOf]);

  const litOrder = open ? (orderOfId.get(open) ?? null) : orderSel;

  // ?open=<action id> and ?order=<order id> open those states at load, for a shared link and the renders.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const o = q.get('open');
    const ord = q.get('order');
    // The address is read once in the browser, so these setStates in an effect are deliberate.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (o && orderOfId.has(o)) setOpen(o);
    else if (ord && blocks.some((b) => b.id === ord)) setOrderSel(ord);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [orderOfId, blocks]);

  function save(next: Set<string>) {
    setSigned(next);
    writeSigned([...next]);
  }
  function toggle(id: string) {
    const next = new Set(signed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    save(next);
  }
  // Signing an order ticks every action it undoes; if all are ticked already, it unticks them.
  function toggleMany(ids: string[]) {
    const next = new Set(signed);
    const all = ids.length > 0 && ids.every((id) => next.has(id));
    for (const id of ids) {
      if (all) next.delete(id);
      else next.add(id);
    }
    save(next);
  }

  const close = useCallback(() => {
    setOpen(null);
    setOrderSel(null);
    setPopPos(null);
  }, []);

  function openSquare(id: string, focus = false) {
    if (open === id && !focus) {
      close();
      return;
    }
    setOpen(id);
    setOrderSel(null);
    setTheme(null);
    track('undo', 'open-square', { order: orderOfId.get(id) ?? 'none' });
  }
  function openOrder(id: string) {
    if (orderSel === id && open === null) {
      close();
      return;
    }
    setOpen(null);
    setOrderSel(id);
    setTheme(null);
    track('undo', 'open-order', { order: id });
  }
  function pickTheme(k: ThemeKey) {
    const next = theme === k ? null : k;
    setTheme(next);
    setOpen(null);
    setOrderSel(null);
    track('undo', 'filter', { theme: next ?? 'all', page: 'undo' });
  }
  function move(id: string, d: 'left' | 'right' | 'up' | 'down') {
    const at = squareById.get(id);
    if (!at) return;
    const rect = layout.rects.find((r) => r.id === at.s.order);
    const step = d === 'left' ? -1 : d === 'right' ? 1 : (d === 'up' ? -1 : 1) * (rect?.cols ?? 1);
    let i = at.i + step;
    if (d === 'up' || d === 'down') {
      const sameRect = squares[i]?.order === at.s.order;
      if (!sameRect) i = at.i + (d === 'up' ? -1 : 1);
    }
    const next = squares[Math.max(0, Math.min(squares.length - 1, i))];
    if (next) {
      boxRef.current?.querySelector<HTMLButtonElement>(`.undo-sq[data-id="${CSS.escape(next.id)}"]`)?.focus();
    }
  }
  function stepSheet(d: -1 | 1) {
    if (!open) return;
    const at = squareById.get(open);
    if (!at) return;
    const next = squares[(at.i + d + squares.length) % squares.length];
    if (next) setOpen(next.id);
  }

  // Escape closes; a press outside the tree, the popup, the chips and the table closes too.
  useEffect(() => {
    if (!open && !orderSel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const was = open;
      close();
      if (was) boxRef.current?.querySelector<HTMLButtonElement>(`.undo-sq[data-id="${CSS.escape(was)}"]`)?.focus({ preventScroll: true });
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('.undo-tree, .undo-pop, .undo-chips, .undo-table-sec, .undo-draft-panel')) return;
      close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open, orderSel, close]);

  // The popup sits beside the lit rectangle, on whichever side covers the fewest lit squares, and
  // inside the tree's own height, so it never reaches the table.
  useLayoutEffect(() => {
    if (phone || !litOrder) return;
    const pop = popRef.current;
    const rect = layout.rects.find((r) => r.id === litOrder);
    if (!pop || !rect) return;
    const h = pop.offsetHeight;
    const me = open ? squareById.get(open)?.s : null;
    const anchorY = me ? me.y : rect.y;
    const top = Math.max(0, Math.min(layout.height - h, anchorY - 24));
    const lit = squares.filter((s) => s.order === litOrder);
    const cover = (left: number) => lit.filter((s) => s.x + layout.cell > left && s.x < left + POP_W && s.y + layout.cell > top && s.y < top + h).length;
    const spots = [rect.x + rect.w + 4, rect.x - POP_W - 4, rect.x + rect.w - POP_W]
      .map((l) => Math.max(0, Math.min(layout.width - POP_W, l)))
      .map((left) => ({ left, n: cover(left), far: Math.abs(left - (me ? me.x : rect.x)) }));
    spots.sort((a, b) => a.n - b.n || a.far - b.far);
    // Measuring the popup must wait for it to draw, so this setState in a layout effect is deliberate.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPopPos({ left: spots[0].left, top });
  }, [phone, litOrder, open, layout, squares, squareById]);

  // On the phone the sheet covers the lower 40 percent, so the lit rectangle is brought into the
  // part of the screen above it (a link straight to ?open= or ?order= lands there too).
  useEffect(() => {
    if (!phone || !litOrder) return;
    const el = open
      ? boxRef.current?.querySelector<HTMLElement>(`.undo-sq[data-id="${CSS.escape(open)}"]`)
      : boxRef.current?.querySelector<HTMLElement>(`.undo-rect-name[data-order="${CSS.escape(litOrder)}"]`);
    if (!el) return;
    const b = el.getBoundingClientRect();
    const room = window.innerHeight * 0.58;
    if (b.top < 64 || b.bottom > room) window.scrollBy({ top: b.top - room * 0.45, behavior: 'smooth' });
  }, [phone, litOrder, open]);

  const popOrderId = litOrder;
  const popOrder = popOrderId ? (orderById.get(popOrderId) ?? null) : null;
  const popBlock = popOrderId ? (sorted.find((b) => b.id === popOrderId) ?? null) : null;
  const popRow = open ? (rowById.get(open) ?? null) : null;
  const popStyle: CSSProperties = phone ? {} : popPos ? { left: popPos.left, top: popPos.top, width: POP_W } : { left: 0, top: 0, width: POP_W, visibility: 'hidden' };

  const frameOf = useCallback((id: string) => {
    const o = orderOfId.get(id);
    return (o && orderById.get(o)?.frame) || COPY.field.unbundled;
  }, [orderOfId, orderById]);
  const themeOfId = useCallback((id: string) => themeOf.get(id) ?? 'gov', [themeOf]);
  const kindOf = useCallback((id: string) => COPY.table.kind[rowKind[id] ?? 'other'] ?? COPY.table.kind.other, [rowKind]);

  const tableRows = useMemo(() => {
    const shown = standing.filter((r) => (theme === null || themeOf.get(r.id) === theme) && (litOrder === null || orderOfId.get(r.id) === litOrder));
    return sortRows(shown, sortKey, dir, frameOf, (id) => THEME_BY_KEY[themeOfId(id)].name, kindOf);
  }, [standing, theme, themeOf, litOrder, orderOfId, sortKey, dir, frameOf, themeOfId, kindOf]);

  function sortBy(k: SortKey) {
    if (k === sortKey) setDir(dir === 1 ? -1 : 1);
    else {
      setSortKey(k);
      setDir(k === 'date' ? -1 : 1);
    }
  }

  const filterLabel = litOrder ? COPY.table.inOrder(orderById.get(litOrder)?.frame ?? COPY.field.unbundled) : theme ? COPY.table.inTheme(THEME_BY_KEY[theme].name) : null;
  const allSigned = penIds.length > 0 && penIds.every((id) => signed.has(id));
  const draftOrder = draft ? (orderById.get(draft) ?? null) : null;
  const draftText = useMemo(
    () => (draftOrder ? forwardOrderText({ title: draftOrder.title, purpose: draftOrder.purpose, items: draftOrder.ids.map((id) => ({ id })) }, rows) : ''),
    [draftOrder, rows],
  );

  return (
    <>
      {/* HERO: the headline and its one button, the five chips, the tree */}
      <section className="undo-tree-hero" id="undo-hero" aria-labelledby="undo-h1">
        <div className="wrap undo-wide">
          <div className="undo-tree-head">
            <h1 id="undo-h1">{COPY.hero.headline(orders.length, penInForce)}</h1>
            <button type="button" className="undo-sign-all" aria-pressed={allSigned} onClick={() => toggleMany(penIds)}>
              {COPY.hero.cta(orders.length)}
            </button>
          </div>
          <div className="undo-chips" role="group" aria-label={COPY.tree.keyLabel}>
            {THEMES.map((t) => (
              <button
                key={t.key}
                type="button"
                className="undo-chip"
                aria-pressed={theme === t.key}
                aria-label={COPY.tree.chip(t.name, themeCount[t.key] ?? 0)}
                onClick={() => pickTheme(t.key)}
              >
                <i className={`t-${t.key}`} aria-hidden="true" />
                <span className="undo-chip-name">{t.name}</span>
                <span className="undo-chip-n undo-num">{themeCount[t.key] ?? 0}</span>
              </button>
            ))}
          </div>
          <TreeOfSquares
            layout={layout}
            squares={squares}
            boxRef={boxRef}
            signed={signed}
            theme={theme}
            litOrder={litOrder}
            open={open}
            focusId={open ?? squares[0]?.id ?? null}
            onOpen={openSquare}
            onOrder={openOrder}
            onMove={move}
          >
            {!phone && popOrderId && popBlock ? (
              <TreePopup
                popRef={popRef}
                order={popOrder ?? { id: popBlock.id, title: popBlock.title, frame: popBlock.frame, line: '' }}
                orderIds={popBlock.ids}
                row={popRow}
                kind={open ? kindOf(open) : null}
                rowById={rowById}
                themeOf={themeOf}
                allSigned={popBlock.ids.every((id) => signed.has(id))}
                draftOpen={draft === popOrderId}
                phone={false}
                style={popStyle}
                onSign={() => toggleMany(popBlock.ids)}
                onDraft={() => setDraft(draft === popOrderId ? null : popOrderId)}
                onClose={close}
                onStep={stepSheet}
              />
            ) : null}
          </TreeOfSquares>
          {phone && popOrderId && popBlock ? (
            <TreePopup
              popRef={popRef}
              order={popOrder ?? { id: popBlock.id, title: popBlock.title, frame: popBlock.frame, line: '' }}
              orderIds={popBlock.ids}
              row={popRow}
              kind={open ? kindOf(open) : null}
              rowById={rowById}
              themeOf={themeOf}
              allSigned={popBlock.ids.every((id) => signed.has(id))}
              draftOpen={draft === popOrderId}
              phone
              style={{}}
              onSign={() => toggleMany(popBlock.ids)}
              onDraft={() => setDraft(draft === popOrderId ? null : popOrderId)}
              onClose={close}
              onStep={stepSheet}
            />
          ) : null}
        </div>
      </section>

      {/* THE DRAFT: the order's full text, when its popup asks for it */}
      {draftOrder ? (
        <section className="undo-draft-panel" id="undo-draft-panel" aria-labelledby="undo-draft-h">
          <div className="wrap undo-wide">
            <h2 id="undo-draft-h" className="undo-draft-h">
              {draftOrder.frame}
            </h2>
            <div className="undo-order-box">
              <pre className="undo-draft" tabIndex={0} role="region" aria-labelledby="undo-draft-h">
                {draftText}
              </pre>
              <CopyButton text={draftText} label={COPY.forward.copy} copiedLabel={COPY.forward.copied} className="undo-copy" track={{ action: 'copy-order', props: { order: draftOrder.id } }} />
            </div>
            <p className="undo-order-note">{COPY.forward.footnote(draftOrder.ids.length)}</p>
            <button type="button" className="undo-plain" onClick={() => setDraft(null)}>
              {COPY.forward.draftHide}
            </button>
          </div>
        </section>
      ) : null}

      {/* THE TABLE: every standing executive action, filtered by the tree and the chips */}
      <UndoTable
        rows={tableRows}
        total={standing.length}
        sortKey={sortKey}
        dir={dir}
        onSort={sortBy}
        frameOf={frameOf}
        themeOf={themeOfId}
        kindOf={kindOf}
        signed={signed}
        onSign={toggle}
        filterLabel={filterLabel}
        onClear={() => {
          setTheme(null);
          close();
        }}
      />
    </>
  );
}
