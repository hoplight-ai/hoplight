import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { COPY } from '@/lib/undo/copy';
import { loadUndo } from '@/lib/undo/load';
import UndoAll from '../UndoAll';

// Rebuilt at most once an hour, like /undo.
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: 'The Undo List, every item',
  description:
    'Every action of the second Trump administration on its own row, with the exact sentence that undoes it, searchable and sorted by who feels it.',
  path: '/undo/all',
  image: {
    url: 'https://hoplight.ai/api/og?title=The+Undo+List&sub=Every+item%2C+one+by+one',
    width: 1200,
    height: 630,
    alt: 'The Undo List, every item - Hoplight',
  },
});

export default async function UndoAllPage() {
  const data = await loadUndo();
  return (
    <>
      <div className="page-hero undo-hero undo-hero-all" id="undo-hero">
        <div className="wrap">
          <a className="undo-back" href="/undo">
            {COPY.all.back}
          </a>
          <h1>{COPY.all.title}</h1>
          <p className="undo-hero-read">{COPY.all.intro(data.total)}</p>
        </div>
      </div>
      <UndoAll rows={data.slim} penInForce={data.penInForce} orders={data.orders} />
    </>
  );
}
