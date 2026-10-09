import type { Bucket, Instrument, Ruling, Status, UndoRow } from './types';

// The automatic first pass. Instrument type alone places about four rows in five correctly; the
// page says "auto, unreviewed" on every row placed this way until a ruling in src/data/undo
// replaces it. No row is ever hidden for being unreviewed.

export function bucketForInstrument(instrument: Instrument): Bucket {
  switch (instrument) {
    case 'executive_order':
    case 'memorandum':
    case 'proclamation':
    case 'personnel':
    case 'treaty':
    case 'tariff':
      return 'pen';
    case 'rule':
      return 'pen-process';
    case 'statute':
      return 'sixty';
    case 'cra':
    case 'judge':
    case 'pardon':
    case 'court':
      return 'locked';
    default:
      return 'pen';
  }
}

export function howForInstrument(instrument: Instrument): string {
  switch (instrument) {
    case 'executive_order':
      return 'Sign an executive order revoking it.';
    case 'memorandum':
      return 'Sign a memorandum withdrawing it.';
    case 'proclamation':
      return 'Sign a proclamation ending it.';
    case 'rule':
      return 'Propose a replacement rule, take comment, publish a final rule with reasons.';
    case 'statute':
      return 'Pass a repeal through both chambers; sixty Senate votes unless it rides reconciliation.';
    case 'cra':
      return 'Nothing. A rule killed under the Congressional Review Act cannot be reissued in substantially the same form.';
    case 'judge':
      return 'Nothing. Article III judges serve for life.';
    case 'pardon':
      return 'Nothing. A pardon is final once delivered.';
    case 'court':
      return 'Nothing short of the Court reversing itself or a constitutional amendment.';
    case 'treaty':
      return 'Rejoin by executive action where entry never needed Senate consent; otherwise the Senate.';
    case 'tariff':
      return 'Revoke the proclamation or have Commerce or USTR end the action.';
    case 'personnel':
      return 'Appoint someone else.';
    default:
      return 'Review case by case.';
  }
}

export function whyForInstrument(instrument: Instrument): string {
  switch (instrument) {
    case 'executive_order':
    case 'memorandum':
    case 'proclamation':
      return 'A presidential document binds only the executive branch and a later president can revoke it the same way it was made.';
    case 'rule':
      return 'A rule that went through notice and comment can only be undone by a rule that goes through notice and comment.';
    case 'statute':
      return 'Only Congress repeals a statute, and the Senate filibuster applies unless the repeal has a budget effect.';
    case 'cra':
      return 'The Congressional Review Act bars any agency from reissuing a disapproved rule in substantially the same form.';
    case 'judge':
      return 'Lifetime tenure under Article III.';
    case 'pardon':
      return 'The pardon power is unreviewable once exercised.';
    case 'court':
      return 'Precedent binds until the Court overrules it.';
    case 'treaty':
      return 'Withdrawal was executive; re-entry follows whatever path the original entry took.';
    case 'tariff':
      return 'Tariff proclamations rest on delegated statutory authority a president can stop invoking.';
    case 'personnel':
      return 'Political appointees serve at the pleasure of the president.';
    default:
      return 'Placed by instrument type only.';
  }
}

// Reads the Federal Register's disposition text ("Revoked by EO 14148 ...") into a status.
export function statusFromDisposition(disposition: string | null | undefined): Status {
  const d = (disposition ?? '').toLowerCase();
  if (/\brevoked\b|\brescinded\b/.test(d)) return 'revoked';
  if (/\bsuperseded\b/.test(d)) return 'revoked';
  return 'in-force';
}

export function autoRow(input: {
  id: string;
  title: string;
  instrument: Instrument;
  date: string;
  number?: string;
  agency?: string;
  topics?: string[];
  disposition?: string | null;
  sources: UndoRow['sources'];
}): UndoRow {
  return {
    id: input.id,
    title: input.title,
    instrument: input.instrument,
    date: input.date,
    number: input.number,
    bucket: bucketForInstrument(input.instrument),
    how: howForInstrument(input.instrument),
    why: whyForInstrument(input.instrument),
    status: statusFromDisposition(input.disposition),
    reviewed: false,
    agency: input.agency,
    topics: input.topics,
    sources: input.sources,
  };
}

