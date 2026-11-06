// /api/revenge-or-justice/feed: the headline list beside the grader, forwarded from quick-tools'
// /api/justice-feed (Bing News, no key; the people and the key words live in that repo's
// lib/justice-feed.mjs). Same credential pair as the grader route. Cached a quarter hour here so a
// busy page does not ask the upstream again on every load.

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const UPSTREAM = 'https://quick-tools-pi.vercel.app/api/justice-feed';
const TTL_MS = 15 * 60 * 1000;
let cache: { at: number; body: string } | null = null;

export async function GET() {
  const u = process.env.PRIVATE_SITE_USER;
  const p = process.env.PRIVATE_SITE_PASSWORD;
  if (!u || !p) return NextResponse.json({ items: [], error: 'the headline list is not configured on this site' }, { status: 503 });
  if (cache && Date.now() - cache.at < TTL_MS) {
    return new NextResponse(cache.body, { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  }
  const res = await fetch(UPSTREAM, { headers: { Authorization: 'Basic ' + Buffer.from(u + ':' + p).toString('base64') }, cache: 'no-store' });
  const body = await res.text();
  if (res.ok) cache = { at: Date.now(), body };
  return new NextResponse(body, { status: res.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
