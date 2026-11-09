'use client';

import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import type { Instrument } from '@/lib/undo/types';
import { COPY } from '@/lib/undo/copy';
import { track } from '@/lib/track';
import { orderText } from '@/lib/undo/order-text';
import { ISSUES, ISSUE_BY_KEY } from '@/lib/undo/issues';
import type { IssueKey } from '@/lib/undo/issues';
import type { ForwardOrderView } from '@/lib/undo/forward-text';
import { groupByBundle, PEN_SORTS, sortByDate } from '@/lib/undo/pen';
import type { PenSort } from '@/lib/undo/pen';
import {
  howOf,
  footnoteOf,
  isAlreadyDone,
  isCeremonial,
  isLeave,
  isJustIn,
  isPenInForce,
  matchesQuery,
  tagOf,
  whyOf,
} from '@/lib/undo/sections';
import type { SlimRow } from '@/lib/undo/sections';
import CopyButton from './CopyButton';
import IssueChips from './IssueChips';
import { readSigned, safeId, writeSigned } from './signed';

const ORDER_INSTRUMENTS: Instrument[] = ['executive_order', 'proclamation', 'memorandum'];
const PAGE = 25;

type Variant = 'check' | 'done';

function OrderDisclosure({ row }: { row: SlimRow }) {
  const [open, setOpen] = useState(false);
  const text = orderText(row);
  if (!text) return null;
  const panelId = `undo-order-${safeId(row.id)}`;
  return (
    <div className="undo-order">
      <button
        type="button"
        className="undo-disclose"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        {open ? COPY.order.hide : COPY.order.show}
      </button>
      {open ? (
        <div id={panelId}>
          <div className="undo-order-box">
            <p className="undo-order-text">{text}</p>
            <CopyButton
              text={text}
              label={COPY.order.copy}
              copiedLabel={COPY.order.copied}
              className="undo-copy"
              track={{ action: 'copy-row-order', props: { row: row.id } }}
            />
          </div>
          <p className="undo-order-note">{COPY.order.footnote}</p>
        </div>
      ) : null}
    </div>
  );
}

// One row: a single line (the box, our headline, the mechanism tag) and the rest behind a native
// disclosure, so a screen of rows reads as a list and not as an essay.
function Item({
  row,
  variant,
  signed,
  onToggle,
}: {
  row: SlimRow;
  variant: Variant;
  signed?: boolean;
  onToggle?: (id: string) => void;
}) {
  const href = row.sources[0]?.url;
  const titleId = `undo-t-${safeId(row.id)}`;
  const showStatus = row.status !== 'in-force';
  const hasOrder = variant === 'check' && ORDER_INSTRUMENTS.includes(row.instrument);
  const tag = variant === 'check' ? tagOf(row.bucket) : null;

  return (
    <li
      className={`undo-item undo-item-${variant}${signed ? ' is-signed' : ''}`}
      data-bucket={row.bucket}
    >
      {variant === 'check' ? (
        <span className="undo-checkwrap">
          <input
            type="checkbox"
            className="undo-check"
            checked={!!signed}
            onChange={() => onToggle?.(row.id)}
            aria-labelledby={titleId}
          />
          <span className="undo-box" aria-hidden="true" />
        </span>
      ) : null}
      <details className="undo-row">
        <summary className="undo-row-sum">
          <span className="undo-title" id={titleId}>
            {row.title}
          </span>
          {tag ? <span className="undo-tag">{tag}</span> : null}
          <span className="undo-row-more" aria-hidden="true">
            {COPY.row.more}
          </span>
        </summary>
        <div className="undo-item-body">
          {variant === 'check' ? <p className="undo-how">{howOf(row)}</p> : null}
          <p className="undo-foot">
            {footnoteOf(row)}
            {showStatus ? (
              <>
                {' · '}
                <span className="undo-status">
                  <span className="sr-only">Status: </span>
                  {row.status}
                </span>
              </>
            ) : null}
            {href ? (
              <>
                {' · '}
                <a href={href} className="undo-source">
                  {COPY.row.source}
                </a>
              </>
            ) : null}
          </p>
          <IssueChips keys={row.issues} />
          {hasOrder ? <OrderDisclosure row={row} /> : null}
          <p className="undo-why">{whyOf(row)}</p>
          {row.unsure ? (
            <p className="undo-auto">{COPY.unconfirmed}</p>
          ) : !row.reviewed ? (
            <p className="undo-auto">{COPY.auto}</p>
          ) : null}
        </div>
      </details>
    </li>
  );
}