const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function rulingMatches(r: Ruling, row: UndoRow): boolean {
  const m = r.match;
  if (!m) return false;
  if (m.document_number && row.id === m.document_number) return true;
  if (m.id && row.id === m.id) return true;
  if (m.eo !== undefined && row.instrument === 'executive_order' && row.number === `EO ${m.eo}`) return true;
  if (m.proclamation !== undefined && row.instrument === 'proclamation' && row.number === `Proclamation ${m.proclamation}`) {
    return true;
  }
  // Exact official title, trimmed, any case. A row a headline ruling has already renamed still
  // answers to its official title, so a second ruling written against the order's own name lands.
  if (m.title && (sameText(m.title, row.title) || (row.official !== undefined && sameText(m.title, row.official)))) {
    return true;
  }
  return false;
}

function mergeSources(first: UndoRow['sources'], rest: UndoRow['sources']): UndoRow['sources'] {
  const seen = new Set<string>();
  return [...first, ...rest].filter((s) => (seen.has(s.url) ? false : (seen.add(s.url), true)));
}

// The headline half of a ruling. A ruling with a `headline` is a complete editorial statement:
// our line becomes the title, the administration's own title moves to `official` (kept if an
// earlier ruling already moved it), and verdict and unsure are taken from the ruling as written,
// so a later, surer ruling clears an earlier "unsure". A ruling without a headline leaves the
// title alone and only sets verdict or unsure when it names them.
function headlineFields(row: UndoRow, r: Ruling): Pick<UndoRow, 'title' | 'official' | 'verdict' | 'unsure'> {
  if (r.headline === undefined) {
    return {
      title: row.title,
      official: row.official,
      verdict: r.verdict ?? row.verdict,
      unsure: r.unsure ?? row.unsure,
    };
  }
  // Only a Federal Register row carries the administration's own title; a curated row's old title
  // was ours, and showing it as "Officially:" would put our words in the government's mouth.
  const fromFeed = /^\d{4}-\d+$/.test(row.id);
  return {
    title: r.headline,
    official: row.official ?? (fromFeed ? row.title : undefined),
    verdict: r.verdict,
    unsure: r.unsure,
  };
}

function stripUndefined<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

// Applies the curated rulings in three steps, so the order rulings arrive in is the order they win:
//  1. Every `row` ruling is added as a row of its own (it needs no feed).
//  2. Every ruling with a `match` is applied to every row it matches, in array order. A LATER
//     ruling overrides an EARLIER one on every field it sets, so a headline ruling written after a
//     plain placement ruling wins, and a `{ match: { id } }` ruling can re-word a row that a `row`
//     ruling added in step 1. (Before 2026-10-09 the first matching ruling won; no two rulings in
//     the data matched the same row, so nothing moved.)
//  3. Sort newest first, never by age (CLAUDE.md: nothing here measures him against a clock).
// Every ruling-placed row is `reviewed: true`.
export function applyRulings(autoRows: UndoRow[], rulings: Ruling[]): UndoRow[] {
  let out: UndoRow[] = [...autoRows];
  for (const r of rulings) {
    if (!r.row) continue;
    const base: UndoRow = {
      ...r.row,
      bucket: r.bucket,
      how: r.how,
      why: r.why,
      status: r.status ?? r.row.status ?? 'in-force',
      reviewed: true,
      sources: r.sources,
    };
    out.push(stripUndefined({ ...base, ...headlineFields(base, r) }));
  }
  for (const r of rulings) {
    if (!r.match || r.row) continue;
    out = out.map((row) => {
      if (!rulingMatches(r, row)) return row;
      return stripUndefined({
        ...row,
        ...headlineFields(row, r),
        bucket: r.bucket,
        how: r.how,
        why: r.why,
        status: r.status ?? row.status,
        reviewed: true,
        sources: r.sources.length ? mergeSources(r.sources, row.sources) : row.sources,
      });
    });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id.localeCompare(b.id)));
}

export function countByBucket(rows: UndoRow[]): Record<Bucket, number> {
  const counts: Record<Bucket, number> = { pen: 0, 'pen-process': 0, majority: 0, sixty: 0, locked: 0 };
  for (const r of rows) counts[r.bucket] += 1;
  return counts;
}
