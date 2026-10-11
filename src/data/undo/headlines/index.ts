import type { Ruling } from '@/lib/undo/types';
import eo1 from './eo-1.json';
import eo2 from './eo-2.json';
import eo3 from './eo-3.json';
import eo4 from './eo-4.json';
import procsMemos from './procs-memos.json';
import curated1 from './curated-1.json';
import curated2 from './curated-2.json';

// Our own headline for every row, written by hand in the seven files beside this one. Each file
// is listed here by name on purpose: a file that goes missing or is renamed is a build error, not
// a quiet gap where a row falls back to the administration's own title. A new file is added to
// this list in the same commit that creates it.
//
// Order matters. applyRulings applies rulings in array order and a later one wins, so these come
// last on the page, after rulings.json and curated.json: a headline ruling overrides the plain
// placement ruling for the same row, and `{ match: { id } }` entries re-word the curated rows.
// scripts/undo-classify.test.mjs walks every JSON file in this folder and fails if one is not
// imported below.
export const headlines: Ruling[] = [
  ...(eo1 as unknown as Ruling[]),
  ...(eo2 as unknown as Ruling[]),
  ...(eo3 as unknown as Ruling[]),
  ...(eo4 as unknown as Ruling[]),
  ...(procsMemos as unknown as Ruling[]),
  ...(curated1 as unknown as Ruling[]),
  ...(curated2 as unknown as Ruling[]),
];