// A list of rows shows its first page and grows by a page on request, so an open group is never
// three hundred rows at once. The page resets when the rows change (a new search or filter).
function PagedItems({
  items,
  variant,
  signed,
  onToggle,
}: {
  items: SlimRow[];
  variant: Variant;
  signed?: ReadonlySet<string>;
  onToggle?: (id: string) => void;
}) {
  const [shown, setShown] = useState(PAGE);
  const [seen, setSeen] = useState(items);
  if (seen !== items) {
    setSeen(items);
    setShown(PAGE);
  }
  const page = items.slice(0, shown);
  const rest = items.length - page.length;
  return (
    <>
      <ul className="undo-items">
        {page.map((r) => (
          <Item key={r.id} row={r} variant={variant} signed={signed?.has(r.id)} onToggle={onToggle} />
        ))}
      </ul>
      {rest > 0 ? (
        <button type="button" className="undo-more" onClick={() => setShown(shown + PAGE)}>
          {COPY.list.showMore(Math.min(rest, PAGE), rest)}
        </button>
      ) : null}
    </>
  );
}

function SubHead({ label, count }: { label: string; count: number }) {
  return (
    <h3 className="undo-subhead">{COPY.groups.titled(label, count)}</h3>
  );
}

// One list of rows in the order the sort control names. Newest first and oldest first are one plain
// list by date. By signing order, the rows a Forward Order revokes sit under that order, in the
// orders' own sequence; a section no order reaches (already done, just in) stays a list by date.
function Rows({
  rows,
  variant,
  sort,
  orders,
  signed,
  onToggle,
}: {
  rows: SlimRow[];
  variant: Variant;
  sort: PenSort;
  orders?: ForwardOrderView[];
  signed?: ReadonlySet<string>;
  onToggle?: (id: string) => void;
}) {
  const list = (items: SlimRow[]) => <PagedItems items={items} variant={variant} signed={signed} onToggle={onToggle} />;
  if (sort === 'bundle' && orders) {
    return (
      <>
        {groupByBundle(rows, orders, COPY.field.unbundled).map((g) => (
          <div key={g.key} className="undo-group">
            <SubHead label={g.label} count={g.rows.length} />
            {list(g.rows)}
          </div>
        ))}
      </>
    );
  }
  return list(sortByDate(rows, sort === 'oldest' ? 'oldest' : 'newest'));
}

