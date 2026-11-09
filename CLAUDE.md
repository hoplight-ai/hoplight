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

- **What it is:** every executive action of the second Trump administration since 2025-01-20 (the
  orders, proclamations and memoranda a president sworn in 2029-01-20 can undo with a pen), one row
  each. Both pages list executive actions only (since 2026-11-08, see "Executive actions only"
  below). The data still places every row in one of five buckets (a pen, a pen then a process, a
  simple majority, sixty votes, or locked), and the other four buckets stay in the data, untouched;
  the pages draw the pen bucket alone. Public, deliberately not in the nav. Whit asked for it on 2026-10-09 ("a running list of everything that Trump has done that we
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
- **Issues and Forward Orders (2026-10-15).** Every written-up row carries one to three issue tags
  from `src/lib/undo/issues.ts` (sixteen keys named for who is affected, never for a side; Whit:
  "veterans should be pissed and want these things signed, too"), stored in
  `src/data/undo/issues/*.json`. "Where it lands" draws one bar per issue (pen, process, Congress,
  locked) with the reader's ticks as a hairline. `src/data/undo/forward.json` holds the Forward
  Orders: thirteen omnibus orders that together revoke every standing pen item exactly once;
  "Sign this order" ticks the whole bundle and "Draft the order" renders the full text
  (`src/lib/undo/forward-text.ts`). Whit: "its not roll back, we must go forward."
- **Reshaped 2026-10-19 (Whit: "it doesn't feel intelligent... a lot of cognitive effort... no way to
  filter... no way to combine multiple executive orders into one thing... a progress bar or like a
  visual interactive representation... especially on a phone... trying to do everything through
  text").** The first screen is now the signature field (`SignatureField.tsx`, packing in
  `src/lib/undo/field.ts`): one square per standing pen item, one block per Forward Order, gold when
  signed; the headline is "Thirteen signatures undo 287 things." with one button. The Forward Orders
  are one row each (title, count, a meter, Sign) and open to their items and the draft; the issue
  filter ("Who feels it") sits above them and reaches the field, the orders, the bars and the list;
  the sticky strip carries one segment per order; a list row is one line until its Details open. The
  hero moved into `UndoList.tsx` because the field, the strip and the ticks share one signed set.
  The field's packing and the new copy are pinned in `scripts/undo-classify.test.mjs`. The
  Browser pane's `preview_start` could not launch the dev server from this folder (getcwd EPERM);
  the page was proved on a local `next start` of the production build instead.
- **Second pass the same evening, after Whit's second ruling ("a scroll bar that small means you put
  way too fuciing much in an unusable wall... we need adversarial review... wtf is the key 'how the
  buckets work' doin on the bottom?" and "the quitting stuff- that shoud be brannded- America isn't a
  Quitter").** Three fresh-context critics read the live page (a hostile design director measured
  it at 78,966px, 97 phone screens, the key at screen 94; a ninety-second phone reader; an
  information-integrity auditor who rebuilt the pipeline against the live feed). What changed:
  the full list is its own page, `/undo/all` (`UndoAll.tsx`, sections closed until tapped, lists
  paged by 25); `/undo` is hero, key, filter, orders, close, one link; the key is a stacked bar of
  everything with the five kinds and their counts, right under the field; the issue bars ARE the
  filter (first five, the rest on a tap), the chip row is gone so one label carries one count; each
  order row carries a plain line of what it ends (`line` in forward.json); the withdrawals order is
  "America isn't a quitter" and the group is "Things America quit"; the hero's "0 of N signed"
  counter went (the strip has it). Data: 19 hand-curated rows were twins of Federal Register rows
  (the same tariff proclamation or order counted twice), so the hero fell from 287 to 275, the list
  from 708 to 688; an `R1-` republication is skipped in the feed mapper; a test now refuses a
  curated row that carries a feed number as its own. Both pages read one loader,
  `src/lib/undo/load.ts`. The five-model Design Murder Board webhook was refused by the session's
  auto-mode classifier (outbound POST), so the review was the three in-house critics.
