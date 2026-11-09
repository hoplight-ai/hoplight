# Which AI refresh (monthly)

The facts behind https://hoplight.ai/tools/which-ai live in `src/data/which-ai.ts`. This is the job the
monthly scheduled task `which-ai-refresh` runs. Whit, 2026-11-09: "we probably need to set up some sort
of schedule task that goes about refreshing this tool to keep it relevant."

1. Open the session in `hoplight-site`, on a new branch `which-ai-refresh-<YYYY-MM-DD>` cut from `main`.
2. Fetch every page in `SOURCES`. For each platform, compare the page to the rows: plan names, US
   monthly prices, whether personal plans train by default, retention, human review, how to opt out, and
   what business plans promise. Blogs and pricing aggregators are leads only; a cell changes only when the
   company's own page says so. Where the company's page is unreachable, leave the row and say so in the PR.
3. Check the current flagship model family per product (`models`) against the company's own announcements
   and the arena.ai leaderboard. Keep the family name only ("GPT-6 family"), never a point release.
4. Read the recommendation text in `src/app/(main)/tools/which-ai/WhichAiTool.tsx` (`getRecommendation`)
   for any claim a new release has made false, a retired product name, or a feature that no longer exists.
   Change a primary pick only when two independent current sources agree it has moved.
5. Add any new source page you relied on to `SOURCES`. Set `CHECKED_AT` to today.
6. Run `npm test` and `npm run build`. Both must pass.
7. Commit with a message listing every changed cell as old to new with its source link, push the branch,
   and open a PR against `main` titled `Which AI refresh <YYYY-MM-DD>`. If nothing moved, still bump
   `CHECKED_AT` in the PR and say "no changes found" in its body.
8. Report to Whit in one line: how many cells changed, the PR link.