// /undo/all: every executive action a pen reaches, one row each, searchable, filtered by who feels
// it and sorted by one control; each section closed until tapped and each open list paged. The
// ticks are the same ticks as the front page. Executive actions only since 2026-11-08: the rows
// that arrive are the pen rows, so the sections a pen does not reach are gone.
export default function UndoAll({
  rows,
  penInForce,
  orders,
}: {
  rows: SlimRow[];
  penInForce: number;
  orders: ForwardOrderView[];
}) {
  const [query, setQuery] = useState('');
  const [issue, setIssue] = useState<IssueKey | null>(null);
  const [sort, setSort] = useState<PenSort>(PEN_SORTS[0]);
  const [signed, setSigned] = useState<Set<string>>(() => new Set());
  // The issue filters sit behind one control on a phone, so the rows come first; on a wide screen
  // the stylesheet shows them always and hides the control.
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    // Reading storage must wait for the browser, so this one setState in an effect is deliberate.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSigned(new Set(readSigned()));
  }, []);

  function toggle(id: string) {
    const next = new Set(signed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSigned(next);
    writeSigned([...next]);
  }

  // Chip counts are taken over the rows still standing that the search leaves, so a chip's number
  // is what its click shows in "To undo" and matches the bar for the same issue on /undo.
  const issueCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of rows) {
      if (!isPenInForce(r) || !matchesQuery(r, query)) continue;
      for (const k of new Set(r.issues ?? [])) counts[k] = (counts[k] ?? 0) + 1;
    }
    return counts;
  }, [rows, query]);

  const view = useMemo(() => {
    const hit = rows.filter((r) => matchesQuery(r, query) && (issue === null || !!r.issues?.includes(issue)));
    return {
      shown: hit.length,
      lunchRows: hit.filter(isPenInForce),
      done: hit.filter(isAlreadyDone),
      // A commemorative proclamation stays in its own group even if a ruling marks it leave.
      leave: hit.filter((r) => isLeave(r) && !isCeremonial(r)),
      justIn: hit.filter(isJustIn),
      ceremonial: hit.filter(isCeremonial),
    };
  }, [rows, query, issue]);
  // Anonymous usage (2026-11-07): a search is logged once typing pauses, with how many rows it found.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const t = setTimeout(() => {
      track('undo', 'search', { query: q.slice(0, 200), results: rows.filter((r) => matchesQuery(r, q)).length });
    }, 1200);
    return () => clearTimeout(t);
  }, [query, rows]);

  function chooseSort(value: PenSort) {
    setSort(value);
    track('undo', 'sort', { sort: value, page: 'all' });
  }

  function chooseIssue(key: IssueKey | null) {
    setIssue(key);
    track('undo', 'filter', { issue: key ?? 'all', page: 'all' });
  }

  const restCount = view.done.length + view.justIn.length + view.leave.length + view.ceremonial.length;

  const activeIds = useMemo(() => new Set(rows.filter(isPenInForce).map((r) => r.id)), [rows]);
  let signedCount = 0;
  for (const id of signed) if (activeIds.has(id)) signedCount += 1;

  return (
    <>
      <section className="undo-section" aria-labelledby="undo-tools-h">
        <div className="wrap">
          <h2 id="undo-tools-h" className="sr-only">
            {COPY.search.label}
          </h2>
          <div className="undo-tools">
            <div className="undo-search">
              <label htmlFor="undo-search-input" className="undo-filter-legend">
                {COPY.search.label}
              </label>
              <input
                id="undo-search-input"
                type="search"
                className="undo-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={COPY.search.placeholder}
                autoComplete="off"
              />
            </div>
            <fieldset className="undo-sort">
              <legend className="undo-filter-legend">{COPY.sort.label}</legend>
              <div className="undo-sort-opts">
                {PEN_SORTS.map((value) => (
                  <label key={value} className="undo-sort-opt">
                    <input
                      type="radio"
                      name="undo-sort"
                      className="undo-sort-input"
                      checked={sort === value}
                      onChange={() => chooseSort(value)}
                    />
                    <span className="undo-sort-text">{COPY.sort[value]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div className={`undo-filters${filtersOpen ? ' is-open' : ''}`}>
            <button
              type="button"
              className="undo-fchips-toggle"
              aria-expanded={filtersOpen}
              aria-controls="undo-fchips"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              {COPY.issues.toggle(issue ? ISSUE_BY_KEY[issue].label : undefined)}
            </button>
            <div role="group" aria-labelledby="undo-issue-legend" id="undo-fchips">
              <span id="undo-issue-legend" className="undo-filter-legend">
                {COPY.issues.filterLabel}
              </span>
              <div className="undo-fchips">
                <button type="button" className="undo-fchip" aria-pressed={issue === null} onClick={() => chooseIssue(null)}>
                  {COPY.issues.all}
                </button>
                {ISSUES.map((i) => {
                  const n = issueCounts[i.key] ?? 0;
                  return (
                    <button
                      key={i.key}
                      type="button"
                      className="undo-fchip"
                      aria-pressed={issue === i.key}
                      disabled={n === 0 && issue !== i.key}
                      onClick={() => chooseIssue(issue === i.key ? null : i.key)}
                    >
                      {i.label}
                      <span className="undo-fchip-n">{n.toLocaleString('en-US')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="undo-count" role="status" aria-live="polite">
            {COPY.search.count(view.lunchRows.length, penInForce)}. {COPY.strip.signedOf(signedCount, penInForce)}.
          </p>
          {rows.length === 0 ? (
            <p className="undo-empty">{COPY.search.noRows}</p>
          ) : view.shown === 0 ? (
            <p className="undo-empty">{COPY.search.empty}</p>
          ) : null}
        </div>
      </section>

      {/* THE LIST: the executive actions still standing, open, so the sort and the filter visibly move it */}
      {view.lunchRows.length > 0 ? (
        <section className="undo-section undo-section-ruled" aria-labelledby="undo-standing-h">
          <div className="wrap">
            <h2 id="undo-standing-h" className="undo-h2">
              {COPY.groups.titled(COPY.groups.standing, view.lunchRows.length)}
            </h2>
            <p className="undo-intro">{COPY.groups.standingIntro}</p>
            <Rows rows={view.lunchRows} orders={orders} variant="check" sort={sort} signed={signed} onToggle={toggle} />
          </div>
        </section>
      ) : null}

      {/* THE REST: what a pen reached that needs no signature now, behind one tap */}
      {restCount > 0 ? (
        <section className="undo-section undo-section-ruled" aria-labelledby="undo-rest-h">
          <div className="wrap">
            {/* Opens on its own only for a typed search, which may hit a row in here; an issue pick
                narrows the list above and leaves this closed until tapped. */}
            <details className="undo-fold undo-rest" open={query.trim() !== '' || undefined}>
              <summary className="undo-fold-summary">
                <h2 id="undo-rest-h" className="undo-h2">
                  {COPY.groups.rest(restCount)}
                </h2>
              </summary>
              <p className="undo-intro">{COPY.groups.restIntro(rows.length)}</p>
              {(
                [
                  [COPY.groups.done, COPY.done.intro, view.done],
                  [COPY.groups.justIn, COPY.justIn.intro, view.justIn],
                  [COPY.groups.leave, COPY.leave.intro, view.leave],
                  [COPY.groups.ceremonial, COPY.ceremonial.intro, view.ceremonial],
                ] as const
              ).map(([label, intro, items]) =>
                items.length > 0 ? (
                  <div key={label} className="undo-group">
                    <SubHead label={label} count={items.length} />
                    <p className="undo-intro">{intro}</p>
                    <Rows rows={items} variant="done" sort={sort} />
                  </div>
                ) : null,
              )}
            </details>
          </div>
        </section>
      ) : null}
    </>
  );
}
