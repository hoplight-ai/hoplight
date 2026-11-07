// Counts the visible words in the built HTML of the pages HOPSITE2 cut (2026-11-07), from .next after
// `npm run build`, with the same rules as scripts/count-visible-words.mjs (nav and footer included; head,
// scripts, styles, drawings, .sr-only text and the skip link dropped). It reads files, so it can count a
// page the running server would put behind the sign-in.
//
//   node scripts/count-built-words.mjs

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..', '.next', 'server', 'app');
const PAGES = { '/': 'index.html', '/portfolio': 'portfolio.html', '/products': 'products.html', '/services': 'services.html', '/insights': 'insights.html', '/about': 'about.html' };

function visibleText(html) {
  let body = html.slice(html.indexOf('<body'));
  body = body.replace(/<(script|style|noscript|svg|canvas|template)\b[\s\S]*?<\/\1>/gi, ' ');
  body = body.replace(/<(\w+)\b[^>]*class="[^"]*\bsr-only\b[^"]*"[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  body = body.replace(/<a\b[^>]*class="[^"]*\bskip-link\b[^"]*"[^>]*>[\s\S]*?<\/a>/gi, ' ');
  body = body.replace(/<[^>]+>/g, ' ');
  return body.replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

for (const [route, file] of Object.entries(PAGES)) {
  const p = join(APP, file);
  if (!existsSync(p)) { console.log(`${route}: no build file`); continue; }
  const words = visibleText(readFileSync(p, 'utf8')).split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w));
  console.log(`${route}: ${words.length}`);
}
