import type { Metadata } from 'next';
import { Newsreader } from 'next/font/google';
import { pageMetadata } from '@/lib/metadata';
import RevengeOrJustice from './RevengeOrJustice';

// The serif has exactly one job on this page: the words quoted from the pasted text, so the eye knows
// which voice it is reading. Nothing else on the site uses it.
const newsreader = Newsreader({ subsets: ['latin'], weight: ['400'], variable: '--font-newsreader', display: 'swap' });

export const metadata: Metadata = pageMetadata({
  title: 'Revenge or Justice',
  description:
    'Paste a press release, a quote or an article. It says whether the words sound like revenge or justice, shows the words it judged, and rewrites the passage so it lands.',
  path: '/revenge-or-justice',
  ogDescription: 'Does it sound like revenge or justice? Paste it and see.',
  image: {
    url: 'https://hoplight.ai/api/og?title=Revenge+or+Justice&sub=Does+it+sound+like+revenge+or+justice%3F+Paste+it+and+see.',
    width: 1200,
    height: 630,
    alt: 'Revenge or Justice - Hoplight',
  },
});

export default function Page() {
  return (
    <div className={newsreader.variable}>
      <RevengeOrJustice />
    </div>
  );
}
