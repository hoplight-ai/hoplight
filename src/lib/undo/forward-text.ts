import type { ForwardOrder, IssueKey } from './issues.ts';
import { rulingMatches } from './classify.ts';
import type { MatchableRow } from './classify.ts';
import { digitsOf, longDate } from './order-text.ts';
import type { UndoRow } from './types.ts';

// A Forward Order is one omnibus order that revokes a bundle of items in a single signature.
// This file finds the items among the merged rows and writes the document. Pure.

type OrderRow = MatchableRow & Pick<UndoRow, 'date'>;

type OrderLike = Pick<ForwardOrder, 'title' | 'purpose' | 'items'>;

/** What the page needs about one order, resolved on the server so the browser does not have to
 *  match every item against every row. */
export interface ForwardOrderView {
  id: string;
  title: string;
  purpose: string;
  issues: IssueKey[];
  /** Ids of the rows the order revokes, in the order the order lists them, each row once. */
  ids: string[];
}

/** Finds the row each item names. An item that matches no row is skipped and counted in
 *  `missing`; two items that name one row give the row once. */
export function resolveOrderItems<R extends OrderRow>(order: Pick<ForwardOrder, 'items'>, rows: R[]): { rows: R[]; missing: number } {
  const found: R[] = [];
  const seen = new Set<string>();
  let missing = 0;
  for (const item of order.items) {
    const row = rows.find((r) => rulingMatches({ match: item }, r));
    if (!row) {
      missing += 1;
      continue;
    }
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    found.push(row);
  }
  return { rows: found, missing };
}

export function forwardOrderView<R extends OrderRow>(order: ForwardOrder, rows: R[]): ForwardOrderView {
  return {
    id: order.id,
    title: order.title,
    purpose: order.purpose,
    issues: order.issues,
    ids: resolveOrderItems(order, rows).rows.map((r) => r.id),
  };
}

/** "A, B and C". Commas between, "and" before the last. */
function listOf(parts: string[]): string {
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

function presidentialName(row: OrderRow & Pick<UndoRow, 'instrument'>): string | null {
  const when = longDate(row.date);
  const n = digitsOf(row.number);
  switch (row.instrument) {
    case 'executive_order':
      return `Executive Order${n ? ` ${n}` : ''} of ${when}`;
    case 'proclamation':
      return `Proclamation${n ? ` ${n}` : ''} of ${when}`;
    case 'memorandum':
      // A memorandum has no number: its date and its legal title name it.
      return `the Presidential Memorandum of ${when} (${row.official ?? row.title})`;
    default:
      return null;
  }
}

/** The whole document. Executive orders, proclamations and memoranda are revoked by name. Every
 *  other item (tariff rows, withdrawals, personnel, rules) is handed to the agencies in a second
 *  sentence, by the row's own title. */
export function forwardOrderText(order: OrderLike, rows: OrderRow[]): string {
  const { rows: items } = resolveOrderItems(order, rows);
  const named: string[] = [];
  const agency: string[] = [];
  for (const row of items) {
    const name = presidentialName(row);
    if (name) named.push(name);
    else agency.push(row.title);
  }
  const revocations: string[] = [];
  if (named.length) revocations.push(`The following are revoked: ${listOf(named)}.`);
  if (agency.length) {
    revocations.push(
      `The heads of the relevant agencies shall, within 30 days, take all lawful steps to end the following actions: ${listOf(agency)}.`,
    );
  }
  return [
    'EXECUTIVE ORDER',
    order.title.toUpperCase(),
    'By the authority vested in me as President by the Constitution and the laws of the United States of America, it is hereby ordered:',
    `Section 1. Purpose. ${order.purpose}`,
    `Sec. 2. Revocations. ${revocations.join(' ')}`,
    'Sec. 3. Implementation. The heads of agencies shall promptly rescind any guidance, policy or rule issued to implement the actions revoked by this order, consistent with applicable law.',
    'Sec. 4. General Provisions. Nothing in this order shall be construed to impair the authority granted by law to an executive department or agency, or the head thereof. This order shall be implemented consistent with applicable law and subject to the availability of appropriations.',
  ].join('\n\n');
}
