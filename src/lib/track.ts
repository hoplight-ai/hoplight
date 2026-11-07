// The browser side of /api/signal: track() for anonymous usage, sendFeedback() for the feedback box.
// What the route keeps and cuts is written in src/lib/signal.ts. No third-party script, no cookie, no
// identifier stored in the browser: the visitor hash is made on the server from the request and
// changes every day.

export type TrackProps = Record<string, string | number | boolean | null | undefined>;

const ENDPOINT = '/api/signal';

function clean(props: TrackProps | undefined): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v === null || v === undefined) continue;
    out[k] = typeof v === 'string' ? v.slice(0, 1000) : v;
  }
  return out;
}

/** Logs one anonymous action. Never throws, never waits: a page never slows down for its own log. */
export function track(tool: string, action: string, props?: TrackProps): void {
  if (typeof window === 'undefined') return;
  try {
    const body = JSON.stringify({ kind: 'event', tool, action, props: clean(props), path: window.location.pathname });
    const sent = typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
    if (!sent) {
      void fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
    }
  } catch {
    // A log that fails is dropped.
  }
}

/** Sends a feedback note; resolves true when the site took it. */
export async function sendFeedback(tool: string, message: string, contact?: string): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'feedback', tool, action: 'feedback', message, contact: contact || undefined, path: window.location.pathname }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
