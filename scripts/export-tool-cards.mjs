#!/usr/bin/env node
// Writes every tool's link-preview card, and the portfolio's, as PNGs, read from a running copy of
// the site. Run: npm run cards:export -- [--base http://localhost:3000] [--out docs/tool-cards-<date>]
// The defaults read production and write to docs/tool-cards-<today>/. A card is checked for a PNG of
// 1200 by 630 before it is written.

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOLS } from '../src/data/tools.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const base = arg('--base', 'https://hoplight.ai').replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);
const out = resolve(ROOT, arg('--out', `docs/tool-cards-${today}`));
mkdirSync(out, { recursive: true });
const marker = join(out, '.metadata_never_index');
if (!existsSync(marker)) writeFileSync(marker, '');

export function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

let bad = 0;
for (const slug of ['portfolio', ...TOOLS.map((t) => t.slug)]) {
  const res = await fetch(`${base}/api/og/tool/${slug}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const size = pngSize(buf);
  const ok = res.ok && size && size.width === 1200 && size.height === 630;
  if (!ok) {
    bad++;
    console.log(`FAIL ${slug}: ${res.status} ${res.headers.get('content-type')} ${size ? `${size.width}x${size.height}` : 'not a PNG'}`);
    continue;
  }
  const file = join(out, `${slug}-link-preview-card.png`);
  writeFileSync(file, buf);
  console.log(`wrote ${file}`);
}
process.exit(bad ? 1 : 0);
