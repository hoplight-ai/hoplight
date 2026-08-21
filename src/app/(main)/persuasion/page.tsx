import type { Metadata } from 'next';
import PmeContent from './PmeContent';
import { FACTS } from '@/lib/facts';

export const metadata: Metadata = {
  title: 'Persuasion',
  // Reads FACTS rather than carrying its own copy. This string previously said "3,000-person",
  // where every other surface says 3,006 — a round number in a metadata description is what search
  // results and link previews show, and it makes the reader wonder what else got rounded.
  description: `Message infrastructure that matches the frame to the listener's psychology, not their demographics. Validated in a ${FACTS.rct.n}-person ${FACTS.rct.method}, ${FACTS.rct.matchRate} matched to the voter file.`,
  alternates: { canonical: '/persuasion' },
  openGraph: {
    title: 'Persuasion - Hoplight',
    description: 'The human-generated progressive frame produces identity backlash with the voters who decide elections. We built the engine the other way around.',
    url: 'https://hoplight.ai/persuasion',
  },
};

export default function PersuasionPage() {
  return <PmeContent />;
}
