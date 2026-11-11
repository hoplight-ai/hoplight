// /api/revenge-or-justice/feed: the headline list beside the grader, forwarded from quick-tools'
// /api/justice-feed (Bing News, no key; the people and the key words live in that repo's
// lib/justice-feed.mjs). Same credential pair as the grader route.
//
// RJFAST1, 2026-11-10: the list is one shared copy for every instance (src/lib/rj-cache.ts), refreshed every
// fifteen minutes behind the visitor and served stale while it refreshes, and the page draws it into its
// own HTML; this route is the page's fallback when that copy was empty. Each headline whose full reading
// the site holds is marked `held`, and fills its dial from that reading when the list carries none.
//
// POST (2026-11-06, Whit: "yes to 1 and 2", "dots on what track?"): forwards to the upstream's
// ?action=grade, which reads up to three of the listed articles that have no reading yet and keeps
// them, so the list can draw each story as a dot on the revenge-to-justice line. Each article is read
// once in its fourteen-day life, so the most a visitor can trigger is the unread remainder; a per-IP
// limit of twenty calls an hour holds a loop on one address to that.

import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { checkLimitIn, clientIp } from '@/lib/rate-limit';
import { feedThroughCopy } from '@/lib/rj-cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// RJ_UPSTREAM_ORIGIN points a local run at a stand-in for quick-tools (lane RJFAST1's renders); unset, it is quick-tools.
const UPSTREAM = (process.env.RJ_UPSTREAM_ORIGIN || 'https://quick-tools-pi.vercel.app') + '/api/justice-feed';
const PER_IP = { max: 20, windowMs: 60 * 60 * 1000 };

function auth(): string | null {
  const u = process.env.PRIVATE_SITE_USER;
  const p = process.env.PRIVATE_SITE_PASSWORD;
  if (!u || !p) return null;
  return 'Basic ' + Buffer.from(u + ':' + p).toString('base64');
}

export async function GET() {
  const a = auth();
  if (!a) return NextResponse.json({ items: [], error: 'the headline list is not configured on this site' }, { status: 503 });
  const feed = await feedThroughCopy(UPSTREAM, a);
  const status = feed.source === 'failed' ? 502 : 200;
  return NextResponse.json(feed.source === 'failed' ? { items: [], error: 'the headline list did not come back' } : feed.body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  const a = auth();
  if (!a) return NextResponse.json({ error: 'the headline list is not configured on this site' }, { status: 503 });
  if (!checkLimitIn('feed-grade-ip', clientIp(req), PER_IP.max, PER_IP.windowMs)) {
    return NextResponse.json({ error: 'That is enough headline readings from your address for an hour.' }, { status: 429 });
  }
  const res = await fetch(UPSTREAM + '?action=grade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: a },
    body: JSON.stringify({ max: 3 }),
    cache: 'no-store',
  });
  const body = await res.text();
  // The list now carries new readings: the shared copy refreshes on the next read.
  if (res.ok) revalidateTag('rj-feed', 'max');
  return new NextResponse(body, { status: res.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
