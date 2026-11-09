import type { Metadata } from 'next';
import { toolMetadata } from '@/lib/metadata';
import { COPY } from '@/lib/undo/copy';
import { loadUndo } from '@/lib/undo/load';
import UndoAll from '../UndoAll';
import ToolFeedback from '@/components/ToolFeedback';

// Rebuilt at most once an hour, like /undo.
export const revalidate = 3600;

export const metadata: Metadata = toolMetadata('undo', {
  title: 'The Undo List, every executive action',
  name: 'The Undo List',
  description:
    'Every executive action of the second Trump administration that a pen undoes, one row each, with the exact sentence that undoes it. Search it, filter it by who feels it, sort it by date or by signing order.',
  path: '/undo/all',
  ogDescription: 'Every Trump executive action a pen undoes, one by one, with the sentence that undoes it.',
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
          <p className="undo-hero-read">{COPY.all.intro(data.penInForce)}</p>
        </div>
      </div>
      <UndoAll rows={data.slim} penInForce={data.penInForce} orders={data.orders} />
      <ToolFeedback tool="undo" />
    </>
  );
}
