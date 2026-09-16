#!/usr/bin/env node
// Generates responsive WebP variants of every public/portfolio/thumbs/*.jpg. Performance review,
// 2026-09-16 (expert-performance.md #7): the thumbs are full desktop-resolution JPGs (e.g.
// federal-agency-ai-inventory.jpg at 248,800 bytes, 1200x750) and every mobile visitor downloaded
// the same file a desktop visitor did.
//
// Writes <slug>-600.webp (for phones, via srcset/sizes on the portfolio grid) and <slug>-1200.webp
// (a same-resolution WebP re-encode for everyone else) next to each original. The original .jpg
// is left in place as the <img> fallback for browsers with no WebP support; nothing is deleted.
//
// Path-safe via process.cwd() (this repo lives under a space in its path). Run as
// `npm run portfolio:thumbs` from inside hoplight-site/.
import sharp from 'sharp';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const THUMBS_DIR = join(process.cwd(), 'public', 'portfolio', 'thumbs');
const WIDTHS = [600, 1200];
const WEBP_QUALITY = 80;

async function processFile(file) {
  const slug = file.replace(/\.jpe?g$/i, '');
  const srcPath = join(THUMBS_DIR, file);
  const meta = await sharp(srcPath).metadata();

  for (const width of WIDTHS) {
    if (meta.width && width > meta.width) continue; // never upscale
    const outPath = join(THUMBS_DIR, `${slug}-${width}.webp`);
    await sharp(srcPath).resize({ width }).webp({ quality: WEBP_QUALITY }).toFile(outPath);
    console.log(`wrote: portfolio/thumbs/${slug}-${width}.webp`);
  }
}

async function main() {
  const files = readdirSync(THUMBS_DIR).filter((f) => /\.jpe?g$/i.test(f));

  let beforeBytes = 0;
  for (const f of files) beforeBytes += statSync(join(THUMBS_DIR, f)).size;

  for (const f of files) await processFile(f);

  const afterFiles = readdirSync(THUMBS_DIR);
  let afterBytes = 0;
  for (const f of afterFiles) afterBytes += statSync(join(THUMBS_DIR, f)).size;

  console.log('');
  console.log(`before (jpg only): ${beforeBytes.toLocaleString()} bytes across ${files.length} files`);
  console.log(`after (jpg + webp variants): ${afterBytes.toLocaleString()} bytes across ${afterFiles.length} files`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
