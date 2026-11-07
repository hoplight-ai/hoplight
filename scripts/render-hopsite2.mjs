// Renders the cut-down pages of the HOPSITE2 lane (2026-11-07) and audits them.
//
//   node scripts/render-hopsite2.mjs <origin> <round-name> [path ...]
//
// For every path: the first screen at 1440 by 900 in colour and in grayscale, the whole page at 1440, and
// the first screen and the whole page at 375 by 812. Then, from the page itself: horizontal overflow at 375,
// the heading order, tap targets under 44px at 375, the text above 28px and the filled buttons on the 1440
// first screen, and a contrast ratio for every visible text run against the nearest painted background
// (a background drawn as an image or gradient is named, not guessed). Pictures and one audit.json land in
// docs/renders/hopsite2-2026-11-07/<round-name>/.
//
// Playwright is not a dependency of this repo; it is borrowed from the quick-tools checkout beside it,
// the same way the workspace's look script borrows it.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(REPO, '..', 'quick-tools', 'package.json'));
const { chromium } = require('playwright');

// `--dir <folder>` puts the round under docs/renders/<folder>/ instead of hopsite2-2026-11-07 (PORTSPLIT1,
// 2026-11-07, renders into portsplit1-2026-11-07).
const argv = process.argv.slice(2);
const dirAt = argv.indexOf('--dir');
const DIR = dirAt >= 0 ? argv.splice(dirAt, 2)[1] : 'hopsite2-2026-11-07';
const [origin, round, ...rest] = argv;
if (!origin || !round) {
  console.error('usage: node scripts/render-hopsite2.mjs <origin> <round-name> [path ...] [--dir <folder>]');
  process.exit(2);
}
const PATHS = rest.length ? rest : ['/', '/portfolio', '/services', '/insights', '/about'];
const OUT = join(REPO, 'docs', 'renders', DIR, round);
mkdirSync(OUT, { recursive: true });
writeFileSync(join(REPO, 'docs', 'renders', '.metadata_never_index'), '');

const slug = (p) => (p === '/' ? 'home' : p.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-'));

// Runs inside the page. Returns the audit for the current viewport.
function audit() {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = '1'] = m[1].split(/[ ,/]+/).filter(Boolean);
    return { r: +r, g: +g, b: +b, a: +a };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const hex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const blend = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });

  function background(el) {
    const layers = [];
    let image = null;
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage && s.backgroundImage !== 'none' && !image) image = n.className || n.tagName;
      const c = parse(s.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i -= 1) base = blend(layers[i], base);
    return { color: base, image };
  }

  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !el.closest('.sr-only');
  };

  const texts = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    const el = t.parentElement;
    if (!el || !t.textContent.trim() || !visible(el) || el.closest('svg,script,style,noscript')) continue;
    const s = getComputedStyle(el);
    const fg = parse(s.color);
    const bg = background(el);
    const size = parseFloat(s.fontSize);
    const bold = parseInt(s.fontWeight, 10) >= 700;
    const large = size >= 24 || (bold && size >= 18.66);
    const r = el.getBoundingClientRect();
    texts.push({
      text: t.textContent.trim().slice(0, 48),
      fg: hex(fg), bg: hex(bg.color), overImage: bg.image,
      size, ratio: +ratio(blend(fg, bg.color), bg.color).toFixed(2), need: large ? 3 : 4.5,
      top: Math.round(r.top + scrollY),
    });
  }

  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({ level: +h.tagName[1], text: h.textContent.trim().slice(0, 40), top: Math.round(h.getBoundingClientRect().top + scrollY), screens: +((h.getBoundingClientRect().top + scrollY) / innerHeight).toFixed(2) }));
  const skips = [];
  for (let i = 1; i < headings.length; i += 1) if (headings[i].level > headings[i - 1].level + 1) skips.push(`${headings[i - 1].text} (h${headings[i - 1].level}) -> ${headings[i].text} (h${headings[i].level})`);

  const small = [...document.querySelectorAll('a[href],button,input,textarea,select,[role=button]')]
    .filter(visible)
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.height < 44 || r.width < 44)
    .map(({ el, r }) => ({ text: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) }));

  const fold = innerHeight;
  const inFold = (el) => { const r = el.getBoundingClientRect(); return r.top < fold && r.bottom > 0; };
  const filled = [...document.querySelectorAll('a,button')].filter((el) => visible(el) && inFold(el)).filter((el) => {
    const c = parse(getComputedStyle(el).backgroundColor);
    return c && c.a > 0.5 && !(c.r > 245 && c.g > 245 && c.b > 245) && el.getBoundingClientRect().height >= 30;
  }).map((el) => el.textContent.trim().slice(0, 30));
  const bigText = texts.filter((t) => t.size > 28 && t.top < fold).map((t) => `${t.text} (${t.size}px)`);

  return {
    overflowX: document.documentElement.scrollWidth - innerWidth,
    height: document.documentElement.scrollHeight,
    headings, skips, small, filled, bigText,
    failing: texts.filter((t) => t.ratio < t.need),
    texts,
  };
}

const browser = await chromium.launch();
const report = {};
try {
  for (const path of PATHS) {
    report[path] = {};
    for (const [w, h] of [[1440, 900], [375, 812]]) {
      const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      const res = await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => ({ status: () => String(e) }));
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(800);
      const name = `${slug(path)}-${w}`;
      await page.screenshot({ path: join(OUT, `${name}-first.png`) });
      await page.screenshot({ path: join(OUT, `${name}-full.png`), fullPage: true });
      if (w === 1440) {
        await page.addStyleTag({ content: 'html { filter: grayscale(1) !important; }' });
        await page.screenshot({ path: join(OUT, `${name}-grayscale.png`) });
      }
      report[path][w] = { status: res.status(), ...(await page.evaluate(audit)) };
      await page.close();
    }
  }
} finally {
  await browser.close();
}
writeFileSync(join(OUT, 'audit.json'), JSON.stringify(report, null, 2));

for (const [path, byWidth] of Object.entries(report)) {
  for (const [w, a] of Object.entries(byWidth)) {
    console.log(`${path} @${w}: status ${a.status}, height ${a.height}, overflowX ${a.overflowX}, heading skips ${a.skips.length}, contrast fails ${a.failing.length}, small targets ${a.small.length}, filled in fold ${a.filled.length} [${a.filled.join(' | ')}], text >28px in fold ${a.bigText.length} [${a.bigText.join(' | ')}]`);
    for (const f of a.failing) console.log(`   contrast ${f.ratio} < ${f.need}: "${f.text}" ${f.fg} on ${f.bg}${f.overImage ? ` over ${f.overImage}` : ''}`);
    for (const s of a.skips) console.log(`   heading skip: ${s}`);
    for (const h of a.headings.filter((x) => x.level <= 2)) console.log(`   h${h.level} "${h.text}" at ${h.top}px, screen ${h.screens}`);
    if (w === '375') for (const s of a.small) console.log(`   small target ${s.w}x${s.h}: "${s.text}"`);
  }
}
console.log(`pictures and audit.json in ${OUT}`);
