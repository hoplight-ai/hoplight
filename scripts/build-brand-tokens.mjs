#!/usr/bin/env node
// Publishes the Hoplight brand tokens as three files under public/, so a session that needs them
// fetches one URL instead of needing this folder connected. Added 2026-09-20 (lane dispatch1).
//
// Run:  node scripts/build-brand-tokens.mjs           writes the three files
//       node scripts/build-brand-tokens.mjs --check   regenerates in memory, fails on any drift
//
// THE PROBLEM THIS EXISTS FOR. A session built a Hoplight page without the design folder connected
// and read the brand tokens live off hoplight.ai as a workaround. Nothing errored and the answer
// happened to be right, so the workaround looked exactly like a sourced answer. The tokens were
// only correct because two files had been kept in step by hand, and they had not been: the brand
// file in the design canon names src/app/globals.css as its own source, was extracted from it on
// 2026-06-02, and still carried the palette that commit a0fe4b2 replaced.
//
// SO: src/app/globals.css IS THE SOURCE, and everything below is parsed out of it rather than typed.
// The --check mode in scripts/verify.sh is the whole point. Without it the served copy is one more
// hand-kept duplicate and it drifts the same way the brand file did.
//
// WHAT IS NOT PARSED, and why it is still here. Alignment, the accent rule as a rule rather than a
// colour, and the voice rules cannot be read out of a stylesheet. Those are carried from the brand
// file verbatim and each field says so in its own `source` key. Where the brand file and the
// stylesheet disagree about something the stylesheet owns, the stylesheet wins and the brand file's
// version is not published: its type section specifies GT America at a 17px base on a Perfect
// Fourth scale, and this repo has run Inter and JetBrains Mono at a 15.5px base with clamp() ramps
// since before that extraction. Publishing the brand file's version would publish the drift.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath rather than `new URL(...).pathname`, which mangles the space in the folder name.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const DATE = '2026-09-20';
const BASE = `hoplight-brand-tokens-${DATE}`;
const css = readFileSync(join(ROOT, 'src/app/globals.css'), 'utf8');

// ---- parse :root ------------------------------------------------------------------------------
function rootVars() {
  const open = css.indexOf(':root {');
  const close = css.indexOf('\n}', open);
  if (open === -1 || close === -1) throw new Error('globals.css has no :root block to read');
  const block = css.slice(open, close);
  const vars = {};
  for (const m of block.matchAll(/^\s*--([a-z0-9-]+):\s*([^;]+);/gim)) {
    vars[m[1]] = m[2].trim();
  }
  return vars;
}

