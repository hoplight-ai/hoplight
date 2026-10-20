'use client';

import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { INSTRUMENT_LABEL } from '@/lib/undo/types';
import type { Instrument } from '@/lib/undo/types';
import { COPY } from '@/lib/undo/copy';
import { orderText } from '@/lib/undo/order-text';
import { ISSUES, ISSUE_BY_KEY } from '@/lib/undo/issues';
import type { IssueKey } from '@/lib/undo/issues';
import { groupByIssue } from '@/lib/undo/issues-merge';
import type { ForwardOrderView } from '@/lib/undo/forward-text';
import {
  groupByInstrument,
  groupPen,
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
import type { Group, SlimRow } from '@/lib/undo/sections';
import CopyButton from './CopyButton';
import IssueChips from './IssueChips';
import { readSigned, safeId, writeSigned } from './signed';

const ORDER_INSTRUMENTS: Instrument[] = ['executive_order', 'proclamation', 'memorandum'];
const PAGE = 25;

type Variant = 'check' | 'hollow' | 'flat' | 'done';

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
  const tag = variant === 'check' || variant === 'hollow' ? tagOf(row.bucket) : null;

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
      ) : variant === 'hollow' ? (
        <span className="undo-glyph" aria-hidden="true" />
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
          {variant === 'check' || variant === 'hollow' ? <p className="undo-how">{howOf(row)}</p> : null}
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
    <h3 className="undo-subhead">
      {label} <span className="undo-subcount">{count.toLocaleString('en-US')}</span>
    </h3>
  );
}

// A section of the list: closed until tapped, open on its own while a search or filter runs.
function Fold({
  id,
  title,
  count,
  forceOpen,
  children,
}: {
  id: string;
  title: string;
  count: number;
  forceOpen: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="undo-section undo-section-ruled" aria-labelledby={id}>
      <div className="wrap">
        <details className="undo-fold" open={forceOpen || undefined}>
          <summary className="undo-fold-summary">
            <h2 id={id} className="undo-h2">
              {title}
            </h2>
            <span className="undo-subcount">{count.toLocaleString('en-US')}</span>
          </summary>
          {children}
        </details>
      </div>
    </section>
  );
}

type SortMode = 'newest' | 'issue';

// One list of rows. Newest first, it is a plain list, or the groups the section already had (the
// instrument groups). By issue, every row sits under its first issue only, so no count doubles.
function Rows({
  rows,
  variant,
  groups,
  byIssue,
  nested,
  signed,
  onToggle,
}: {
  rows: SlimRow[];
  variant: Variant;
  groups?: Group<SlimRow>[];
  byIssue: boolean;
  nested?: boolean;
  signed?: ReadonlySet<string>;
  onToggle?: (id: string) => void;
}) {
  const list = (items: SlimRow[]) => <PagedItems items={items} variant={variant} signed={signed} onToggle={onToggle} />;
  if (byIssue) {
    return (
      <>
        {groupByIssue(rows).map((g) => (
          <div key={g.key} className={`undo-group${nested ? ' undo-group-nested' : ''}`}>
            <SubHead label={g.key === 'none' ? COPY.issues.noIssue : ISSUE_BY_KEY[g.key].label} count={g.rows.length} />
            {list(g.rows)}
          </div>
        ))}
      </>
    );
  }
  if (groups) {
    return (
      <>
        {groups.map((g) => (
          <div key={g.key} className="undo-group">
            <SubHead label={g.label} count={g.rows.length} />
            {list(g.rows)}
          </div>
        ))}
      </>
    );
  }
  return list(rows);
}

