// Renders public/og.svg to public/og.png (1200x630), the og:image every page on hoplight.ai shares.
// Run: npm run og:build   (macOS, needs Google Chrome; set CHROME to use another Chrome binary)
//
// Split out of gen-favicons.mjs on 2026-10-09, when the card moved to Inter. sharp cannot be used for
// this card: on macOS its SVG renderer finds fonts through CoreText, ignores FONTCONFIG_FILE, and swaps
// Inter for a system sans-serif without an error (measured 2026-10-09: a render pointed at Inter-only
// fontconfig was byte-identical to a render with no font setup at all). So the card is drawn by headless
// Chrome, the same tool scripts/render-page.sh uses, with Inter 400 and 700 fetched from Google Fonts
// (the source src/app/api/og/route.tsx uses for the per-route cards) and embedded as @font-face.
//
// Self-check: the card is rendered a second time with no @font-face. If the two renders are identical,
// Inter never reached the page, and the script exits non-zero without touching og.png.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = (name) => join(root, 'public', name);
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = 1200;
const H = 630;

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
html, body { margin: 0; padding: 0; overflow: hidden; background: #0F1B2D; }
svg { display: block; width: ${W}px; height: ${H}px; }
</style></head><body>${svg}</body></html>`;
}

function shoot(htmlPath, pngPath) {
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--virtual-time-budget=5000', `--window-size=${W},${H}`, `--screenshot=${pngPath}`,
    pathToFileURL(htmlPath).href,
  ], { stdio: 'ignore' });
}

const work = mkdtempSync(join(tmpdir(), 'og-card-'));
try {
  const svg = readFileSync(pub('og.svg'), 'utf8');
  const [regular, bold] = await Promise.all([fetchInter(400), fetchInter(700)]);
  const faces = [[400, regular], [700, bold]]
    .map(([w, b64]) => `@font-face { font-family: 'Inter'; font-weight: ${w}; font-display: block; src: url(data:font/ttf;base64,${b64}) format('truetype'); }`)
    .join('\n');

  writeFileSync(join(work, 'inter.html'), page(svg, faces));
  writeFileSync(join(work, 'control.html'), page(svg, ''));
  shoot(join(work, 'inter.html'), join(work, 'inter.png'));
  shoot(join(work, 'control.html'), join(work, 'control.png'));

  const shot = sharp(join(work, 'inter.png'));
  const { width, height } = await shot.metadata();
  if (width !== W || height !== H) throw new Error(`Chrome wrote ${width}x${height}, expected ${W}x${H}`);

  const a = await sharp(join(work, 'inter.png')).raw().toBuffer();
  const b = await sharp(join(work, 'control.png')).raw().toBuffer();
  if (a.equals(b)) throw new Error('the Inter render is identical to the no-font render: Inter did not load, og.png left as it was');

  const info = await shot.png({ compressionLevel: 9 }).toFile(pub('og.png'));
  console.log(`og.png written: ${info.width}x${info.height}, ${info.size} bytes, text in Inter (differs from the no-font control render)`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
