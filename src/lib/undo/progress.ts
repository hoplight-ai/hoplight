import { ISSUES } from './issues.ts';
import type { IssueKey } from './issues.ts';
import { isAlreadyDone, isCeremonial, isJustIn, isLeave, isPenInForce } from './sections.ts';
import type { UndoRow } from './types.ts';

// The numbers behind "Where it lands": for each issue, how its items split by what it takes to
// undo them. Pure, so the test can pin the fixture and the page can draw divs from the result.
//
// Counted: every row carrying the issue EXCEPT a row marked leave, a commemorative proclamation,
// a row already undone by a court or by the administration, and a feed row nobody has written up
// yet (it is not on the to-do list, so it is not in the hero number either). That keeps the pen
// column here the same set the hero number counts.

type BarRow = Pick<UndoRow, 'id' | 'instrument' | 'bucket' | 'status' | 'title' | 'reviewed'> & {
  verdict?: UndoRow['verdict'];
  issues?: IssueKey[];
};

export interface IssueBar {
  key: IssueKey;
  label: string;
  line: string;
  total: number;
  /** One signature. */
  pen: number;
  /** A final rule: a new rule, no vote. */
  process: number;
  /** A simple majority or sixty votes. */
  congress: number;
  locked: number;
  /** Pen items the reader has ticked. */
  signedPen: number;
}

export function isCounted(r: BarRow): boolean {
  return !isLeave(r) && !isCeremonial(r) && !isAlreadyDone(r) && !isJustIn(r);
}

export function issueBars(rows: BarRow[], signed: ReadonlySet<string> = new Set()): IssueBar[] {
  const bars = ISSUES.map((i) => ({
    key: i.key,
    label: i.label,
    line: i.line,
    total: 0,
    pen: 0,
    process: 0,
    congress: 0,
    locked: 0,
    signedPen: 0,
  }));
  const byKey = new Map(bars.map((b) => [b.key, b]));
  for (const r of rows) {
    if (!r.issues || r.issues.length === 0 || !isCounted(r)) continue;
    const pen = isPenInForce(r);
    for (const key of new Set(r.issues)) {
      const b = byKey.get(key);
      if (!b) continue;
      b.total += 1;
      if (pen) {
        b.pen += 1;
        if (signed.has(r.id)) b.signedPen += 1;
      } else if (r.bucket === 'pen-process') b.process += 1;
      else if (r.bucket === 'majority' || r.bucket === 'sixty') b.congress += 1;
      else if (r.bucket === 'locked') b.locked += 1;
    }
  }
  // Biggest first; a tie keeps the order of the ISSUES table. Issues with nothing in them drop out.
  return bars
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => b.total > 0)
    .sort((x, y) => y.b.total - x.b.total || x.i - y.i)
    .map(({ b }) => b);
}