// /undo/all: every row on its own, searchable, sorted by date or by issue, each section closed
// until tapped and each open list paged. The ticks are the same ticks as the front page.
export default function UndoAll({
  rows,
  penInForce,
}: {
  rows: SlimRow[];
  penInForce: number;
  orders: ForwardOrderView[];
}) {
  const [query, setQuery] = useState('');
  const [issue, setIssue] = useState<IssueKey | null>(null);
  const [sort, setSort] = useState<SortMode>('newest');
  const [signed, setSigned] = useState<Set<string>>(() => new Set());

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

  // Chip counts are taken over the rows the search leaves, so a chip's number is what its click shows.
  const issueCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of rows) {
      if (!matchesQuery(r, query)) continue;
      for (const k of new Set(r.issues ?? [])) counts[k] = (counts[k] ?? 0) + 1;
    }
    return counts;
  }, [rows, query]);

  const view = useMemo(() => {
    const hit = rows.filter((r) => matchesQuery(r, query) && (issue === null || !!r.issues?.includes(issue)));
    const lunchRows = hit.filter(isPenInForce);
    const lockedRows = hit.filter((r) => r.bucket === 'locked' && !isLeave(r));
    return {
      shown: hit.length,
      lunchRows,
      lunch: groupPen(lunchRows),
      year: hit.filter((r) => r.bucket === 'pen-process' && !isAlreadyDone(r) && !isLeave(r)),
      majority: hit.filter((r) => r.bucket === 'majority' && !isLeave(r)),
      sixty: hit.filter((r) => r.bucket === 'sixty' && !isLeave(r)),
      lockedRows,
      locked: groupByInstrument(lockedRows, INSTRUMENT_LABEL),
      done: hit.filter(isAlreadyDone),
      // A commemorative proclamation stays in its own group even if a ruling marks it leave.
      leave: hit.filter((r) => isLeave(r) && !isCeremonial(r)),
      justIn: hit.filter(isJustIn),
      ceremonial: hit.filter(isCeremonial),
    };
  }, [rows, query, issue]);

  const byIssue = sort === 'issue';
  const searching = query.trim() !== '' || issue !== null;
  const congressCount = view.majority.length + view.sixty.length;

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
              <legend className="undo-filter-legend">{COPY.issues.sortLabel}</legend>
              <div className="undo-sort-opts">
                {(
                  [
                    ['newest', COPY.issues.newest],
                    ['issue', COPY.issues.byIssue],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="undo-sort-opt">
                    <input
                      type="radio"
                      name="undo-sort"
                      className="undo-sort-input"
                      checked={sort === value}
                      onChange={() => setSort(value)}
                    />
                    <span className="undo-sort-text">{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="undo-filters">
            <div role="group" aria-labelledby="undo-issue-legend">
              <span id="undo-issue-legend" className="undo-filter-legend">
                {COPY.issues.filterLabel}
              </span>
              <div className="undo-fchips">
                <button type="button" className="undo-fchip" aria-pressed={issue === null} onClick={() => setIssue(null)}>
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
                      onClick={() => setIssue(issue === i.key ? null : i.key)}
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
            {COPY.search.count(view.shown, rows.length)}. {COPY.strip.signedOf(signedCount, penInForce)}.
          </p>
          {rows.length === 0 ? (
            <p className="undo-empty">{COPY.search.noRows}</p>
          ) : view.shown === 0 ? (
            <p className="undo-empty">{COPY.search.empty}</p>
          ) : null}
        </div>
      </section>

      {view.lunchRows.length > 0 ? (
        <Fold id="undo-lunch-h" title={COPY.lunch.title} count={view.lunchRows.length} forceOpen={searching}>
          <p className="undo-intro">{COPY.lunch.intro}</p>
          <Rows rows={view.lunchRows} groups={view.lunch} variant="check" byIssue={byIssue} signed={signed} onToggle={toggle} />
        </Fold>
      ) : null}

      {view.year.length > 0 ? (
        <Fold id="undo-year-h" title={COPY.thisYear.title} count={view.year.length} forceOpen={searching}>
          <p className="undo-intro">{COPY.thisYear.intro}</p>
          <Rows rows={view.year} variant="hollow" byIssue={byIssue} />
        </Fold>
      ) : null}

      {congressCount > 0 ? (
        <Fold id="undo-congress-h" title={COPY.congress.title} count={congressCount} forceOpen={searching}>
          {view.majority.length > 0 ? (
            <div className="undo-group">
              <SubHead label={COPY.congress.majority.title} count={view.majority.length} />
              <p className="undo-intro">{COPY.congress.majority.intro}</p>
              <Rows rows={view.majority} variant="hollow" byIssue={byIssue} nested />
            </div>
          ) : null}
          {view.sixty.length > 0 ? (
            <div className="undo-group">
              <SubHead label={COPY.congress.sixty.title} count={view.sixty.length} />
              <p className="undo-intro">{COPY.congress.sixty.intro}</p>
              <Rows rows={view.sixty} variant="hollow" byIssue={byIssue} nested />
            </div>
          ) : null}
        </Fold>
      ) : null}

      {view.lockedRows.length > 0 ? (
        <Fold id="undo-locked-h" title={COPY.locked.title} count={view.lockedRows.length} forceOpen={searching}>
          <p className="undo-intro">{COPY.locked.intro}</p>
          <Rows rows={view.lockedRows} groups={view.locked} variant="flat" byIssue={byIssue} />
        </Fold>
      ) : null}

      {view.done.length > 0 ? (
        <Fold id="undo-done-h" title={COPY.done.title} count={view.done.length} forceOpen={searching}>
          <p className="undo-intro">{COPY.done.intro}</p>
          <Rows rows={view.done} variant="done" byIssue={byIssue} />
        </Fold>
      ) : null}

      {view.justIn.length > 0 ? (
        <Fold id="undo-justin-h" title={COPY.justIn.title} count={view.justIn.length} forceOpen={searching}>
          <p className="undo-intro">{COPY.justIn.intro}</p>
          <Rows rows={view.justIn} variant="done" byIssue={byIssue} />
        </Fold>
      ) : null}

      {view.leave.length > 0 ? (
        <Fold id="undo-leave-h" title={COPY.leave.title} count={view.leave.length} forceOpen={searching}>
          <p className="undo-intro">{COPY.leave.intro}</p>
          <Rows rows={view.leave} variant="done" byIssue={byIssue} />
        </Fold>
      ) : null}

      {view.ceremonial.length > 0 ? (
        <Fold id="undo-ceremonial-h" title={COPY.ceremonial.title} count={view.ceremonial.length} forceOpen={searching}>
          <p className="undo-intro">{COPY.ceremonial.intro}</p>
          <Rows rows={view.ceremonial} variant="done" byIssue={byIssue} />
        </Fold>
      ) : null}
    </>
  );
}
