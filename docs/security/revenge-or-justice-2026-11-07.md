STATUS: FAIL

# Revenge or Justice, security check of 2026-11-07

Address: https://hoplight.ai/revenge-or-justice (this repo, main at 9c6642b: src/app/(main)/revenge-or-justice/, src/app/api/revenge-or-justice/route.ts and feed/route.ts) forwarding to quick-tools main 18ab7b6 (api/justice-or-retribution.js, api/justice-feed.js). Checked by lane Publicist SITESEC1 (Fable 5.1): the code a stranger can reach, the live headers, five live posts through hoplight.ai (four refused addresses and one grade), no load, nothing destructive.

The page is live now, in the sitemap, and answers 200 without credentials; "hidden until PASS" holds only for the portfolio listing.

One high finding is open, so the first line says FAIL. It closes with one dashboard check or one setting; everything else here is medium or lower and does not block the Tuesday launch. When the high finding is closed, change the first line to PASS and say what closed it.

## Findings

### High: the only hard limit on the model bill is unverified

What a stranger can do: every grade is a paid call chain on quick-tools (split into voices, the whole text, up to two voices, up to four issues: up to eight Sonnet 5.5 calls of up to 14,000 characters each, api/justice-or-retribution.js lines 460 to 520). What stands in front of it is soft: six an hour per address and three hundred a day, both held in memory in one running copy of the function (src/lib/rate-limit.ts, `checkLimitIn`; the file says so itself). Vercel starts a fresh copy under load, and each copy starts at zero. A rotating set of addresses, or a burst that spreads over copies, gets three hundred grades per copy per day. The code comments and CLAUDE.md say the hard limit is a Vercel Firewall rate-limit rule "Whit's to set". This session could not open the Vercel dashboard (the connector is not authorised), so whether that rule exists is unknown.

Proof: route.ts lines 8 to 11 and 20 to 22 (PER_IP, PER_DAY in memory); rate-limit.ts lines 6 to 11 ("THIS IS A SOFT LIMIT ONLY"). Live: the per-address limit does hold for one address (the first x-forwarded-for value is set by Vercel; a forged header was ignored, tested on /api/signal which keys the same way).

Fix, any one of these closes it:
1. Whit opens Vercel, project hoplight, Firewall, Rate Limiting, and confirms a rule on POST /api/revenge-or-justice and POST /api/revenge-or-justice/feed at or under 6 requests per hour per address, with a second rule of a few hundred per hour across all addresses. If there is none, add it. Size: one dashboard rule. Owner: Whit.
2. A spend limit on the Anthropic workspace that holds quick-tools' ANTHROPIC_API_KEY (Anthropic Console, Limits): the bill then stops whatever the traffic does. Size: one setting. Owner: Whit.
3. A shared daily counter in quick-tools' route (one row in Supabase or Vercel KV, incremented per grade, refusing past 300) in place of the in-memory one. Size: twenty lines plus a test. Owner: quick-tools (Ops seat).

### Medium: the grader fetches any address it is handed, and reads what it finds

quick-tools fetchUrlText (lines 382 to 395) checks the scheme and nothing else: it follows redirects, has no size cap, no content-type check, and the text it extracts is quoted back verbatim in the answer's evidence lines. The upstream also treats a text that is one bare link as a link (line 476), so the text field is a second way in.

Proof, live through hoplight.ai (each counts against the six-an-hour limit; no model call was made by the refused ones):
- `{"url":"file:///etc/passwd"}` answered 400 "only http and https links".
- `{"url":"http://127.0.0.1:1/"}` answered 400 "fetch failed".
- `{"url":"http://169.254.169.254/latest/meta-data/"}` answered 400 "fetch failed" in under a second, so nothing listens on the metadata address from the function; the function's network reach to private space looks empty, which is why this is medium and not high.
What stays open: any public address is fetched from hoplight's own egress and its text is reflected (an open fetcher, six times an hour per address); a link to a very large file is read whole into memory before the slice (a cost and a timeout, not a leak); a public name that resolves to a private address, or a public page that redirects to one, is not stopped.

