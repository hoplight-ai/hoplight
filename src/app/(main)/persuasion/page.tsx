import type { Metadata } from 'next';
import PmeContent from './PmeContent';

export const metadata: Metadata = {
  title: 'Persuasion',
  description: 'Message infrastructure that matches the frame to the listener\'s psychology, not their demographics. Validated in a 3,000-person voter-file-matched RCT.',
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
