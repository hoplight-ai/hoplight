// POST /api/signal: feedback and anonymous usage from the Hoplight tools, cleaned here and forwarded
// to the quick-tools store. The rules (what is kept, what is cut, the daily visitor hash, who may post)
// live in src/lib/signal.ts and are tested in scripts/signal.test.mjs. Whit, 2026-11-07: "a way for
// users to give me feedback and for user actions to be logged anonymized."
//
// Env, names only:
//   TOOL_SIGNAL_URL       the quick-tools endpoint, https://quick-tools-pi.vercel.app/api/tool-signal
//                         (lane signal1; storeBody() shapes the body it takes). Unset: every valid signal
//                         is answered 202 and dropped, so this route is safe before the store exists.
//   PRIVATE_SITE_USER,    the Basic auth pair the revenge-or-justice forwarder already uses.
//   PRIVATE_SITE_PASSWORD
//   SIGNAL_HASH_SALT      the visitor hash's salt. Unset: a random salt per running instance, with a
//                         warning, so hashes still change daily but do not match across instances.
//
// The limits are soft and per instance, like every limiter in src/lib/rate-limit.ts: 120 events and 5
// feedback notes per visitor per ten minutes.

import { randomBytes } from 'node:crypto';
import { after, NextResponse } from 'next/server';
import { checkLimitIn } from '@/lib/rate-limit';
import { corsHeaders, handleSignal, originPolicy, SIGNAL_TOOLS, storeBody } from '@/lib/signal';

export const dynamic = 'force-dynamic';

const TEN_MIN = 10 * 60 * 1000;
const LIMITS = { event: 120, feedback: 5 } as const;

let instanceSalt: string | null = null;
function salt(): string {
  const s = process.env.SIGNAL_HASH_SALT;
  if (s) return s;
  if (!instanceSalt) {
    instanceSalt = randomBytes(16).toString('hex');
    console.warn('[signal] SIGNAL_HASH_SALT is not set; using a random salt for this instance.');
  }
  return instanceSalt;
}

function upstreamAuth(): string | null {
  const u = process.env.PRIVATE_SITE_USER;
  const p = process.env.PRIVATE_SITE_PASSWORD;
  if (!u || !p) return null;
  return 'Basic ' + Buffer.from(u + ':' + p).toString('base64');
}

export async function OPTIONS(req: Request) {
  const { allowed, cors } = originPolicy(req.headers.get('origin'), req.headers.get('host'));
  return new NextResponse(null, { status: allowed ? 204 : 403, headers: corsHeaders(cors) });
}

export async function POST(req: Request) {
  const bodyText = await req.text();
  const result = handleSignal({
    bodyText,
    header: (n) => req.headers.get(n),
    tools: SIGNAL_TOOLS,
    salt: salt(),
    now: new Date(),
    allow: (kind, key) => checkLimitIn(`signal-${kind}`, key, LIMITS[kind], TEN_MIN),
  });

  const target = process.env.TOOL_SIGNAL_URL;
  const forward = result.forward ? storeBody(result.forward) : null;
  if (forward && target) {
    const auth = upstreamAuth();
    // After the answer goes out, so a slow store never slows a page.
    after(async () => {
      try {
        const res = await fetch(target, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) },
          body: JSON.stringify(forward),
          cache: 'no-store',
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) console.warn(`[signal] store answered ${res.status}`);
      } catch (err) {
        console.warn(`[signal] store unreachable: ${(err as Error).name}`);
      }
    });
  }

  return NextResponse.json(result.body, {
    status: result.status,
    headers: { ...corsHeaders(result.cors), 'Cache-Control': 'no-store' },
  });
}