Fix on quick-tools (the real one, where the fetch happens): resolve the host before fetching and refuse loopback, private, link-local, carrier-grade and multicast ranges; follow redirects by hand (redirect: 'manual', three hops at most, each hop checked the same way); refuse a Content-Type that is not text or HTML; read at most 2 MB; time out at 15 seconds. Size: forty lines plus tests. Owner: quick-tools.

Fix on this repo, done on branch sitesec1: src/lib/safe-url.ts refuses, before forwarding, a link to a private, loopback, link-local or metadata address, a bare machine name, a .local or .internal name, or a link carrying a sign-in, in the url field and in a text that is one bare link. scripts/safe-url.test.mjs, seven tests, in npm test. This is a first wall; the upstream fix is still needed for names that resolve inward and for redirects.

### Low: the headline list's grade call is a smaller paid door

POST /api/revenge-or-justice/feed forwards to the upstream's ?action=grade, which reads up to three unread headlines per call. Twenty calls an hour per address, soft and per copy as above. Bounded by the unread remainder of the fourteen-day list (one read per article for its life, kept in public.justice_readings), so the worst case is the whole list once, about forty reads. Fix: covered by the Firewall rule above.

### Low: the site-wide script policy allows inline script

Content-Security-Policy on every page carries `script-src 'self' 'unsafe-inline'` (next.config.ts, with its reason: Next's hydration script and the inline styles). The page escapes everything it draws, so there is no injection to carry; the policy would only matter if one appeared. Fix: a nonce-based policy, a project for the whole site, not for this launch.

## Checked and clean

- Prompt injection: one live grade of a 686-character statement that told the grader to return `<img onerror>`, `<script>`, a link to an outside address and the system prompt. The answer was plain text (verdict retribution, headline in prose); the only links anywhere in the JSON were the thirteen corpus sources. The page escapes every string with esc() and builds an href only from a corpus URL or the fetched address, both escaped; `target="_blank" rel="noopener"` on both.
- Secrets: the Anthropic key lives on quick-tools and is never read here; the site pair is read server-side in the two routes and the about page (an hourly cached fetch of the precedent list) and never reaches the browser. The upstream routes answer 401 to a request without the pair (live: /api/justice-or-retribution, /api/justice-feed).
- Input size: text is cut at 20,000 characters here and 14,000 upstream; a non-JSON body answers 400.
- Headers on the page: CSP, HSTS (two years, subdomains), nosniff, X-Frame-Options SAMEORIGIN and frame-ancestors 'self', Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy denying camera, microphone and location.
- Error text from the upstream is passed through as JSON and drawn as text; "fetch failed" leaks nothing about the network.
- Usage logging: grade, result, grade-failed, headline, headlines-all events with source, verdict, length and the first 1,000 characters of what was pasted (`query`), through /api/signal (see signal-2026-11-07.md). A pasted statement can carry a name; that is the nature of the tool, and the page says nothing about it. Consider one line under the box.

## Only Whit can check

- Vercel, project hoplight, Firewall, Rate Limiting: the rules on /api/revenge-or-justice and /api/revenge-or-justice/feed (the high finding).
- Anthropic Console: the spend limit on the workspace of quick-tools' ANTHROPIC_API_KEY.

## Update, 2026-11-07 evening (Publicist Dispatch)

Counted, `vercel firewall overview` on project hoplight: the firewall was "Not configured" (no rule existed). Two rules are now live: "Revenge or Justice model cap", POST to any path starting /api/revenge-or-justice, 10 per address per hour, deny past it; and "Signal and sign-in cap", POST /api/signal or /api/grant, 150 per address per ten minutes. A cap across all addresses was refused by Vercel ("Rate limit key header:host is not available for this plan (402)"), so a rotating set of addresses is still bounded only by the in-memory caps. The high finding stays open until fix 2 (a spend limit on the Anthropic workspace that holds quick-tools' ANTHROPIC_API_KEY) or fix 3 lands; with either, change the first line to PASS.
