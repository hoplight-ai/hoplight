import type { Ruling } from './types';
import { applyRulings } from './classify';
import { applyIssues } from './issues-merge';
import { forwardOrderView } from './forward-text';
import type { ForwardOrderView } from './forward-text';
import type { ForwardOrder } from './issues';
import { countPenInForce, slimRow } from './sections';
import { penRows } from './pen';
import type { SlimRow } from './sections';
import { fetchFederalRegisterRows } from './federal-register';
import rulingsJson from '@/data/undo/rulings.json';
import curatedJson from '@/data/undo/curated.json';
import { headlines } from '@/data/undo/headlines';
import { issueTags } from '@/data/undo/issues';
import forwardJson from '@/data/undo/forward.json';

// Everything the two /undo pages need, built once per render on the server: the feed merged with
// the curated files, narrowed to the rows a pen reaches, the counts the hero prints, and each
// Forward Order matched to its rows. The Undo List is executive actions only (2026-11-08): a row
// the classifier places in any other bucket stays in the data and never reaches a page.

// The curated files are written by hand and by other lanes; the cast is the one place the pages
// trust their shape, and scripts/undo-classify.test.mjs reads the same files.
const rulings = rulingsJson as unknown as Ruling[];
const curated = curatedJson as unknown as Ruling[];
const forwardOrders = forwardJson as unknown as ForwardOrder[];

export interface UndoData {
  /** The pen rows, slimmed for the client. */
  slim: SlimRow[];
  /** Every pen row, standing or not: what /undo/all lists. */
  total: number;
  reviewed: number;
  auto: number;
  newest: string | null;
  penInForce: number;
  orders: ForwardOrderView[];
  feedOk: boolean;
}

export async function loadUndo(): Promise<UndoData> {
  const feed = await fetchFederalRegisterRows();
  const merged = applyIssues(applyRulings(feed.rows, [...rulings, ...curated, ...headlines]), issueTags);
  const pen = penRows(merged);
  const reviewed = pen.filter((r) => r.reviewed).length;
  // Rows nobody reviewed ship without their boilerplate how/why (the client derives it from the
  // instrument), and without fields the page does not draw. The text still renders on the server.
  const slim = pen.map(slimRow);
  // Each Forward Order is matched against the pen rows here, once, so the browser gets ids. An
  // order whose items are all missing (the feed is down and its items are feed rows) is left out
  // rather than shown as "undoes 0 items".
  const orders = forwardOrders.map((o) => forwardOrderView(o, pen)).filter((o) => o.ids.length > 0);
  return {
    slim,
    total: pen.length,
    reviewed,
    auto: pen.length - reviewed,
    newest: pen.length ? pen[0].date : null,
    penInForce: countPenInForce(pen),
    orders,
    feedOk: feed.ok,
  };
}
