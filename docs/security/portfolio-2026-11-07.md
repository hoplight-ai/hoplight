STATUS: PASS

# The portfolio page, security check of 2026-11-07

Address: https://hoplight.ai/portfolio (this repo, main at 9c6642b: src/app/(main)/portfolio/page.tsx, src/data/tools.ts, src/app/api/og/tool/[slug]/route.tsx, src/proxy.ts). Checked by lane Publicist SITESEC1 (Fable 5.1): the code a stranger can reach, the live headers, the public folder. No findings above low. The feedback and usage route the page and every tool share is checked in signal-2026-11-07.md.

## Findings

### Low: six stray screenshots are served to anyone

Proof: public/screenshots/ holds "Screenshot 2026-06-26 at 14.20.19.png" and five "Screenshot 2026-07-01 at ..." files (52 KB to 358 KB) that nothing under src/ references (the only screenshots the site uses are rayli-composer.webp and rayli-reading.webp). Two were opened: an AI-industry supply-chain chart and a diagram of the persuasion engine's four layers marked "proprietary IP". Nothing personal was seen; the other four were not opened. They are reachable by anyone who guesses or finds the names.

Fix: `git rm` the six files, or move them behind the gate. Size: one commit. Owner: this repo.

### Low: the children's ages are in the tool copy

Proof: src/data/tools.ts lines 148 and 168: "a Spanish app for a five-year-old", "a letter-formation app for a four-year-old". No name anywhere in this repo, the rumi repo or the letters repo (grep for name prompts and the family name: nothing). The ages are Whit's to publish or not; named so the choice is made on purpose.

Fix: none unless Whit wants the ages out; then "for a child who cannot read yet" and "for a child learning to write".

## Checked and clean

- The schedule cannot be opened early from outside: `portfolioClock()` reads PORTFOLIO_NOW and PORTFOLIO_SHOW_UNCLEARED from the server's environment only and production ignores both; no query parameter reaches it.
- The preview card route /api/og/tool/<slug> looks the slug up in tools.ts and answers 404 for anything else; it draws a card for an entry not yet cleared, so a tool's name and look can be seen before its day. Both tools in question are live pages already, so nothing is revealed.
- The portfolio pieces under /portfolio/* stay behind the one-password sign-in (live: /rayli answers 401 with no-store and noindex); /portfolio itself is public and in the sitemap.
- The pages carry `access-control-allow-origin: *`, which Vercel adds to static responses; the gated pages do not carry it, and a wildcard never sends cookies, so nothing private crosses an origin.
- Secrets: none in public/ (grep for key shapes: nothing); the only server env vars are the site pair, the intake webhook, the command-center password, the signal salt and the signal store address, all read server-side.
- Headers: CSP, HSTS, nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy, Permissions-Policy.
- robots.ts allows every crawler including the AI ones; sitemap lists only public pages (gate.test.mjs holds that).

## Only Whit can check

Nothing for this page. The Firewall rules named in revenge-or-justice-2026-11-07.md and signal-2026-11-07.md cover the routes this page's tools call.
