STATUS: PASS

# Rumi Español, security check of 2026-11-07

Address: https://rumi-rouge.vercel.app (repo rumi, main at 75a288c: rumi-espanol-app.html, one file of 5.3 MB with its audio inside, vercel.json). Checked by lane Publicist SITESEC1 (Fable 5.1): the shipped file, the live headers, every remote branch for signal wiring (none yet; another lane is wiring it). No findings above low. The conditions for the logging are the part that matters; they are in the last section.

## Findings

### Low: no security headers beyond HSTS

Proof: live headers on /: Strict-Transport-Security with preload, access-control-allow-origin: * (Vercel's static default), nothing else. No X-Frame-Options or frame-ancestors (any site can frame the app), no X-Content-Type-Options, no Referrer-Policy, no Permissions-Policy. vercel.json has no headers block.

Fix: a headers block in vercel.json like Gut Check's: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy no-referrer, Permissions-Policy camera=(), microphone=(), geolocation=() (the app plays audio and does not record; if it ever listens, drop microphone from the list), and `Content-Security-Policy: frame-ancestors 'none'; object-src 'none'; base-uri 'self'`. Size: eight lines. Owner: rumi repo.

## Checked and clean

- No child's name in the shipped file: the state starts `name:"", age:5, gender:"f"` (line 1194) and the name is whatever the parent types on the device (line 3381, `kidName`), kept in localStorage under `rumi.v1` and nowhere else. The copy refers to "her" and "whoever speaks Spanish with her", no name. The hoplight.ai copy says "a five-year-old" (see portfolio-2026-11-07.md).
- No network call but its own voice clips (fetch of voiceClipUrl and voiceIndexUrl, same origin); no third-party script, no analytics, no cookie.
- No form posts anywhere; nothing a stranger can send to a server.
- The public anon key and the family name do not appear in the file.

## What must be true for the usage logging to be safe

The other lane is adding the Hoplight signal kit. The kit sends whatever props it is given, truncated at 1,000 characters each, and the site cuts only email addresses and phone numbers (src/lib/signal.ts); a name passes straight into public.tool_signals beside a daily visitor hash, country and region. So the app's own calls are the only wall. For a child's app that wall must be:

1. Never send `S.name`, `S.age`, `S.gender`, the voice the parent picked by any name that is a person, or any phrase the child said or typed. Send settings and counts: the section opened, the phrase by its index or id, the voice by its slug, the speed, stars earned, whether sound is muted.
2. Props come from a fixed list of keys written in the app, never from spreading the state object (`...S` or `...prefs`) into a call.
3. No feedback box in the app, or one that says in plain words that what is typed is kept without a name, since a parent will type the child's name. The site's contact page is the better door.
4. A second wall on the site, recommended and not done on sitesec1 because the wiring lane owns the key names: in src/lib/signal.ts, for the tools `rumi` and `letters`, accept only a listed set of prop keys and refuse any string value over 32 characters. Ten lines and a test.
5. Vercel's edge adds country and region to every event. For a child's app at home that is the family's region, every day, under one hash. Acceptable as coarse place; if Whit would rather not, the site can drop region for these two tools (one line in storeBody).

## Only Whit can check

Nothing for this app.
