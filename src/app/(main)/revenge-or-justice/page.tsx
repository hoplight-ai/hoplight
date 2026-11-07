import type { Metadata } from 'next';
import { Newsreader } from 'next/font/google';
import { toolMetadata } from '@/lib/metadata';
import ToolFeedback from '@/components/ToolFeedback';
import RevengeOrJustice from './RevengeOrJustice';

// The serif has exactly one job on this page: the words quoted from the pasted text, so the eye knows
// which voice it is reading. Nothing else on the site uses it.
const newsreader = Newsreader({ subsets: ['latin'], weight: ['400'], variable: '--font-newsreader', display: 'swap' });

export const metadata: Metadata = toolMetadata('revenge-or-justice', {
  title: 'Revenge or Justice',
  description:
    'Paste a press release, a quote or an article. It says whether the words sound like revenge or justice, shows the words it judged, and rewrites the passage so it lands.',
  path: '/revenge-or-justice',
  ogDescription: 'Does it sound like revenge or justice? Paste it and see.',
});

export default function Page() {
  return (
    <div className={newsreader.variable}>
      <RevengeOrJustice />
      {/* The usage note is already in the tool's own foot line, so the box leaves it out. */}
      <ToolFeedback tool="revenge-or-justice" note={false} align="rj" />
    </div>
  );
}
