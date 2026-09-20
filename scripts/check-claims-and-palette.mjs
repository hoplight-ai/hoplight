#!/usr/bin/env node
// Three standing guards that scripts/verify.sh could not express, because its grep helpers only
// ever read $SRC and every one of these has to cover public/ as well. Added 2026-09-20 (lane
// dispatch1). Run: node scripts/check-claims-and-palette.mjs [--root <dir>]
//
// 1. BANNED TRIAL PHRASING. "11 to 26 points" mixes two baselines into one range and that range
//    does not exist in the vendor's topline. It was ruled dead 2026-08-15. It is allowed to appear
//    in a source comment, because the comment on research/page.tsx is the record of WHY it is dead
//    and the next session needs that; it is never allowed in a rendered string.
// 2. A LIFT NUMBER WITH NO BASELINE IN ITS OWN SENTENCE. The August 2025 trial has two honest
//    pairs, +10 to +23 over the staff-written frame and +18 to +26 over the placebo group, and a
//    number with no baseline beside it silently becomes whichever one the reader assumes. Every
//    sentence carrying a lift number therefore has to name what the lift is over.
// 3. THE RETIRED HOPLIGHT PAIR. #0A1628 / #E8A838 was the palette before a0fe4b2. The brand file
//    in the design canon names src/app/globals.css as its own source and was extracted from it on
//    2026-06-02; the stylesheet changed afterwards and the brand file did not, so by the brand
//    file's own rule the stylesheet is authoritative and the old pair is dead in this repo.
//
// A fourth guard, that the served brand-token files still agree with globals.css, lives in
// scripts/check-brand-tokens.mjs because it needs the same generator this one would have to import.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// --root exists so the checks can be pointed at an older tree and watched going red; without it the
// root is this file's own repo, resolved from its path rather than cwd. fileURLToPath rather than
// `new URL(...).pathname`, which mangles the space in the containing folder's name.
const rootFlag = process.argv.indexOf('--root');
const ROOT = rootFlag === -1
  ? join(dirname(fileURLToPath(import.meta.url)), '..')
  : process.argv[rootFlag + 1];

const SCAN_DIRS = ['src', 'public'];
const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.html', '.json', '.svg']);
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'fonts', 'img', 'images']);

