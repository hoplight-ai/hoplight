import type { Metadata } from 'next';
import { Newsreader } from 'next/font/google';
import { toolMetadata } from '@/lib/metadata';
import ToolFeedback from '@/components/ToolFeedback';
import RevengeOrJustice from './RevengeOrJustice';
import { cardItem, feedThroughCopy } from '@/lib/rj-cache';

// The serif has exactly one job on this page: the words quoted from the pasted text, so the eye knows
// which voice it is reading. Nothing else on the site uses it.
const newsreader = Newsreader({ subsets: ['latin'], weight: ['400'], variable: '--font-newsreader', display: 'swap' });

export const metadata: Metadata = toolMetadata('revenge-or-justice', {
  title: 'Revenge or Justice',
  description:
    'Investigations win when voters can see what they get and backfire when they sound like a vendetta. A test built from thirteen that won or failed, 1905 to 2021, reads what an official says about an investigation, scores it and rewrites it so it lands.',
  path: '/revenge-or-justice',
  ogDescription: 'A test built from thirteen investigations that won or backfired. Paste what an official says and see whether voters will hear justice or a vendetta.',
});

// The headline list arrives with the page (lane RJFAST1, 2026-11-10; Whit: "the articles take forever to load").
// The page is drawn from the list's shared copy (src/lib/rj-cache.ts, fifteen minutes) and drawn again at most
// every five minutes, so it is never staler than the list's own refresh, and a reading kept since shows on its
// card. A build with no site pair draws no list, and the page script fetches it as before.
export const revalidate = 300;

const FEED_UPSTREAM = (process.env.RJ_UPSTREAM_ORIGIN || 'https://quick-tools-pi.vercel.app') + '/api/justice-feed';

function siteAuth(): string | null {
  const u = process.env.PRIVATE_SITE_USER;
  const p = process.env.PRIVATE_SITE_PASSWORD;
  if (!u || !p) return null;
  return 'Basic ' + Buffer.from(u + ':' + p).toString('base64');
}

export default async function Page() {
  const feed = await feedThroughCopy(FEED_UPSTREAM, siteAuth());
  return (
    <div className={newsreader.variable}>
      <RevengeOrJustice items={feed.body.items.map(cardItem)} source={feed.source} />
      {/* The usage note is already in the tool's own foot line, so the box leaves it out. */}
      <ToolFeedback tool="revenge-or-justice" note={false} align="rj" />
    </div>
  );
}
