// /api/revenge-or-justice/logo?host=<outlet host>: the outlet's own icon, so each article in the
// headline list and the reading's source line carry the outlet's brand (Whit, 2026-11-09: "the news
// articles should jump off the page including the outlet that wrote them ... no branding").
// Fetched here, server-side, from Google's public icon service and cached a week at the edge, so a
// visitor's browser never calls a third party. The host is checked to be a bare domain name; the
// upstream address is fixed, so nothing a visitor sends can point this route anywhere else.

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const HOST = /^(?=.{3,100}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;
const WEEK = 7 * 24 * 60 * 60;

export async function GET(req: Request) {
  const host = (new URL(req.url).searchParams.get('host') || '').trim().toLowerCase().replace(/^www\./, '');
  if (!HOST.test(host)) return new NextResponse(null, { status: 400 });
  try {
    const res = await fetch('https://www.google.com/s2/favicons?sz=64&domain=' + encodeURIComponent(host), {
      next: { revalidate: WEEK },
      signal: AbortSignal.timeout(5000),
    });
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !type.startsWith('image/')) return new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'public, max-age=3600' } });
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=' + WEEK + ', s-maxage=' + WEEK + ', immutable' },
    });
  } catch {
    return new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'public, max-age=3600' } });
  }
}
