import type { ForwardOrderView } from './forward-text.ts';
import type { IssueKey } from './issues.ts';

// The signature field: the hero picture on /undo. One small square per item a pen undoes, the
// squares packed into one block per Forward Order, so the first screen shows the whole job as
// thirteen blocks rather than as a number. Signing an order fills its block gold. Pure, so the
// test can pin the packing and the page can draw divs from it.

export interface FieldBlock {
  /** The order's id, or 'unbundled' for pen items no order names yet. */
  id: string;
  /** 1-based position of the order in the list; 0 for the unbundled block. */
  n: number;
  title: string;
  /** Row ids, each a pen item still standing, each in exactly one block. */
  ids: string[];
  /** Columns the block packs into: wide enough to read as a block, never a long strip. */
  cols: number;
  issues: IssueKey[];
}

export const MAX_COLS = 12;

/** Columns for a block of n squares: roughly 1.7 squares wide for every one tall, between 2 and
 *  MAX_COLS, so an 83-item block is 12 by 7 and a 6-item block is 4 by 2. */
export function colsFor(n: number): number {
  if (n <= 0) return 1;
  return Math.min(MAX_COLS, Math.max(2, Math.ceil(Math.sqrt(n * 1.7))));
}

/** Packs the pen items into blocks, one per order in order, each id once. Pen items no order
 *  names go into a last block so the field and the hero number always agree. An order with no
 *  standing pen item draws no block. */
export function fieldBlocks(
  orders: Pick<ForwardOrderView, 'id' | 'title' | 'ids' | 'issues'>[],
  penIds: readonly string[],
  unbundledTitle: string,
): FieldBlock[] {
  const pen = new Set(penIds);
  const taken = new Set<string>();
  const blocks: FieldBlock[] = [];
  orders.forEach((o, i) => {
    const ids = o.ids.filter((id) => pen.has(id) && !taken.has(id));
    for (const id of ids) taken.add(id);
    blocks.push({ id: o.id, n: i + 1, title: o.title, ids, cols: colsFor(ids.length), issues: o.issues });
  });
  const rest = penIds.filter((id) => !taken.has(id));
  if (rest.length > 0) {
    blocks.push({ id: 'unbundled', n: 0, title: unbundledTitle, ids: rest, cols: colsFor(rest.length), issues: [] });
  }
  return blocks.filter((b) => b.ids.length > 0);
}