- **Executive actions only (2026-11-08, lane undopen1; Whit: "wait yes the undo list is supposed ot be just exec orders").** `load.ts` hands both pages the pen-bucket rows only (`penRows` in `src/lib/undo/pen.ts`; the classifier and the data are untouched), the key counts the pen rows still standing by kind, /undo/all lists the same pen rows with one sort control (newest first, oldest first, by signing order), and `scripts/undo-pen.test.mjs` pins that no other bucket renders, the counts, one bundle per pen row and the sort.
- **Round 2 the same day, after a visual-sociologist review failed the first pass on seven points.** One count everywhere, the rows still standing: /undo/all opens on "To undo (N)" with rows showing, and the other pen rows (Already undone, Not yet written up, Worth keeping, Ceremonial) sit behind one closed fold, the only place the whole pen total prints; the chips count the standing rows, so they match the bars on /undo. The issue filters sit behind one "Filter by issue" control under 760px. The key counts by document type only (executive orders, proclamations, memoranda, withdrawals, other) as sideways bars in the same form as "Who feels it". The ticks legend is gone, and every hero block carries its order's name. The built-page checks in `scripts/undo-pen.test.mjs` skip until `npm run build` has run.
- **Round 3 the same day, after a second review failed round 2 on nine points.**
  - /undo/all: rows start in the first screen at 1440 and 390. There is no heading over the list, and the issue filters sit behind the "Filter by issue" control at every width. Rows carry no "one signature" chip. The fold reads "Off the to-undo list (N)" with a line naming its four groups.
  - Units, labels and type: every count is in executive actions (never "items"), and each bar's count sits at its end. The sort labels are Newest, Oldest, By order. Buttons and fields take the page font instead of Arial.
  - By kind: the key counts each row under the document that issued it, read from every source label on the server (the 2026-01-07 memorandum's 64 withdrawals count as memoranda), so there is no Withdrawals kind.
  - Names: the allies issue is "Allies, treaties and aid". "America isn't a quitter" stays, because it is Whit's own words (2026-10-19, quoted above).
- **Rows draw at their real height (2026-11-08, lane undotidy1).** List rows no longer use deferred drawing (`content-visibility: auto` with a 150px placeholder, from the first build when the list was one 700-row page). Measured at 1440, a one-line row is 63px and a row still waiting drew at 179px, so a full-page render showed blank rows and the scroll bar jumped. The list pages by 25, so nothing needs deferring; `scripts/undo-pen.test.mjs` pins it.

## The Command Center door, `/command-center` (added 2026-10-28, lane sendlist1)

- **What it is:** the July 2026 chief-of-staff desk prototype (v2), shown to one person at a time behind its own password. Whit, 2026-10-23: "give it a password". Its copy is his mockup, unchanged apart from self-hosted fonts and neutral ground colours.
- **Route:** `src/app/command-center/route.ts` (GET serves the page or the sign-in form, POST is the form sign-in). Door logic: `src/lib/command-center.ts`. Page file: `src/private/command-center.html`, read at request time, so the route is the only way in (`outputFileTracingIncludes` in `next.config.ts` ships it).
- **Password:** env var name `COMMAND_CENTER_PASSWORD` on the `hoplight` Vercel project (production, preview, development). The value lives there and in no file. A request passes with Basic auth (any user plus the password) or the thirty-day `cc_access` cookie. With the variable missing, nobody gets in (fails closed).
- **Test:** `scripts/command-center.test.mjs`, seven tests, part of `npm test`. It is the proof that his own way in still works; a change to the door is not done until it passes.
- **Never add `/command-center` to the site gate** (`GATED_PREFIXES` in `src/lib/gate.ts`). The door is page-level on one route so one link can go to one person, and it never touches the site-wide sign-in.

## The site gate (written 2026-11-08 from main's code, lane cardlive1)

- **What it gates:** `src/lib/gate.ts`. `GATED_PREFIXES` gates a path equal to or under `/persuasion`, `/research`, `/portfolio`, `/rayli`, `/shelf-options`, `/mockups` and the seven moved tools (`MOVED_TOOLS`: `/tools-hub`, `/visualizations`, `/whatshuman`, `/pme`, `/research-books`, `/board`, `/daily`). `GATED_EXACT` gates five single files (`/hoplight-rct-research-brief.pdf`, `/pme-lever.html` and its manifest, the 2026-09-20 brand tokens page and its manifest). `PUBLIC_PORTFOLIO` opens `/portfolio` itself and the Oregon report under it; every other file under `/portfolio/` stays gated. `/tools/which-ai` is public and `/tools` is not gated on purpose.
- **Where it runs:** `src/proxy.ts`. Its `config.matcher` must list the same paths as `gate.ts` (it lists `/portfolio/:path*` and not `/portfolio`, since the page is public). A moved tool answers a 307 to its vercel.app address, and only after sign-in.
- **Sign-in:** env var names `PRIVATE_SITE_USER` and `PRIVATE_SITE_PASSWORD` (the values live on the Vercel project and in no file). A browser gets the sign-in page, a script gets a 401 with a Basic challenge, and a cookie or the Basic pair opens the path. With no password set, every gated path stays shut.
- **Test:** `scripts/gate.test.mjs`, in the `package.json` test line. It fails when the matcher and the gate list drift, when the sitemap names a gated path, or when a moved tool forwards before sign-in.
- **Redirects** (`next.config.ts`; they run before the proxy, so no gated path is redirected there): `hoplight-rouge.vercel.app` to `hoplight.ai`; `/engine` and `/pme.html` to `/persuasion`; `/index.html`, `/services.html`, `/persuasion.html`, `/about.html`, `/faq.html`, `/contact.html` and `/portfolio.html` to their routes; `/work`, `/work.html` and `/products` to `/portfolio`; four 2026-09-21 draft home pages, the 2026-09-09 productized services mockup and `/home-art/` to the visualizations site's private folder.
- **`public/mockups`** (gated under `/mockups`): the three site posture mockups `a-discretion`, `b-candor` and `c-hybrid` (four pages each: home, products, services, insights), and the link-card mockups `card-frames.html`, `card-lockup.html` and `card-marks.html`.

## Revenge or Justice, `/revenge-or-justice` (added 2026-11-06)

- **What it is:** the grader Whit asked for on 2026-11-05 ("drop a press release from house oversight
  or a quote from jamie raskin or a news article and have it evaluated on this"), made a Hoplight tool
  on 2026-11-06 ("let's make this a hop light tool"; "make justice the second thing so that it rings").
  Paste a statement or a link, or click one of the recent articles on the right. The politicians and
  operatives in their own words come first; a toggle reads the outlet's own framing on the same scale,
  and the whole text last (Whit, 2026-11-06: "i should see the politicians and operative etc first, and
  i should be able to toggle to have the outlet/coverage evaluated"); within a voice, one tab per issue.
  Five readings as bars out from a centre line between revenge and justice, the precedent pair, the
  words behind each reading with the speaker named on each quoted line, three rewrites. Public, not in the nav, in the sitemap. `/revenge-or-justice/about` is the
  why, the record and how it reads, in Whit's own words from his Substack draft of 2026-11-05 and his
  messages of 2026-11-06, as short blocks with a bold lead-in, no location, his name as the sign-off and
  (since 2026-11-07) the site's feedback box under it in place of the old Send feedback button to /contact;
  nothing in his voice was written for him.
- **Where the grader lives:** NOT here. `/api/revenge-or-justice` and `/api/revenge-or-justice/feed`
  forward to quick-tools (`/api/justice-or-retribution`, `/api/justice-feed`, behind that site's
  sign-in) with this site's own `PRIVATE_SITE_USER` / `PRIVATE_SITE_PASSWORD` pair, so the Anthropic
  key stays on the one project that holds it. The rubric, the precedent corpus, the issue split, the
  people and key words of the headline list, and the verify script are all in the quick-tools repo.
  The API's word for the bad side stays `retribution`; `tool.js` shows `revenge`.
- **The page is a port, on purpose:** `RevengeOrJustice.tsx` is static markup drawn into by id by
  `tool.js`, the quick-tools page script as it stood at build v6 (plus the word swap and the route
  names), and `revenge-or-justice.css` is that page's stylesheet scoped under `.rj` with the site's
  tokens. React never re-renders the exhibit. Newsreader is loaded by the page for the quoted words
  only.
- **What stands between the public and a paid model call:** six readings an hour per address and
  three hundred a day per instance (`checkLimitIn` in `src/lib/rate-limit.ts`, tested in
  `scripts/intake-ratelimit.test.mjs`), both soft; the hard limit is a Vercel Firewall rate-limit
  rule on the two routes, Whit's to set.

## Tool drops, feedback and anonymous usage (added 2026-11-07, lane tooldrop1)

- **The portfolio is a schedule.** `src/data/tools.ts` holds every entry with `releaseAt` (a day, read as
  midnight America/Los_Angeles) and `cleared`. `/portfolio` shows an entry only when both hold, newest
  first, and revalidates hourly, so a cleared entry appears on its day with no deploy. Flip `cleared` only
  after `npm run launch:check -- <slug>` passes. Outside production, `PORTFOLIO_NOW` and
  `PORTFOLIO_SHOW_UNCLEARED=1` let a render show a future drop. Tested in `scripts/portfolio-schedule.test.mjs`.
- **`hold: '<one-line reason>'` keeps an entry off `/portfolio` whatever its date and clearance**, even in an uncleared preview render, for a cut or a tool held back for its own announcement (PORTHOLD1, 2026-11-07: Bet Appetit cut, AGIS and Gut Check held). The entry stays in the list so its links and preview card still work, and a held slug must not appear in the portfolio card's `LIBRARY` in `src/lib/brand/tool-card.ts` (tested). Delete the `hold` line to put it back.
- **Every entry carries `shelf: 'product' | 'report'`** (required by the type; PORTSPLIT1, 2026-11-07, Whit: "we had previously split out reports from apps and dashboards and I think we need that sort of division"). `/portfolio` shows products only, through `onShelf('product', ...)` in `src/data/tools.ts`. `/insights` keeps its own hand-kept Reports list in `src/lib/insights-content.ts`, which names the three reports (Whit, 2026-11-07, after seeing a redesign: "The insights page the before version is the winner and the products page ... the after version is the winner"). So a new report goes in the tool list with `shelf: 'report'` and also in the Insights Reports list; the shelf test fails if a report is not listed once on the built /insights. `shelf` is not `kind`, which stays the state label. Tested in `scripts/portfolio-shelf.test.mjs`.
- **Writing on `/insights` is Whit's Substack feed** (`src/lib/substack.ts`, `https://whitpendergast.substack.com/feed`, cached an hour), falling back to the hand-kept `WRITING` list when the feed fails or is empty. Tested on a saved copy of the feed in `scripts/fixtures/`, never on the network (`scripts/insights-writing.test.mjs`).
- **Every tool has its own preview card** at `/api/og/tool/<slug>` (`src/lib/brand/tool-card.ts`): the tool's
  name and look inside one identical Hoplight frame, a solid navy mat (28px at the top and sides, 108 at the
  foot) with the bloom and the word Hoplight in its foot, lockup b (`bloomLockup()` in
  `src/lib/brand/marks.ts`). Whit picked both on 2026-11-07 ("let’s do lock up b"); the approved mockups are
  `public/mockups/card-frames.html` (treatment 3) and `public/mockups/card-lockup.html` (option b), and
  `scripts/tool-card.test.mjs` holds the renderer to their numbers. `?band=0` is the frameless portfolio tile.
  Pages use `toolMetadata()` in `src/lib/metadata.ts`. `npm run cards:export -- --base <url>` writes every
  card as a PNG; `npm run cards:sheet -- --dir <that folder>` makes one contact sheet of them at 300px and
  at full size; `node scripts/cards-measure-foot.mjs <png>` reads the frame and lockup back from the pixels.
- **Feedback and usage go through one route**, `POST /api/signal` (rules in `src/lib/signal.ts`, tested in
  `scripts/signal.test.mjs`), forwarded to the quick-tools store. Env, names only: `TOOL_SIGNAL_URL`
  (unset: signals are answered 202 and dropped), `SIGNAL_HASH_SALT`, and the existing `PRIVATE_SITE_USER` /
  `PRIVATE_SITE_PASSWORD`. Pages call `track()` from `src/lib/track.ts` and put `<ToolFeedback tool=...>` at
  the foot; tools hosted elsewhere load `/kit/signal.js`. No third-party analytics, ever.
