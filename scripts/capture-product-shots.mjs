// Capture live product screenshots for the shelf page.
// Run: node scripts/capture-product-shots.mjs
// Desktop viewport, 1600x1000. Writes JPEGs into public/shots/.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'public', 'shots');
mkdirSync(OUT, { recursive: true });

const TARGETS = [
  // The shelf: open, clickable
  { slug: 'agis',        url: 'https://ai-policy-tool.vercel.app' },
  { slug: 'mocu',        url: 'https://quick-tools-pi.vercel.app/tools/mocu' },
  { slug: 'whatshuman',  url: 'https://whatshuman.vercel.app' },
  { slug: 'ontheclock',  url: 'https://the-board-red-seven.vercel.app' },
  { slug: 'betappetit',  url: 'https://hoplight.ai/bet-appetit' },
  { slug: 'rumi',        url: 'https://rumi-rouge.vercel.app' },
  { slug: 'letters',     url: 'https://letters-ten-eta.vercel.app' },
  // Research
  { slug: 'dnc',         url: 'https://visualizations-eta.vercel.app/public/political/dnc-aar-takedown' },
  { slug: 'electoral',   url: 'https://visualizations-eta.vercel.app/public/political/electoral-cost' },
  { slug: 'lobbyist',    url: 'https://visualizations-eta.vercel.app/public/ai-policy/lobbyist-player-map' },
  { slug: 'equity',      url: 'https://visualizations-eta.vercel.app/public/models/ge-equity-dilution' },
  // Client book, public surfaces only
  { slug: 'america250',  url: 'https://america-250-lake.vercel.app' },
  // Local prototypes, served on 8899 by the caller
  { slug: 'oregon',      url: 'http://localhost:8899/oregon/oregon-schools-report.html' },
  { slug: 'funderfinder', url: 'http://localhost:8899/funder/funder-match-prototype.html' },
];

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const results = [];

for (const t of TARGETS) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  try {
    const resp = await page.goto(t.url, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: join(OUT, `${t.slug}.jpg`), type: 'jpeg', quality: 78 });
    results.push(`${resp?.status() ?? '???'}  ${t.slug.padEnd(13)} ${t.url}`);
  } catch (e) {
    results.push(`FAIL ${t.slug.padEnd(13)} ${t.url}  ${e.message.split('\n')[0]}`);
  }
  await ctx.close();
}

await browser.close();
console.log(results.join('\n'));
