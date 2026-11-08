// TILEVALUE1, 2026-11-07: renders the mockup at 390 and 1440 for review.
// Usage (from the workspace root): node <this file> <base url> <out folder>
// Writes tile-value-390.png and tile-value-1440.png (whole page), and at 390 a second picture with the
// field swiped one tool to the right, to show every row moving together.
import { createRequire } from 'node:module';
import { join } from 'node:path';
const require = createRequire(join(process.cwd(), 'quick-tools', 'package.json'));
const { chromium } = require('playwright');
const [base, out] = process.argv.slice(2);
const url = base.replace(/\/$/, '') + '/mockups/tile-value.html';
const b = await chromium.launch();
for (const w of [390, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: w === 390 ? 844 : 900 }, deviceScaleFactor: 2 });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: join(out, `tile-value-${w}.png`), fullPage: true });
  await p.screenshot({ path: join(out, `tile-value-${w}-first-screen.png`) });
  if (w === 390) {
    await p.evaluate(() => { const f = document.querySelector('.field'); f.scrollLeft = 346; });
    await p.waitForTimeout(600);
    await p.screenshot({ path: join(out, 'tile-value-390-swiped.png'), fullPage: true });
  }
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  console.log(w, 'page scrolls sideways:', overflow);
}
await b.close();
