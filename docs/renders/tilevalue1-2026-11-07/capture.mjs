// TILEVALUE1, 2026-11-07: takes the real screens the tile crops are cut from, from the live tools.
// Usage (from the workspace root): node <this file> <out folder> [which ...]
// which: rj undo letters whichai wonder. Each writes <which>-full.png at 3x, W wide (default 520).
// Revenge or Justice makes one real reading (one model call, the tool's normal use) of the first
// recent article; nothing else on any tool is changed.
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(join(process.cwd(), 'quick-tools', 'package.json'));
const { chromium } = require('playwright');
const out = process.argv[2];
const want = process.argv.slice(3);
// Taken at a narrow width (W, default 520) so the tool's own text is large against the crop, which a
// tile shows at about 350 to 420 wide.
const W = Number(process.env.W || 520);
const b = await chromium.launch();
async function page(w = W) { return b.newPage({ viewport: { width: w, height: w > 1000 ? 900 : 1000 }, deviceScaleFactor: w > 1000 ? 2 : 3 }); }
const clickText = async (p, t) => { await p.getByText(t, { exact: false }).first().click(); await p.waitForTimeout(1200); };
const jobs = {
  // Wonder Cards' today tile, drawn by today-wonder-cards.html beside this file (it is not on the tool
  // list, so the card route cannot draw it), at the card's own 1200 by 630.
  async wondertoday() {
    const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await p.goto(pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'today-wonder-cards.html')).href);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: join(out, 'today-wonder-cards.png') });
  },
  async rj() {
    const p = await page();
    await p.goto('https://hoplight.ai/revenge-or-justice', { waitUntil: 'networkidle' });
    // The first article (a paywalled Post story) answered "fetch failed" on 2026-11-07, so the
    // reading is of the article that names a speaker, Jamie Raskin, from the same list.
    await p.getByText(process.env.RJ_ARTICLE || 'Jamie Raskin Eyes', { exact: false }).first().click();
    await p.waitForTimeout(90000);
    await p.locator('.rj-hero').first().screenshot({ path: join(out, 'rj-hero.png') });
    await p.locator('.rj-hero').first().scrollIntoViewIfNeeded();
    await p.screenshot({ path: join(out, 'rj-view.png') });
    
  },
  async undo() {
    // The Undo List is taken at 1440, where the headline and the whole signature field sit side by
    // side in one wide picture, after signing the first order so one block shows gold.
    const p = await page(1440);
    await p.goto('https://hoplight.ai/undo', { waitUntil: 'networkidle' });
    await clickText(p, 'Sign the first order');
    await p.getByRole('button', { name: /Sign this order/ }).first().click().catch(() => {});
    await p.waitForTimeout(1200);
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(800);
    await p.screenshot({ path: join(out, 'undo-full.png') });
  },
  // Letters, second pass: the letter H, one real frame per stroke. The parent panel's own word list is
  // set to "H" (its normal use: her own words come first), so the session opens on H. Each frame is the
  // app's glyph as it stands before that stroke: the strokes done in ink, the next one numbered with its
  // start dot and arrow; the last frame is the whole letter the app shows after "You did it."
  async letters() {
    const p = await page();
    await p.emulateMedia({ reducedMotion: 'reduce' });
    await p.addInitScript(() => localStorage.setItem('letters.v1', JSON.stringify({ ground: 'blue', words: ['H'] })));
    await p.goto('https://letters-ten-eta.vercel.app', { waitUntil: 'networkidle' });
    await clickText(p, 'Start');
    const glyph = p.locator('#glyph');
    const strokes = [[272, 192, 272, 672], [672, 192, 672, 672], [272, 432, 672, 432]];
    for (let k = 0; k < strokes.length; k++) {
      await p.waitForTimeout(2600); // the demonstration stroke clears; her turn
      console.log(await p.textContent('#glyph-label'));
      await glyph.screenshot({ path: join(out, 'letters-h-' + (k + 1) + '.png') });
      const [x1, y1, x2, y2] = strokes[k];
      const pts = await p.evaluate(([x1, y1, x2, y2]) => {
        const svg = document.getElementById('glyph'), m = svg.getScreenCTM(), o = [];
        for (let t = 0; t <= 40; t++) { const pt = svg.createSVGPoint(); pt.x = x1 + (x2 - x1) * t / 40; pt.y = y1 + (y2 - y1) * t / 40; const q = pt.matrixTransform(m); o.push([q.x, q.y]); }
        return o;
      }, [x1, y1, x2, y2]);
      await p.mouse.move(pts[0][0], pts[0][1]); await p.mouse.down();
      for (const [x, y] of pts) { await p.mouse.move(x, y); await p.waitForTimeout(16); }
      await p.mouse.up();
    }
    await p.waitForTimeout(400);
    await glyph.screenshot({ path: join(out, 'letters-h-done.png') });
  },
  async whichai() {
    const p = await page();
    await p.goto('https://hoplight.ai/tools/which-ai', { waitUntil: 'networkidle' });
    for (const t of ['Get started', 'No, absolutely not', 'Confidential', 'Drafting & writing', 'Voice and nuance']) await clickText(p, t);
    await p.screenshot({ path: join(out, 'whichai-full.png'), fullPage: true });
  },
  async wonder() {
    const p = await page();
    await p.goto('https://wonder-cards.vercel.app', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1000);
    // The Screen topic, so the card wears the deck's default colour (theme-color #005A63).
    await clickText(p, 'Choose a topic');
    await clickText(p, process.env.WONDER_TOPIC || 'Screen');
    await p.waitForTimeout(2000);
    await p.screenshot({ path: join(out, 'wonder-full.png') });
    console.log((await p.innerText('body')).slice(0, 600));
  },
};
for (const w of (want.length ? want : Object.keys(jobs).filter((k) => k !== 'wondertoday'))) { await jobs[w](); console.log('done', w); }
await b.close();
