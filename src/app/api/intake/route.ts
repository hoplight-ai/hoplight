import { NextResponse } from 'next/server';

// TODO(whit): set RESEND_API_KEY in Vercel and verify a sending domain so this emails.
// Until the key is set, the function still accepts the POST, logs the payload, and
// returns success, so the form is never broken — it just isn't emailing yet.

const TO = 'whit@hoplight.ai';
// Resend's shared sandbox sender works without domain verification; swap to a
// verified hoplight.ai address once the domain is set up in Resend.
const FROM = 'Hoplight Intake <onboarding@resend.dev>';

type Payload = {
  branch?: 'client' | 'talent';
  fields?: Record<string, unknown>;
};

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

function render(fields: Record<string, unknown>) {
  const rows: string[] = [];
  const lines: string[] = [];
  for (const [k, v] of Object.entries(fields)) {
    const val = Array.isArray(v) ? v.join(', ') : String(v ?? '');
    if (!val) continue;
    rows.push(`<tr><td style="padding:6px 14px 6px 0;color:#6b6457;vertical-align:top;font-size:13px">${escapeHtml(k)}</td><td style="padding:6px 0;font-size:14px">${escapeHtml(val)}</td></tr>`);
    lines.push(`${k}: ${val}`);
  }
  return {
    html: `<table style="border-collapse:collapse">${rows.join('')}</table>`,
    text: lines.join('\n'),
  };
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const branch = body.branch === 'talent' ? 'talent' : 'client';
  const fields = body.fields ?? {};
  const first = String(fields['First name'] ?? '').trim();
  const last = String(fields['Last name'] ?? '').trim();
  const org = String(fields['Organization'] ?? '').trim();
  const who = [first, last].filter(Boolean).join(' ') || 'Unknown';
  const subject = `Intake: ${branch === 'talent' ? 'Talent' : 'Client'} — ${who}${org ? `, ${org}` : ''}`;
  const { html, text } = render(fields);

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log('[intake] RESEND_API_KEY not set — logging only.', { subject, fields });
    return NextResponse.json({ ok: true, emailed: false });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: String(fields['Email'] ?? '') || undefined,
        subject,
        html: `<div style="font-family:Helvetica,Arial,sans-serif"><h2 style="font-size:16px">${escapeHtml(subject)}</h2>${html}</div>`,
        text: `${subject}\n\n${text}`,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error('[intake] Resend error', res.status, detail);
      // Never break the form for the user; report success but flag not emailed.
      return NextResponse.json({ ok: true, emailed: false });
    }
    return NextResponse.json({ ok: true, emailed: true });
  } catch (err) {
    console.error('[intake] send failed', err);
    return NextResponse.json({ ok: true, emailed: false });
  }
}
