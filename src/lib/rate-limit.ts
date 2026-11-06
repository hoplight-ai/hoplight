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

// A second limiter with its own buckets, for /api/revenge-or-justice (2026-11-06): each `bucket`
// (a route, or a route-wide 'all' key) keeps its own window and ceiling, so the grader's six-an-hour
// per address and its three-hundred-a-day per instance never share state with the intake form's
// five-per-ten-minutes above. Same soft, per-instance nature; same hard limit lives in the Firewall.
const buckets = new Map<string, number[]>();

export function checkLimitIn(bucket: string, key: string, max: number, windowMs: number, now: number = Date.now()): boolean {
  const id = bucket + '\u0000' + key;
  const recent = (buckets.get(id) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    buckets.set(id, recent);
    return false;
  }
  recent.push(now);
  buckets.set(id, recent);
  return true;
}
