import { NextResponse } from 'next/server';

const MAKE_WEBHOOK = 'https://hook.us2.make.com/kuprh9ayexizs5yi4p6czddpc323ou23';

type Payload = {
  branch?: 'client' | 'talent';
  fields?: Record<string, unknown>;
};

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const branch = body.branch === 'talent' ? 'talent' : 'client';
  const raw = body.fields;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
  }

  // Honeypot: the form renders a hidden "website" input that people never see and bots fill.
  // A filled honeypot answers ok and forwards nothing, so the bot learns nothing.
  if (typeof raw.website === 'string' && raw.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  // Cap what reaches the webhook: at most 40 fields, each a string or list of strings, each value
  // at most 4,000 characters. Anything else is dropped rather than forwarded verbatim.
  const fields: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(raw).slice(0, 40)) {
    if (key === 'website') continue;
    const k = key.slice(0, 120);
    if (typeof value === 'string') fields[k] = value.slice(0, 4000);
    else if (Array.isArray(value)) fields[k] = value.filter((v) => typeof v === 'string').map((v) => v.slice(0, 200)).slice(0, 50);
  }
  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
  }

  try {
    await fetch(MAKE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch, fields }),
    });
  } catch (err) {
    console.error('[intake] Make webhook failed', err);
    // never break the form for the user
  }

  return NextResponse.json({ ok: true });
}
