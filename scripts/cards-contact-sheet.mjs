#!/usr/bin/env node
// One contact sheet of every exported link-preview card: first all of them at text-message size
// (300px wide, about what a phone shows a pasted link at), then all of them at full size (1200 by 630),
// two to a row. Reads the *-link-preview-card.png files that `npm run cards:export` wrote.
// Run: npm run cards:sheet -- --dir docs/tool-cards-<date>/framed   (writes contact-sheet.png there)

import { readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const dir = resolve(ROOT, arg('--dir', ''));
const files = readdirSync(dir).filter((f) => f.endsWith('-link-preview-card.png'));
// The portfolio card first, as the export writes it; then the tools in file order.
files.sort((a, b) => (a.startsWith('portfolio-') ? -1 : b.startsWith('portfolio-') ? 1 : a.localeCompare(b)));
if (!files.length) {
  console.log(`no cards in ${dir}`);
  process.exit(1);
}

const M = 24; // margin and gutter
const SMALL_W = 300, SMALL_H = Math.round((300 * 630) / 1200);
const FULL_W = 1200, FULL_H = 630;
const FULL_COLS = 2;
const SHEET_W = M + FULL_COLS * (FULL_W + M);
const LABEL = 30;
const SMALL_COLS = Math.floor((SHEET_W - M) / (SMALL_W + M));
const smallRows = Math.ceil(files.length / SMALL_COLS);
const fullRows = Math.ceil(files.length / FULL_COLS);
const HEAD = 56;
const smallTop = HEAD;
const fullTop = smallTop + smallRows * (SMALL_H + LABEL + M) + HEAD;
const SHEET_H = fullTop + fullRows * (FULL_H + LABEL + M);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, s, size = 18, weight = 400) =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="#0F1B2D">${esc(s)}</text>`;

let labels = text(M, 38, `Every card at text-message size, ${SMALL_W} px wide (${files.length} cards)`, 24, 600)
  + text(M, fullTop - 18, `Every card at full size, ${FULL_W} by ${FULL_H}`, 24, 600);
const layers = [];
for (const [i, f] of files.entries()) {
  const slug = f.replace(/-link-preview-card\.png$/, '');
  const sx = M + (i % SMALL_COLS) * (SMALL_W + M), sy = smallTop + Math.floor(i / SMALL_COLS) * (SMALL_H + LABEL + M);
  const fx = M + (i % FULL_COLS) * (FULL_W + M), fy = fullTop + Math.floor(i / FULL_COLS) * (FULL_H + LABEL + M);
  layers.push({ input: await sharp(join(dir, f)).resize(SMALL_W, SMALL_H, { kernel: 'lanczos3' }).png().toBuffer(), left: sx, top: sy });
  layers.push({ input: join(dir, f), left: fx, top: fy });
  labels += text(sx, sy + SMALL_H + 21, slug, 14) + text(fx, fy + FULL_H + 22, slug, 18);
}
layers.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${SHEET_W}" height="${SHEET_H}">${labels}</svg>`), left: 0, top: 0 });

const out = join(dir, 'contact-sheet.png');
await sharp({ create: { width: SHEET_W, height: SHEET_H, channels: 3, background: '#FFFFFF' } }).composite(layers).png().toFile(out);
console.log(`wrote ${out} (${SHEET_W} by ${SHEET_H}, ${files.length} cards)`);
