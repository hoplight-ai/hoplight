// Writes public/og.svg and renders it to public/og.png (1200x630), the og:image every page on
// hoplight.ai shares. Run: npm run og:build   (macOS, needs Google Chrome; CHROME= overrides the path)
//
// The card follows the Hoplight Design System (2026-10-11): a navy band, the band's Flower of Life field
// seeded "Hoplight" and faded from the right (src/lib/brand/geometry.ts, ported from the system's
// Geometry component), the full lockup copied byte for byte from the system (src/lib/brand/marks.ts;
// its rule: "Decks, the site hero, social cards, at 320px wide or more"), and the line in Inter 400 in
// on-band-muted. og.svg is written by this script from those sources; edit them, not og.svg.
//
// Why Chrome and not sharp (measured 2026-10-09): on macOS sharp's SVG renderer finds fonts through
// CoreText, ignores FONTCONFIG_FILE and swaps Inter for a system face without an error. So the card is
// drawn by headless Chrome, as scripts/render-page.sh does, with Inter 400 fetched from Google Fonts
// (the source src/app/api/og/route.tsx uses) and embedded as @font-face. Self-check: the card is drawn
// a second time with no @font-face, and if the two are identical Inter never loaded, so the script
// exits non-zero without touching og.png.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { fieldMarkup } from '../src/lib/brand/geometry.ts';
import { LOCKUP_CLEAR } from '../src/lib/brand/marks.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = (name) => join(root, 'public', name);
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = 1200;
const H = 630;

// Design-system tokens, light theme.
const BAND = '#0F1B2D';
const ON_BAND_MUTED = '#C9D3E0';

// ---- the card ---------------------------------------------------------------------------------------
// The lockup's own viewBox; the word "Hoplight" starts at x 13.6 with its baseline at y 0.
const vb = LOCKUP_CLEAR.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const [vx, vy, vw, vh] = vb;
const LEFT = 72; // the card's left margin, space-8
const LOCKUP_W = 720;
const s = LOCKUP_W / vw;
const lockupX = LEFT - (13.6 - vx) * s; // so the word, not the viewBox, sits on the margin
const BASELINE = 262;
const lockupY = BASELINE + vy * s;
const lockup = LOCKUP_CLEAR.replace(
  /^<svg [^>]*>/,
  `<svg x="${lockupX.toFixed(1)}" y="${lockupY.toFixed(1)}" width="${LOCKUP_W}" height="${(vh * s).toFixed(1)}" viewBox="${vb.join(' ')}" role="img" aria-label="Hoplight">`,
);

const field = fieldMarkup({ width: W, height: H, seed: 'Hoplight', tone: 'band', fade: 'right', id: 'og-field' });
const LINES = ['AI strategy for labor, advocacy, and', 'mission-driven organizations.'];
const text = LINES.map(
  (line, i) => `<text x="${LEFT}" y="${520 + i * 46}" font-family="Inter, sans-serif" font-size="34" font-weight="400" fill="${ON_BAND_MUTED}">${line}</text>`,
).join('\n  ');

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Hoplight: ${LINES.join(' ')}">
  <!-- Written by scripts/gen-og-card.mjs from src/lib/brand/; do not edit by hand. -->
  <defs>${field.defs}</defs>
  <rect width="${W}" height="${H}" fill="${BAND}"/>
  ${field.body}
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
  const regular = await fetchInter(400);
  const face = `@font-face { font-family: 'Inter'; font-weight: 400; font-display: block; src: url(data:font/ttf;base64,${regular}) format('truetype'); }`;

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

  const info = await shot.png({ compressionLevel: 9 }).toFile(pub('og.png'));
  console.log(`og.svg written; og.png written: ${info.width}x${info.height}, ${info.size} bytes, text in Inter (differs from the no-font control render)`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
