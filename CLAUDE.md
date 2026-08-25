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
- **Stack:** Next.js + TypeScript + Tailwind
- **Build:** `npm run build`
- **Vercel project:** `hoplight`
- **Live URL:** https://hoplight.ai — **CORRECTED 2026-08-25 by live probe. This row said `hoplight-rouge.vercel.app` and a project memory note (`hoplight-domain-not-on-vercel`, written 2026-06-13) said the apex domain was still served by Cloudflare. Both were false and had been for weeks.** `counted`, Vercel API `GET /v9/projects/hoplight`: the project's domain list is `hoplight.ai`, `www.hoplight.ai`, `hoplight-rouge.vercel.app`, plus the two generated hostnames. `counted`, live fetch of `https://hoplight.ai` on 2026-08-25: it serves the current Next.js site, canonical `https://hoplight.ai`, og:image `https://hoplight.ai/og.png`, and every nav route (`/rayli`, `/services`, `/portfolio`, `/persuasion`, `/about`, `/tools/which-ai`, `/faq`) resolves. **So: `hoplight.ai` is the canonical public URL and is what goes in any bio, profile, deck, email signature or link handed to a person.** `hoplight-rouge.vercel.app` is a still-attached alias, not the address. Never quote the vercel.app hostname to Whit or to an outside party again, and never repeat the Cloudflare claim without re-fetching the apex first.
- **Notes:** GT America web fonts. Standard Next.js app router. Root of `~/code/` is a legacy RAG MVP (marketing-bible-rag), not the hoplight site. **ARCHIVE-PENDING-WHIT (flagged 2026-07-31):** this root-level RAG MVP (`marketing_bible_chunks.jsonl`, `package.json`, `app/` at the top of `~/code/` itself, no `.git` found in this sandbox) is superseded by `hoplight-site` and not otherwise referenced in this file; Whit's call whether to archive it out of `~/code/` root.
