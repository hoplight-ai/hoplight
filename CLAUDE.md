# hoplight-site (company site)

> **Moved out of the shared instruction file on 2026-08-25, under Whit's approval in session.**
> Everything below used to load into EVERY session on this machine, for all twenty projects at once.
> It now loads only when a session opens inside this folder. Nothing was summarised or dropped in
> the move: the text is byte-identical to what the shared file carried.
>
> The shared file at the top level still loads too, and it wins on conflict. It holds the rules that
> apply everywhere: what needs Whit's approval, how to write to him, how work is handed between
> sessions. This file holds only what is true about this one project.
>
> If you are reading this and the shared file's rules seem to contradict it, the shared file wins and
> the drift is worth reporting to Whit.

## hoplight-site (company site)
- **Path:** `hoplight-site` — **but the GitHub repo is `hoplight-ai/hoplight`, NOT `hoplight-ai/hoplight-site`. Added 2026-08-20 because this row named no repo at all and the folder name is the wrong guess.** Every `gh` command built from the folder name answers 404, which reads as "this repo is missing" rather than "you used the wrong name": a sweep on 2026-08-19 reported CI status unknown for this project for exactly that reason, and CI is green under the real name. Third instance of the same drift in this file — see `pme-mvp` (folder, repo and Vercel project all differ) and `research-books-strategist`. **Never derive a repo name from a folder name here; read `.git/config` or run `gh repo view`.**
- **Stack:** Next.js + TypeScript, hand-written CSS in `src/app/globals.css`. **There is no Tailwind in this repo** (corrected 2026-09-16 under Whit's typed GOVERNANCE EDIT, after the review-squad performance reviewer found no `tailwindcss` dependency and no utility classes anywhere; the old word sent reviewers looking for a config that does not exist).
- **Build:** `npm run build`
- **Vercel project:** `hoplight`
- **Live URL:** https://hoplight.ai — **CORRECTED 2026-08-25 by live probe. This row said `hoplight-rouge.vercel.app` and a project memory note (`hoplight-domain-not-on-vercel`, written 2026-06-13) said the apex domain was still served by Cloudflare. Both were false and had been for weeks.** `counted`, Vercel API `GET /v9/projects/hoplight`: the project's domain list is `hoplight.ai`, `www.hoplight.ai`, `hoplight-rouge.vercel.app`, plus the two generated hostnames. `counted`, live fetch of `https://hoplight.ai` on 2026-08-25: it serves the current Next.js site, canonical `https://hoplight.ai`, og:image `https://hoplight.ai/og.png`, and every nav route (`/rayli`, `/services`, `/portfolio`, `/persuasion`, `/about`, `/tools/which-ai`, `/faq`) resolves. **So: `hoplight.ai` is the canonical public URL and is what goes in any bio, profile, deck, email signature or link handed to a person.** `hoplight-rouge.vercel.app` is a still-attached alias, not the address. Never quote the vercel.app hostname to Whit or to an outside party again, and never repeat the Cloudflare claim without re-fetching the apex first.
- **Notes:** Fonts are Inter and JetBrains Mono, loaded through `next/font/google` in `src/app/layout.tsx`. **Not GT America** (corrected 2026-09-16 under Whit's typed GOVERNANCE EDIT): the ten GT America, Outfit and Playfair files in `public/fonts/` are referenced only by the static `public/pme-lever.html` and by nothing under `src/`; they stay only because that file needs them. Standard Next.js app router. One environment variable, `MAKE_INTAKE_WEBHOOK` (see README); the intake form's Make listener is scenario 6294831, rebuilt 2026-09-16 after the old webhook was found with no scenario attached.
## The Undo List, `/undo` (added 2026-10-09)

- **What it is:** every action of the second Trump administration since 2025-01-20, one row each,
  placed in one of five buckets by what it takes a president sworn in 2029-01-20 to undo it: a pen,
  a pen then a process, a simple majority, sixty votes, or locked. Public, deliberately not in the
  nav. Whit asked for it on 2026-10-09 ("a running list of everything that Trump has done that we
  can step into the oval office in 2029 and undo"). Nothing public did this; three research agents
  checked about sixty trackers first.
- **Where the rows come from.** Executive orders, proclamations and memoranda are read LIVE from the
  Federal Register API (no key) in `src/lib/undo/federal-register.ts`, revalidated hourly; a dead
  feed costs the page its live rows and nothing else. Everything else (statutes, CRA repeals, judges,
  final rules, withdrawals, tariffs, personnel, pardons, court rulings) is hand-curated in
  `src/data/undo/curated.json`. `src/data/undo/rulings.json` overrides the automatic placement of
  named Federal Register rows. The five buckets and the row shape live in `src/lib/undo/types.ts`;
  placement logic in `src/lib/undo/classify.ts`. A row the feed supplies is placed by instrument
  type alone until a ruling places it, and the page says "auto, unreviewed" on every such row.
- **Rules that bind here:** no clock words on the page (no "days since", "overdue", "stale"; a plain
  ISO date is fine), no em dashes in copy. Both are asserted by `scripts/undo-classify.test.mjs`,
  which runs in `npm test` and in CI.
- **This container cannot reach federalregister.gov** (the cloud session proxy blocks it), so a
  local build here always takes the feed's failure path. The feed was proved from a Vercel sandbox
  on 2026-10-09: 289 executive orders, 187 proclamations, 34 memoranda, one page each.
