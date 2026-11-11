// The two shared copies behind Revenge or Justice (lane RJFAST1, 2026-11-10; Whit: "the articles take forever to
// load, we should triage so they populate faster, less latency").
//
//   - The headline list: one copy for every instance (Next's data cache through unstable_cache), refreshed every
//     fifteen minutes behind the visitor and served stale while it refreshes, so no visitor waits on the
//     upstream's tagger once any copy exists. Fifteen minutes is the upstream's own copy (quick-tools
//     api/justice-feed.js); asking more often only re-reads it.
//   - The full reading of a link-only request (the text is one bare link, or the url field): kept seven days,
//     keyed by the link less its tracking parameters and hash (keyOf below). Pasted text is never kept
//     and never served from the copy; a failed or error reply is never kept. A reading served from the copy
//     says so (`cached: true`, `read_at`) and costs nothing, so it does not count against the rate limits.
//
// Everything here is pure or takes its fetch and its store as arguments, so scripts/rj-speed.test.mjs runs it
// offline. nextStore() and feedThroughCopy() are the only parts that touch Next, and they import it lazily.

export const LIST_REVALIDATE_S = 15 * 60;
export const READING_TTL_S = 7 * 24 * 60 * 60;
const READING_TTL_MS = READING_TTL_S * 1000;

// The dispatcher's ruling, 2026-11-11: the query stays, because some outlets name an article only by it (?id=, ?p=,
// ?storyId=) and two articles sharing one reading is worse than a missed copy. Only tracking parameters and the
// hash go; what remains is sorted; only the host is lower-cased; a trailing slash goes.
const TRACKING = /^(utm_.*|fbclid|gclid|mc_cid|mc_eid|ocid|cmpid|smid|ref|taid)$/i;

