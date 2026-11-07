// /api/revenge-or-justice/feed: the headline list beside the grader, forwarded from quick-tools'
// /api/justice-feed (Bing News, no key; the people and the key words live in that repo's
// lib/justice-feed.mjs). Same credential pair as the grader route. Cached a quarter hour here so a
// busy page does not ask the upstream again on every load.

//
// POST (2026-11-06, Whit: "yes to 1 and 2", "dots on what track?"): forwards to the upstream's
// ?action=grade, which reads up to three of the listed articles that have no reading yet and keeps
// them, so the list can draw each story as a dot on the revenge-to-justice line. Each article is read
// once in its fourteen-day life, so the most a visitor can trigger is the unread remainder; a per-IP
// limit of twenty calls an hour holds a loop on one address to that.

import { NextResponse } from 'next/server';
import { checkLimitIn, clientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const UPSTREAM = 'https://quick-tools-pi.vercel.app/api/justice-feed';
const TTL_MS = 2 * 60 * 1000;
const PER_IP = { max: 20, windowMs: 60 * 60 * 1000 };
let cache: { at: number; body: string } | null = null;

function auth(): string | null {
  const u = process.env.PRIVATE_SITE_USER;
  const p = process.env.PRIVATE_SITE_PASSWORD;
  if (!u || !p) return null;
  return 'Basic ' + Buffer.from(u + ':' + p).toString('base64');
}

export async function GET() {
  const a = auth();
  if (!a) return NextResponse.json({ items: [], error: 'the headline list is not configured on this site' }, { status: 503 });
  if (cache && Date.now() - cache.at < TTL_MS) {
    return new NextResponse(cache.body, { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  }
  const res = await fetch(UPSTREAM, { headers: { Authorization: a }, cache: 'no-store' });
  const body = await res.text();
  if (res.ok) cache = { at: Date.now(), body };
  return new NextResponse(body, { status: res.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
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
  if (res.ok) cache = null; // the list now carries new readings; the next GET fetches them
  return new NextResponse(body, { status: res.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
