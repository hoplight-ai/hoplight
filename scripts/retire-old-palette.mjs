#!/usr/bin/env node
// Retires the pre-a0fe4b2 Hoplight palette from src/ and public/. Added 2026-09-20 (lane dispatch1).
// Run: node scripts/retire-old-palette.mjs [--apply]   (default is a dry run)
//
// WHY A SCRIPT. The old pair survived in 40 rgba() literals across five files as well as in seven
// hex literals, and a hand sweep of that many sites is how three of them got missed twice already.
// The 2026-09-16 token consolidation moved PmeContent.tsx's NAMED tokens onto globals.css and left
// every rgba() literal in the same file on the old navy and the old gold, so the file passed a hex
// grep while still painting the retired colours.
//
// WHICH SIDE IS AUTHORITATIVE. src/app/globals.css. The Hoplight brand file in the design canon
// names that stylesheet as its own source and was extracted from it on 2026-06-02; the stylesheet
// changed afterwards (commit a0fe4b2) and the brand file did not. By the brand file's own rule the
// stylesheet wins and the brand file is the stale side.
//
// WHAT IS DELIBERATELY NOT IN THE MAP. --paper #F7F5F0 and --stone #8B8578 keep their old values in
// the static pages that still use those names. They are not the retired pair, the visible difference
// is under a perceptual threshold, and changing them would be harmonising past what was asked. The
// one exception is public/pme-lever.html, whose :root is aligned in full to its own React twin
// src/app/(main)/persuasion/PmeContent.tsx, because the two files render the same page and a reader
// landing on one or the other is exactly the complaint this sweep exists to close.

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APPLY = process.argv.includes('--apply');
// Resolved from this file's own location, not from cwd, so it runs the same whether it is called
// from the repo, through `npm --prefix`, or from a parent directory. fileURLToPath rather than
// `new URL(...).pathname`, which mangles the space in the containing folder's name.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Old -> authoritative. Every replacement value is read off src/app/globals.css :root, never chosen.
const MAP = [
  // the retired pair itself
  ['#0A1628', '#0F1B2D', 'ink'],
  ['#0a1628', '#0F1B2D', 'ink'],
  ['#E8A838', '#D4950A', 'gold'],
  ['#e8a838', '#D4950A', 'gold'],
  // the same two colours written in decimal, which a hex grep never sees
  ['rgba(10, 22, 40', 'rgba(15, 27, 45', 'ink, decimal'],
  ['rgba(10,22,40', 'rgba(15,27,45', 'ink, decimal'],
  ['rgba(232, 168, 56', 'rgba(212, 149, 10', 'gold, decimal'],
  ['rgba(232,168,56', 'rgba(212,149,10', 'gold, decimal'],
  // the deep gold that carries small text on light. Included because leaving it behind would pair a
  // new accent with the old accent's dark variant, and because it is the one swap in this map that
  // changes a contrast verdict: #B8851F on #F5F5F0 is 2.99:1 and fails WCAG AA for normal text,
  // #845810 on the same ground is 5.60:1 and passes.
  ['#B8851F', '#845810', 'gold-deep'],
  ['#b8851f', '#845810', 'gold-deep'],
];

const SCAN_DIRS = ['src', 'public'];
const SCAN_EXT = new Set(['.ts', '.tsx', '.css', '.html', '.svg', '.json']);
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'fonts']);

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
    } else if (SCAN_EXT.has(extname(e.name)) && statSync(p).size < 4_000_000) {
      out.push(p);
    }
  }
  return out;
}

let totalHits = 0;
let touchedFiles = 0;
for (const file of SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)))) {
  const before = readFileSync(file, 'utf8');
  let after = before;
  const perFile = [];
  for (const [from, to, role] of MAP) {
    const n = after.split(from).length - 1;
    if (n === 0) continue;
    after = after.split(from).join(to);
    perFile.push(`${n}x ${from} -> ${to} (${role})`);
    totalHits += n;
  }
  if (after === before) continue;
  touchedFiles += 1;
  console.log(`${relative(ROOT, file)}`);
  for (const line of perFile) console.log(`   ${line}`);
  if (APPLY) writeFileSync(file, after);
}

console.log(`\n${APPLY ? 'applied' : 'dry run'}: ${totalHits} replacements across ${touchedFiles} files`);
if (!APPLY) console.log('re-run with --apply to write');