// ---- parse one declaration off one selector ----------------------------------------------------
function decl(selector, prop) {
  const re = new RegExp(`^${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'm');
  const body = css.match(re);
  if (!body) return null;
  const hit = body[1].match(new RegExp(`(?:^|;)\\s*${prop}:\\s*([^;]+)`));
  return hit ? hit[1].trim() : null;
}

const V = rootVars();
const need = (name) => {
  if (!(name in V)) throw new Error(`globals.css :root no longer defines --${name}`);
  return V[name];
};

// Colour tokens, in the order a building session needs them rather than source order: the two that
// carry the brand, then the surfaces, then text, then the semantic ones.
const COLOR_ORDER = [
  ['ink', 'Primary. Headlines, body text, dark section grounds.'],
  ['ink-mid', 'Dark section step, one level up from ink.'],
  ['ink-soft', 'Muted ink for supporting prose on light.'],
  ['gold', 'Accent. Rules, left borders, the one filled button, link underlines. Never dominant.'],
  ['gold-hot', 'Brighter gold, for large figures on dark grounds only.'],
  ['gold-deep', 'The gold for small text on light. 5.6:1 on --surface; --gold itself is 2.4:1 and fails.'],
  ['gold-bg', 'Gold tint for a filled callout ground.'],
  ['gold-bg-light', 'Lighter gold tint, table and row wash.'],
  ['surface', 'Default page ground. Warm off-white.'],
  ['surface-card', 'Card ground on --surface.'],
  ['white', 'True white, for cards that must separate from --surface.'],
  ['stone', 'Secondary text. Captions, metadata, timestamps.'],
  ['stone-deep', 'Secondary text that has to pass AA on --surface.'],
  ['mute', 'Warm grey for de-emphasised chrome.'],
  ['danger', 'Error and destructive state. Semantic only.'],
];

const payload = {
  name: 'Hoplight brand tokens',
  version: DATE,
  source: 'hoplight-site/src/app/globals.css :root, parsed, never transcribed',
  authority:
    'This file is generated from the production stylesheet on every build and scripts/verify.sh ' +
    'fails if the served copy has drifted from it. It supersedes any hand-kept extraction, ' +
    'including the tokens section of the Hoplight brand file in the design reference, which was ' +
    'extracted on 2026-06-02 and still carries the palette retired by commit a0fe4b2.',
  retired: {
    note:
      'Present only so a session that finds these values in an old file knows they are dead, in ' +
      'either notation. The rgba forms are how this pair survived a fix aimed straight at it.',
    ink: '#0A1628',
    gold: '#E8A838',
    'gold-deep': '#B8851F',
    'ink-rgba': 'rgba(10, 22, 40, a)',
    'gold-rgba': 'rgba(232, 168, 56, a)',
  },
  color: Object.fromEntries(
    COLOR_ORDER.map(([k, role]) => [k, { value: need(k), var: `--${k}`, role }])
  ),
  line: {
    note: 'Hairlines. Black alphas on light grounds, white alphas on dark ones.',
    light: { value: need('line'), var: '--line' },
    'light-soft': { value: need('line-soft'), var: '--line-soft' },
    'light-fill': { value: need('ink-05'), var: '--ink-05' },
    dark: { value: need('line-dark'), var: '--line-dark' },
    'dark-strong': { value: need('line-dark-strong'), var: '--line-dark-strong' },
  },
  type: {
    source: 'globals.css :root and its element rules. Not the brand file, which names a font this repo does not load.',
    roles: {
      body: {
        role: 'Everything that is read. One family at every size.',
        stack: need('font-body'),
        installed: 'Inter, via next/font/google in src/app/layout.tsx',
        size: decl('body', 'font-size'),
        'line-height': decl('body', 'line-height'),
      },
      mono: {
        role: 'Labels, kickers, units, figures that sit in a column. The only second voice.',
        stack: need('font-mono'),
        installed: 'JetBrains Mono, via next/font/google in src/app/layout.tsx',
      },
    },
    scale: {
      note: 'Fluid clamp() ramps, not a fixed modular scale. Weight 700 and letter-spacing -0.025em on every heading.',
      h1: { 'font-size': decl('h1', 'font-size'), 'line-height': decl('h1', 'line-height') },
      h2: { 'font-size': decl('h2', 'font-size'), 'line-height': decl('h2', 'line-height') },
      h3: { 'font-size': decl('h3', 'font-size'), 'line-height': decl('h3', 'line-height') },
      'heading-shared': {
        'font-weight': decl('h1, h2, h3, h4', 'font-weight'),
        'letter-spacing': decl('h1, h2, h3, h4', 'letter-spacing'),
        'text-wrap': decl('h1, h2, h3, h4', 'text-wrap'),
      },
    },
    numerals: {
      rule: 'font-variant-numeric: tabular-nums lining-nums on every figure and every column of numbers.',
      source: 'design reference foundation rules, applied throughout globals.css',
    },
    alignment: {
      rules: [
        'Left-aligned throughout. No centred body text. No justified text.',
        'Ragged-right always.',
        'More vertical space above a heading than below it.',
      ],
      source: 'Hoplight brand file section 2, alignment rules. Not expressible in a stylesheet.',
    },
    measure: { value: need('measure'), var: '--measure', role: 'Prose column cap.' },
  },
  space: {
    source: 'globals.css :root',
    section: { value: need('space-section'), var: '--space-section' },
    'section-sm': { value: need('space-section-sm'), var: '--space-section-sm' },
    'section-lg': { value: need('space-section-lg'), var: '--space-section-lg' },
    'page-max': { value: need('maxw'), var: '--maxw' },
    'page-gutter': { value: decl('.wrap', 'padding'), selector: '.wrap' },
  },
  geometry: {
    source: 'globals.css :root',
    'radius-sm': need('radius-sm'),
    'radius-md': need('radius-md'),
    'radius-lg': need('radius-lg'),
    'radius-pill': need('radius-pill'),
    'button-height': need('btn-h'),
    'shadow-elevated': need('shadow-elevated'),
    'shadow-hover': need('shadow-hover'),
  },
  components: {
    source: 'globals.css element and class rules, parsed. These are the live specs, not the brand file\'s.',
    'accent rule': {
      spec: `height ${decl('.rule', 'height')}, background ${decl('.rule', 'background')}, width ${decl('.rule', 'width')}`,
      selector: '.rule',
      rule: 'The primary separator. Gold is an accent and never dominant: one accent zone per viewport.',
    },
    callout: {
      spec: `border-left ${decl('.unlock', 'border-left')}, padding ${decl('.unlock', 'padding')}`,
      selector: '.unlock',
      rule: 'Left gold border, no box. Used for the one line that carries the section.',
    },
    label: {
      spec: [
        `font-family ${decl('.label', 'font-family')}`,
        `font-size ${decl('.label', 'font-size')}`,
        `text-transform ${decl('.label', 'text-transform')}`,
        `letter-spacing ${decl('.label', 'letter-spacing')}`,
        `color ${decl('.label', 'color')}`,
      ].join(', '),
      selector: '.label',
      rule: 'Mono, uppercase, wide-tracked, deep gold. Never at body size.',
    },
    'button, primary': {
      spec: `background ${decl('.btn-primary', 'background')}, color ${decl('.btn-primary', 'color')}, height ${need('btn-h')}, radius ${need('radius-sm')}`,
      selector: '.btn .btn-primary',
      rule: 'Exactly one filled button above the fold.',
    },
    'focus ring': {
      spec: decl(':where(button, [role="button"], input, textarea, select):focus-visible', 'outline'),
      rule: 'Visible keyboard focus on every interactive element. Never removed.',
    },
    'prose link': {
      spec: `border-bottom ${decl('main p a, main li a, main blockquote a, main h2 a, main h3 a', 'border-bottom')}`,
      rule: 'Inline links carry a static gold underline, never hover-only.',
    },
    divider: {
      spec: `1px solid ${need('line')} on light, 1px solid ${need('line-dark')} on dark`,
      rule: 'Bottom borders only on tables. No full grid.',
    },
  },
  voice: {
    source: 'Hoplight brand file section 4, carried verbatim. Nothing here is inferred.',
    rules: [
      'Precise. Name the mechanism. Name the number.',
      'Direct. Lead with the answer. Context follows.',
      'Grounded. Write from inside the work, not above it. Practitioner voice.',
      'Honest about limits. State what the thing does and what it does not do.',
      'Tight. One idea per sentence.',
    ],
    'tone markers': [
      'No em dashes anywhere in rendered output. Hyphens, commas, colons, periods.',
      'No tidy parallel constructions. Break into separate sentences.',
      'No sycophancy openers.',
      'Active verbs, not passive constructions.',
      'State what is unknown rather than implying certainty.',
    ],
    avoid: ['leverage', 'synergy', 'transform', 'unlock', 'seamless', 'revolutionary'],
  },
  'not carried': [
    'Logo files. The brand file records none as existing.',
    'A tagline. The brand file says none is formalised; the positioning line is "AI strategy for labor, advocacy, and mission-driven organizations".',
    'The brand file\'s docx and pptx implementation sections. They are document specs, not web tokens, and nothing on this site consumes them.',
    'The brand file\'s GT America type scale and its 17px / Perfect Fourth document scale. The stylesheet is authoritative on type and runs Inter at 15.5px with clamp() ramps.',
  ],
};

// ---- the copy-paste stylesheet ----------------------------------------------------------------
function buildCss() {
  const L = [];
  L.push('/* Hoplight brand tokens. Generated from hoplight-site/src/app/globals.css.');
  L.push(` * Version ${DATE}. Canonical copy: https://hoplight.ai/${BASE}.css`);
  L.push(' * Do not hand-edit: scripts/verify.sh fails if this file disagrees with the stylesheet.');
  L.push(' * Retired and dead, in either notation: #0A1628, #E8A838, #B8851F,');
  L.push(' * rgba(10, 22, 40, a), rgba(232, 168, 56, a). */');
  L.push(':root {');
  for (const [k, { value, role }] of Object.entries(payload.color)) {
    L.push(`  --${k}: ${value};${role ? ` /* ${role} */` : ''}`);
  }
  L.push('');
  for (const [k, v] of Object.entries(payload.line)) {
    if (k === 'note') continue;
    L.push(`  --line${k === 'light' ? '' : `-${k.replace('light-', '')}`}: ${v.value};`);
  }
  L.push('');
  // The stylesheet's own stacks lead with var(--font-inter) and var(--font-jetbrains), which
  // next/font defines inside this app and nowhere else. Left as-is, a session pasting this file
  // would silently get the first real fallback, which is why the family name is substituted here
  // and the raw stack is kept in the .json for anyone who needs it.
  L.push("  /* next/font injects the two families on the site itself; named here so this file works standalone. */");
  L.push(`  --font-body: ${payload.type.roles.body.stack.replace('var(--font-inter)', "'Inter'")};`);
  L.push(`  --font-mono: ${payload.type.roles.mono.stack.replace('var(--font-jetbrains)', "'JetBrains Mono'")};`);
  L.push(`  --measure: ${payload.type.measure.value};`);
  L.push('');
  for (const [k, v] of Object.entries(payload.space)) {
    if (k === 'source' || k === 'page-gutter') continue;
    L.push(`  --${k === 'page-max' ? 'maxw' : `space-${k}`}: ${v.value};`);
  }
  L.push('');
  for (const [k, v] of Object.entries(payload.geometry)) {
    if (k === 'source') continue;
    L.push(`  --${k === 'button-height' ? 'btn-h' : k}: ${v};`);
  }
  L.push('}');
  L.push('');
  L.push('/* The four rules that carry the brand. Copy these, not a theme. */');
  L.push(`.rule { height: ${decl('.rule', 'height')}; width: ${decl('.rule', 'width')}; background: var(--gold); border: 0; }`);
  L.push(`.callout { border-left: ${decl('.unlock', 'border-left')}; padding: ${decl('.unlock', 'padding')}; }`);
  L.push(`.label { font-family: var(--font-mono); font-size: ${decl('.label', 'font-size')}; text-transform: uppercase; letter-spacing: ${decl('.label', 'letter-spacing')}; color: var(--gold-deep); }`);
  L.push(`.btn-primary { background: var(--gold); color: var(--ink); height: var(--btn-h); border-radius: var(--radius-sm); border: 1px solid var(--gold); }`);
  L.push('');
  L.push('/* Left-aligned throughout, ragged right, never centred and never justified.');
  L.push(' * Tabular figures on every number. No em dashes in rendered output. */');
  L.push('body { font-family: var(--font-body); font-size: ' + payload.type.roles.body.size + '; line-height: ' + payload.type.roles.body['line-height'] + '; background: var(--surface); color: var(--ink); text-align: left; }');
  L.push('[class*="num"], td, th { font-variant-numeric: tabular-nums lining-nums; }');
  return L.join('\n') + '\n';
}

// ---- contrast, computed rather than asserted ---------------------------------------------------
// WCAG 2.x relative luminance. Computed here so the page cannot print a ratio that is no longer
// true: the whole failure this file exists to stop is a number that was right when someone typed it.
function lum(hex) {
  const h = hex.replace('#', '');
  const ch = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = ch.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
const isHex = (v) => /^#[0-9a-f]{6}$/i.test(v.trim());
const verdict = (r) => (r >= 4.5 ? 'AA text' : r >= 3 ? 'large text only' : 'not for text');

// ---- the human-readable page -------------------------------------------------------------------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buildHtml() {
  const C = payload.color;
  const onSurface = (hex) => ratio(hex, C.surface.value);
  const onInk = (hex) => ratio(hex, C.ink.value);

  const rows = Object.entries(C)
    .map(([k, v]) => {
      const hex = v.value.trim();
      if (!isHex(hex)) return '';
      const s = onSurface(hex);
      const i = onInk(hex);
      return `<tr>
      <td><span class="sw" style="background:${hex}"></span><code>--${k}</code></td>
      <td><code>${hex.toUpperCase()}</code></td>
      <td class="n" data-on="on surface">${s.toFixed(2)}<span class="v">${verdict(s)}</span></td>
      <td class="n" data-on="on ink">${i.toFixed(2)}<span class="v">${verdict(i)}</span></td>
      <td class="role">${esc(v.role)}</td>
    </tr>`;
    })
    .join('\n');

  const retiredChips = [payload.retired.ink, payload.retired.gold, payload.retired['gold-deep']]
    .map((h) => `<span class="dead"><span class="sw" style="background:${h}"></span><code>${h}</code></span>`)
    .join('');

  const specRows = Object.entries(payload.components)
    .filter(([k]) => k !== 'source')
    .map(
      ([k, v]) => `<tr>
      <td><strong>${esc(k)}</strong>${v.selector ? ` <code>${esc(v.selector)}</code>` : ''}</td>
      <td><code class="spec">${esc(v.spec)}</code></td>
      <td class="role">${esc(v.rule ?? '')}</td>
    </tr>`
    )
    .join('\n');

  const list = (items) => items.map((t) => `<li>${esc(t)}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hoplight Brand Tokens</title>
<meta name="description" content="The live Hoplight navy and gold, every token, and the contrast verdict for each one. Generated from the production stylesheet, ${DATE}.">
<meta name="apple-mobile-web-app-title" content="Hoplight Tokens">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta property="og:type" content="website">
<meta property="og:title" content="Hoplight Brand Tokens">
<meta property="og:description" content="The live Hoplight navy and gold, every token, and the contrast verdict for each one. Generated from the production stylesheet, ${DATE}.">
<meta property="og:image" content="https://hoplight.ai/og.png">
<meta property="og:url" content="https://hoplight.ai/${BASE}.html">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Hoplight Brand Tokens">
<meta name="twitter:description" content="The live Hoplight navy and gold, every token, and the contrast verdict for each one.">
<meta name="twitter:image" content="https://hoplight.ai/og.png">
<link rel="canonical" href="https://hoplight.ai/${BASE}.html">
<link rel="manifest" href="/${BASE}-manifest.json">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
<link rel="icon" href="/favicon.ico" sizes="any">
<meta name="theme-color" content="${C.ink.value}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
/* The generated stylesheet, inlined verbatim rather than linked. This page IS the reference, so it
   has to render correctly with nothing else resolving: linked at /${BASE}.css it came up unstyled
   anywhere the absolute path did not resolve, which on a token reference is the one failure that
   cannot be allowed. The copy served at that URL is byte-identical, generated in the same run. */
${buildCss().split('\n').map((l) => (l ? l : '')).join('\n')}
</style>
<style>
/* Page-specific layout. The tokens above are the payload; nothing below redefines one. */
*{box-sizing:border-box}
body{margin:0}
code{font-family:var(--font-mono);font-size:0.86em}

/* SIGNATURE ELEMENT. The live pair is not a chip beside a label: the two colours are full-height
   fields and their own hex numbers are set inside them, so the first thing on the page is the
   colours at real size. Everything below is quiet on purpose. */
.pair{display:grid;grid-template-columns:1fr 1fr;min-height:60vh}
.field{padding:clamp(28px,4vw,56px);display:flex;flex-direction:column;justify-content:flex-end}
.field .hex{font-family:var(--font-mono);font-size:clamp(2.2rem,1.2rem+4.4vw,4.6rem);font-weight:500;letter-spacing:-0.02em;line-height:1;font-variant-numeric:tabular-nums lining-nums}
.field .nm{font-family:var(--font-mono);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:auto}
.field .rl{margin:14px 0 0;max-width:26ch;font-size:0.98rem;line-height:1.45}
.f-ink{background:var(--ink);color:var(--gold)}
.f-ink .rl{color:rgba(255,255,255,0.72)}
.f-gold{background:var(--gold);color:var(--ink)}
.f-gold .rl{color:rgba(15,27,45,0.78)}

.mast{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:baseline;
  padding:18px clamp(20px,4vw,48px);border-bottom:1px solid var(--line)}
.mast .ttl{font-weight:800;letter-spacing:-0.02em;font-size:1.05rem}
.mast .src{font-family:var(--font-mono);font-size:0.72rem;color:var(--stone-deep);letter-spacing:0.04em}

.strip{display:flex;flex-wrap:wrap;gap:clamp(14px,3vw,32px);align-items:center;justify-content:space-between;
  padding:20px clamp(20px,4vw,48px);border-bottom:1px solid var(--line)}
.deadset{display:flex;flex-wrap:wrap;gap:16px;align-items:center}
.deadset .lbl{font-family:var(--font-mono);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.14em;color:var(--stone-deep)}
.dead{display:inline-flex;align-items:center;gap:7px;color:var(--stone-deep);text-decoration:line-through}
.sw{width:15px;height:15px;border-radius:3px;border:1px solid var(--line);display:inline-block;vertical-align:-2px;flex:0 0 auto}
/* Ink fill, not the gold .btn-primary the token set ships. The gold field above is already the
   page's one accent zone, and a gold button beside it makes two contiguous gold regions, which the
   Composition Gate caps at one. Still exactly one filled button above the fold. */
a.cta{display:inline-flex;align-items:center;height:var(--btn-h);padding:0 1.3rem;background:var(--ink);
  color:var(--surface);border:1px solid var(--ink);border-radius:var(--radius-sm);font-weight:600;
  font-size:0.9rem;text-decoration:none;white-space:nowrap}
a.cta:hover{background:var(--ink-mid);border-color:var(--ink-mid)}
a.cta:focus-visible{outline:2px solid var(--gold);outline-offset:2px}

main{padding:clamp(36px,5vw,64px) clamp(20px,4vw,48px);max-width:var(--maxw);margin:0 auto}
section+section{margin-top:clamp(40px,5vw,72px)}
h2{font-size:clamp(1.3rem,1rem+1.2vw,1.8rem);font-weight:700;letter-spacing:-0.025em;margin:0 0 6px;text-wrap:balance}
.note{color:var(--stone-deep);max-width:var(--measure);margin:0 0 22px;font-size:0.96rem;line-height:1.55}
table{width:100%;border-collapse:collapse;font-size:0.9rem}
th{text-align:left;font-family:var(--font-mono);font-size:0.68rem;text-transform:uppercase;
  letter-spacing:0.12em;color:var(--stone-deep);font-weight:500;padding:0 14px 9px 0;
  border-bottom:1px solid var(--line);white-space:nowrap}
td{padding:11px 14px 11px 0;border-bottom:1px solid var(--line-soft);vertical-align:top}
td.n{font-variant-numeric:tabular-nums lining-nums;white-space:nowrap}
td.n .v{display:block;font-family:var(--font-mono);font-size:0.62rem;text-transform:uppercase;
  letter-spacing:0.08em;color:var(--stone-deep);margin-top:2px}
td.role{color:var(--stone-deep);line-height:1.45}
code.spec{color:var(--ink-soft);word-break:break-word}
ul{margin:0;padding-left:1.1rem;color:var(--stone-deep);line-height:1.6;max-width:var(--measure)}
li{margin-bottom:5px}
.cols{display:grid;gap:clamp(24px,4vw,48px);grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
footer{border-top:1px solid var(--line);padding:22px clamp(20px,4vw,48px);color:var(--stone-deep);
  font-size:0.84rem;line-height:1.6}
footer code{color:var(--ink-soft)}
@media (max-width:760px){
  .pair{grid-template-columns:1fr;min-height:0}
  .field{min-height:44vh}
  /* The five-column table overflowed the viewport at 390: the Role column sat off the right edge
     behind a horizontal scrollbar and every row gapped open to the height of the prose hiding
     there. Each row becomes a block instead, with the two ratio cells labelled in place. */
  table, thead, tbody, tr, td{display:block;width:100%}
  thead{display:none}
  tr{padding:14px 0;border-bottom:1px solid var(--line)}
  td{border:0;padding:0 0 4px}
  td.n{display:inline-block;width:auto;margin-right:22px;padding-bottom:8px}
  td.n::before{content:attr(data-on);display:block;font-family:var(--font-mono);font-size:0.62rem;
    text-transform:uppercase;letter-spacing:0.08em;color:var(--stone-deep)}
  td.n .v{display:inline;margin-left:6px}
  td.role{padding-top:2px}
  code.spec{display:block;padding:2px 0 6px}
}
</style>
</head>
<body>

<div class="mast">
  <span class="ttl">Hoplight brand tokens</span>
  <span class="src">generated from src/app/globals.css, ${DATE}</span>
</div>

<div class="pair">
  <div class="field f-ink">
    <span class="nm">ink</span>
    <span class="hex">${C.ink.value.toUpperCase()}</span>
    <p class="rl">${esc(C.ink.role)}</p>
  </div>
  <div class="field f-gold">
    <span class="nm">gold</span>
    <span class="hex">${C.gold.value.toUpperCase()}</span>
    <p class="rl">${esc(C.gold.role)}</p>
  </div>
</div>

<div class="strip">
  <span class="deadset"><span class="lbl">Retired, do not use</span>${retiredChips}</span>
  <a class="cta" href="/${BASE}.css">Copy the stylesheet</a>
</div>

<main>
  <section>
    <h2>Every token, with its contrast verdict</h2>
    <p class="note">Ratios are computed from the token values themselves each time this page is
      built, so a value that moves takes its verdict with it. Gold is an accent: <code>--gold</code>
      does not pass for text on the light ground, which is what <code>--gold-deep</code> is for.</p>
    <table>
      <thead><tr><th>Token</th><th>Value</th><th>On surface</th><th>On ink</th><th>Role</th></tr></thead>
      <tbody>
${rows}
      </tbody>
    </table>
  </section>

  <section>
    <h2>The rules that carry the brand</h2>
    <p class="note">Read off the production stylesheet, not off any extraction. Copy these four
      rather than reaching for a theme.</p>
    <table>
      <thead><tr><th>Element</th><th>Spec</th><th>Rule</th></tr></thead>
      <tbody>
${specRows}
      </tbody>
    </table>
  </section>

  <section class="cols">
    <div>
      <h2>Type</h2>
      <p class="note">One family for everything, one mono voice for labels and figures.
        <code>${esc(payload.type.roles.body.installed)}</code> and
        <code>${esc(payload.type.roles.mono.installed)}</code>.
        Body ${esc(payload.type.roles.body.size)} at ${esc(payload.type.roles.body['line-height'])}.
        Prose caps at <code>${esc(payload.type.measure.value)}</code>.</p>
      <ul>${list(payload.type.alignment.rules)}</ul>
    </div>
    <div>
      <h2>Voice</h2>
      <ul>${list(payload.voice['tone markers'])}</ul>
    </div>
    <div>
      <h2>Not carried here</h2>
      <ul>${list(payload['not carried'])}</ul>
    </div>
  </section>
</main>

<footer>
  <p>Machine-readable: <code>/${BASE}.json</code>. Stylesheet: <code>/${BASE}.css</code>.
  Both are generated from <code>hoplight-site/src/app/globals.css</code> and
  <code>scripts/verify.sh</code> fails if either has drifted from it.</p>
  <p>${esc(payload.authority)}</p>
</footer>

</body>
</html>
`;
}

function buildManifest() {
  return (
    JSON.stringify(
      {
        name: 'Hoplight Brand Tokens',
        short_name: 'Hoplight Tokens',
        description: `The live Hoplight navy and gold, every token, and the contrast verdict for each one. Generated ${DATE}.`,
        start_url: `/${BASE}.html`,
        display: 'standalone',
        background_color: payload.color.surface.value,
        theme_color: payload.color.ink.value,
        icons: [
          { src: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      null,
      2
    ) + '\n'
  );
}

const outJson = JSON.stringify(payload, null, 2) + '\n';
const outCss = buildCss();

const targets = [
  [`public/${BASE}.json`, outJson],
  [`public/${BASE}.css`, outCss],
  [`public/${BASE}.html`, buildHtml()],
  [`public/${BASE}-manifest.json`, buildManifest()],
];

if (CHECK) {
  let drift = 0;
  for (const [rel, want] of targets) {
    let got;
    try {
      got = readFileSync(join(ROOT, rel), 'utf8');
    } catch {
      console.log(`FAIL: ${rel} is not served at all; run npm run tokens:build`);
      drift = 1;
      continue;
    }
    if (got === want) {
      console.log(`PASS: ${rel} matches globals.css`);
    } else {
      console.log(`FAIL: ${rel} has drifted from globals.css; run npm run tokens:build`);
      drift = 1;
    }
  }
  process.exit(drift);
}

for (const [rel, body] of targets) {
  writeFileSync(join(ROOT, rel), body);
  console.log(`wrote ${rel} (${body.length} bytes)`);
}
