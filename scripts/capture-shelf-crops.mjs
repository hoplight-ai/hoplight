#!/usr/bin/env node
/**
 * capture-shelf-crops.mjs
 *
 * Captures the ten open Hoplight products as CROPPED-AT-SOURCE images for the
 * shelf page options in public/shelf-options/.
 *
 * Round-1 critique finding B1: every earlier shot was a whole 1280-1600px window
 * shrunk into a 273px cell, so product type rendered at 2.7-5.7px and the pictures
 * read as texture. The fix is to crop at capture, never at display: each product
 * gets a hand-chosen rectangle around ONE legible element, captured at
 * deviceScaleFactor 2, so a 560px tile shows real type at real size.
 *
 * Finding B13: one capture generation only, one folder only. Output lives in
 * public/shelf-options/shots/ and nothing under public/shots/ is touched.
 *
 * Usage (run from the Code Claude root, bare command):
 *   node hoplight-site-shelf2/scripts/capture-shelf-crops.mjs
 *   node hoplight-site-shelf2/scripts/capture-shelf-crops.mjs --ref /abs/out/dir
 *   node hoplight-site-shelf2/scripts/capture-shelf-crops.mjs --only rayli,pme
 *
 * --ref writes a full-page 1440x900 deviceScaleFactor:1 PNG per product, which is
 * the reference the clip rectangles below were measured from. Coordinates in
 * `clip` and `thumb` are CSS pixels in FULL-PAGE DOCUMENT space, so they can be
 * read straight off those reference PNGs.
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

// Playwright is not installed in this checkout; borrow quick-tools' install.
const require = createRequire('/Users/whitpendergast/Documents/Code Claude/quick-tools/package.json');
const { chromium } = require('playwright');

// fileURLToPath, not .pathname: the repo path contains a space.
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(SCRIPT_DIR, '..');
const SHOTS_DIR = path.join(REPO, 'public', 'shelf-options', 'shots');

const VIEWPORT = { width: 1440, height: 900 };
const SETTLE_MS = 2500;
const JPEG_QUALITY = 82;

/**
 * Every rectangle is CSS pixels in full-page document space.
 *   clip  - 2:1 (width exactly twice height), 640-900px wide so that rendered
 *           into a 560px tile the product's own body type stays >= 9px. Letters is
 *           the one exception at 1000px, and its note says why.
 *   thumb - 1:1, 160px, for the 56px thumbnails options A and C use.
 *   note  - what the crop shows, and any compromise (sign-in wall, empty state).
 */
const PRODUCTS = [
  {
    slug: 'rayli',
    url: 'https://rayli.ai',
    note: 'Sign-in wall. The product itself needs an account, so the crop is the sign-in card: the Rayli wordmark, the email and password fields, the Sign in button and the demo-key line. Public face, honestly labelled.',
    clip: { x: 290, y: 235, width: 860, height: 430 },
    thumb: { x: 545, y: 190, width: 160, height: 160 },
  },
  {
    slug: 'agis',
    url: 'https://ai-policy-tool.vercel.app',
    note: 'The ask box with its gold Search button and three of the suggested questions. Nav bar and hero excluded, so the ARIA/AGIS name mismatch cannot show. Round 2: the rectangle was 660,470,720,360 and cut the third suggestion pill at the bottom frame edge (painter, ex-apple). Widened and dropped 10px so the pill closes with ~15px of air beneath it; still exactly 2:1.',
    clip: { x: 660, y: 482, width: 692, height: 346 },
    thumb: { x: 180, y: 530, width: 160, height: 160 },
  },
  {
    slug: 'pme',
    url: 'https://pme-mvp-clean.vercel.app',
    note: 'The whole input card: AUDIENCE DESCRIPTION with its worked example, OBJECTIVE, and the Generate Message button. Page headline and theme toggle excluded.',
    clip: { x: 340, y: 152, width: 760, height: 380 },
    thumb: { x: 450, y: 405, width: 160, height: 160 },
  },
  {
    slug: 'podcast',
    url: 'https://podcast-knowledge-engine.vercel.app',
    note: "The Daily's Politics desk card: desk name, FROM A FEED / NOT SCORED provenance chips, the item headline, WHY IT'S HERE and the three feedback controls. Masthead and date header excluded.",
    clip: { x: 288, y: 460, width: 860, height: 430 },
    thumb: { x: 340, y: 425, width: 160, height: 160 },
  },
  {
    slug: 'strategist',
    url: 'https://research-books-strategist.vercel.app',
    note: 'The AUDIENCE chooser: three labelled audience cards with Reporters & Editors selected, the worked suggestion chips above, the Generate press release button below.',
    clip: { x: 370, y: 340, width: 700, height: 350 },
    thumb: { x: 458, y: 592, width: 160, height: 160 },
  },
  {
    slug: 'ontheclock',
    url: 'https://the-board-red-seven.vercel.app',
    dismiss: 'Got it',
    note: 'The pick screen: pick 1.01, the roster counters, TAKE THIS, the player, and the one-paragraph reason with its control. The "add to home screen" intro overlay is dismissed first.',
    clip: { x: 360, y: 8, width: 720, height: 360 },
    thumb: { x: 640, y: 740, width: 160, height: 160 },
  },
  {
    slug: 'whatshuman',
    url: 'https://whatshuman.vercel.app',
    dismiss: 'Skip',
    dismissWait: 6000,
    // Short window on purpose: at 900 px tall the passage and the two buttons sit
    // 340 px apart and the crop is mostly empty dark.
    viewport: { width: 1440, height: 560 },
    note: 'The test itself: one passage and the Human / AI choice. The optional demographics gate is skipped first. The passage is drawn at random each load, so the rectangle is sized for up to four lines; the buttons are fixed.',
    clip: { x: 340, y: 180, width: 760, height: 380 },
    thumb: { x: 520, y: 380, width: 160, height: 160 },
  },
  {
    slug: 'betappetit',
    url: 'https://bet-appetit.vercel.app',
    note: 'One bet card from The Guide, the lifetime bet: the question, the Not settleable as written badge, HOW IT SETTLES and the note count. It is the only card alone on its row, so it crops with air on both sides.',
    clip: { x: 0, y: 2140, width: 740, height: 370 },
    thumb: { x: 380, y: 380, width: 160, height: 160 },
  },
  {
    slug: 'rumi',
    url: 'https://rumi-rouge.vercel.app',
    note: 'The whole opening screen on its gradient: the cat mark, Rumi Espanol, Tap to wake up Rumi, and the Vamos button.',
    clip: { x: 370, y: 280, width: 700, height: 350 },
    thumb: { x: 640, y: 260, width: 160, height: 160 },
  },
  {
    slug: 'letters',
    url: 'https://letters-ten-eta.vercel.app',
    note: 'The traced letter L above the Start button. 1000 px wide rather than the 640-900 band because nothing narrower holds both the letter and the button with air around each.',
    clip: { x: 220, y: 130, width: 1000, height: 500 },
    thumb: { x: 640, y: 462, width: 160, height: 160 },
  },
];

