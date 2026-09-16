#!/usr/bin/env node
// Converts the two tier-three Rayli product screenshots (composer, reading/provenance screen)
// to WebP for the /rayli page. Sibling to optimize-hero-shots.mjs, same approach (sharp, 1200px
// max width, quality 80) but reading its sources from the review scratchpad instead of an
// existing public/ file, since these are new assets landing for the first time.
//
// Path-safe via process.cwd(): this repo lives under a space in its path ("Code Claude"), and
// import.meta.url + fileURLToPath can mis-decode that on some setups. process.cwd() returns a
// plain OS path with a literal space character, which fs calls handle fine. Run this as
// `npm run screenshots:rayli` from inside hoplight-site/ (cwd is then hoplight-site/), or
// `npm --prefix hoplight-site run screenshots:rayli` from the workspace root.
import sharp from 'sharp';
import { statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SOURCE_DIR =
  '/private/tmp/claude-501/-Users-whitpendergast-Documents-Code-Claude/fa81fec6-3c07-4b8b-b379-b96ce3154de7/scratchpad/assets';
const outDir = join(process.cwd(), 'public', 'screenshots');

const MAX_WIDTH = 1200;
const QUALITY = 80;

const TARGETS = [
  { src: join(SOURCE_DIR, 'rayli-1-composer.png'), out: join(outDir, 'rayli-composer.webp') },
  { src: join(SOURCE_DIR, 'rayli-2-reading-provenance.png'), out: join(outDir, 'rayli-reading.webp') },
];

async function convert({ src, out }) {
  if (!existsSync(src)) {
    throw new Error(`Source not found: ${src}`);
  }
  const before = statSync(src).size;
  const image = sharp(src);
  const meta = await image.metadata();
  const width = Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH);
  const info = await image
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out);
  console.log(
    `${src} -> ${out}: ${before} bytes -> ${info.size} bytes (${info.width}x${info.height}), ` +
      `${(100 - (info.size / before) * 100).toFixed(1)}% smaller`,
  );
  return info;
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