/** The key a link's reading is kept under. */
export function keyOf(url: string): string {
  const raw = String(url || '').trim();
  let u: URL;
  try { u = new URL(raw); } catch { return raw.replace(/#.*$/, '').replace(/\/$/, ''); }
  const kept = [...u.searchParams.entries()].filter(([k]) => !TRACKING.test(k)).sort(([a, x], [b, y]) => (a === b ? (x < y ? -1 : x > y ? 1 : 0) : a < b ? -1 : 1));
  const path = u.pathname.length > 1 ? u.pathname.replace(/\/$/, '') : '';
  const query = kept.length ? '?' + new URLSearchParams(kept).toString() : '';
  return u.protocol + '//' + u.host.toLowerCase() + path + query;
}

const BARE_LINK = /^https?:\/\/\S+$/;

/** The one bare link a request is, or '' when it carries pasted text. */
export function linkOf(input: { text?: string; url?: string }): string {
  const text = (input.text || '').trim();
  if (text) return BARE_LINK.test(text) ? text : '';
  const url = (input.url || '').trim();
  return BARE_LINK.test(url) ? url : '';
}

export interface Held {
  reply: Record<string, unknown>;
  read_at: string;
}

export interface Store {
  get(key: string): Promise<Held | null>;
  set(key: string, held: Held): Promise<void>;
}

/** A store in this process's memory: the tests' store, and the fallback when Next's cache is out of reach. */
export function memoryStore(): Store {
  const m = new Map<string, Held>();
  return {
    async get(key) { return m.get(key) ?? null; },
    async set(key, held) { m.set(key, held); },
  };
}

// The shared store: Next's data cache, which on Vercel is one copy for every instance of the deployment and
// locally is the build's .next/cache. unstable_cache only memoises a function, so a write is a miss that is
// answered from `pending`, and a read is a miss that throws (a throw is never kept).
class Miss extends Error {}
const pending = new Map<string, Held>();
let cachedRead: ((key: string) => Promise<Held>) | null = null;

async function readFn(): Promise<(key: string) => Promise<Held>> {
  if (cachedRead) return cachedRead;
  const { unstable_cache } = await import('next/cache');
  cachedRead = unstable_cache(
    async (key: string) => {
      const h = pending.get(key);
      if (!h) throw new Miss('not held');
      return h;
    },
    ['rj-reading-v1'],
    { revalidate: READING_TTL_S, tags: ['rj-reading'] },
  );
  return cachedRead;
}

export function nextStore(): Store {
  return {
    async get(key) {
      try {
        const h = await (await readFn())(key);
        return h && typeof h === 'object' && h.reply ? h : null;
      } catch {
        return null;
      }
    },
    async set(key, held) {
      pending.set(key, held);
      try {
        await (await readFn())(key);
      } catch {
        /* a copy that cannot be kept is not an error for the visitor */
      } finally {
        pending.delete(key);
      }
    },
  };
}

/** A reading worth keeping: the grader answered, with a verdict and a score, and no error. */
export function keepable(status: number, reply: unknown): reply is Record<string, unknown> {
  if (status !== 200 || !reply || typeof reply !== 'object') return false;
  const r = reply as Record<string, unknown>;
  return !r.error && typeof r.verdict === 'string' && typeof r.mean_position === 'number';
}

/** The held reading for this link, or null when there is none or it is older than seven days. */
export async function heldFor(store: Store, link: string, now: Date): Promise<Held | null> {
  const key = keyOf(link);
  if (!key) return null;
  const h = await store.get(key);
  if (!h || !h.reply || !h.read_at) return null;
  const at = Date.parse(h.read_at);
  if (!Number.isFinite(at) || now.getTime() - at > READING_TTL_MS) return null;
  return h;
}

export interface GradeDeps {
  store: Store;
  fetchImpl: typeof fetch;
  upstream: string;
  auth: string;
  /** Asked only before a real model call: null to go ahead, or the sentence a limited visitor sees. */
  allow: () => string | null;
  /** Signs the reply's share links before it is kept, so a reading from the copy shares as it did. */
  attach?: (reply: Record<string, unknown>) => void;
  now?: () => Date;
}

export interface GradeResult {
  status: number;
  body: string;
  cached: boolean;
}

const json = (status: number, obj: unknown, cached = false): GradeResult => ({ status, body: JSON.stringify(obj), cached });

// Two visitors who click the same new headline at once share one upstream call (per instance).
const inflight = new Map<string, Promise<GradeResult>>();

/** The reading for this request: from the copy when the request is one link already read, else from the grader. */
export async function gradeThroughCopy(input: { text?: string; url?: string }, deps: GradeDeps): Promise<GradeResult> {
  const now = deps.now ? deps.now() : new Date();
  const text = typeof input.text === 'string' ? input.text : '';
  const url = typeof input.url === 'string' ? input.url : '';
  const link = linkOf({ text, url });
  if (link) {
    const held = await heldFor(deps.store, link, now);
    // The reply keeps the link the visitor asked for, so the page finds its own list item for it.
    if (held) return json(200, { ...held.reply, fetched: held.reply.fetched ? link : held.reply.fetched, cached: true, read_at: held.read_at }, true);
    const key = keyOf(link);
    const running = inflight.get(key);
    if (running) return running;
    const limited = deps.allow();
    if (limited) return json(429, { error: limited });
    const job = callAndKeep({ text, url }, link, deps, now).finally(() => inflight.delete(key));
    inflight.set(key, job);
    return job;
  }
  const limited = deps.allow();
  if (limited) return json(429, { error: limited });
  return callAndKeep({ text, url }, '', deps, now);
}

async function callAndKeep(input: { text: string; url: string }, link: string, deps: GradeDeps, now: Date): Promise<GradeResult> {
  const res = await deps.fetchImpl(deps.upstream, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: deps.auth },
    body: JSON.stringify(input.text ? { text: input.text } : { url: input.url }),
    cache: 'no-store',
  });
  const out = await res.text();
  let reply: unknown;
  try { reply = JSON.parse(out); } catch { return { status: res.status, body: out, cached: false }; }
  if (!res.ok || !reply || typeof reply !== 'object') return { status: res.status, body: out, cached: false };
  const r = reply as Record<string, unknown>;
  if (deps.attach) {
    try { deps.attach(r); } catch { /* a reply that cannot be shared is still a reply */ }
  }
  if (link && keepable(res.status, r)) {
    try { await deps.store.set(keyOf(link), { reply: r, read_at: now.toISOString() }); } catch { /* not kept */ }
  }
  return { status: res.status, body: JSON.stringify(r), cached: false };
}

