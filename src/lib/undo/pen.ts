import type { UndoRow } from './types';
// Explicit .ts extension: scripts/undo-pen.test.mjs loads this file with Node's native TypeScript
// support, which does not resolve extensionless relative imports.
import { isPenInForce } from './sections.ts';
import type { Group } from './sections.ts';

// The Undo List is executive actions only (2026-11-08). Whit: "wait yes the undo list is supposed
// ot be just exec orders." Both pages draw the rows the classifier places in the pen bucket and
// nothing else; the classifier and the data are untouched, so this is a view, not a ruling. Pure,
// so scripts/undo-pen.test.mjs can pin it.

/** The rows a pen reaches: every row the classifier placed in the pen bucket. */
export function penRows<T extends Pick<UndoRow, 'bucket'>>(rows: readonly T[]): T[] {
  return rows.filter((r) => r.bucket === 'pen');
}

// The key counts by document type only (round 2, 2026-11-08): a subject label such as "Tariffs"
// counted the one curated tariff row while order 04 bundles 29 tariff proclamations, so the two
// numbers contradicted each other. Round 3: a withdrawal, a tariff or an agency move is counted
// under the document that issued it, read from its number and every source label (the 2026-01-07
// memorandum that quit 66 bodies counts as a memorandum); one no document issued is "Other". The
// slim rows the browser gets carry one source, so the loader counts this on the server.
const KINDS: { key: string; label: string; instrument: UndoRow['instrument']; named: RegExp }[] = [
  { key: 'eo', label: 'Executive orders', instrument: 'executive_order', named: /\bExecutive Order\b|\bEO \d/i },
  { key: 'proc', label: 'Proclamations', instrument: 'proclamation', named: /\bProclamation\b/i },
  { key: 'memo', label: 'Memoranda', instrument: 'memorandum', named: /\bMemorandum\b/i },
];

type KindRow = Pick<UndoRow, 'instrument' | 'number'> & { sources?: readonly { label: string }[] };

/** The kind of presidential document a row was issued as, or 'other' when none is named. */
export function issuedAs(r: KindRow): string {
  const own = KINDS.find((k) => k.instrument === r.instrument);
  if (own) return own.key;
  const said = `${r.number ?? ''} ${(r.sources ?? []).map((s) => s.label).join(' ')}`;
  return KINDS.find((k) => k.named.test(said))?.key ?? 'other';
}

/** The pen rows still standing, by the document that issued each, for the key under the field.
 *  The counts sum to the hero number; a kind with nothing standing drops out. */
export function penKinds<T extends Parameters<typeof isPenInForce>[0] & KindRow>(
  rows: readonly T[],
): { key: string; label: string; count: number }[] {
  const standing = rows.filter(isPenInForce);
  return [...KINDS, { key: 'other', label: 'Other' }]
    .map((k) => ({ key: k.key, label: k.label, count: standing.filter((r) => issuedAs(r) === k.key).length }))
    .filter((k) => k.count > 0);
}

/** The orders the one sort control offers, the default first. */
export const PEN_SORTS = ['newest', 'oldest', 'bundle'] as const;
export type PenSort = (typeof PEN_SORTS)[number];

/** A copy of the rows by ISO date. Rows on the same date keep the order they came in. */
export function sortByDate<T extends { date: string }>(rows: readonly T[], dir: 'newest' | 'oldest'): T[] {
  const sign = dir === 'newest' ? -1 : 1;
  return rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => (a.r.date < b.r.date ? -sign : a.r.date > b.r.date ? sign : a.i - b.i))
    .map(({ r }) => r);
}

/** The rows under the signing order that revokes each, orders in their own sequence, newest first
 *  inside each. A row sits under the first order that names it; rows no order names come last. */
export function groupByBundle<T extends { id: string; date: string }>(
  rows: readonly T[],
  orders: readonly { id: string; title: string; ids: readonly string[] }[],
  unbundledTitle: string,
): Group<T>[] {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const taken = new Set<string>();
  const groups: Group<T>[] = orders.map((o) => {
    const mine: T[] = [];
    for (const id of o.ids) {
      const r = byId.get(id);
      if (r && !taken.has(id)) {
        taken.add(id);
        mine.push(r);
      }
    }
    return { key: o.id, label: o.title, rows: sortByDate(mine, 'newest') };
  });
  groups.push({ key: 'unbundled', label: unbundledTitle, rows: sortByDate(rows.filter((r) => !taken.has(r.id)), 'newest') });
  return groups.filter((g) => g.rows.length > 0);
}

/** Which pen rows no order names, and which two or more orders name. Both lists empty means every
 *  pen row is in exactly one bundle. */
export function bundleCoverage(
  penIds: readonly string[],
  orders: readonly { id: string; ids: readonly string[] }[],
): { inNone: string[]; inTwo: string[] } {
  const seen = new Map<string, number>();
  for (const o of orders) for (const id of new Set(o.ids)) seen.set(id, (seen.get(id) ?? 0) + 1);
  return {
    inNone: penIds.filter((id) => !seen.has(id)),
    inTwo: penIds.filter((id) => (seen.get(id) ?? 0) > 1),
  };
}
