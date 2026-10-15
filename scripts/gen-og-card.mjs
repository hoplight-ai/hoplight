// Writes public/og.svg and renders it to public/og.png (1200x630), the og:image every page on
// hoplight.ai shares. Run: npm run og:build   (macOS, needs Google Chrome; CHROME= overrides the path)
//
// The card follows round four of the design system (2026-10-15), the masthead Whit approved for the
// home page: a navy band, the seed's lattice with the soft magnifier rising out of it at the upper right
// (src/lib/brand/magnify.ts, the still twin of the home hero's canvas), a navy veil from the left, the
// seed lockup at the top left (src/lib/brand/marks.ts: the seed beside "Hoplight" in Albert Sans 600,
// outlined), and the line in Inter 600 in white at the bottom left. og.svg is written by this script
// from those sources; edit them, not og.svg.
//
// Why Chrome and not sharp (measured 2026-10-09): on macOS sharp's SVG renderer finds fonts through
// CoreText, ignores FONTCONFIG_FILE and swaps Inter for a system face without an error. So the card is
// drawn by headless Chrome, as scripts/render-page.sh does, with Inter 600 fetched from Google Fonts
// (the source src/app/api/og/route.tsx uses) and embedded as @font-face. Self-check: the card is drawn
// a second time with no @font-face, and if the two are identical Inter never loaded, so the script
// exits non-zero without touching og.png.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { leftVeil, magnifiedField } from '../src/lib/brand/magnify.ts';
import { LOCKUP_H, LOCKUP_W, seedLockup } from '../src/lib/brand/marks.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = (name) => join(root, 'public', name);
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = 1200;
const H = 630;

// Design-system tokens.
const BAND = '#0F1B2D';
const ON_BAND = '#FFFFFF';

// ---- the card ---------------------------------------------------------------------------------------
const LEFT = 72; // the card's margin
const LOCKUP_DRAWN_W = 420; // the seed is 96px square
// A 1200px card is mostly seen at 500 to 600px, so the seed is drawn with the line of a ~40px seed.
const lockup = seedLockup({ word: ON_BAND, seen: 40 }).replace(
  /^<svg [^>]*>/,
  `<svg x="${LEFT}" y="${LEFT}" width="${LOCKUP_DRAWN_W}" height="${((LOCKUP_DRAWN_W * LOCKUP_H) / LOCKUP_W).toFixed(1)}" viewBox="0 0 ${LOCKUP_W} ${LOCKUP_H}" role="img" aria-label="Hoplight">`,
);

// The lens sits up and to the right, clear of the words, as the home hero holds it right of the copy.
const field = magnifiedField({ width: W, height: H, r: 44, focus: [952, 262], S: 150, id: 'og-mag' });
const veil = leftVeil(W, H, 0.36, 0.62, 'og-veil');
const LINES = ['AI strategy for labor, advocacy,', 'and mission-driven organizations.'];
const text = LINES.map(
  (line, i) => `<text x="${LEFT}" y="${506 + i * 52}" font-family="Inter, sans-serif" font-size="40" font-weight="600" letter-spacing="-0.4" fill="${ON_BAND}">${line}</text>`,
).join('\n  ');

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Hoplight: ${LINES.join(' ')}">
  <!-- Written by scripts/gen-og-card.mjs from src/lib/brand/; do not edit by hand. -->
  <defs>${field.defs}${veil.defs}</defs>
  <rect width="${W}" height="${H}" fill="${BAND}"/>
  ${field.body}
  ${veil.body}
  ${lockup}
  ${text}
</svg>
`;
writeFileSync(pub('og.svg'), ogSvg);

// ---- the render -------------------------------------------------------------------------------------
async function fetchInter(weight) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`;
  const css = await (await fetch(cssUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);
  if (!match) throw new Error(`Inter ${weight}: no TrueType url in the Google Fonts response`);
  const res = await fetch(match[1]);
  if (!res.ok) throw new Error(`Inter ${weight}: font fetch answered ${res.status}`);
  return Buffer.from(await res.arrayBuffer()).toString('base64');
}

function page(svg, fontFaces) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${fontFaces}
html, body { margin: 0; padding: 0; overflow: hidden; background: ${BAND}; }
svg { display: block; width: ${W}px; height: ${H}px; }
</style></head><body>${svg}</body></html>`;
}

// Chrome 2026-10 writes the screenshot and then can exit 2 on a teardown watchdog (seen 2026-10-11:
// "1385 bytes written to file", then "Teardown watchdog expired"). So the exit code is not the test;
// the file is, and the size and font checks below read it.
function shoot(htmlPath, pngPath) {
  try {
    execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
      '--virtual-time-budget=5000', `--window-size=${W},${H}`, `--screenshot=${pngPath}`,
      pathToFileURL(htmlPath).href,
    ], { stdio: 'ignore', timeout: 60000 });
  } catch (err) {
    if (!existsSync(pngPath) || statSync(pngPath).size === 0) throw err;
  }
}

const work = mkdtempSync(join(tmpdir(), 'og-card-'));
try {
  const semibold = await fetchInter(600);
  const face = `@font-face { font-family: 'Inter'; font-weight: 600; font-display: block; src: url(data:font/ttf;base64,${semibold}) format('truetype'); }`;

  writeFileSync(join(work, 'inter.html'), page(ogSvg, face));
  writeFileSync(join(work, 'control.html'), page(ogSvg, ''));
  shoot(join(work, 'inter.html'), join(work, 'inter.png'));
  shoot(join(work, 'control.html'), join(work, 'control.png'));

  const shot = sharp(join(work, 'inter.png'));
  const { width, height } = await shot.metadata();
  if (width !== W || height !== H) throw new Error(`Chrome wrote ${width}x${height}, expected ${W}x${H}`);

  const a = await sharp(join(work, 'inter.png')).raw().toBuffer();
  const b = await sharp(join(work, 'control.png')).raw().toBuffer();
  if (a.equals(b)) throw new Error('the Inter render is identical to the no-font render: Inter did not load, og.png left as it was');

  // A palette PNG: the lattice's fine detail made a full-colour card 640 KB (2026-10-15), over the
  // ~300 KB some messaging apps accept for a preview image. Navy and gold quantise without banding.
  const { data, info } = await shot.png({ compressionLevel: 9, palette: true, colours: 96, dither: 0 }).toBuffer({ resolveWithObject: true });
  if (data.length > 300 * 1024) throw new Error(`og.png would be ${data.length} bytes; previews in some apps drop images over 300 KB, og.png left as it was`);
  writeFileSync(pub('og.png'), data);
  info.size = data.length;
  console.log(`og.svg written; og.png written: ${info.width}x${info.height}, ${info.size} bytes, text in Inter (differs from the no-font control render)`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
