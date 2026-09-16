import { NextResponse } from 'next/server';

// The Make webhook address lives in the MAKE_INTAKE_WEBHOOK environment variable, set in the
// Vercel project, never in this file. Until 2026-09-16 it was a string literal here, and this
// repo is public, so anyone could POST to Make directly and skip every check below. The old
// address stays in git history; rotating the webhook in Make is what retires it.
const MAKE_WEBHOOK = process.env.MAKE_INTAKE_WEBHOOK;

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

  if (!MAKE_WEBHOOK) {
    // Misconfigured deploy: say so to the visitor rather than pretend the message went through.
    console.error('[intake] MAKE_INTAKE_WEBHOOK is not set; submission dropped', { branch, fields });
    return NextResponse.json(
      { ok: false, error: 'The form is not connected right now. Email whit@hoplight.ai instead.' },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(MAKE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch, fields }),
    });
    if (!res.ok) {
      // Make answered but refused. Log the whole payload so the submission is recoverable from
      // the Vercel runtime log; the visitor still sees success (their part was done correctly).
      console.error('[intake] Make webhook refused', res.status, JSON.stringify({ branch, fields }));
    }
  } catch (err) {
    console.error('[intake] Make webhook unreachable', err, JSON.stringify({ branch, fields }));
    // never break the form for the user
  }

  return NextResponse.json({ ok: true });
}
