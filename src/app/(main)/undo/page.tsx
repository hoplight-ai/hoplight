import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { COPY } from '@/lib/undo/copy';
import { loadUndo } from '@/lib/undo/load';
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

export default async function UndoPage() {
  const data = await loadUndo();

  return (
    <>
      {/* HERO, THE KEY, THE FILTER, THE ORDERS: one client tree, because the field, the strip and
          the ticks share one set of signed ids. The full list is its own page, /undo/all. */}
      <UndoList rows={data.slim} penInForce={data.penInForce} locked={data.locked} orders={data.orders} />

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

      {/* EVERY ITEM, ON ITS OWN PAGE */}
      <section className="undo-section undo-section-ruled" aria-labelledby="undo-all-h">
        <div className="wrap undo-all-link">
          <h2 id="undo-all-h" className="undo-h2">
            {COPY.all.title}
          </h2>
          <p className="undo-intro">{COPY.all.intro(data.total)}</p>
          <a className="btn btn-ghost" href="/undo/all">
            {COPY.all.link(data.total)}
          </a>
        </div>
      </section>

      {/* SOURCES AND METHOD, closed until tapped */}
      <section className="undo-section undo-section-ruled" aria-labelledby="undo-method-h">
        <div className="wrap">
          <details className="undo-fold">
            <summary className="undo-fold-summary">
              <h2 id="undo-method-h" className="undo-h2">
                Sources and method
              </h2>
            </summary>
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
                  {data.reviewed.toLocaleString('en-US')} {data.reviewed === 1 ? 'row has' : 'rows have'} been
                  placed by a reviewer. {data.auto.toLocaleString('en-US')} {data.auto === 1 ? 'row is' : 'rows are'}{' '}
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
                  {data.feedOk
                    ? 'The Federal Register feed answered.'
                    : 'The Federal Register feed did not answer; this render shows curated rows only.'}
                  {data.newest ? ` Newest row on the list: ${data.newest}.` : ''}
                </dd>
              </div>
            </dl>
          </details>
        </div>
      </section>
    </>
  );
}
