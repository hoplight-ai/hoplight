import type { UndoRow } from './types';

// The whole document a president signs to undo an executive order, a proclamation or a memorandum.
// Pure. Returns null for every other instrument: a statute, a rule or a treaty takes more than one
// sentence, and the page does not pretend otherwise. Dates are written out ("January 20, 2025");
// the ISO date stays on the row's own label line.

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function longDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const month = MONTHS[Number(m[2]) - 1];
  if (!month) return iso;
  return `${month} ${Number(m[3])}, ${m[1]}`;
}

function digitsOf(number: string | undefined): string | null {
  const m = /\d[\d-]*/.exec(number ?? '');
  return m ? m[0] : null;
}

export function orderText(row: Pick<UndoRow, 'instrument' | 'title' | 'date' | 'number'>): string | null {
  const when = longDate(row.date);
  const n = digitsOf(row.number);
  switch (row.instrument) {
    case 'executive_order':
      return `Executive Order${n ? ` ${n}` : ''} of ${when} (${row.title}) is hereby revoked.`;
    case 'proclamation':
      return `Proclamation${n ? ` ${n}` : ''} of ${when} (${row.title}) is hereby rescinded.`;
    case 'memorandum':
      return `The Presidential Memorandum of ${when} (${row.title}) is hereby withdrawn.`;
    default:
      return null;
  }
}
