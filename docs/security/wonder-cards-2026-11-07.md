STATUS: PASS

# Wonder Cards (the kids deck), security check of 2026-11-07

Address: https://wonder-cards.vercel.app/junior, the kids deck "What Should We Wonder?" (repo wonder-cards, main at 752c28d, lane WCKIDS1, which put the feedback kit on it). Checked by lane Publicist WCKIDS2 (kids Wonder Cards joins the portfolio, Opus 5.5) on 2026-11-07 from a real read: the served page (23,959 bytes, one file, its scripts inline), its live headers, the files it links (manifest, icon), the Hoplight kit it loads, and the deck's other addresses. No findings above low, the same bar the Letters and Rumi Español reports passed on; the lows are listed with their fixes.

## Findings

### Low: no security headers beyond HSTS

Proof: live headers on /junior: Strict-Transport-Security with preload, access-control-allow-origin: * (Vercel's static default), nothing else. No X-Frame-Options or frame-ancestors, no X-Content-Type-Options, no Referrer-Policy, no Permissions-Policy.

Fix: the same headers block as rumi-espanol-2026-11-07.md names (X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy no-referrer, Permissions-Policy camera=(), microphone=(), geolocation=()). Owner: wonder-cards repo.

### Low: the page asks Google for its fonts

Proof: the head links https://fonts.googleapis.com/css2 (Fredoka and Nunito). A stylesheet, not a script, but each visit sends the visitor's address to Google. Nothing else on the page reaches a third party.

Fix: serve the two faces from the deck's own site, as hoplight.ai serves Inter. Owner: wonder-cards repo.

### Low: the kids page links the adult deck's home-screen file, and an icon that is not there

Proof: /junior links /wonder-cards-manifest.json, whose name is the adult deck's ("248 questions worth talking about") and whose start address is the adult page, so "Add to Home Screen" from the kids page opens the adult deck. /junior also links /icon.svg, which answers 404. The canonical and og:url name https://wondercards-whit-2730s-projects.vercel.app/, another project that serves the kids deck at its root without the feedback kit (as does https://wondercards-teal.vercel.app, the address the tile mockup used).

Fix: a kids manifest and icon for /junior, and its canonical set to https://wonder-cards.vercel.app/junior. Owner: wonder-cards repo. Not a leak; listed so a parent's home-screen copy lands on the right deck.

## Checked and clean

- Scripts: three inline scripts (the signal shim, the deck, the kit's onload) and one outside script, https://hoplight.ai/kit/signal.js (1,833 bytes, posts only to https://hoplight.ai/api/signal with keepalive, no cookies sent). No other script, no analytics, no eval or new Function, no iframe, no postMessage.
- Stored: nothing. No localStorage, sessionStorage, IndexedDB, cookie or service worker in the page.
- Sent, as usage: seven fixed action names (open, draw, filter, tips-open, list-open, note-open, note-sent), each carrying only the props suit, filter, card, n and ok, which the shim's `clean` keeps only as true or false, whole numbers, or one of seven fixed words (all, tell, feel, imagine, find, doit, words). Never a card's text, never anything typed. `card` is the card's place in the deck, a number.
- Sent, as feedback: the grown-ups' note box (`data-hoplight-feedback="wonder-cards"`, inside a closed "Grown-ups: tell us what to fix" drawer), a message up to 2,000 characters and an optional email up to 200, sent only through the kit's feedback call, never as an event. The site's route cuts emails and phone numbers out of the message and keeps the email only in the contact field the person filled in.
- No form asks a child for anything; no name, age or place is asked for or kept; the page says under the note box "Anonymous usage is logged to make this better. No names, no addresses."
- No key of any kind in the page: no Supabase URL or key, no API key, no token.
- The signal route allows the origin https://wonder-cards.vercel.app, which also serves the adult deck at its root; that page loads no kit and posts nothing today.

## What must be true for the usage logging to be safe

1. Props stay on the shim's fixed lists (the five keys, the seven words); never a card's text or a typed word in an event.
2. The note box stays the one free-text path, and stays in the grown-ups' drawer.
3. Region from Vercel's edge is the family's region under one daily hash; acceptable as coarse place, as for Rumi Español and Letters.

## Only Whit can check

Nothing for this deck.
