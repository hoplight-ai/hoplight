# Hoplight

The company site for Hoplight AI (hoplight.ai): who we are, what we build, and the portfolio of shipped work.

- **Live:** https://hoplight-rouge.vercel.app
- **Stack:** Next.js (App Router) + TypeScript + Tailwind. GT America web fonts.

## Run locally

```bash
npm install
npm run dev     # localhost:3000
```

## Deploy

Push to `main` — Vercel auto-deploys (project `hoplight`). Build with `npm run build` first; the build must be green before any commit.

## Notes

- The Vercel framework preset must stay **Next.js** — with any other preset every route 404s.
- The apex domain `hoplight.ai` is served via DNS pointing at Vercel; the canonical URL and sitemap are configured for `hoplight.ai`.
- One environment variable: `MAKE_INTAKE_WEBHOOK`, the Make.com address the contact form forwards
  to. It lives in the Vercel project (see `.env.example` and `scripts/set-vercel-env.sh`). Without
  it the site builds and serves, and `/api/intake` answers 503 with an email fallback.
