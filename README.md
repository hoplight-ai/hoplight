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
- No environment variables are required; the site is fully static content.
