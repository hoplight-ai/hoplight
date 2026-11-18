'use client';

import { COPY } from '@/lib/undo/copy';
import type { SlimRow } from '@/lib/undo/sections';
import { THEME_BY_KEY } from '@/lib/undo/themes';
import type { ThemeKey } from '@/lib/undo/themes';

export type SortKey = 'action' | 'order' | 'theme' | 'kind' | 'date';

/** The table's rows in the order a header asks for; ties keep the newest first. */
export function sortRows<R extends { id: string; title: string; date: string }>(
  rows: readonly R[],
  key: SortKey,
  dir: 1 | -1,
  orderOf: (id: string) => string,
  themeOf: (id: string) => string,
  kindOf: (id: string) => string,
): R[] {
  const val = (r: R) =>
    key === 'action' ? r.title : key === 'order' ? orderOf(r.id) : key === 'theme' ? themeOf(r.id) : key === 'kind' ? kindOf(r.id) : r.date;
  return [...rows].sort((a, b) => {
    const va = val(a);
    const vb = val(b);
    const c = va < vb ? -1 : va > vb ? 1 : 0;
    if (c !== 0) return c * dir;
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  });
}

const COLS: { key: SortKey | null; label: string; cls: string }[] = [
  { key: 'action', label: COPY.table.cols.action, cls: 'c-act' },
  { key: 'order', label: COPY.table.cols.order, cls: 'c-ord' },
  { key: 'theme', label: COPY.table.cols.theme, cls: 'c-thm' },
  { key: 'kind', label: COPY.table.cols.kind, cls: 'c-kind' },
  { key: 'date', label: COPY.table.cols.date, cls: 'c-date' },
  { key: null, label: COPY.table.cols.sign, cls: 'c-sign' },
];

// The table of every standing executive action under the tree: fixed column widths so nothing moves
// when a filter lands, every header sorting both ways, every row drawn at its real height.
export default function UndoTable({
  rows,
  total,
  sortKey,
  dir,
  onSort,
  frameOf,
  themeOf,
  kindOf,
  signed,
  onSign,
  filterLabel,
  onClear,
}: {
  rows: SlimRow[];
  total: number;
  sortKey: SortKey;
  dir: 1 | -1;
  onSort: (k: SortKey) => void;
  frameOf: (id: string) => string;
  themeOf: (id: string) => ThemeKey;
  kindOf: (id: string) => string;
  signed: ReadonlySet<string>;
  onSign: (id: string) => void;
  filterLabel: string | null;
  onClear: () => void;
}) {
  return (
    <section className="undo-table-sec" aria-labelledby="undo-table-h">
      <div className="wrap undo-wide">
        <div className="undo-now">
          <h2 id="undo-table-h" className="undo-now-h">
            <span className="undo-num">{COPY.table.shown(rows.length)}</span>
            {filterLabel ? <span> {filterLabel}</span> : null}
          </h2>
          {filterLabel ? (
            <button type="button" className="undo-plain" onClick={onClear}>
              {COPY.table.showAll(total)}
            </button>
          ) : null}
        </div>
        <table className="undo-table">
          <caption className="sr-only">{COPY.table.caption}</caption>
          <colgroup>
            {COLS.map((c) => (
              <col key={c.cls} className={c.cls} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {COLS.map((c) => (
                <th key={c.cls} scope="col" className={c.cls} aria-sort={c.key && c.key === sortKey ? (dir === 1 ? 'ascending' : 'descending') : undefined}>
                  {c.key ? (
                    <button type="button" className={`undo-th${c.key === sortKey ? (dir === 1 ? ' is-up' : ' is-down') : ''}`} onClick={() => onSort(c.key as SortKey)}>
                      {c.label}
                    </button>
                  ) : (
                    <span className="undo-th">{c.label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const t = THEME_BY_KEY[themeOf(r.id)];
              const on = signed.has(r.id);
              return (
                <tr key={r.id} className={on ? 'is-signed' : undefined}>
                  <td className="c-act">{r.title}</td>
                  <td className="c-ord">{frameOf(r.id)}</td>
                  <td className="c-thm">
                    <i className={`t-${t.key}`} aria-hidden="true" />
                    {t.name}
                  </td>
                  <td className="c-kind">{kindOf(r.id)}</td>
                  <td className="c-date undo-num">{r.date}</td>
                  <td className="c-sign">
                    <button type="button" className="undo-plain" aria-pressed={on} onClick={() => onSign(r.id)}>
                      {on ? COPY.table.signed : COPY.table.sign}
                      <span className="sr-only">: {r.title}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
