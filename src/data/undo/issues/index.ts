import type { IssueTag } from '@/lib/undo/issues';
import a from './a.json';
import b from './b.json';

// The issue tags for every row, written by hand in the files beside this one. Each file is
// listed here by name on purpose: a file that goes missing or is renamed is a build error, not a
// quiet gap where a whole batch of rows loses its chips. A new file is added to this list in the
// same commit that creates it. scripts/undo-classify.test.mjs walks every JSON file in this
// folder and fails if one is not imported below.
//
// Order matters only when two entries hit one row: the first three distinct keys win.
export const issueTags: IssueTag[] = [
  ...(a as unknown as IssueTag[]),
  ...(b as unknown as IssueTag[]),
];
