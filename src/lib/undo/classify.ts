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

function rulingMatches(r: Ruling, row: UndoRow): boolean {
  if (!r.match) return false;
  if (r.match.document_number && row.id === r.match.document_number) return true;
  if (r.match.eo !== undefined && row.instrument === 'executive_order' && row.number === `EO ${r.match.eo}`) return true;
  if (
    r.match.proclamation !== undefined &&
    row.instrument === 'proclamation' &&
    row.number === `Proclamation ${r.match.proclamation}`
  ) {
    return true;
  }
  return false;
}

// Applies the curated rulings: an override replaces the automatic placement of a matching Federal
// Register row; a ruling with its own `row` becomes a row of its own. Every ruling-placed row is
// `reviewed: true`. Returns the merged, sorted list, newest first (never by age: CLAUDE.md rule).
export function applyRulings(autoRows: UndoRow[], rulings: Ruling[]): UndoRow[] {
  const out: UndoRow[] = autoRows.map((row) => {
    const r = rulings.find((x) => rulingMatches(x, row));
    if (!r) return row;
    return {
      ...row,
      bucket: r.bucket,
      how: r.how,
      why: r.why,
      status: r.status ?? row.status,
      reviewed: true,
      sources: r.sources.length ? [...r.sources, ...row.sources] : row.sources,
    };
  });
  for (const r of rulings) {
    if (!r.row) continue;
    out.push({
      ...r.row,
      bucket: r.bucket,
      how: r.how,
      why: r.why,
      status: r.status ?? r.row.status ?? 'in-force',
      reviewed: true,
      sources: r.sources,
    });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id.localeCompare(b.id)));
}

export function countByBucket(rows: UndoRow[]): Record<Bucket, number> {
  const counts: Record<Bucket, number> = { pen: 0, 'pen-process': 0, majority: 0, sixty: 0, locked: 0 };
  for (const r of rows) counts[r.bucket] += 1;
  return counts;
}
