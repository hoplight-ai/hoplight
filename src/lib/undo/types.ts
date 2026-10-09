// The Undo List (hoplight.ai/undo): one row per action the second Trump administration took, each
// sorted by what it would take a president sworn in on 2029-01-20 to undo it.
//
// Five buckets, not three. Whit's ask named a pen, a simple majority and a supermajority. Two more
// are needed or the list lies: a final rule takes a pen AND a months-long process, and lifetime
// judges, CRA-killed rules, pardons and spent money cannot be undone by anyone.

export type Bucket = 'pen' | 'pen-process' | 'majority' | 'sixty' | 'locked';

export const BUCKETS: Record<Bucket, { order: number; label: string; line: string }> = {
  pen: {
    order: 1,
    label: 'A pen',
    line: 'The next president signs and it is gone. Executive orders, memoranda, proclamations, guidance, appointees.',
  },
  'pen-process': {
    order: 2,
    label: 'A pen, then a process',
    line: 'A final rule. Undoing it takes a new rule: notice, comment, reasons, and months, or a court throws it out first.',
  },
  majority: {
    order: 3,
    label: 'A simple majority',
    line: 'Congress can undo it without sixty votes: budget reconciliation for anything with a price tag, or the Congressional Review Act for rules finished late enough in 2028.',
  },
  sixty: {
    order: 4,
    label: 'Sixty votes',
    line: 'A statute with no budget hook, a treaty, or anything the Senate has to consent to.',
  },
  locked: {
    order: 5,
    label: 'Locked',
    line: 'Nobody can undo it. Lifetime judges, rules killed under the Congressional Review Act, pardons, money already spent, Supreme Court precedent.',
  },
};

export type Instrument =
  | 'executive_order'
  | 'memorandum'
  | 'proclamation'
  | 'rule'
  | 'statute'
  | 'cra'
  | 'judge'
  | 'treaty'
  | 'tariff'
  | 'personnel'
  | 'pardon'
  | 'court'
  | 'other';

export const INSTRUMENT_LABEL: Record<Instrument, string> = {
  executive_order: 'Executive order',
  memorandum: 'Memorandum',
  proclamation: 'Proclamation',
  rule: 'Rule',
  statute: 'Statute',
  cra: 'CRA repeal',
  judge: 'Judges',
  treaty: 'Treaty or withdrawal',
  tariff: 'Tariff',
  personnel: 'Personnel',
  pardon: 'Pardon',
  court: 'Court ruling',
  other: 'Other',
};

// What a row is doing today. Never a clock word: no "days since", no "overdue".
export type Status = 'in-force' | 'enjoined' | 'vacated' | 'revoked' | 'expired' | 'struck' | 'pending';

export interface Source {
  label: string;
  url: string;
}

export interface UndoRow {
  /** Stable id. Federal Register rows use the FR document number; curated rows use a slug. */
  id: string;
  title: string;
  instrument: Instrument;
  /** ISO date, the signing or effective date. */
  date: string;
  /** Executive order number, public law number, proclamation number, where one exists. */
  number?: string;
  bucket: Bucket;
  /** One line: what the 2029 president, or Congress, actually does to undo it. */
  how: string;
  /** One line: why it sits in this bucket and not the one beside it. */
  why: string;
  status: Status;
  /** true when a person or a sourced pass placed the row; false when the instrument type alone did. */
  reviewed: boolean;
  agency?: string;
  topics?: string[];
  sources: Source[];
}

// A curated ruling overrides the automatic placement of one Federal Register row (matched on
// executive order number or FR document number) or adds a row the Federal Register does not carry.
export interface Ruling {
  match?: { eo?: number; document_number?: string; proclamation?: number };
  /** Required when `match` is absent: the ruling IS the row. */
  row?: Omit<UndoRow, 'bucket' | 'how' | 'why' | 'reviewed' | 'sources' | 'status'> & { status?: Status };
  bucket: Bucket;
  how: string;
  why: string;
  status?: Status;
  sources: Source[];
}
