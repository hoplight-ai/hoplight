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
  // Letters, third pass (second review, 2026-11-07): ONE H with all three strokes drawn and numbered,
  // in the app's own stroke style. The app numbers one stroke at a time, so this is the one composite:
  // the live app opened on H through its own word list (letters.v1 words ["H"]), then its own layers
  // filled with H's three strokes (from its glyph data) as done ink (class g-done), and for each stroke
  // the app's own cue marks drawn the way drawCueMarks draws them: dot r 54 (g-dot), the stroke's number
  // (g-num), and the arrow on the stroke (g-arrow, half-width 34, length 46), a quarter of the way along
  // rather than the app's third, so stroke 1's arrow clears stroke 3's dot when all three show at once.
  async letters() {
    const p = await page();
    await p.emulateMedia({ reducedMotion: 'reduce' });
    await p.addInitScript(() => localStorage.setItem('letters.v1', JSON.stringify({ ground: 'blue', words: ['H'] })));
    await p.goto('https://letters-ten-eta.vercel.app', { waitUntil: 'networkidle' });
    await clickText(p, 'Start');
    await p.waitForTimeout(2600);
    console.log(await p.textContent('#glyph-label'));
    await p.evaluate(() => {
      const NS = 'http://www.w3.org/2000/svg';
      const mk = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
      // H's strokes as the app's glyph data gives them, in order.
      const S = [[272, 192, 272, 672], [672, 192, 672, 672], [272, 432, 672, 432]];
      const $ = (id) => document.getElementById(id);
      $('layer-ghost').textContent = ''; $('layer-done').textContent = ''; $('layer-cue').textContent = '';
      $('layer-demo').setAttribute('d', ''); $('layer-ink').setAttribute('d', '');
      for (const [x1, y1, x2, y2] of S) $('layer-done').appendChild(mk('path', { d: `M ${x1} ${y1} L ${x2} ${y2}`, class: 'g-done' }));
      S.forEach(([x1, y1, x2, y2], k) => {
        const cue = $('layer-cue');
        cue.appendChild(mk('circle', { cx: x1, cy: y1, r: 54, class: 'g-dot' }));
        const t = mk('text', { x: x1, y: y1, class: 'g-num' }); t.textContent = String(k + 1); cue.appendChild(t);
        const ang = Math.atan2(y2 - y1, x2 - x1), px = x1 + (x2 - x1) * 0.25, py = y1 + (y2 - y1) * 0.25, w = 34;
        const pt = (a, r) => (px + Math.cos(a) * r).toFixed(1) + ' ' + (py + Math.sin(a) * r).toFixed(1);
        cue.appendChild(mk('path', { d: 'M ' + pt(ang, 46) + ' L ' + pt(ang + 2.5, w) + ' L ' + pt(ang - 2.5, w) + ' Z', class: 'g-arrow' }));
      });
    });
    await p.waitForTimeout(300);
    await p.locator('#glyph').screenshot({ path: join(out, 'letters-h-one.png') });
  },
  // Revenge or Justice, third pass: its first three readings drawn large by rj-scored.html beside this
  // file, from the one real reading the rj job took (see that file for every number's source).
  async rjscored() {
    const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await p.goto(pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'rj-scored.html')).href);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: join(out, 'rj-scored.png') });
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
for (const w of (want.length ? want : Object.keys(jobs).filter((k) => k !== 'wondertoday' && k !== 'rjscored'))) { await jobs[w](); console.log('done', w); }
await b.close();
