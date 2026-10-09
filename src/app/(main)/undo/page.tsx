import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { BUCKETS } from '@/lib/undo/types';
import type { Bucket, Ruling } from '@/lib/undo/types';
import { applyRulings } from '@/lib/undo/classify';
import { fetchFederalRegisterRows } from '@/lib/undo/federal-register';
import rulingsJson from '@/data/undo/rulings.json';
import curatedJson from '@/data/undo/curated.json';
import UndoList from './UndoList';

// Rebuilt at most once an hour. The Federal Register fetch inside carries the same interval.
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: 'The Undo List',
  description:
    'Every action of the second Trump administration, sorted by what it takes to undo it in 2029: a pen, a process, a majority, sixty votes, or nothing at all.',
  path: '/undo',
  image: {
    url: 'https://hoplight.ai/api/og?title=The+Undo+List&sub=Everything+Trump+did%2C+sorted+by+what+it+takes+to+undo+it',
    width: 1200,
    height: 630,
    alt: 'The Undo List - Hoplight',
  },
});

// The two curated files are written by hand and by other lanes; the cast is the one place the page
// trusts their shape, and scripts/undo-classify.test.mjs reads the same files.
const rulings = rulingsJson as unknown as Ruling[];
const curated = curatedJson as unknown as Ruling[];

const BUCKET_ORDER = (Object.keys(BUCKETS) as Bucket[]).sort((a, b) => BUCKETS[a].order - BUCKETS[b].order);

export default async function UndoPage() {
  const feed = await fetchFederalRegisterRows();
  const rows = applyRulings(feed.rows, [...rulings, ...curated]);
  const reviewed = rows.filter((r) => r.reviewed).length;
  const auto = rows.length - reviewed;
  const newest = rows.length ? rows[0].date : null;

  return (
    <>
      {/* HERO */}
      <div className="page-hero">
        <div className="wrap">
          <span className="label">Hoplight</span>
          <h1>The Undo List</h1>
          <p>
            Every action of the second Trump administration since 2025-01-20, placed in one of five
            buckets by what it would take a president sworn in on 2029-01-20 to undo it. The
            first bucket takes a pen. The last cannot be undone by anyone. Each row
            says what the next president or Congress would have to do and why the row sits in that
            bucket and not the one beside it.
          </p>
          <p>
            This is a public record compiled by Hoplight. Rows the Federal Register publishes are
            placed by instrument type until a reviewer places them, and every row says which.
          </p>
        </div>
      </div>

      {/* BUCKET BAND + FILTERS + LIST */}
      <UndoList rows={rows} />

      {/* HOW THE BUCKETS WORK */}
      <section className="undo-section" aria-labelledby="undo-buckets-h">
        <div className="wrap">
          <h2 id="undo-buckets-h" className="undo-h2">How the buckets work</h2>
          <dl className="undo-dl">
            {BUCKET_ORDER.map((b) => (
              <div key={b} className="undo-dl-row">
                <dt>{BUCKETS[b].label}</dt>
                <dd>{BUCKETS[b].line}</dd>
              </div>
            ))}
          </dl>
          <div className="undo-prose">
            <p>
              Budget reconciliation is a yearly budget process that passes the Senate with a simple
              majority instead of sixty votes. It only reaches provisions that change federal
              spending or revenue, which is why a law with a price tag can be undone by a majority
              and a pure policy statute cannot.
            </p>
            <p>
              The Congressional Review Act lets Congress overturn a federal rule by simple majority
              inside a window after the rule is finished. Rules finished after roughly late July
              2028 land in the window that opens in early 2029, so the new Congress can kill them
              without sixty votes.
            </p>
          </div>
        </div>
      </section>

      {/* SOURCES AND METHOD */}
      <section className="undo-section undo-section-ruled" aria-labelledby="undo-method-h">
        <div className="wrap">
          <h2 id="undo-method-h" className="undo-h2">Sources and method</h2>
          <dl className="undo-dl">
            <div className="undo-dl-row">
              <dt>Live feed</dt>
              <dd>
                Executive orders, proclamations and memoranda come from the Federal Register API,
                read once an hour. Each is placed in a bucket by its instrument type alone until a
                reviewer places it by hand.
              </dd>
            </div>
            <div className="undo-dl-row">
              <dt>Curated rows</dt>
              <dd>
                Statutes, Congressional Review Act repeals, judges, final rules, withdrawals,
                tariffs, personnel, pardons and court rulings are not in the feed. They are added
                by hand, and each one carries its own sources.
              </dd>
            </div>
            <div className="undo-dl-row">
              <dt>Placement</dt>
              <dd>
                {reviewed.toLocaleString('en-US')} {reviewed === 1 ? 'row has' : 'rows have'} been
                placed by a reviewer. {auto.toLocaleString('en-US')} {auto === 1 ? 'row is' : 'rows are'}{' '}
                placed by instrument type and marked auto, unreviewed. No row is hidden for being unreviewed.
              </dd>
            </div>
            <div className="undo-dl-row">
              <dt>Feed status</dt>
              <dd>
                {feed.ok
                  ? 'The Federal Register feed answered.'
                  : 'The Federal Register feed did not answer; this render shows curated rows only.'}
                {newest ? ` Newest row on the list: ${newest}.` : ''}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
