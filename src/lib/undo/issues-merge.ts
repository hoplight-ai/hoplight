import type { IssueKey, IssueTag } from './issues.ts';
import { ISSUES } from './issues.ts';
import { rulingMatches } from './classify.ts';
import type { MatchableRow } from './classify.ts';
import type { UndoRow } from './types.ts';

// Attaches the issue tags to the rows. Tags match the way rulings do (executive order number,
// proclamation number, Federal Register document number, exact title, row id), so the same
// `rulingMatches` decides. Pure.

/** A row carries at most this many chips. The tag files hold one to three per entry; when two
 *  entries hit one row (an id tag and a title tag), the first three distinct keys win, in the
 *  order the entries appear. */
export const MAX_ISSUES_PER_ROW = 3;

export function applyIssues<T extends MatchableRow & { issues?: IssueKey[] }>(rows: T[], tags: IssueTag[]): T[] {
  return rows.map((row) => {
    const found: IssueKey[] = [];
    for (const tag of tags) {
      if (!rulingMatches(tag, row)) continue;
      for (const key of tag.issues) if (!found.includes(key)) found.push(key);
      if (found.length >= MAX_ISSUES_PER_ROW) break;
    }
    return { ...row, issues: found.slice(0, MAX_ISSUES_PER_ROW) };
  });
}

export interface IssueGroup<T> {
  /** An issue key, or 'none' for rows nobody has tagged yet. */
  key: IssueKey | 'none';
  rows: T[];
}

/** Groups rows by their FIRST issue, in the order of the ISSUES table, untagged rows last. A row
 *  with three issues appears once, so no section's count doubles. Empty groups are dropped. */
export function groupByIssue<T extends { issues?: UndoRow['issues'] }>(rows: T[]): IssueGroup<T>[] {
  const groups: IssueGroup<T>[] = ISSUES.map((i) => ({
    key: i.key as IssueKey | 'none',
    rows: rows.filter((r) => r.issues?.[0] === i.key),
  }));
  groups.push({ key: 'none', rows: rows.filter((r) => !r.issues || r.issues.length === 0) });
  return groups.filter((g) => g.rows.length > 0);
}