// The generated PNG/ICO family is built FROM favicon.svg by scripts/gen-favicons.mjs, so the SVG is
// the only place the mark's colours are authored and the only place worth checking.
function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(p, out);
    } else if (SCAN_EXT.has(extname(e.name))) {
      try {
        if (statSync(p).size < 4_000_000) out.push(p);
      } catch { /* unreadable file is not a claim */ }
    }
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)));
let fail = 0;
const report = (ok, label, hits = []) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${label}`);
  for (const h of hits) console.log(`   ${h}`);
  if (!ok) fail = 1;
};

// Comments are blanked out rather than pattern-matched per line, because the record of WHY a
// phrasing is dead is written as a multi-line block comment and its continuation lines look like
// ordinary prose. A first cut tested each line for a leading comment marker and reported
// ResearchStatBand.tsx:50 as a live claim when it is the third line of a {/* ... */} block.
// Line numbering is preserved: every removed character becomes a space, every newline survives.
function stripComments(src) {
  const out = src.split('');
  const blank = (from, to) => {
    for (let i = from; i < to && i < out.length; i++) if (out[i] !== '\n') out[i] = ' ';
  };
  // Block forms first: /* ... */ (JS, CSS, JSX inside braces) and <!-- ... --> (HTML, SVG).
  for (const [open, close] of [['/*', '*/'], ['<!--', '-->']]) {
    let i = 0;
    while ((i = src.indexOf(open, i)) !== -1) {
      const end = src.indexOf(close, i + open.length);
      const stop = end === -1 ? src.length : end + close.length;
      blank(i, stop);
      i = stop;
    }
  }
  // Then // to end of line, on the post-block text, so a // inside a stripped block is not
  // re-handled and a URL's // is skipped by requiring the preceding character not to be a colon.
  const partly = out.join('');
  let j = 0;
  while ((j = partly.indexOf('//', j)) !== -1) {
    if (partly[j - 1] !== ':') {
      const nl = partly.indexOf('\n', j);
      blank(j, nl === -1 ? partly.length : nl);
    }
    j += 2;
  }
  return out.join('');
}

// ---- 1. banned trial phrasing ------------------------------------------------------------------
const BANNED = /\b11\s*(?:to|-|–|—)\s*26\b/i;
{
  const hits = [];
  for (const f of files) {
    stripComments(readFileSync(f, 'utf8')).split('\n').forEach((line, i) => {
      if (BANNED.test(line)) hits.push(`${relative(ROOT, f)}:${i + 1}: ${line.trim().slice(0, 140)}`);
    });
  }
  report(hits.length === 0, "no '11 to 26 points' anywhere outside a source comment (ruled dead 2026-08-15)", hits);
}

// ---- 2. a lift number with no baseline in its own sentence -------------------------------------
// The lift shapes the site actually renders: "up to 26 points", "10 to 23 points", "+18 to +26
// points", "26 points net". A bare "9 points below" is a within-sentence comparison and carries
// its baseline in the word "below the placebo group", which the baseline vocabulary below covers.
const LIFT = /(?:\+?\d{1,2}\s*(?:to|-|–)\s*\+?\d{1,2}|\b\d{1,2})\s*points\b/i;
const BASELINE = /(placebo|baseline|control|staff-written|staff written|human-written|no message|unrelated message|over the (?:staff|human)|no-message)/i;
{
  const hits = [];
  for (const f of files) {
    const lines = stripComments(readFileSync(f, 'utf8')).split('\n');
    lines.forEach((line, i) => {
      if (!LIFT.test(line)) return;
      // Sentence window: the line itself plus the next two lines, because JSX and HTML both wrap a
      // single rendered sentence across lines and the baseline clause is routinely on the next one.
      const window = [line, lines[i + 1] ?? '', lines[i + 2] ?? ''].join(' ');
      if (!BASELINE.test(window)) {
        hits.push(`${relative(ROOT, f)}:${i + 1}: ${line.trim().slice(0, 140)}`);
      }
    });
  }
  report(hits.length === 0, 'every rendered lift number names its baseline in the same sentence', hits);
}

// ---- 3. the retired Hoplight colour pair -------------------------------------------------------
// Both notations. The hex form alone is what the 2026-09-16 consolidation checked, and PmeContent.tsx
// passed that check while still painting eleven rgba() tints in the retired navy and the retired
// gold. A guard that only reads hex is the reason this drift survived a fix aimed straight at it.
const RETIRED = /#(?:0A1628|E8A838)\b|rgba?\(\s*10\s*,\s*22\s*,\s*40|rgba?\(\s*232\s*,\s*168\s*,\s*56/i;
{
  // The generated brand-token files are the one place the retired values are meant to appear: they
  // carry them under a "retired" key and strike them through on the page, so that a session holding
  // an old value can look it up and find it marked dead. Exempted by name, and nowhere else.
  const isTokenReference = (f) => /hoplight-brand-tokens-\d{4}-\d{2}-\d{2}/.test(f);
  const hits = [];
  for (const f of files) {
    if (isTokenReference(f)) continue;
    stripComments(readFileSync(f, 'utf8')).split('\n').forEach((line, i) => {
      if (RETIRED.test(line)) hits.push(`${relative(ROOT, f)}:${i + 1}: ${line.trim().slice(0, 140)}`);
    });
  }
  report(hits.length === 0, 'no retired navy or retired gold under src/ or public/, in hex or in rgba()', hits);
}

// ---- 4. em dashes in rendered output -----------------------------------------------------------
// The design canon bars the em dash from rendered output and the Hoplight brand file's own tone
// markers say the same: "No em dashes. Use hyphens, commas, colons, periods." On 2026-09-20 the
// built site carried them on 45 output files, because the title template read "%s — Hoplight" and
// so every <title> and every og:title on the domain was the standing exception to the rule.
//
// Both notations. Two of the four survivors were written as &mdash; and a grep for the literal
// character never saw them; they were found only by grepping the BUILT html, which is a step
// nobody repeats. Comments are exempt: this file and several others discuss the character by name.
//
// SCOPE, and it is deliberate. This fails on src/ and on the served pages this repo composes. The
// nine standalone reports under public/portfolio/ are counted and printed, and do NOT fail the run:
// their em dashes are inside editorial prose and inside data tables that use the character as an
// "no value" marker, and a machine sweep of those would mangle sentences to satisfy a grep. They
// are counted on every run so the number is visible and can only go down.
const EMDASH = /—|&mdash;|&#8212;|&#x2014;/i;
{
  const hits = [];
  let editorial = 0;
  const editorialFiles = new Set();
  for (const f of files) {
    if (/check-claims-and-palette|hoplight-brand-tokens-\d{4}-\d{2}-\d{2}/.test(f)) continue;
    const isReport = f.includes(`public${sep}portfolio${sep}`);
    stripComments(readFileSync(f, 'utf8')).split('\n').forEach((line, i) => {
      if (!EMDASH.test(line)) return;
      if (isReport) {
        editorial += 1;
        editorialFiles.add(relative(ROOT, f));
      } else {
        hits.push(`${relative(ROOT, f)}:${i + 1}: ${line.trim().slice(0, 140)}`);
      }
    });
  }
  report(hits.length === 0, 'no em dash in rendered output, as a character or as an entity', hits);
  if (editorial) {
    console.log(
      `NOTE: ${editorial} em dashes remain in ${editorialFiles.size} standalone reports under ` +
        'public/portfolio/, in prose and in table "no value" cells. Not failed here: they need an ' +
        'editorial pass, not a substitution.'
    );
  }
}

process.exit(fail);
