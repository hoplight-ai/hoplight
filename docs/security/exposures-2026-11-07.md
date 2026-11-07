# Pages found public that maybe should not be, 2026-11-07

Four addresses the brief's read agent found answering 200 to a stranger. Each one re-read live by lane Publicist SITESEC1 (Fable 5.1) on 2026-11-07, with what it holds and the one-line fix: gate, move, or leave.

## 1. The Daily, https://podcast-knowledge-engine.vercel.app/

Live: 200, no sign-in. Holds: Whit's own reading, podcast knowledge units and newsletter items filed into nine desks, browsable by day and desk, with sources and an archive. No credential in the page, no client, no money, no person named beyond the people in the stories. It shows what he reads, which is a habit, not a secret. hoplight.ai/daily sits behind the one-password sign-in and then sends the browser to this open address, so that gate is cosmetic.

Fix: gate. Copy the one-password middleware the hub and Gut Check use into the podcast-knowledge-engine repo, same pair, same cookie scheme; or decide it is public reading and leave it, in which case the hoplight.ai/daily gate should go too so the two agree.

## 2. SEIU Learn and SEIU Member Survey, https://visualizations-eta.vercel.app/public/dashboards/seiu-learn and /seiu-member-survey

Live: 200 and 200, 177 KB and 66 KB. Holds: client material for SEIU, a learning dashboard and a member-survey participation dashboard by local. SEIU Learn carries a named SEIU 721 staff email address in its source. Each page draws a full-screen "gate" in JavaScript over the content; the content is in the same file, so the gate is a curtain, not a door. The visualizations repo's server-side gate covers /private/* and not /public/*; these two sit under public/ on purpose or by inheritance.

Fix: move. `git mv` both files under private/dashboards/ in the visualizations repo so the server gate covers them, and give SEIU the password (or a share password of their own, as Gut Check does). If SEIU needs an open link, strip the staff email first and accept that the page is public.

## 3. Token Burn by Type, https://visualizations-eta.vercel.app/token-burn-by-type-2026-10-29

The brief placed this on quick-tools; it is on visualizations (data/shipped.json in quick-tools lists it there). Live: 200, 13 KB. Holds: his own operation's token spend by agent type, numbers and labels about how this fleet runs. No client, no person, no credential. Internal ops that a competitor or a curious reader could learn from, nothing anyone could act on against him.

Fix: move. `git mv` the file under private/ in the visualizations repo; one line.

## 4. Friday Pizza Night, https://quick-tools-pi.vercel.app/tools/pizza-night

Live: 200, 32 KB, on OPEN_PATHS in middleware.js by name. Holds: a household checklist in phases with per-person amounts, no names, no address, no email in the page. The page ships the project's public anon key, and public.pizza_night_items carries anon insert, select and update policies (migration 0013 narrowed the grant to those three), so anyone holding the address can read and edit the list. The page's own comment records that as Whit's ruling: "anyone holding the URL may edit the list ... There is a restore path instead of a gate."

Fix: leave, as ruled. If a stranger ever edits it, the restore path is the nightly backup. The one thing to keep true: no other table gets anon write policies on the strength of this one.
