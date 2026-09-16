#!/usr/bin/env node
// Converts the two homepage hero screenshots to WebP. Performance review, 2026-09-16: agis.png
// (208,982 bytes) and pme.png (357,616 bytes) are raw, uncompressed macOS screenshots, displayed
// on the homepage at roughly 333px wide on mobile and under 600px on desktop, but shipped at full
// screenshot resolution (1228x925 and 1270x794). Both are used twice each on the page.
//
// Exports at up to 1200px wide (native size if already narrower), quality 80 — sharp enough for a
// 2x-density 600px display slot without shipping the full native screenshot.
//
// Path-safe: resolves the repo root from the script's own location (fileURLToPath, same pattern
// already proven in gen-favicons.mjs), not from process.cwd(), because this repo lives under a
// space in its path ("Code Claude") and this command is meant to be run as a bare
// `node hoplight-site/scripts/optimize-hero-shots.mjs` from the workspace root, not from inside
// hoplight-site/.
import sharp from 'sharp';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'public', 'screenshots');

const MAX_WIDTH = 1200;
const QUALITY = 80;

const TARGETS = [
  { src: 'agis.png', out: 'agis.webp' },
  { src: 'pme.png', out: 'pme.webp' },
];

async function convert({ src, out }) {
  const inPath = join(dir, src);
  const outPath = join(dir, out);
  const before = statSync(inPath).size;
  const image = sharp(inPath);
  const meta = await image.metadata();
  const width = Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH);
  const info = await image
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outPath);
  console.log(
    `${src} -> ${out}: ${before} bytes -> ${info.size} bytes (${info.width}x${info.height}), ` +
      `${(100 - (info.size / before) * 100).toFixed(1)}% smaller`,
  );
}

async function main() {
  for (const target of TARGETS) {
    await convert(target);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
