#!/usr/bin/env node
// Adds a minimal shared header strip (wordmark home-link + "Start a conversation") to every static
// portfolio page under public/portfolio/*.html. UX review, 2026-09-16: several of these pages are a
// genuinely good lead-gen tool (the AI governance checklist) or a real interactive piece, and once a
// visitor finishes one there is nothing to click — no nav, no logo, no way back into the funnel. One
// file (redistricting-seat-shifts.html) is bare SVG with no <html>/<head>/<body> at all and no
// <title>, so its tab shows the raw file path.
//
// Idempotent and repeatable: run it again after adding a new portfolio HTML file and it only
// touches files that don't already carry the marker below. Each page's own styling is left intact;
// the strip carries its own scoped class names (hoplight-phdr*) and inline styles so it never
// collides with a page's local CSS variables or resets.
//
// Path-safe via process.cwd() (this repo lives under a space in its path). Run as
// `npm run portfolio:header` from inside hoplight-site/.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PORTFOLIO_DIR = join(process.cwd(), 'public', 'portfolio');
const MARKER = 'data-hoplight-phdr';

// Only the one file with no <title> at all needs an explicit override; every other file keeps its
// existing <title>. Kept human-readable, matching the card title on /portfolio.
const TITLE_OVERRIDES = {
  'redistricting-seat-shifts': 'Redistricting seat shifts | Hoplight',
};

const HEADER_FRAGMENT = `
<div class="hoplight-phdr" ${MARKER}="1">
  <style>
    .hoplight-phdr { display: flex; align-items: center; justify-content: space-between; gap: 16px;
      padding: 12px 20px; background: #0F1B2D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
    .hoplight-phdr-brand { color: #fff; font-weight: 700; font-size: 13px; letter-spacing: 0.08em;
      text-transform: uppercase; text-decoration: none; }
    .hoplight-phdr-brand:hover { color: #E8A820; }
    .hoplight-phdr-cta { color: #0F1B2D; background: #D4950A; font-weight: 600; font-size: 13px;
      padding: 8px 16px; border-radius: 4px; text-decoration: none; white-space: nowrap; }
    .hoplight-phdr-cta:hover { background: #E8A820; }
  </style>
  <a class="hoplight-phdr-brand" href="https://hoplight.ai">Hoplight</a>
  <a class="hoplight-phdr-cta" href="https://hoplight.ai/contact">Start a conversation</a>
</div>
`;

function titleFor(slug, existing) {
  if (TITLE_OVERRIDES[slug]) return TITLE_OVERRIDES[slug];
  if (existing) return existing;
  return `${slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')} | Hoplight`;
}

function process_(file) {
  const path = join(PORTFOLIO_DIR, file);
  const slug = file.replace(/\.html$/, '');
  let html = readFileSync(path, 'utf8');

  if (html.includes(MARKER)) {
    console.log(`skip (already has header): ${file}`);
    return;
  }

  if (/<body[^>]*>/i.test(html)) {
    html = html.replace(/<body([^>]*)>/i, (m) => `${m}\n${HEADER_FRAGMENT}`);
    if (!/<title>/i.test(html)) {
      const title = titleFor(slug, null);
      html = html.replace(/<\/head>/i, `<title>${title}</title>\n</head>`);
    }
  } else {
    // No html/head/body at all (raw SVG served as .html). Wrap it in a minimal document.
    const title = titleFor(slug, null);
    html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body>
${HEADER_FRAGMENT}
${html}
</body>
</html>
`;
  }

  writeFileSync(path, html);
  console.log(`updated: ${file}`);
}

function main() {
  const files = readdirSync(PORTFOLIO_DIR).filter((f) => f.endsWith('.html'));
  for (const file of files) process_(file);
}

main();
