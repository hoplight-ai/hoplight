'use client';

import { useMemo, useState } from 'react';
import { BUCKETS, INSTRUMENT_LABEL } from '@/lib/undo/types';
import type { Bucket, Instrument, Status, UndoRow } from '@/lib/undo/types';
import { countByBucket } from '@/lib/undo/classify';

type StatusFilter = 'all' | 'in-force' | 'blocked' | 'revoked' | 'pending';

const BUCKET_ORDER = (Object.keys(BUCKETS) as Bucket[]).sort((a, b) => BUCKETS[a].order - BUCKETS[b].order);

const STATUS_GROUPS: Record<Exclude<StatusFilter, 'all'>, Status[]> = {
  'in-force': ['in-force'],
  blocked: ['enjoined', 'vacated', 'struck'],
  revoked: ['revoked', 'expired'],
  pending: ['pending'],
};

const STATUS_LABEL: Record<StatusFilter, string> = {
  all: 'All',
  'in-force': 'In force',
  blocked: 'Blocked or struck',
  revoked: 'Revoked or expired',
  pending: 'Pending',
};

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className="undo-chip" aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
}

export default function UndoList({ rows }: { rows: UndoRow[] }) {
  const [bucket, setBucket] = useState<Bucket | 'all'>('all');
  const [instrument, setInstrument] = useState<Instrument | 'all'>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [reviewedOnly, setReviewedOnly] = useState(false);
  const [query, setQuery] = useState('');

  const counts = useMemo(() => countByBucket(rows), [rows]);

  const instruments = useMemo(() => {
    const present = new Set<Instrument>(rows.map((r) => r.instrument));
    return (Object.keys(INSTRUMENT_LABEL) as Instrument[]).filter((i) => present.has(i));
  }, [rows]);

  const hasPending = useMemo(() => rows.some((r) => r.status === 'pending'), [rows]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (bucket !== 'all' && r.bucket !== bucket) return false;
      if (instrument !== 'all' && r.instrument !== instrument) return false;
      if (status !== 'all' && !STATUS_GROUPS[status].includes(r.status)) return false;
      if (reviewedOnly && !r.reviewed) return false;
      if (q && !r.title.toLowerCase().includes(q) && !(r.number ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, bucket, instrument, status, reviewedOnly, query]);

  const filtered = bucket !== 'all' || instrument !== 'all' || status !== 'all' || reviewedOnly || query.trim() !== '';

  function reset() {
    setBucket('all');
    setInstrument('all');
    setStatus('all');
    setReviewedOnly(false);
    setQuery('');
  }

  return (
    <>
      {/* BUCKET BAND: the five columns are the bucket filter */}
      <section className="slate undo-band" aria-label="Rows by what it takes to undo them">
        <div className="wrap">
          <div className="undo-band-grid" role="group" aria-label="Filter by bucket">
            {BUCKET_ORDER.map((b) => (
              <button
                key={b}
                type="button"
                className="undo-band-col"
                data-bucket={b}
                aria-pressed={bucket === b}
                onClick={() => setBucket(bucket === b ? 'all' : b)}
              >
                <span className="undo-band-num">{counts[b].toLocaleString('en-US')}</span>
                <span className="undo-band-text">
                  <span className="undo-band-label">{BUCKETS[b].label}</span>
                  <span className="undo-band-line">{BUCKETS[b].line}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FILTERS AND LIST */}
      <section className="undo-section" aria-label="The list">
        <div className="wrap">
          <div className="undo-filters">
            <div className="undo-search">
              <label htmlFor="undo-search-input" className="undo-filter-legend">
                Search title or number
              </label>
              <input
                id="undo-search-input"
                type="search"
                className="undo-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tariff, EO 14148, birthright"
                autoComplete="off"
              />
            </div>

            <fieldset className="undo-filter">
              <legend className="undo-filter-legend">Type</legend>
              <div className="undo-chips">
                <Chip pressed={instrument === 'all'} onClick={() => setInstrument('all')}>
                  All types
                </Chip>
                {instruments.map((i) => (
                  <Chip key={i} pressed={instrument === i} onClick={() => setInstrument(i)}>
                    {INSTRUMENT_LABEL[i]}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <fieldset className="undo-filter">
              <legend className="undo-filter-legend">Status</legend>
              <div className="undo-chips">
                {(['all', 'in-force', 'blocked', 'revoked', ...(hasPending ? (['pending'] as const) : [])] as StatusFilter[]).map(
                  (s) => (
                    <Chip key={s} pressed={status === s} onClick={() => setStatus(s)}>
                      {STATUS_LABEL[s]}
                    </Chip>
                  ),
                )}
              </div>
            </fieldset>

            <fieldset className="undo-filter">
              <legend className="undo-filter-legend">Placement</legend>
              <div className="undo-chips">
                <Chip pressed={reviewedOnly} onClick={() => setReviewedOnly(!reviewedOnly)}>
                  Reviewed rows only
                </Chip>
              </div>
            </fieldset>
          </div>

          <div className="undo-count-line">
            <p className="undo-count" role="status" aria-live="polite">
              {shown.length.toLocaleString('en-US')} of {rows.length.toLocaleString('en-US')} rows
            </p>
            {filtered ? (
              <button type="button" className="undo-reset" onClick={reset}>
                Clear filters
              </button>
            ) : null}
          </div>

          {shown.length === 0 ? (
            <p className="undo-empty">
              {rows.length === 0
                ? 'There are no rows to show in this render. Check the feed status under Sources and method below.'
                : 'No row matches these filters. Clear a filter or change the search to see more of the list.'}
            </p>
          ) : (
            <ul className="undo-rows">
              {shown.map((r) => {
                const href = r.sources[0]?.url;
                return (
                  <li key={r.id} className="undo-row" data-bucket={r.bucket}>
                    <p className="undo-meta">
                      <span>{INSTRUMENT_LABEL[r.instrument]}</span>
                      {r.number ? <span>{r.number}</span> : null}
                      <span>{r.date}</span>
                    </p>
                    <p className="undo-title">
                      {href ? <a href={href}>{r.title}</a> : r.title}
                    </p>
                    <p className="undo-tags">
                      <span className="undo-bucket">{BUCKETS[r.bucket].label}</span>
                      {r.status !== 'in-force' ? (
                        <span className="undo-status">
                          <span className="sr-only">Status: </span>
                          {r.status}
                        </span>
                      ) : null}
                      {!r.reviewed ? <span className="undo-auto">auto, unreviewed</span> : null}
                    </p>
                    <p className="undo-how">{r.how}</p>
                    <p className="undo-why">{r.why}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