function parseArgs(argv) {
  const out = { ref: null, only: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--ref') { out.ref = argv[i + 1]; i += 1; }
    else if (argv[i] === '--only') { out.only = argv[i + 1].split(',').map((s) => s.trim()); i += 1; }
  }
  return out;
}

async function settle(page, product) {
  await page.goto(product.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  try {
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  } catch {
    // Some of these apps hold an open socket; the fixed wait below covers it.
  }
  await page.waitForTimeout(SETTLE_MS);
  // The only click allowed: an intro overlay that covers the product.
  if (product.dismiss) {
    try {
      await page.getByText(product.dismiss, { exact: true }).first().click({ timeout: 5000 });
      await page.waitForTimeout(product.dismissWait ?? 1200);
      // Drop the focus ring the click leaves behind: it reads as a chosen answer.
      await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
      await page.waitForTimeout(300);
    } catch {
      console.log(`  (dismiss "${product.dismiss}" not found on ${product.slug})`);
    }
  }
}

async function captureReferences(browser, list, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const p of list) {
    const context = await browser.newContext({ viewport: p.viewport ?? VIEWPORT, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const file = path.join(outDir, `${p.slug}.png`);
    try {
      await settle(page, p);
      await page.screenshot({ path: file, fullPage: true });
      const dims = await page.evaluate(() => ({
        w: document.documentElement.scrollWidth,
        h: document.documentElement.scrollHeight,
      }));
      console.log(`ref ${p.slug.padEnd(11)} doc ${dims.w}x${dims.h}  ${fs.statSync(file).size} bytes`);
    } catch (err) {
      console.log(`ref ${p.slug.padEnd(11)} FAILED ${err.message}`);
    }
    await page.close();
    await context.close();
  }
}

async function captureCrops(browser, list) {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
  let total = 0;
  for (const p of list) {
    if (!p.clip) { console.log(`crop ${p.slug.padEnd(11)} SKIPPED (no clip rectangle)`); continue; }
    const context = await browser.newContext({ viewport: p.viewport ?? VIEWPORT, deviceScaleFactor: 2 });
    const page = await context.newPage();
    try {
      await settle(page, p);
      for (const [suffix, rect] of [['', p.clip], ['-thumb', p.thumb]]) {
        if (!rect) continue;
        const file = path.join(SHOTS_DIR, `${p.slug}${suffix}.jpg`);
        await page.screenshot({
          path: file,
          type: 'jpeg',
          quality: JPEG_QUALITY,
          fullPage: true,
          clip: rect,
        });
        const bytes = fs.statSync(file).size;
        total += bytes;
        console.log(
          `crop ${(p.slug + suffix).padEnd(17)} ${rect.width}x${rect.height} css -> ${rect.width * 2}x${rect.height * 2} px  ${bytes} bytes`,
        );
      }
    } catch (err) {
      console.log(`crop ${p.slug.padEnd(11)} FAILED ${err.message}`);
    }
    await page.close();
    await context.close();
  }
  console.log(`total ${total} bytes (${(total / 1024).toFixed(0)} KB)`);
}

const args = parseArgs(process.argv.slice(2));
const list = args.only ? PRODUCTS.filter((p) => args.only.includes(p.slug)) : PRODUCTS;
const browser = await chromium.launch();
if (args.ref) await captureReferences(browser, list, args.ref);
else await captureCrops(browser, list);
await browser.close();
