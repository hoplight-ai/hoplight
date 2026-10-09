import type { Instrument, Status, UndoRow } from './types';
// Explicit .ts extension: scripts/undo-classify.test.mjs loads this file with Node's native
// TypeScript support, which does not resolve extensionless relative imports.
import { howForInstrument, whyForInstrument } from './classify.ts';

// How the /undo page cuts the list into sections. Pure, so the test can pin the counts the hero
// prints. The page, the hero numbers and the progress strip all read the same two functions.

/** A row as the client receives it: reviewed:false rows carry no how/why (derived from the
 *  instrument), and nothing the page does not render (agency, topics, extra sources) ships. */
export type SlimRow = Omit<UndoRow, 'how' | 'why' | 'agency' | 'topics'> & { how?: string; why?: string };

type RowLike = Pick<UndoRow, 'instrument' | 'bucket' | 'status' | 'title'>;

// An enjoined order is still on the to-do list: an injunction can fall on appeal, and a pen still revokes it.
const ACTIVE: Status[] = ['in-force', 'pending', 'enjoined'];

export function isActive(r: Pick<UndoRow, 'status'>): boolean {
  return ACTIVE.includes(r.status);
}

// A commemorative proclamation (National Manufacturing Day, 2026; Honoring the Memory of ...) is
// not a to-do. It is counted on its own and kept off the list and out of the hero number. Pattern
// tested against the 191 proclamation titles the live page carried on 2026-10-09: 125 commemorative,
// 66 substantive, every substantive title checked by eye.
const CEREMONIAL =
  /(\b(Day|Week|Weekend|Month|Year|Anniversary)\b.*,\s*20\d\d$)|^(National|World)\b.*\b(Day|Week|Weekend|Month)\b|Anniversary|Memorial Day|Mother's Day|Father's Day|Thanksgiving|Christmas|Flag Day|Columbus Day|Federal Holiday|Days of Remembrance|Honoring the Memory|Honoring the Victims|Death of|Birthday/i;

export function isCeremonial(r: Pick<UndoRow, 'instrument' | 'title'>): boolean {
  return r.instrument === 'proclamation' && CEREMONIAL.test(r.title);
}

/** Rows a pen undoes and that are still standing: the section "Before lunch" and the hero number. */
export function isPenInForce(r: RowLike & Pick<UndoRow, 'title'>): boolean {
  return r.bucket === 'pen' && isActive(r) && !isCeremonial(r);
}

export function countPenInForce(rows: RowLike[]): number {
  return rows.filter(isPenInForce).length;
}

export function countLocked(rows: RowLike[]): number {
  return rows.filter((r) => r.bucket === 'locked').length;
}

/** pen and pen-process rows already undone by a court or by the administration itself. */
export function isAlreadyDone(r: RowLike & Pick<UndoRow, 'title'>): boolean {
  return (r.bucket === 'pen' || r.bucket === 'pen-process') && !isActive(r) && !isCeremonial(r);
}

export function slimRow(row: UndoRow): SlimRow {
  // A row nobody reviewed carries the instrument's boilerplate; the client derives it again.
  const keepHow = row.reviewed || row.how !== howForInstrument(row.instrument);
  const keepWhy = row.reviewed || row.why !== whyForInstrument(row.instrument);
  return {
    id: row.id,
    title: row.title,
    instrument: row.instrument,
    date: row.date,
    number: row.number,
    bucket: row.bucket,
    status: row.status,
    reviewed: row.reviewed,
    sources: row.sources.slice(0, 1),
    ...(keepHow ? { how: row.how } : {}),
    ...(keepWhy ? { why: row.why } : {}),
  };
}

export function howOf(row: SlimRow): string {
  return row.how ?? howForInstrument(row.instrument);
}

export function whyOf(row: SlimRow): string {
  return row.why ?? whyForInstrument(row.instrument);
}

export function matchesQuery(row: Pick<UndoRow, 'title' | 'number'>, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return row.title.toLowerCase().includes(q) || (row.number ?? '').toLowerCase().includes(q);
}

export interface Group<T> {
  key: string;
  label: string;
  rows: T[];
}

const PEN_GROUPS: { key: string; label: string; instruments: Instrument[] }[] = [
  { key: 'eo', label: 'Executive orders', instruments: ['executive_order'] },
  { key: 'proc', label: 'Proclamations', instruments: ['proclamation'] },
  { key: 'memo', label: 'Memoranda', instruments: ['memorandum'] },
  { key: 'tariff', label: 'Tariffs', instruments: ['tariff'] },
  { key: 'treaty', label: 'Withdrawals', instruments: ['treaty'] },
  // Everything else a pen reaches lands here, so no row can fall out of the list.
  { key: 'other', label: 'Appointments and agency moves', instruments: ['personnel', 'other'] },
];

/** Sub-groups of "Before lunch", in the owner's order. Any instrument not named goes to the last
 *  group. Empty groups are dropped. */
export function groupPen<T extends { instrument: Instrument }>(rows: T[]): Group<T>[] {
  const named = new Set(PEN_GROUPS.flatMap((g) => g.instruments));
  return PEN_GROUPS.map((g, i) => ({
    key: g.key,
    label: g.label,
    rows: rows.filter((r) =>
      g.instruments.includes(r.instrument) || (i === PEN_GROUPS.length - 1 && !named.has(r.instrument)),
    ),
  })).filter((g) => g.rows.length > 0);
}

/** Sub-groups by instrument, in the order of the label table. Used for the locked list. */
export function groupByInstrument<T extends { instrument: Instrument }>(
  rows: T[],
  labels: Record<Instrument, string>,
): Group<T>[] {
  return (Object.keys(labels) as Instrument[])
    .map((i) => ({ key: i, label: labels[i], rows: rows.filter((r) => r.instrument === i) }))
    .filter((g) => g.rows.length > 0);
}
