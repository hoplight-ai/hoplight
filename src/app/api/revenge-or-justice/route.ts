// /api/revenge-or-justice: the public door to the grader. The grader itself, its key and its precedent
// corpus live on quick-tools (/api/justice-or-retribution, behind that site's sign-in); this route
// forwards to it with the site's own credential pair, so the Anthropic key stays on the one project
// that holds it and nothing here can be read for it. Whit, 2026-11-06: "let's make this a hop light
// tool".
//
// What stands between the public and a paid model call:
//   - a per-IP limit, 6 grades an hour, soft (in-memory, per instance; see src/lib/rate-limit.ts);
//   - a per-instance ceiling, 300 grades a day, so a flood on one instance stops at a known cost;
//   - the input cap the grader already has (14,000 characters);
//   - the Vercel Firewall rate-limit rule, the hard limit, which is set in the dashboard.
// Env, names only: PRIVATE_SITE_USER, PRIVATE_SITE_PASSWORD (already on the project for the gate).

import { NextResponse } from 'next/server';
import { checkLimitIn, clientIp } from '@/lib/rate-limit';
import { LOOKS_LIKE_LINK, publicHttpUrl } from '@/lib/safe-url';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const UPSTREAM = 'https://quick-tools-pi.vercel.app/api/justice-or-retribution';
const PER_IP = { max: 6, windowMs: 60 * 60 * 1000 };
const PER_DAY = { max: 300, windowMs: 24 * 60 * 60 * 1000 };

function auth(): string | null {
  const u = process.env.PRIVATE_SITE_USER;
  const p = process.env.PRIVATE_SITE_PASSWORD;
  if (!u || !p) return null;
  return 'Basic ' + Buffer.from(u + ':' + p).toString('base64');
}

export async function GET() {
  const a = auth();
  if (!a) return NextResponse.json({ error: 'the grader is not configured on this site' }, { status: 503 });
  const res = await fetch(UPSTREAM, { headers: { Authorization: a }, cache: 'no-store' });
  const body = await res.text();
  return new NextResponse(body, { status: res.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  const a = auth();
  if (!a) return NextResponse.json({ error: 'the grader is not configured on this site' }, { status: 503 });
  if (!checkLimitIn('grade-ip', clientIp(req), PER_IP.max, PER_IP.windowMs)) {
    return NextResponse.json({ error: 'That is six readings in an hour from your address. Come back in a bit.' }, { status: 429 });
  }
  if (!checkLimitIn('grade-day', 'all', PER_DAY.max, PER_DAY.windowMs)) {
    return NextResponse.json({ error: 'The grader has done its day’s share of readings. Try again tomorrow.' }, { status: 429 });
  }
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad JSON' }, { status: 400 }); }
  const b = (body && typeof body === 'object' ? body : {}) as { text?: unknown; url?: unknown };
  const text = typeof b.text === 'string' ? b.text.slice(0, 20000) : '';
  const url = typeof b.url === 'string' ? b.url.slice(0, 2000) : '';
  if (!text && !url) return NextResponse.json({ error: 'paste some text or a link' }, { status: 400 });
  // Security check SITESEC1, 2026-11-07: the upstream fetches any address it is handed, and reads a text
  // that is one link as a link. A link to a private network, a loopback or link-local address, a
  // metadata host or a bare machine name stops here (src/lib/safe-url.ts, scripts/safe-url.test.mjs).
  const link = url || (LOOKS_LIKE_LINK.test(text.trim()) ? text.trim() : '');
  if (link) {
    const safe = publicHttpUrl(link);
    if (!safe.ok) return NextResponse.json({ error: safe.reason }, { status: 400 });
  }
  const res = await fetch(UPSTREAM, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: a },
    body: JSON.stringify(text ? { text } : { url }),
    cache: 'no-store',
  });
  const out = await res.text();
  return new NextResponse(out, { status: res.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
