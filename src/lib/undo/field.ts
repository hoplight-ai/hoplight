import type { ForwardOrderView } from './forward-text.ts';
import type { IssueKey } from './issues.ts';

// The tree of lit squares: the first screen of /undo (UNDOTREE1, 2026-11-18; Whit: "the tree is best
// but its very gratifying to have all those square light up too"). One rectangle per Forward Order,
// squarified so none is a sliver, each holding one square per executive action it undoes. Every
// square in the tree is the same size, so a rectangle's squares are its count. Pure, so the tests
// pin the packing and the page draws divs from it.

export interface FieldBlock {
  /** The order's id, or 'unbundled' for pen items no order names yet. */
  id: string;
  /** 1-based position of the order in the list; 0 for the unbundled block. */
  n: number;
  title: string;
  /** The frame name on the rectangle; the title when the order carries none. */
  frame: string;
  /** Row ids, each a pen item still standing, each in exactly one block. */
  ids: string[];
  issues: IssueKey[];
}

/** Packs the pen items into blocks, one per order in order, each id once. Pen items no order
 *  names go into a last block so the tree and the hero number always agree. An order with no
 *  standing pen item draws no block. */
export function fieldBlocks(
  orders: (Pick<ForwardOrderView, 'id' | 'title' | 'ids' | 'issues'> & { frame?: string })[],
  penIds: readonly string[],
  unbundledTitle: string,
): FieldBlock[] {
  const pen = new Set(penIds);
  const taken = new Set<string>();
  const blocks: FieldBlock[] = [];
  orders.forEach((o, i) => {
    const ids = o.ids.filter((id) => pen.has(id) && !taken.has(id));
    for (const id of ids) taken.add(id);
    blocks.push({ id: o.id, n: i + 1, title: o.title, frame: o.frame ?? o.title, ids, issues: o.issues });
  });
  const rest = penIds.filter((id) => !taken.has(id));
  if (rest.length > 0) {
    blocks.push({ id: 'unbundled', n: 0, title: unbundledTitle, frame: unbundledTitle, ids: rest, issues: [] });
  }
  return blocks.filter((b) => b.ids.length > 0);
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Squarified treemap (Bruls, Huizing and van Wijk, 2000): rows are laid along the shorter side,
 *  each row kept while adding the next item lowers its worst aspect ratio. Items arrive largest
 *  first; the boxes come back in the same order and tile the whole area. */
export function squarify<T extends { v: number }>(items: readonly T[], x: number, y: number, w: number, h: number): (T & Box)[] {
  const total = items.reduce((s, it) => s + it.v, 0);
  if (total <= 0 || w <= 0 || h <= 0) return [];
  const scale = (w * h) / total;
  const list = items.map((it) => ({ it, a: it.v * scale }));
  const out: (T & Box)[] = [];
  const worst = (row: { a: number }[], side: number) => {
    const s = row.reduce((t, r) => t + r.a, 0);
    const mx = Math.max(...row.map((r) => r.a));
    const mn = Math.min(...row.map((r) => r.a));
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  const lay = (row: { it: T; a: number }[]) => {
    const s = row.reduce((t, r) => t + r.a, 0);
    if (w >= h) {
      const cw = s / h;
      let cy = y;
      for (const r of row) {
        const rh = r.a / cw;
        out.push({ ...r.it, x, y: cy, w: cw, h: rh });
        cy += rh;
      }
      x += cw;
      w -= cw;
    } else {
      const ch = s / w;
      let cx = x;
      for (const r of row) {
        const rw = r.a / ch;
        out.push({ ...r.it, x: cx, y, w: rw, h: ch });
        cx += rw;
      }
      y += ch;
      h -= ch;
    }
  };
  let row: { it: T; a: number }[] = [];
  while (list.length) {
    const side = Math.min(w, h);
    const next = list[0];
    if (!row.length || worst([...row, next], side) <= worst(row, side)) {
      row.push(list.shift()!);
      continue;
    }
    lay(row);
    row = [];
  }
  if (row.length) lay(row);
  return out;
}

export interface TreeOptions {
  /** Square side in px, the same for every square in the tree. */
  cell: number;
  /** Space between squares. */
  gap: number;
  /** White gutter between rectangles. */
  gutter: number;
  /** Space inside a rectangle around its label and squares. */
  pad: number;
  /** Name size and line height, for the label estimate. */
  nameSize: number;
  nameLine: number;
  /** Height of the count line under the name. */
  countLine: number;
  /** Extra weight per rectangle, in squares, so a small order still has room for its name. */
  overhead: number;
  /** No rectangle narrower than this, so every name sits in whole words. */
  minW: number;
}

export const TREE_DESKTOP: TreeOptions = { cell: 24, gap: 3, gutter: 8, pad: 10, nameSize: 15, nameLine: 19, countLine: 18, overhead: 5, minW: 128 };
export const TREE_PHONE: TreeOptions = { cell: 12, gap: 2, gutter: 6, pad: 6, nameSize: 13, nameLine: 16, countLine: 16, overhead: 7, minW: 92 };

/** How many lines a name wraps to in a given width: greedy by word, at a conservative Inter width
 *  of 0.58em a character (the bold name runs about 0.55em). */
export function nameLines(name: string, width: number, size: number): number {
  const per = Math.max(1, Math.floor(width / (size * 0.58)));
  let lines = 1;
  let used = 0;
  for (const word of name.split(/\s+/)) {
    const len = word.length;
    if (used === 0) used = len;
    else if (used + 1 + len <= per) used += 1 + len;
    else {
      lines += 1;
      used = len;
    }
    while (used > per) {
      lines += 1;
      used -= per;
    }
  }
  return lines;
}

export interface TreeRect extends Box {
  id: string;
  n: number;
  frame: string;
  ids: string[];
  /** Columns and rows of squares inside the rectangle. */
  cols: number;
  rows: number;
  /** Height the name and count take at the top of the rectangle. */
  labelH: number;
}

export interface TreeLayout {
  width: number;
  height: number;
  cell: number;
  gap: number;
  rects: TreeRect[];
}

/** The label and the squares of one rectangle at a given outer width. */
function inside(frame: string, n: number, w: number, o: TreeOptions) {
  const pitch = o.cell + o.gap;
  const innerW = w - o.gutter - 2 * o.pad;
  const labelH = nameLines(frame, innerW, o.nameSize) * o.nameLine + o.countLine + 4;
  const cols = Math.max(0, Math.floor((innerW + o.gap) / pitch));
  const rows = cols > 0 ? Math.ceil(n / cols) : Infinity;
  /** The outer height the rectangle needs at this width. */
  const need = o.gutter + 2 * o.pad + labelH + rows * pitch - o.gap;
  return { labelH, cols, rows, need };
}

function fit(blocks: readonly FieldBlock[], weights: readonly number[], width: number, height: number, o: TreeOptions) {
  const items = blocks.map((b, i) => ({ b, i, v: weights[i] })).sort((p, q) => q.b.ids.length - p.b.ids.length || p.i - q.i);
  const boxes = squarify(items, 0, 0, width, height);
  const rects: TreeRect[] = [];
  let ok = true;
  const need: number[] = [];
  for (const r of boxes) {
    const s = inside(r.b.frame, r.b.ids.length, r.w, o);
    // A rectangle narrower than minW asks for the area it would need at minW, and a little more,
    // so the next round widens it instead of leaving a sliver with a name broken mid-word.
    const narrow = r.w < o.minW;
    const at = narrow ? inside(r.b.frame, r.b.ids.length, o.minW, o) : s;
    need[r.i] = Number.isFinite(at.need) ? at.need * Math.max(r.w, o.minW) * (narrow ? 1.15 : 1) : weights[r.i] * 4;
    if (narrow || !(s.cols >= 1 && s.need <= r.h + 0.5)) ok = false;
    rects.push({ id: r.b.id, n: r.b.n, frame: r.b.frame, ids: r.b.ids, x: r.x, y: r.y, w: r.w, h: r.h, cols: s.cols, rows: s.rows, labelH: s.labelH });
  }
  return { rects, ok, need };
}

/** Lays the blocks out as a treemap of the given width, as short as it can be while every
 *  rectangle holds its name, its count and all its squares at the one square size. The squares
 *  carry the count (every square one action, one size); each rectangle's area is what its squares
 *  and its name need, found by re-weighting the squarified layout a few rounds. */
export function treeLayout(blocks: readonly FieldBlock[], width: number, o: TreeOptions): TreeLayout {
  const pitch = o.cell + o.gap;
  let weights = blocks.map((b) => (b.ids.length + o.overhead) * pitch * pitch);
  let height = Math.max(120, Math.ceil(weights.reduce((s, v) => s + v, 0) / Math.max(1, width)));
  // Each round sizes every rectangle by what it needed in the round before; a round where every
  // rectangle fits is kept if it is the shortest yet. Then, if none fit, the height grows.
  let best: { f: ReturnType<typeof fit>; height: number; weights: number[] } | null = null;
  for (let round = 0; round < 24; round++) {
    const f = fit(blocks, weights, width, height, o);
    if (!f.ok) {
      // A little room over the bare need, so the next round has a chance to fit.
      weights = f.need.map((v) => v * 1.04);
    } else {
      if (!best || height < best.height) best = { f, height, weights };
      weights = f.need.map((v) => v * 1.02);
    }
    height = Math.ceil(weights.reduce((s, v) => s + v, 0) / Math.max(1, width));
  }
  if (!best) {
    for (let k = 0; k < 600; k++) {
      const f = fit(blocks, weights, width, height, o);
      if (f.ok) {
        best = { f, height, weights };
        break;
      }
      height += 2;
    }
  }
  return best
    ? { width, height: best.height, cell: o.cell, gap: o.gap, rects: best.f.rects }
    : { width, height, cell: o.cell, gap: o.gap, rects: fit(blocks, weights, width, height, o).rects };
}

/** Where square k of a rectangle sits, relative to the rectangle's top left. */
export function cellAt(r: TreeRect, k: number, o: Pick<TreeOptions, 'cell' | 'gap' | 'pad' | 'gutter'>): { x: number; y: number } {
  const pitch = o.cell + o.gap;
  return { x: o.gutter / 2 + o.pad + (k % r.cols) * pitch, y: o.gutter / 2 + o.pad + r.labelH + Math.floor(k / r.cols) * pitch };
}
