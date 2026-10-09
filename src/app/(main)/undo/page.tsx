import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { BUCKETS } from '@/lib/undo/types';
import type { Bucket, Ruling } from '@/lib/undo/types';
import { applyRulings } from '@/lib/undo/classify';
import { COPY } from '@/lib/undo/copy';
import { countLocked, countPenInForce, slimRow } from '@/lib/undo/sections';
import { fetchFederalRegisterRows } from '@/lib/undo/federal-register';
import rulingsJson from '@/data/undo/rulings.json';
import curatedJson from '@/data/undo/curated.json';
import CopyButton from './CopyButton';
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
  const penInForce = countPenInForce(rows);
  const locked = countLocked(rows);
  // Rows nobody reviewed ship without their boilerplate how/why (the client derives it from the
  // instrument), and without fields the page does not draw. The text still renders on the server.
  const slim = rows.map(slimRow);

  return (
    <>
      {/* HERO */}
      <div className="page-hero" id="undo-hero">
        <div className="wrap">
          <span className="label">{COPY.hero.label}</span>
          <h1>{COPY.hero.title}</h1>
          {COPY.hero.lead.map((t) => (
            <p key={t}>{t}</p>
          ))}
          <div className="undo-hero-nums">
            <div className="undo-hero-stat">
              <span className="undo-hero-num">{penInForce.toLocaleString('en-US')}</span>
              <span className="undo-hero-label">{COPY.hero.penNumberLabel}</span>
            </div>
            <div className="undo-hero-stat">
              <span className="undo-hero-num">{locked.toLocaleString('en-US')}</span>
              <span className="undo-hero-label">{COPY.hero.lockedNumberLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* STRIP + THE LIST */}
      <UndoList rows={slim} penInForce={penInForce} />

      {/* CLOSING CALL TO ACTION */}
      <section className="close-cta slate undo-cta" aria-labelledby="undo-cta-h">
        <div className="wrap">
          <h2 id="undo-cta-h">{COPY.cta.title}</h2>
          <p className="cl-sub">{COPY.cta.body}</p>
          <div className="btn-row">
            <CopyButton
              label={COPY.cta.copyLink}
              copiedLabel={COPY.cta.copied}
              className="btn btn-primary"
            />
            <a className="btn btn-ghost" href={COPY.cta.mailto}>
              {COPY.cta.correction}
            </a>
          </div>
        </div>
      </section>

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
              <dt>{COPY.sources.ticksLabel}</dt>
              <dd>{COPY.sources.ticks}</dd>
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
