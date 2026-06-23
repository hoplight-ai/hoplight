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
  const fields = body.fields ?? {};

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