// The headline list.

export interface FeedItem {
  url: string;
  title?: string;
  reading?: { position?: number | null; verdict?: string | null; headline?: string; error?: string; rows?: { key?: string; position?: number }[] | null } | null;
  held?: { read_at: string };
  [k: string]: unknown;
}

/** Marks each headline whose full reading is held, and fills its dial from it when the list carries none. */
export async function markHeld<T extends FeedItem>(items: T[], store: Store, now: Date = new Date()): Promise<T[]> {
  return Promise.all(items.map(async (it) => {
    if (!it || !it.url) return it;
    let h: Held | null = null;
    try { h = await heldFor(store, it.url, now); } catch { h = null; }
    if (!h) return it;
    const r = h.reply;
    const out: T = { ...it, held: { read_at: h.read_at } };
    if (!it.reading || it.reading.position == null) {
      out.reading = { position: r.mean_position as number, verdict: r.verdict as string, headline: typeof r.headline === 'string' ? r.headline : '' };
    }
    return out;
  }));
}

/** What the page needs of a headline to draw its card and its waiting screen, and nothing more. */
export function cardItem(it: FeedItem): FeedItem {
  const r = it.reading;
  const pick = (k: string) => (it[k] === undefined ? {} : { [k]: it[k] });
  return {
    url: it.url,
    ...pick('title'), ...pick('source'), ...pick('host'), ...pick('published'), ...pick('people'), ...pick('officials'), ...pick('held'),
    // The quick read's five positions only (no prose), so the waiting screen can colour each measure's tick.
    ...(r && r.position != null ? { reading: { position: r.position, verdict: r.verdict ?? null, headline: r.headline || '', ...(Array.isArray(r.rows) ? { rows: r.rows.filter((x) => x && typeof x.position === 'number').map((x) => ({ key: x.key, position: x.position })) } : {}) } } : {}),
  };
}

export type FeedSource ='upstream' | 'unconfigured' | 'failed';
export interface Feed {
  body: Record<string, unknown> & { items: FeedItem[] };
  source: FeedSource;
}

let cachedList: ((upstream: string) => Promise<Record<string, unknown>>) | null = null;

/** The upstream list from the shared copy (fifteen minutes, stale while it refreshes), with the held readings marked. */
export async function feedThroughCopy(upstream: string, auth: string | null): Promise<Feed> {
  if (!auth) return { body: { items: [] }, source: 'unconfigured' };
  try {
    if (!cachedList) {
      const { unstable_cache } = await import('next/cache');
      cachedList = unstable_cache(
        async (u: string) => {
          const res = await fetch(u, { headers: { Authorization: auth }, cache: 'no-store', signal: AbortSignal.timeout(20000) });
          if (!res.ok) throw new Error('the list answered ' + res.status);
          const j = (await res.json()) as Record<string, unknown>;
          if (!j || !Array.isArray(j.items)) throw new Error('the list carried no items');
          return j;
        },
        ['rj-feed-v1'],
        { revalidate: LIST_REVALIDATE_S, tags: ['rj-feed'] },
      );
    }
    const body = await cachedList(upstream);
    const items = await markHeld((body.items as FeedItem[]) || [], nextStore());
    return { body: { ...body, items }, source: 'upstream' };
  } catch {
    return { body: { items: [] }, source: 'failed' };
  }
}
