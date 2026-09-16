// In-memory sliding-window rate limiter for /api/intake. Site review, 2026-09-16
// (expert-security.md IMPORTANT #2, expert-nextjs-vercel.md CRITICAL #1 sibling finding): the
// route had a honeypot and size caps but nothing to stop a scripted client that just omits the
// honeypot field.
//
// THIS IS A SOFT LIMIT ONLY. Vercel can run more than one instance of this function
// concurrently, and any instance can cold-start and lose this in-memory Map at any time, so a
// determined sender can still exceed 5-per-10-minutes by landing on a fresh instance. The real,
// hard limit is a Vercel Firewall rate-limit rule on /api/intake, which Whit sets in the Vercel
// dashboard (Project -> Firewall -> Rate Limiting) — this module only raises the floor for the
// common case without adding a dependency or touching the webhook logic.
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

/**
 * Records a submission attempt for `ip` at `now` and returns whether it is allowed.
 * Pure function of its inputs plus module-level state, so it is directly testable without a
 * server: see scripts/intake-ratelimit.test.mjs.
 */
export function checkRateLimit(ip: string, now: number = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

/** Pulls the client IP the same way for every caller: first value of x-forwarded-for. */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return 'unknown';
}
