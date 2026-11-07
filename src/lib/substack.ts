// Whit's latest Substack posts, read from the public feed for the Writing section of /insights.
// PORTSPLIT1 round two, Whit, 2026-11-07: "the reports need to live more as ... a research section of the
// website or something may be tied into my writings or like a blog or a Substack connection."
//
// The page revalidates hourly, and the fetch asks Next to cache the feed for the same hour. If the feed
// fails, answers with no posts, or cannot be read, the page keeps the hand-kept list in
// src/lib/insights-content.ts, so Writing is never empty.
//
// Imported by the page and by scripts/insights-writing.test.mjs under plain node, so this file keeps to
// erasable TypeScript and its one import is a type. The test passes its own fetch and a saved copy of the
// feed; it never reaches the network.

import type { InsightItem } from './insights-content';

export const FEED = 'https://whitpendergast.substack.com/feed';
const ORIGIN = 'https://whitpendergast.substack.com/';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** How many posts Writing shows at most. */
export const WRITING_LIMIT = 6;

function text(block: string, tag: string): string | undefined {
  const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!m) return undefined;
  const raw = m[1].trim();
  const cdata = raw.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  const value = cdata
    ? cdata[1]
    : raw
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&amp;/g, '&');
  return value.trim() || undefined;
}

/** The feed's posts as Writing cards, newest first. Dates are the day in UTC, as Substack shows them. */
export function parseFeed(xml: string, limit: number = WRITING_LIMIT): InsightItem[] {
  const items: (InsightItem & { at: number })[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const title = text(m[1], 'title');
    const href = text(m[1], 'link');
    const at = Date.parse(text(m[1], 'pubDate') ?? '');
    if (!title || !href || !href.startsWith(ORIGIN) || Number.isNaN(at)) continue;
    const d = new Date(at);
    items.push({
      kind: 'Essay',
      title,
      line: 'Substack',
      href,
      external: true,
      iso: d.toISOString().slice(0, 10),
      shown: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`,
      at,
    });
  }
  return items
    .sort((a, b) => b.at - a.at)
    .slice(0, limit)
    .map(({ at: _at, ...item }) => item);
}

type Fetcher = (url: string, init: RequestInit & { next?: { revalidate: number } }) => Promise<Response>;

/** The latest posts from the feed, or `fallback` when the feed cannot give any. */
export async function latestWriting(fallback: InsightItem[], fetcher: Fetcher = fetch as Fetcher): Promise<InsightItem[]> {
  try {
    const res = await fetcher(FEED, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return fallback;
    const items = parseFeed(await res.text());
    return items.length > 0 ? items : fallback;
  } catch {
    return fallback;
  }
}
