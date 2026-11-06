#!/usr/bin/env node
// Adds link-preview metadata (meta description, canonical, og:*, twitter:*) to every static
// portfolio page under public/portfolio/*.html that is missing it. Review squad, 2026-09-16
// (expert-seo.md #8: "titles but no description, og:image, or canonical, and aren't in the
// sitemap"). Sibling to scripts/add-portfolio-header.mjs (which adds the nav strip); this only
// touches <head>, idempotent via the same kind of marker, and leaves the header script's own
// work alone.
//
// Descriptions are pulled from each page's own subtitle/first paragraph (see the inline map
// below, sourced by hand 2026-09-16 by reading each file — not generated), trimmed to <=155
// chars. Preview images point at the shared /api/og route (src/app/api/og/route.tsx) rather than
// a static file, so every card carries its own title text without a design pass per page.
//
// Path-safe via process.cwd() (this repo lives under a space in its path). Run as
// `npm run portfolio:metadata` from inside hoplight-site/.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PORTFOLIO_DIR = join(process.cwd(), 'public', 'portfolio');
const ORIGIN = 'https://hoplight.ai';
const MARKER = 'data-hoplight-pmeta';

// Card titles match src/app/(main)/portfolio/page.tsx's PIECES array exactly, for consistency
// with how each piece is already named on the gallery that links to it.
const TITLES = {
  'dnc-autopsy-taken-apart': 'DNC autopsy, taken apart',
  'oregon-school-budget-report': 'Oregon school budget report',
  'worker-equity-dilution-at-ge': 'Worker equity dilution at GE',
};

// Trimmed to <=155 chars. Source: each file's own <p class="subtitle">/<p class="lede">/first
// substantive <p>, quoted or paraphrased down to fit — see the done-file for the exact source
// line per page.
const DESCRIPTIONS = {
  'dnc-autopsy-taken-apart':
    "A systematic examination of what the DNC's 2024 after-action report says, what it omits, and what it means for Democratic politics.",
  'oregon-school-budget-report':
    'Five years of Oregon K-12 spending across all 197 districts shows where the money actually goes, and where it does not reach the classroom.',
  'worker-equity-dilution-at-ge':
    "An 80-year simulation (1940-2020) testing three equity structures against GE's historical headcount, revenue, and turnover.",
};

function ogImageUrl(title) {
  return `${ORIGIN}/api/og?title=${encodeURIComponent(title)}&sub=Hoplight+portfolio`;
}

function process_(file) {
  const path = join(PORTFOLIO_DIR, file);
  const slug = file.replace(/\.html$/, '');
  let html = readFileSync(path, 'utf8');

  if (html.includes(MARKER)) {
    // Migration, added 2026-09-20 (lane dispatch1). This script is write-once per file: it stamps a
    // marker and skips anything already carrying it, so correcting the template above would never
    // have reached the eleven pages it had already written. The separator in the tags THIS script
    // owns is normalised in place instead, which leaves the pages' own editorial prose untouched.
    const fixed = html
      .replace(/(<meta (?:property="og:title"|name="twitter:title") content="[^"]*?) — (Hoplight">)/g, '$1 - $2')
      .replace(
        'For mission-driven organizations beginning AI adoption — an interactive checklist',
        'For mission-driven organizations beginning AI adoption, an interactive checklist'
      );
    if (fixed !== html) {
      writeFileSync(path, fixed);
      console.log(`separator normalised: ${file}`);
    } else {
      console.log(`skip (already has metadata): ${file}`);
    }
    return;
  }

  const title = TITLES[slug] ?? slug;
  const url = `${ORIGIN}/portfolio/${file}`;
  const image = ogImageUrl(title);

  // "if missing" per item 6: two files (hoplight-persuasion-story-page.html,
  // oregon-school-budget-report.html) already carry a hand-written <meta name="description">.
  // Never overwrite an existing description — one of the two quotes a stat this lane was told not
  // to touch (no factual claim changes) — only add what each file is actually missing, and reuse
  // its own existing description for og:/twitter: so all three agree instead of drifting.
  const existingDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const hasDescription = Boolean(existingDescMatch);
  const description = existingDescMatch ? existingDescMatch[1] : (DESCRIPTIONS[slug] ?? '');

  const candidateTags = [
    hasDescription ? null : `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${url}">`,
    // Hyphen, matching src/app/layout.tsx. Was an em dash until 2026-09-20 (lane dispatch1), which
    // put one in the og:title of every static portfolio page, against the brand's own tone rule.
    `<meta property="og:title" content="${title} - Hoplight">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta property="og:type" content="website">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${title} - Hoplight">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${image}">`,
  ].filter(Boolean);

  const tags = `<meta ${MARKER}="1">\n${candidateTags.join('\n')}`;

  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${tags}\n</head>`);
  } else {
    // Defensive: every file here already has a <head> (add-portfolio-header.mjs guarantees a
    // full document), but if one ever doesn't, prepend before <body> rather than silently no-op.
    html = html.replace(/<body/i, `<head>\n${tags}\n</head>\n<body`);
  }

  writeFileSync(path, html);
  console.log(`updated: ${file}${hasDescription ? ' (kept existing description)' : ''}`);
}

function main() {
  const files = readdirSync(PORTFOLIO_DIR).filter((f) => f.endsWith('.html'));
  for (const file of files) process_(file);
}

main();
