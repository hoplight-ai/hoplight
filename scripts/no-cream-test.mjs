// L8 test, lane hopwhite1, 2026-10-07. Whit, 2026-10-06, on how the Hoplight look reads:
// "this fucking cream on cream bullshit has got to go. It is atrocious."
//
// WHY THIS EXISTS. hoplight.ai's own stylesheet is headed "White workshop surface" and painted a warm
// off-white page (--surface #F5F5F0) with a second warm tint for cards (--surface-card #EEEEE8), gold-wash
// bands (--gold-bg), secondary text at 5:1, a text-field border at 1.7:1 and a gold focus ring at 2.4:1 on
// that ground. Page and card sat within a few points of lightness of each other, which is what reads as a
// filing folder. This pins the repair: the page is white, no card or panel ground is a warm tint, text is
// 7:1 on the page, and field edges and focus rings are 3:1 (WCAG 1.4.3/1.4.6 for text, 1.4.11 for the UI
// boundaries). Model: ai-policy-tool/src/lib/hoplightTheme.test.ts, the same fix on the Hoplight AGIS.
//
// WHAT IT READS. src/app/globals.css (the source), public/hoplight-brand-tokens-2026-09-20.css (the copy
// other sessions paste from), and the two page files that carry their own colours:
// src/app/(main)/persuasion/PmeContent.tsx and src/app/(main)/services/page.tsx. Nothing is hard-coded to a
// hex it expects to find: values are parsed out and resolved through var(), so a future warm token, or a
// new warm background literal in any of those four files, goes red.
//
// ADDED 2026-10-08 (lane hopfix1, the four findings that lane hopwhite1 filed). The first lane could
// not reach the files that carry their own palettes, so this lane pins them too:
//   (a) src/app/(main)/tools/which-ai/WhichAiTool.tsx (white cards and callouts with borders, tokens that
//       match the stylesheet) and src/app/manifest.ts (the phone splash colour is the page's white);
//   (b) every static page, mockup, svg and token file under public/ (no cream colour literal at all);
//   (c) the contact page's two choice buttons (title and description on separate lines);
//   (d) the deep gold used for small gold text reaches 7:1 on white, in every file that defines it.
//
// ADDED 2026-10-08 (lane hopmock1, the three smaller findings lane hopfix1 filed), tests (e) to (h) at the
// bottom of this file:
//   (e) cream-tinted text and rules on the navy sections of src/app/(main)/services/page.tsx, and the cream
//       text colour in the link-preview card src/app/api/og/route.tsx, are white at the same transparency;
//   (f) the secondary gray of eight static pages under public/portfolio/ reaches 7:1 on their white ground;
//   (g) the gold figures on the political-money page reach 7:1 on white (they were 2.9:1);
//   (h) scripts/retire-old-palette.mjs maps the old small-text gold to the 7:1 deep gold, not the old 6.2:1 one.
//
// ADDED 2026-10-08 (lane hopmock1 again, the three findings that lane filed at its own close, which the
// dispatcher ruled in scope for the same mockup), tests (i) to (k) at the bottom of this file:
//   (i) the "US Senate" and "US House" labels on the political-money page are white boxes with a thin
//       deep-gold outline, not a gold wash that reads as a cream box (washes written as rgba() are read too);
//   (j) the two secondary grays of the dark page every-political-dollar-buys-less.html (--tx2 and --mt) reach
//       7:1 on both of its dark grounds (the page ground and the card ground), keep their order below the main
//       text, and are cool neutrals; its baseline row still fades back and reaches 4.5:1;
//   (k) the headline of the political-money page has a gap above it, so it does not sit on the Hoplight bar.
//
// ADDED 2026-10-09 (lane hopgold1). Whit, 2026-10-09: "the hoplight gold isnt doing it for me yet- the old
// was too bright the new is too muddy"; shown five golds the same day, he answered "option c". Option C is
// #996D00, 4.62:1 on white. The 7:1 floor the gold carried above was set by a session, never by Whit, so
// every gold floor in this file is now the 4.5:1 body-text bar; every grey keeps its own floor. Tests (l) to
// (q) at the bottom of this file:
//   (l) --gold-deep is #996D00 in every file that defines it, and the old deep gold #785010 is gone;
//   (m) no gold used as text on a light ground measures under 4.5:1;
//   (n) gold on navy and the other dark grounds reaches 4.5:1 (the story page above all);
//   (o) no chip or table row uses a warm tint ground (the Which AI exposure chips, the political-money rows);
//   (p) the agency inventory's "Uncertain" reaches 4.5:1;
//   (q) no served page loads a font from fonts.googleapis.com or fonts.gstatic.com (the site's content
//       security policy blocks both, so those pages drew in a fallback face); the faces are self-hosted.
//
// ADDED 2026-10-09 (lane hopgold1, the two findings it filed, which the dispatcher ruled in scope), tests
// (r) and (s) at the bottom of this file:
//   (r) the DNC page's category badges are white outlined chips: no warm or cream wash, text at 4.5:1 on the
//       chip in both of the page's themes, and the "strategy" and "candidate" orange still reads as orange;
//   (s) the political-money page's "Citizens United" label hangs from the top of the chart, inside it, and
//       not below the bars where it ran through the note paragraph.
//
// STILL NOT COVERED: the dark theme of the Oregon report and the rest of the DNC page's dark theme (its
// badges are held by test (r)), the rest of the dark page every-political-dollar-buys-less.html (its secondary grays are held
// by test (j), its gold by test (n)), gold drawn as svg text, and every image file (the portfolio
// thumbnails show other products' screens).
//
// Run: `node --test scripts/no-cream-test.mjs` (also part of `npm test`, which CI runs).

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath rather than `new URL(...).pathname`, which mangles the space in the folder name.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const FILES = {
  globals: 'src/app/globals.css',
  served: 'public/hoplight-brand-tokens-2026-09-20.css',
  pme: 'src/app/(main)/persuasion/PmeContent.tsx',
  services: 'src/app/(main)/services/page.tsx',
  whichai: 'src/app/(main)/tools/which-ai/WhichAiTool.tsx',
  manifest: 'src/app/manifest.ts',
  intake: 'src/components/IntakeForm.tsx',
  ogroute: 'src/app/api/og/route.tsx',
  retire: 'scripts/retire-old-palette.mjs',
};
const src = Object.fromEntries(Object.entries(FILES).map(([k, rel]) => [k, read(rel)]));

// ---- css reading --------------------------------------------------------------------------------
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// Custom properties declared anywhere in a text, last declaration wins within that text.
function customProps(text) {
  const out = {};
  for (const m of stripComments(text).matchAll(/--([a-z0-9-]+)\s*:\s*([^;}\n]+)/gi)) out[m[1]] = m[2].trim();
  return out;
}

// The first :root block only, which is where the tokens live in both css files.
function rootBlock(css) {
  const plain = stripComments(css);
  const open = plain.indexOf(':root {');
  const close = plain.indexOf('\n}', open);
  assert.ok(open !== -1 && close !== -1, ':root block not found');
  return plain.slice(open, close);
}

// Every `selector { body }` rule, innermost only (rules inside @media come out as plain rules).
function rules(css) {
  const out = [];
  for (const m of stripComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    out.push({ selector: m[1].trim().replace(/\s+/g, ' '), body: m[2] });
  }
  return out;
}

const decls = (body, prop) => {
  const re = new RegExp(`(?:^|[;\\s])${prop}\\s*:\\s*([^;]+)`, 'gi');
  return [...body.matchAll(re)].map((m) => m[1].trim());
};

// ---- colour maths -------------------------------------------------------------------------------
function hexToRgb(h) {
  let s = h.replace('#', '');
  if (s.length === 3) s = [...s].map((c) => c + c).join('');
  assert.match(s, /^[0-9a-f]{6}([0-9a-f]{2})?$/i, `not a hex colour: ${h}`);
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}

const ATOM = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|var\(--[a-z0-9-]+\)/g;

// One colour atom (hex, rgb(), rgba() or var()) to [r,g,b,a], resolving var() through `vars`.
function parseColor(atom, vars, depth = 0) {
  assert.ok(depth < 8, `var() chain too deep at ${atom}`);
  const a = atom.trim();
  const v = a.match(/^var\(--([a-z0-9-]+)\)$/i);
  if (v) {
    assert.ok(v[1] in vars, `--${v[1]} is not defined`);
    return parseColor(vars[v[1]], vars, depth + 1);
  }
  if (a.startsWith('#')) return [...hexToRgb(a).slice(0, 3), 1];
  const f = a.match(/^rgba?\(([^)]*)\)$/i);
  assert.ok(f, `cannot read colour: ${atom}`);
  const p = f[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
}

// Lay a colour with alpha over an opaque ground, as the browser would.
const over = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a)];

function luminance([r, g, b]) {
  const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

function hsl([r, g, b]) {
  const [R, G, B] = [r, g, b].map((c) => c / 255);
  const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === R) h = ((G - B) / d) % 6;
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return [h, s * 100, l * 100];
}

// Warm off-white = a yellow-orange hue carrying any saturation at high lightness. The same test the
// Hoplight AGIS uses, so the two products cannot disagree about what counts as cream. Pure white
// (lightness 100) and cool or neutral greys pass; #F5F5F0, #EEEEE8, #F5E6C4, #FBF4E4, #EFECE5 do not.
function isCream(rgb) {
  const [h, s, l] = hsl(rgb);
  return l >= 85 && l < 100 && s > 4 && h >= 20 && h <= 70;
}

const hexOf = ([r, g, b]) => '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('').toUpperCase();
const WHITE = [255, 255, 255];

// ---- the vocabulary -----------------------------------------------------------------------------
const globalVars = customProps(rootBlock(src.globals));
const servedVars = customProps(rootBlock(src.served));
const PAGE_GROUND = [['globals.css', globalVars], ['served token file', servedVars]];

// Tokens that are text, by the stylesheet's own roles (--ink: headlines and body; --ink-soft: supporting
// prose; --stone-deep and --stone: secondary text, captions, metadata). --gold-deep is the accent text
// for small labels and links. Held to AA (4.5:1) by the first lane, raised to 7:1 by lane hopfix1 on
// 2026-10-08, and back to 4.5:1 by lane hopgold1 on 2026-10-09, when Whit picked option C (#996D00).
const BODY_TEXT = [['ink', 12], ['ink-soft', 7]];
const SECONDARY_TEXT = [['stone-deep', 7], ['stone', 7]];
const GOLD_FLOOR = 4.5;
const GOLD_C = '#996D00';

// ---- 1. the page is white -----------------------------------------------------------------------
test('the page ground is pure white in the stylesheet and in the served token file', () => {
  for (const [name, vars] of PAGE_GROUND) {
    assert.equal(hexOf(parseColor('var(--surface)', vars)), '#FFFFFF', `${name}: --surface is not white`);
  }
  const body = rules(src.globals).find((r) => r.selector === 'body');
  assert.ok(body, 'no body rule in globals.css');
  assert.equal(hexOf(parseColor(decls(body.body, 'background')[0], globalVars)), '#FFFFFF', 'body does not paint white');
  const servedBody = rules(src.served).find((r) => r.selector === 'body');
  assert.ok(servedBody, 'no body rule in the served token file');
  assert.equal(hexOf(parseColor(decls(servedBody.body, 'background')[0], servedVars)), '#FFFFFF', 'served body does not paint white');
});

test('cards are white and separated by borders, not by a tint', () => {
  for (const [name, vars] of PAGE_GROUND) {
    for (const t of ['surface-card', 'paper', 'paper-deep']) {
      if (!(t in vars)) continue; // the legacy aliases live in globals.css only
      assert.equal(hexOf(parseColor(`var(--${t})`, vars)), '#FFFFFF', `${name}: --${t} is not white`);
    }
  }
});

// ---- 2. no warm tint anywhere a ground can come from --------------------------------------------
test('no light colour token is a warm tint', () => {
  for (const [name, vars] of PAGE_GROUND) {
    for (const [k, v] of Object.entries(vars)) {
      // Whole-value colours only: skips font stacks, shadows, lengths and rgba() alpha washes.
      if (!/^(#[0-9a-f]{3,6}|var\(--[a-z0-9-]+\))$/i.test(v)) continue;
      if (/^var\(--font/.test(v)) continue;
      const rgb = parseColor(v, vars).slice(0, 3);
      assert.ok(!isCream(rgb), `${name}: --${k} is a warm tint (${hexOf(rgb)})`);
    }
  }
});

test('no background in the stylesheet or the two page files paints a warm tint', () => {
  const offenders = [];
  for (const key of ['globals', 'pme', 'services']) {
    const vars = { ...globalVars, ...customProps(src[key]) };
    const text = key === 'globals' ? src[key] : src[key].replace(/\n/g, ' ');
    // Declarations: css `background: x` and jsx `background: 'x'` / `backgroundColor: 'x'`.
    for (const m of stripComments(text).matchAll(/background(?:-?[cC]olor)?\s*:\s*([^;}]+)/g)) {
      for (const atom of m[1].match(ATOM) ?? []) {
        if (atom.startsWith('rgb')) continue; // alpha washes of black and white are neutral
        let rgb;
        try { rgb = parseColor(atom, vars).slice(0, 3); } catch { continue; }
        if (isCream(rgb)) offenders.push(`${FILES[key]}: background ${atom} is ${hexOf(rgb)}`);
      }
    }
  }
  assert.deepEqual([...new Set(offenders)], [], 'warm backgrounds found');
});

test('the persuasion page keeps the same token values as the stylesheet it copies from', () => {
  // Pixel Cop, 2026-09-16: that page runs its own :root-like block under the site's own token names.
  const pmeBlock = src.pme.match(/\.pme-page\s*\{[\s\S]*?\n\}/)[0];
  const local = customProps(pmeBlock);
  for (const k of Object.keys(local)) {
    if (!(k in globalVars) || !/^#/.test(local[k]) || !/^#/.test(globalVars[k])) continue;
    assert.equal(local[k].toUpperCase(), globalVars[k].toUpperCase(), `PmeContent.tsx --${k} has drifted from globals.css`);
  }
});

// ---- 3. text clears 7:1 on the page -------------------------------------------------------------
test('body and secondary text clear their contrast floors on the page ground', () => {
  for (const [name, vars] of PAGE_GROUND) {
    const ground = parseColor('var(--surface)', vars).slice(0, 3);
    for (const [tok, floor] of [...BODY_TEXT, ...SECONDARY_TEXT]) {
      const c = contrast(parseColor(`var(--${tok})`, vars).slice(0, 3), ground);
      assert.ok(c >= floor, `${name}: --${tok} is ${c.toFixed(2)}:1 on the page, needs ${floor}:1`);
    }
    const accent = contrast(parseColor('var(--gold-deep)', vars).slice(0, 3), ground);
    assert.ok(accent >= GOLD_FLOOR, `${name}: --gold-deep is ${accent.toFixed(2)}:1 on the page, needs ${GOLD_FLOOR}:1`);
  }
});

// ---- 4. field edges and focus rings clear 3:1 ---------------------------------------------------
test('text-field edges clear 3:1 against the page', () => {
  const field = rules(src.globals).find((r) => r.selector.includes('.field input[type="text"]'));
  assert.ok(field, 'no .field input rule in globals.css');
  const border = decls(field.body, 'border')[0];
  const atom = (border.match(ATOM) ?? []).pop();
  assert.ok(atom, `no colour in the field border: ${border}`);
  const edge = over(parseColor(atom, globalVars), WHITE);
  const c = contrast(edge, WHITE);
  assert.ok(c >= 3, `field border ${border} is ${c.toFixed(2)}:1 on the page, needs 3:1`);
});

test('every keyboard focus indicator on a light ground clears 3:1', () => {
  const failing = [];
  let seen = 0;
  for (const r of rules(src.globals)) {
    if (!r.selector.includes(':focus')) continue;
    // Dark grounds are checked separately below; skip-link and nav live on or over navy.
    if (/\.slate|header|\.skip-link/.test(r.selector)) continue;
    seen += 1;
    const indicators = [
      ...decls(r.body, 'outline').filter((v) => v !== 'none'),
      ...decls(r.body, 'border-color'),
      ...decls(r.body, 'box-shadow'),
    ];
    // The indicator is the strongest colour the rule paints, not the soft glow beside it.
    const best = Math.max(0, ...indicators.map((v) => {
      const atoms = v.match(ATOM) ?? [];
      return Math.max(0, ...atoms.map((a) => {
        try { return contrast(over(parseColor(a, globalVars), WHITE), WHITE); } catch { return 0; }
      }));
    }));
    if (best < 3) failing.push(`${r.selector} { ${r.body.trim().replace(/\s+/g, ' ')} } is ${best.toFixed(2)}:1`);
  }
  assert.ok(seen >= 4, `expected at least 4 focus rules on light grounds, found ${seen}`);
  assert.deepEqual(failing, [], 'focus indicators under 3:1 on white');
});

test('focus rings on the navy sections stay at least 3:1 on navy', () => {
  const dark = rules(src.globals).find((r) => /\.slate/.test(r.selector) && decls(r.body, '--ring').length);
  assert.ok(dark, 'no dark-section rule sets --ring, so the light-ground ring would land on navy');
  const ring = over(parseColor(decls(dark.body, '--ring')[0], globalVars), WHITE);
  const ink = parseColor('var(--ink)', globalVars).slice(0, 3);
  const c = contrast(ring, ink);
  assert.ok(c >= 3, `dark-section ring is ${c.toFixed(2)}:1 on navy, needs 3:1`);
});

// =====================================================================================================
// LANE hopfix1, 2026-10-08: the four findings the first lane filed. Each test below was written first and
// seen red on the tree at c1c1c76 (see the lane's done-file for the observed failures).
// =====================================================================================================

// ---- helpers for the files outside the stylesheet ------------------------------------------------
function walkFiles(dir, exts, skip = new Set(['fonts', 'node_modules', '.next'])) {
  const out = [];
  for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const rel = join(dir, e.name);
    if (e.isDirectory()) {
      if (!skip.has(e.name)) out.push(...walkFiles(rel, exts, skip));
    } else if (exts.has(extname(e.name)) && statSync(join(ROOT, rel)).size < 4_000_000) {
      out.push(rel);
    }
  }
  return out;
}

// Every cream colour literal in a text, by the same rule as isCream: hex of 3, 6 or 8 digits, and rgb() or
// rgba() written in decimal. Returned as written.
function creamLiterals(text) {
  const found = [];
  for (const m of text.matchAll(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z])/g)) {
    if (isCream(hexToRgb(m[0]).slice(0, 3))) found.push(m[0]);
  }
  for (const m of text.matchAll(/rgba?\(\s*(\d+)\s*[\s,]\s*(\d+)\s*[\s,]\s*(\d+)/g)) {
    if (isCream([Number(m[1]), Number(m[2]), Number(m[3])])) found.push(`${m[0]})`);
  }
  return found;
}

const withoutLineComments = (text) => text.replace(/^\s*\/\/.*$/gm, '');

// The Which AI tool keeps its own brand tokens in one object, `const C = { ... }`.
function whichAiTokens() {
  const block = src.whichai.match(/const C = \{([\s\S]*?)\n\};/);
  assert.ok(block, 'no brand token block (const C) in WhichAiTool.tsx');
  return Object.fromEntries([...block[1].matchAll(/(\w+):\s*'([^']+)'/g)].map((m) => [m[1], m[2]]));
}

// The value of every `background:`, `backgroundColor:` and `.style.background =` in a jsx file, read as one
// expression: a quoted string, a template literal or a dotted name. Anything after it (a border, a comma)
// belongs to some other property and is not read.
function jsxBackgrounds(text) {
  const out = [];
  for (const m of text.matchAll(/background(?:Color)?\s*[:=]\s*/g)) {
    const rest = text.slice(m.index + m[0].length);
    const q = rest[0];
    if (q === '`' || q === "'" || q === '"') out.push(rest.slice(0, rest.indexOf(q, 1) + 1));
    else out.push((rest.match(/^[\w.$]+/) ?? [''])[0]);
  }
  return out;
}

// The colours one jsx background value paints, as [r,g,b,a]: a bare `C.name`, a `${C.name}hh` wash, or a literal.
function groundsOf(value, C) {
  const out = [];
  const bare = value.match(/^C\.(\w+)$/);
  if (bare && C[bare[1]]) out.push(parseColor(C[bare[1]], {}));
  for (const t of value.matchAll(/\$\{C\.(\w+)\}([0-9a-fA-F]{2})?/g)) {
    if (!C[t[1]]) continue;
    const [r, g, b] = parseColor(C[t[1]], {});
    out.push([r, g, b, t[2] ? parseInt(t[2], 16) / 255 : 1]);
  }
  for (const t of value.matchAll(/#[0-9a-fA-F]{6}\b|rgba?\([^)]*\)/g)) out.push(parseColor(t[0], {}));
  return out;
}

// ---- (a) the Which AI tool and the phone splash colour -------------------------------------------
test('(a) the phone splash colour is the page white, not a cream', () => {
  const bg = src.manifest.match(/background_color:\s*["'](#[0-9a-fA-F]{6})["']/);
  assert.ok(bg, 'no background_color in manifest.ts');
  assert.equal(bg[1].toUpperCase(), '#FFFFFF', `background_color is ${bg[1]}; the splash has to match the white page`);
  assert.deepEqual(creamLiterals(withoutLineComments(src.manifest)), [], 'manifest.ts carries a cream colour');
});

test('(a) the Which AI tool takes its tokens from the stylesheet and its card ground is white', () => {
  const C = whichAiTokens();
  assert.equal(hexOf(parseColor(C.paper, {})), '#FFFFFF', `C.paper is ${C.paper}, the card ground must be white`);
  const pairs = [['ink', 'ink'], ['inkSoft', 'ink-soft'], ['gold', 'gold'], ['goldDeep', 'gold-deep'], ['stone', 'stone']];
  for (const [mine, theirs] of pairs) {
    assert.ok(C[mine], `C.${mine} is missing from the Which AI tool's tokens`);
    assert.equal(C[mine].toUpperCase(), globalVars[theirs].toUpperCase(), `C.${mine} has drifted from --${theirs} in globals.css`);
  }
  for (const [k, v] of Object.entries(C)) {
    if (/^#[0-9a-f]{6}$/i.test(v)) assert.ok(!isCream(hexToRgb(v)), `C.${k} is a warm tint (${v})`);
  }
});

test('(a) no card, callout, pill or hover wash in the Which AI tool paints a warm tint', () => {
  const C = whichAiTokens();
  const offenders = [];
  for (const value of jsxBackgrounds(src.whichai)) {
    for (const rgba of groundsOf(value, C)) {
      const rgb = over(rgba, WHITE);
      if (isCream(rgb)) offenders.push(`background ${value} lays down ${hexOf(rgb)} on the white page`);
    }
  }
  assert.deepEqual([...new Set(offenders)], [], 'warm backgrounds in WhichAiTool.tsx');
});

test('(a) every white card in the Which AI tool is told apart by a visible border, not a whisper', () => {
  const C = whichAiTokens();
  assert.ok(C.line, 'C.line (the card border, the stylesheet\'s --line-card) is missing');
  const [, , , alpha] = parseColor(C.line, {});
  assert.ok(alpha >= 0.18, `C.line is ${alpha} opaque; the stylesheet's card border is 0.18`);
  const cards = [...src.whichai.matchAll(/background:\s*C\.paper,\s*border:\s*(`[^`]*`)/g)].map((m) => m[1]);
  assert.ok(cards.length >= 5, `expected at least 5 white cards with a border, found ${cards.length}`);
  const weak = cards.filter((b) => !b.includes('C.line'));
  assert.deepEqual(weak, [], 'white cards whose border is not C.line');
});

test('(a) the security notices on the result page are white boxes with a border, not tinted boxes', () => {
  // The yellow notice was a gold wash over white, which reads as a cream box inside a white card. The
  // three status grounds are boxes, so they follow the same rule as every other card. (The red, yellow and
  // green chips in the exposure table stay tinted: they are the data, the level of exposure, not a ground.)
  const block = src.whichai.match(/const securityColors[^=]*=\s*\{([\s\S]*?)\n\};/);
  assert.ok(block, 'no securityColors in WhichAiTool.tsx');
  const C = whichAiTokens();
  // bg is either a quoted colour or a name from the tool's own token object (`C.paper`)
  const levels = [...block[1].matchAll(/(\w+):\s*\{\s*bg:\s*(?:'([^']+)'|C\.(\w+))/g)].map((m) => [m[1], m[2] ?? C[m[3]]]);
  assert.ok(levels.length >= 3, `expected the three security levels, found ${levels.length}`);
  const tinted = levels.filter(([, bg]) => hexOf(over(parseColor(bg, {}), WHITE)) !== '#FFFFFF').map(([k, bg]) => `${k}: ${bg}`);
  assert.deepEqual(tinted, [], 'security notice grounds that are not white');
});

test('(a) secondary text in the Which AI tool is a solid colour, not ink dimmed with opacity', () => {
  // Ink at 70 percent opacity is 6.4:1 on white and at 55 percent is 3.9:1; both are under the 7:1 floor.
  const dimmed = [...src.whichai.matchAll(/color:\s*C\.ink\b[^{}]*?opacity:\s*[0-9.]+/g)].map((m) => m[0].replace(/\s+/g, ' '));
  assert.deepEqual(dimmed, [], 'text dimmed with opacity');
});

// ---- (b) the static pages under public/ -----------------------------------------------------------
test('(b) no static page, mockup, svg or token file under public/ carries a cream colour', () => {
  const files = walkFiles('public', new Set(['.html', '.svg', '.css', '.json', '.js']));
  assert.ok(files.length >= 20, `expected to scan at least 20 static files, scanned ${files.length}`);
  const offenders = [];
  for (const f of files) {
    const hits = creamLiterals(read(f));
    if (hits.length) offenders.push(`${f}: ${[...new Set(hits)].join(' ')}`);
  }
  assert.deepEqual(offenders, [], 'cream colour literals left under public/');
});

// ---- (c) the contact page's two choice buttons ----------------------------------------------------
test('(c) the contact page choice buttons put the title and the description on separate lines', () => {
  const buttons = src.intake.match(/<button[^>]*className="gate-btn"[\s\S]*?<\/button>/g) ?? [];
  assert.equal(buttons.length, 2, 'expected the two gate buttons in IntakeForm.tsx');
  const INLINE = new Set(['span', 'strong', 'em', 'b', 'i', 'a', 'small', 'code']);
  for (const cls of ['gt', 'gd']) {
    for (const b of buttons) {
      const tag = b.match(new RegExp(`<(\\w+)[^>]*className="${cls}"`));
      assert.ok(tag, `a gate button has no .${cls}`);
      if (!INLINE.has(tag[1])) continue; // a block element already sits on its own line
      const shown = rules(src.globals)
        .filter((r) => r.selector.split(',').some((s) => s.trim() === `.gate-btn .${cls}`))
        .flatMap((r) => decls(r.body, 'display'));
      const last = shown[shown.length - 1];
      assert.ok(
        last && /^(block|flex|grid)$/.test(last),
        `.gate-btn .${cls} is an inline <${tag[1]}> and the stylesheet does not make it a block (display: ${last ?? 'unset'}), so it runs into the next line`,
      );
    }
  }
});

// ---- (d) the deep gold reaches the gold floor on white everywhere it is defined ---------------------
// Was 7:1 until lane hopgold1, 2026-10-09; the floor is now the 4.5:1 body-text bar (see the header).
test('(d) every definition of the deep gold clears the 4.5:1 gold floor on white', () => {
  const files = [
    ...walkFiles('src', new Set(['.ts', '.tsx', '.css'])),
    ...walkFiles('public', new Set(['.html', '.css', '.json', '.svg'])),
  ];
  // A css custom property, the Which AI tool's goldDeep constant, or an object in the token json.
  const DEF = /--gold-deep\s*:\s*(#[0-9a-fA-F]{6})|goldDeep\s*:\s*'(#[0-9a-fA-F]{6})'|"gold-deep"\s*:\s*\{\s*"value"\s*:\s*"(#[0-9a-fA-F]{6})"/g;
  const failing = [];
  let seen = 0;
  for (const f of files) {
    for (const m of read(f).matchAll(DEF)) {
      seen += 1;
      const hex = m[1] ?? m[2] ?? m[3];
      const c = contrast(hexToRgb(hex), WHITE);
      if (c < GOLD_FLOOR) failing.push(`${f}: ${hex} is ${c.toFixed(2)}:1`);
    }
  }
  assert.ok(seen >= 8, `expected at least 8 definitions of the deep gold, found ${seen}`);
  assert.deepEqual(failing, [], `deep gold under ${GOLD_FLOOR}:1 on white`);
});

test('(d) the old 6.2:1 deep gold is gone from the source and the served files', () => {
  const files = [
    ...walkFiles('src', new Set(['.ts', '.tsx', '.css'])),
    ...walkFiles('public', new Set(['.html', '.css', '.json', '.svg'])),
  ];
  const left = files.filter((f) => /#845810/i.test(read(f)));
  assert.deepEqual(left, [], 'files that still carry #845810');
  const claim = files.filter((f) => /6\.2:1/.test(read(f)) && /gold-deep|--ring/.test(read(f)));
  assert.deepEqual(claim, [], 'files that still say the deep gold or the ring is 6.2:1');
});

// =====================================================================================================
// LANE hopmock1, 2026-10-08: the three smaller findings lane hopfix1 filed, shown to Whit as before and
// after pictures before anything is published. Each test below was written first and seen red on the tree
// at 60c4c81 (see the lane's done-file for the observed failures).
// =====================================================================================================

const NAVY_GROUND = hexToRgb('#0F1B2D');

// ---- (e) the navy sections and the link-preview card ---------------------------------------------
test('(e) the services page navy sections use white text and rules at the same transparency, not cream', () => {
  const text = withoutLineComments(src.services);
  assert.deepEqual(creamLiterals(text), [], 'cream colour literals left in services/page.tsx');
  const whites = [...text.matchAll(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*(0?\.\d+)\s*\)/g)].map((m) => m[1]).sort();
  assert.deepEqual(
    whites,
    ['0.18', '0.18', '0.18', '0.18', '0.18', '0.7', '0.7', '0.7', '0.7'],
    'expected the five rules at 0.18 and the four paragraphs at 0.7, all white',
  );
  // The paragraphs keep their 7:1 on the navy once laid over it.
  const para = over([255, 255, 255, 0.7], NAVY_GROUND);
  const c = contrast(para, NAVY_GROUND);
  assert.ok(c >= 7, `white at 0.7 on the navy is ${c.toFixed(2)}:1, needs 7:1`);
});

test('(e) the link-preview card paints its headline and wordmark in white, not cream', () => {
  const text = withoutLineComments(src.ogroute);
  assert.deepEqual(creamLiterals(text), [], 'cream colour literals left in api/og/route.tsx');
  const consts = Object.fromEntries([...text.matchAll(/const (\w+) = '(#[0-9a-fA-F]{6})'/g)].map((m) => [m[1], m[2]]));
  const textColours = [...text.matchAll(/\bcolor:\s*(\w+)\s*,/g)].map((m) => consts[m[1]]).filter(Boolean);
  assert.ok(textColours.length >= 3, `expected the headline, the subtitle and the wordmark colours, found ${textColours.length}`);
  assert.ok(
    textColours.some((h) => h.toUpperCase() === '#FFFFFF'),
    `no text on the card is white (colours: ${[...new Set(textColours)].join(' ')})`,
  );
  for (const h of textColours) {
    const c = contrast(hexToRgb(h), NAVY_GROUND);
    assert.ok(c >= 7, `card text ${h} is ${c.toFixed(2)}:1 on the navy, needs 7:1`);
  }
});

// ---- (f) the eight static pages: secondary gray -------------------------------------------------
// [file, the page's own secondary-text token in its light theme, the value it carried at 60c4c81]
const GRAY_PAGES = [
  ['ai-governance-checklist.html', '--text-secondary', '#6b6b68'],
  ['ai-lobbyist-player-map.html', '--text-secondary', '#6b6b68'],
  ['cba-win-pattern-playbook.html', '--text-secondary', '#6b6b68'],
  ['dnc-autopsy-taken-apart.html', '--text-dim', '#6b6b6b'],
  ['oregon-school-budget-report.html', '--text-dim', '#6d6a60'],
  ['pdi-trust-dilution-model.html', '--muted', '#6b7280'],
  ['worker-equity-dilution-at-ge.html', '--text-muted', '#6b7280'],
  ['where-political-money-actually-works.html', '--mt', '#7A756E'],
];

test('(f) the secondary gray on each of the eight static pages reaches 7:1 on white', () => {
  assert.equal(GRAY_PAGES.length, 8);
  const failing = [];
  for (const [file, token, was] of GRAY_PAGES) {
    const text = read(`public/portfolio/${file}`);
    // The first declaration of the token is the light theme in every one of these pages.
    const m = text.match(new RegExp(`${token}\\s*:\\s*(#[0-9a-fA-F]{3,6})`));
    assert.ok(m, `${file}: no ${token} declaration`);
    const c = contrast(hexToRgb(m[1]), WHITE);
    if (c < 7) failing.push(`${file}: ${token} ${m[1]} is ${c.toFixed(2)}:1`);
    // Copies of the same gray written out as a literal (the PDI chart axes, a caption) go with it.
    if (text.toLowerCase().includes(was.toLowerCase())) failing.push(`${file}: still carries the old gray ${was}`);
  }
  assert.deepEqual(failing, [], 'secondary gray under 7:1 on white');
});

// ---- (g) the political-money page: gold figures ------------------------------------------------------
// Was 7:1 until lane hopgold1, 2026-10-09; the floor is now the 4.5:1 gold floor (see the header).
test('(g) the gold figures on the political-money page reach the 4.5:1 gold floor on white', () => {
  const text = read('public/portfolio/where-political-money-actually-works.html');
  const style = text.match(/<style>([\s\S]*?)<\/style>/)[1];
  const vars = customProps(style);
  assert.ok(!/#B8920A/i.test(text), 'the page still carries the 2.9:1 gold #B8920A');
  const ac = contrast(parseColor('var(--ac)', vars).slice(0, 3), WHITE);
  assert.ok(ac >= GOLD_FLOOR, `--ac is ${ac.toFixed(2)}:1 on white, needs ${GOLD_FLOOR}:1`);
  const failing = [];
  for (const sel of ['h1', '.pair-ratio', '.card .stat', '.accent']) {
    const r = rules(style).find((x) => x.selector === sel);
    assert.ok(r, `no ${sel} rule on the page`);
    const colour = parseColor(decls(r.body, 'color')[0], vars).slice(0, 3);
    const c = contrast(colour, WHITE);
    if (c < GOLD_FLOOR) failing.push(`${sel}: ${hexOf(colour)} is ${c.toFixed(2)}:1`);
  }
  assert.deepEqual(failing, [], `gold figures under ${GOLD_FLOOR}:1 on white`);
  // The two federal labels (.tag-fed) are held by test (i) below: white box, deep-gold outline, 7:1 text.
});

// ---- (h) the old-palette retire script ---------------------------------------------------------------
// The floor was 7:1 until lane hopgold1, 2026-10-09; it is the 4.5:1 gold floor now, and the target has to
// be the stylesheet's own --gold-deep, which is option C.
test('(h) the old-palette retire script maps the old deep gold to the stylesheet\'s deep gold, not the 6.2:1 one', () => {
  const targets = [...src.retire.matchAll(/\['#b8851f',\s*'(#[0-9a-fA-F]{6})'/gi)].map((m) => m[1]);
  assert.equal(targets.length, 2, `expected the upper and lower case map rows for #B8851F, found ${targets.length}`);
  for (const t of targets) {
    const c = contrast(hexToRgb(t), WHITE);
    assert.ok(c >= GOLD_FLOOR, `the script maps the old deep gold to ${t}, which is ${c.toFixed(2)}:1 on white, needs ${GOLD_FLOOR}:1`);
    assert.equal(t.toUpperCase(), globalVars['gold-deep'].toUpperCase(), `${t} is not the stylesheet's --gold-deep`);
  }
  assert.ok(!/#845810/i.test(src.retire), 'the script still names the old 6.2:1 gold #845810');
  assert.ok(!/6\.20:1/.test(src.retire), 'the script still says the deep gold is 6.20:1');
});

// =====================================================================================================
// LANE hopmock1, second pass, 2026-10-08: the three findings that lane filed at its own close. Each test
// below was written first and seen red on ed034af (see the lane's done-file for the observed failures).
// =====================================================================================================

const MONEY_PAGE = 'public/portfolio/where-political-money-actually-works.html';
const DARK_PAGE = 'public/portfolio/every-political-dollar-buys-less.html';
// The page's own stylesheet is the first <style> block; the Hoplight bar injects a second one after it.
const ownStyle = (html) => html.match(/<style>([\s\S]*?)<\/style>/)[1];

// Every background colour a page paints, in its stylesheet and in inline style="" attributes, as
// [where, atom as written, rgb laid over `ground`]. Reads hex and rgb() / rgba() and resolves var() through
// the page's own tokens. A wash written as rgba() is laid over the ground first, because a 12 percent gold
// wash on white is a cream box even though the literal rgba(184,146,10,...) is a dark gold on its own.
function backgroundsOver(html, ground) {
  const style = ownStyle(html);
  const vars = customProps(style);
  const out = [];
  const bodies = [
    ...rules(style).map((r) => [r.selector, r.body]),
    ...[...html.matchAll(/\sstyle="([^"]*)"/g)].map((m) => [`style="${m[1].slice(0, 40)}"`, m[1]]),
  ];
  for (const [where, body] of bodies) {
    for (const prop of ['background', 'background-color']) {
      for (const value of decls(body, prop)) {
        for (const atom of value.match(ATOM) ?? []) {
          let rgba;
          try { rgba = parseColor(atom, vars); } catch { continue; }
          out.push([where, atom, over(rgba, ground)]);
        }
      }
    }
  }
  return out;
}

// A css length in pixels (px, rem and em at 16px); NaN for anything else.
function px(v) {
  const m = String(v).trim().match(/^(-?[\d.]+)(px|rem|em)?$/);
  return m ? Number(m[1]) * (m[2] === 'rem' || m[2] === 'em' ? 16 : 1) : NaN;
}

// ---- (i) the "US Senate" and "US House" labels --------------------------------------------------------
test('(i) the federal labels on the political-money page are white boxes with a thin deep-gold outline, no warm tint', () => {
  const html = read(MONEY_PAGE);
  const style = ownStyle(html);
  const vars = customProps(style);
  // No background on the page, laid over white, is a warm tint (the scan sees rgba() washes, not only hex).
  const warm = backgroundsOver(html, WHITE)
    .filter(([, , rgb]) => isCream(rgb))
    .map(([where, atom, rgb]) => `${where}: ${atom} lays down ${hexOf(rgb)} on white`);
  assert.deepEqual([...new Set(warm)], [], 'warm tinted backgrounds on the political-money page');
  // The label itself: a white box, a 1px solid outline in the deep gold, text at the gold floor on that
  // white (7:1 until lane hopgold1, 2026-10-09; 4.5:1 since, see the header).
  const tag = rules(style).find((r) => r.selector === '.tag-fed');
  assert.ok(tag, 'no .tag-fed rule');
  const ground = over(parseColor(decls(tag.body, 'background')[0], vars), WHITE);
  assert.equal(hexOf(ground), '#FFFFFF', `.tag-fed background is ${hexOf(ground)}, it has to be white`);
  const border = decls(tag.body, 'border')[0];
  assert.ok(border, '.tag-fed has no border, so a white box on a white page would have no edge');
  assert.match(border, /^1px\s+solid\s+/i, `.tag-fed border is "${border}", expected a thin 1px solid outline`);
  const edge = parseColor(border.match(ATOM).pop(), vars).slice(0, 3);
  assert.equal(hexOf(edge), hexOf(parseColor('var(--gold-deep)', globalVars)), `.tag-fed outline is ${hexOf(edge)}, expected the deep gold ${globalVars['gold-deep']}`);
  const text = parseColor(decls(tag.body, 'color')[0], vars).slice(0, 3);
  const c = contrast(text, ground);
  assert.ok(c >= GOLD_FLOOR, `.tag-fed text ${hexOf(text)} is ${c.toFixed(2)}:1 on its ground, needs ${GOLD_FLOOR}:1`);
  assert.ok(contrast(edge, ground) >= 3, '.tag-fed outline is under 3:1 against its ground');
});

// ---- (j) the dark page's two secondary grays ------------------------------------------------------------
// --tx2 (the thesis, the bar labels, the card descriptions, the "Sources:" label) and --mt (captions, source
// lines, the baseline row) are the page's two greys below its main text --tx. Each reaches 7:1 on both dark
// grounds, and they keep that order: main text brighter than --tx2, brighter than --mt. The second half of the
// test was added the same day, after lightening --mt alone made the captions brighter than the descriptions
// and the "Sources:" label that sit beside them (the order had flipped).
test('(j) the two secondary grays of the dark political-dollar page reach 7:1 on both dark grounds, keep their order and are cool neutrals', () => {
  const html = read(DARK_PAGE);
  const vars = customProps(ownStyle(html));
  for (const k of ['bg', 'sf', 'tx', 'tx2', 'mt']) assert.ok(vars[k], `the dark page has no --${k}`);
  const colour = (k) => parseColor(`var(--${k})`, vars).slice(0, 3);
  const failing = [];
  // --bg is the page ground; --sf is the ground of the stat box, the cards and the corrections box, which is
  // where the captions and source notes sit. Every use of --mt and --tx2 as text sits on one of the two.
  for (const k of ['tx2', 'mt']) {
    for (const g of ['bg', 'sf']) {
      const c = contrast(colour(k), colour(g));
      if (c < 7) failing.push(`--${k} ${hexOf(colour(k))} is ${c.toFixed(2)}:1 on --${g} ${vars[g]}`);
    }
  }
  assert.deepEqual(failing, [], 'dark page secondary grays under 7:1');
  // The order holds: main text, then --tx2, then --mt, each strictly brighter than the next.
  assert.ok(
    luminance(colour('tx')) > luminance(colour('tx2')) && luminance(colour('tx2')) > luminance(colour('mt')),
    `the order is broken: --tx ${vars.tx}, --tx2 ${vars.tx2}, --mt ${vars.mt} (each must be brighter than the next)`,
  );
  // Cool neutrals: low saturation, and a hue on the blue side, never the yellow-orange side of cream.
  for (const k of ['tx2', 'mt']) {
    const [h, s] = hsl(colour(k));
    assert.ok(s <= 20, `--${k} ${hexOf(colour(k))} is ${s.toFixed(0)} percent saturated, a neutral grey stays under 20`);
    assert.ok(!(h >= 20 && h <= 70 && s > 4), `--${k} ${hexOf(colour(k))} has a warm hue (${h.toFixed(0)} degrees)`);
  }
  // The old grey is not left behind as a text colour anywhere in the page.
  assert.ok(!/#6b7280/i.test(ownStyle(html).replace(/rgba\(107,114,128,[0-9.]+\)/g, '')), 'the old grey #6b7280 is still in the page stylesheet');
  // The baseline row ("CPI inflation (baseline)") is meant to fade back: its label and its value are no
  // brighter than the other rows' labels (--tx2) and still reach 4.5:1 on the page ground.
  const label = html.match(/<span class="bar-label" style="color:([^"]+)">CPI inflation \(baseline\)/);
  assert.ok(label, 'no baseline row label found');
  const val = rules(ownStyle(html)).find((r) => r.selector === '.bar-val.base-val');
  assert.ok(val, 'no .bar-val.base-val rule');
  for (const [what, atom] of [['label', label[1].trim()], ['value', decls(val.body, 'color')[0]]]) {
    const rgb = parseColor(atom, vars).slice(0, 3);
    assert.ok(luminance(rgb) <= luminance(colour('tx2')), `the baseline ${what} ${hexOf(rgb)} is brighter than the other rows' labels ${vars.tx2}`);
    const c = contrast(rgb, colour('bg'));
    assert.ok(c >= 4.5, `the baseline ${what} ${hexOf(rgb)} is ${c.toFixed(2)}:1 on the page ground, needs 4.5:1`);
  }
  // Its bar is --mt at a low opacity over the track, and stays the dimmest mark in the chart: no more than
  // 1.55:1 against the track. It was about 1.5:1 when --mt was #6b7280 at 0.35; lightening --mt to #a0a7b3 at
  // the same 0.35 made it about 2.0:1, so the opacity came down to 0.22 with it.
  const track = over(parseColor(decls(rules(ownStyle(html)).find((r) => r.selector === '.bar-track').body, 'background')[0], vars), colour('bg'));
  const fillRule = rules(ownStyle(html)).find((r) => r.selector === '.bar-fill.baseline');
  assert.ok(fillRule, 'no .bar-fill.baseline rule');
  const [fr, fg, fb] = parseColor(decls(fillRule.body, 'background')[0], vars);
  const alpha = Number(decls(fillRule.body, 'opacity')[0]);
  const bar = over([fr, fg, fb, alpha], track);
  const cb = contrast(bar, track);
  assert.ok(cb <= 1.55, `the baseline bar ${hexOf(bar)} is ${cb.toFixed(2)}:1 against its track ${hexOf(track)}; it must stay under 1.55:1 so the row fades back`);
});

// ---- (k) the political-money page headline clears the Hoplight bar -------------------------------------
test('(k) the headline of the political-money page has a gap above it, on the page\'s own stylesheet', () => {
  const style = ownStyle(read(MONEY_PAGE));
  const h1 = rules(style).find((r) => r.selector === 'h1');
  assert.ok(h1, 'no h1 rule on the page');
  const gaps = [];
  for (const p of ['margin', 'padding']) {
    for (const v of decls(h1.body, `${p}-top`)) gaps.push(px(v));
    for (const v of decls(h1.body, p)) gaps.push(px(v.split(/\s+/)[0]));
  }
  const top = Math.max(0, ...gaps.filter((n) => !Number.isNaN(n)));
  assert.ok(top > 0, 'the h1 has no top margin or padding, so it sits against the Hoplight bar above it');
  // About a line: the headline is 26px on a 1.2 line, so a gap between half a line and two lines.
  assert.ok(top >= 16 && top <= 64, `the h1 top gap is ${top}px, expected roughly one line (16 to 64px)`);
});

// =====================================================================================================
// LANE hopgold1, 2026-10-09: the gold becomes option C, #996D00. Each test below was written first and seen
// red on 9251acb (see the lane's done-file for the observed failures).
// =====================================================================================================

// The gold family: the yellow-orange hues the brand golds and the ambers sit in, saturated, neither
// near-white nor near-black. #D4950A, #E8A820, #785010, #996D00, #92600A, #F59E0B and #D97706 are in it;
// the brown-orange #B45309 (26 degrees) and the DNC page's data orange #D35400 (24 degrees) are not.
function isGold(rgb) {
  const [h, s, l] = hsl(rgb);
  return h >= 30 && h <= 55 && s >= 50 && l >= 15 && l <= 75;
}

// A warm tint: a near-white carrying any saturation on the red-to-yellow side of the wheel. Wider than
// isCream (20 to 70 degrees) on purpose: a pink wash behind a table row is as warm a ground as a cream one.
function isWarmTint(rgb) {
  const [h, s, l] = hsl(rgb);
  return l >= 85 && l < 100 && s > 4 && (h <= 70 || h >= 330);
}

// Every <style> block of a static page, as one stylesheet (the page's own, then the Hoplight bar's).
const pageStyles = (html) => [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');

// Custom properties, FIRST declaration wins: on a page with a dark theme in a media query, the light theme
// is the one written first, and the light theme is the one a reader on a white page sees.
function firstProps(text) {
  const out = {};
  for (const m of stripComments(text).matchAll(/--([a-z0-9-]+)\s*:\s*([^;}\n]+)/gi)) {
    if (!(m[1] in out)) out[m[1]] = m[2].trim();
  }
  return out;
}

// The ground a declaration block paints for itself, laid over `under`, or null if it paints none.
function ownGround(body, vars, under) {
  for (const prop of ['background', 'background-color']) {
    for (const v of decls(body, prop)) {
      const atom = (v.match(ATOM) ?? [])[0];
      if (!atom) continue;
      try { return over(parseColor(atom, vars), under); } catch { /* not a colour */ }
    }
  }
  return null;
}

// Every text colour a static page declares, in its <style> blocks and in inline style="" attributes. The
// ground of each is the block's own background if it paints one; else the ground of a dark section the
// selector sits inside (a one-class rule such as `.hero { background: var(--ink) }` makes `.hero .btn` a
// rule on navy); else the navy of the Hoplight bar for the bar's own rules; else the page ground.
function textColours(html) {
  const css = pageStyles(html);
  const vars = firstProps(css);
  const all = rules(css).filter((r) => !r.selector.startsWith('@'));
  const bodyRule = all.find((r) => r.selector.split(',').map((s) => s.trim()).includes('body') && ownGround(r.body, vars, WHITE));
  const page = bodyRule ? ownGround(bodyRule.body, vars, WHITE) : WHITE;
  const darkSections = all.flatMap((r) => {
    const g = ownGround(r.body, vars, page);
    if (!g || isLight(g)) return [];
    return r.selector.split(',').map((s) => s.trim()).filter((s) => /^\.[\w-]+$/.test(s))
      .map((s) => [new RegExp(`\\${s}(?![\\w-])`, 'g'), g]);
  });
  // The nearest dark section among a selector's ancestors (its last compound, the element itself, is cut).
  const sectionOf = (selector) => {
    let best = null;
    for (const part of selector.split(',')) {
      const ancestors = part.trim().replace(/\s*[^\s>+~]+$/, '');
      for (const [re, g] of darkSections) {
        for (const m of ancestors.matchAll(re)) if (!best || m.index >= best[0]) best = [m.index, g];
      }
    }
    return best && best[1];
  };
  const bodies = [
    ...all.map((r) => [r.selector, r.body]),
    ...[...html.matchAll(/\sstyle="([^"]*)"/g)].map((m) => [`style="${m[1].slice(0, 48)}"`, m[1]]),
  ];
  const out = [];
  for (const [where, body] of bodies) {
    for (const v of decls(body, 'color')) {
      const atom = (v.match(ATOM) ?? [])[0];
      if (!atom) continue;
      let rgba;
      try { rgba = parseColor(atom, vars); } catch { continue; }
      const section = where.startsWith('style="') ? null : sectionOf(where);
      const base = section ?? (/\.hoplight-phdr/.test(where) ? NAVY_GROUND : page);
      const ground = ownGround(body, vars, base) ?? base;
      out.push({ where, atom, rgb: over(rgba, ground), ground });
    }
  }
  return { page, out };
}

const isLight = (rgb) => luminance(rgb) > 0.4;
const STORY_PAGE = 'public/portfolio/hoplight-persuasion-story-page.html';
const AGENCY_PAGE = 'public/portfolio/federal-agency-ai-inventory.html';
const PME_STATIC = 'public/pme-lever.html';

// ---- (l) --gold-deep is option C everywhere -----------------------------------------------------------
test('(l) --gold-deep is option C, #996D00, in every file that defines it', () => {
  const files = [
    ...walkFiles('src', new Set(['.ts', '.tsx', '.css'])),
    ...walkFiles('public', new Set(['.html', '.css', '.json', '.svg'])),
  ];
  const DEF = /--gold-deep\s*:\s*(#[0-9a-fA-F]{6})|goldDeep\s*:\s*'(#[0-9a-fA-F]{6})'|"gold-deep"\s*:\s*\{\s*"value"\s*:\s*"(#[0-9a-fA-F]{6})"/g;
  const wrong = [];
  let seen = 0;
  for (const f of files) {
    for (const m of read(f).matchAll(DEF)) {
      seen += 1;
      const hex = (m[1] ?? m[2] ?? m[3]).toUpperCase();
      if (hex !== GOLD_C) wrong.push(`${f}: ${hex}`);
    }
  }
  assert.ok(seen >= 9, `expected at least 9 definitions of the deep gold, found ${seen}`);
  assert.deepEqual(wrong, [], `definitions of the deep gold that are not ${GOLD_C}`);
  const c = contrast(hexToRgb(GOLD_C), WHITE);
  assert.ok(c >= GOLD_FLOOR, `${GOLD_C} is ${c.toFixed(2)}:1 on white, needs ${GOLD_FLOOR}:1`);
});

test('(l) the 7.1:1 deep gold #785010 is gone from the source and the served files', () => {
  const files = [
    ...walkFiles('src', new Set(['.ts', '.tsx', '.css'])),
    ...walkFiles('public', new Set(['.html', '.css', '.json', '.svg', '.js'])),
  ];
  const left = files.filter((f) => /#785010/i.test(read(f)));
  assert.deepEqual(left, [], 'files that still carry #785010');
});

// ---- (m) no gold used as text on a light ground measures under 4.5:1 ------------------------------------
// The stylesheet's selectors that sit on a navy section by construction. Gold text inside them is held on
// that navy by test (n); every other gold text colour in the stylesheet sits on the white page.
const DARK_SCOPES = [
  /\.slate\b/, /\.hero(?![\w-])/, /\.ident\b/, /\.close-cta\b/, /(^|[\s>])header\b/, /\.ch-col\.good\b/,
  /\.choice-col\b/, /\.map-stat\b/, /\.mcard\b/, /\.mbar-ai\b/, /\.mdiff/, /\.mirror-bottom\b/,
  /\.proof-lead\b/, /\.rct-/, /\.rstat-/,
];
const onDark = (selector) => selector.split(',').every((part) => DARK_SCOPES.some((re) => re.test(part)));

function stylesheetGoldText() {
  const out = [];
  for (const r of rules(src.globals)) {
    for (const v of decls(r.body, 'color')) {
      const atom = (v.match(ATOM) ?? [])[0];
      if (!atom) continue;
      let rgb;
      try { rgb = parseColor(atom, globalVars).slice(0, 3); } catch { continue; }
      if (isGold(rgb)) out.push({ selector: r.selector, atom, rgb, dark: onDark(r.selector) });
    }
  }
  return out;
}

test('(m) no gold used as text on white in the stylesheet measures under 4.5:1 (the "95%" and the card-link hover included)', () => {
  const light = stylesheetGoldText().filter((r) => !r.dark);
  assert.ok(light.length >= 10, `expected at least 10 gold text rules on the white page, found ${light.length}`);
  const failing = light
    .map((r) => [r, contrast(r.rgb, WHITE)])
    .filter(([, c]) => c < GOLD_FLOOR)
    .map(([r, c]) => `${r.selector} { color: ${r.atom} } is ${hexOf(r.rgb)} at ${c.toFixed(2)}:1`);
  assert.deepEqual(failing, [], `gold text under ${GOLD_FLOOR}:1 on white in globals.css`);
});

// The persuasion page and its static copy carry their own stylesheet. The rendered sweep of 2026-10-09
// found gold text on its white sections in four places: the "HOPLIGHT" eyebrow, the gold line of the
// headline, and the two gold phrases "millions" and "high fidelity at scale". Each is looked up from its
// most specific selector to its least; the first rule that sets a colour is the colour a reader sees.
const PME_SOURCES = [
  ['src/app/(main)/persuasion/PmeContent.tsx', () => src.pme.match(/const pmeCSS = `([\s\S]*?)`;/)[1]],
  [PME_STATIC, () => pageStyles(read(PME_STATIC))],
];
const PME_LIGHT = [
  ['the "HOPLIGHT" eyebrow', ['.hero .eyebrow', '.eyebrow']],
  ['the gold line of the headline', ['.hero h1 .gold-line']],
  ['"millions" and "high fidelity at scale"', ['.bg-paper strong.gold', 'strong.gold']],
];
function pmeColour(css, vars, selectors) {
  const all = rules(css);
  for (const want of selectors) {
    let found = null;
    for (const r of all) {
      const parts = r.selector.split(',').map((s) => s.trim().replace(/^\.pme-page\s+/, ''));
      if (!parts.includes(want)) continue;
      const c = decls(r.body, 'color');
      if (c.length) found = c[c.length - 1];
    }
    if (found) return { selector: want, value: found, rgb: parseColor(found, vars).slice(0, 3) };
  }
  return null;
}

test('(m) no gold used as text on the persuasion page\'s white sections measures under 4.5:1 (both copies)', () => {
  const failing = [];
  for (const [file, cssOf] of PME_SOURCES) {
    const css = cssOf();
    const vars = customProps(css);
    for (const [what, selectors] of PME_LIGHT) {
      const hit = pmeColour(css, vars, selectors);
      assert.ok(hit, `${file}: no colour found for ${what}`);
      const c = contrast(hit.rgb, WHITE);
      if (c < GOLD_FLOOR) failing.push(`${file}: ${what} (${hit.selector} { color: ${hit.value} }) is ${hexOf(hit.rgb)} at ${c.toFixed(2)}:1`);
    }
  }
  assert.deepEqual(failing, [], `gold text under ${GOLD_FLOOR}:1 on the persuasion page's white sections`);
});

// The Which AI tool keeps its status colours in two objects; parse each into { level: { key: colour } }.
function statusColours(name) {
  const block = src.whichai.match(new RegExp(`const ${name}[^=]*=\\s*\\{([\\s\\S]*?)\\n\\};`));
  assert.ok(block, `no ${name} in WhichAiTool.tsx`);
  const C = whichAiTokens();
  const val = (v) => (v.startsWith('C.') ? C[v.slice(2)] : v.slice(1, -1));
  const out = {};
  for (const [, level, body] of block[1].matchAll(/(\w+):\s*\{([^}]*)\}/g)) {
    out[level] = Object.fromEntries([...body.matchAll(/(\w+):\s*('[^']*'|C\.\w+)/g)].map(([, k, v]) => [k, val(v)]));
  }
  return out;
}

test('(m) no gold used as text in the Which AI tool measures under 4.5:1 on its ground', () => {
  const C = whichAiTokens();
  const failing = [];
  const deep = contrast(parseColor(C.goldDeep, {}).slice(0, 3), WHITE);
  if (deep < GOLD_FLOOR) failing.push(`C.goldDeep ${C.goldDeep} is ${deep.toFixed(2)}:1 on white`);
  for (const name of ['pillColors', 'securityColors']) {
    for (const [level, s] of Object.entries(statusColours(name))) {
      const ground = over(parseColor(s.bg, {}), WHITE);
      for (const k of ['text', 'heading']) {
        if (!s[k]) continue;
        const rgb = parseColor(s[k], {}).slice(0, 3);
        if (!isGold(rgb)) continue;
        const c = contrast(rgb, ground);
        if (c < GOLD_FLOOR) failing.push(`${name}.${level}.${k} ${s[k]} is ${c.toFixed(2)}:1 on ${hexOf(ground)}`);
      }
    }
  }
  assert.deepEqual(failing, [], `gold text under ${GOLD_FLOOR}:1 in WhichAiTool.tsx`);
});

test('(m) no gold used as text on a white static page measures under 4.5:1', () => {
  // The static persuasion page mixes white and navy sections; the test above holds its white ones.
  const files = walkFiles('public', new Set(['.html'])).filter((f) => f !== PME_STATIC);
  const failing = [];
  let pages = 0;
  for (const f of files) {
    const { page, out } = textColours(read(f));
    if (!isLight(page)) continue; // dark pages: test (n)
    pages += 1;
    for (const t of out) {
      if (!isGold(t.rgb)) continue;
      const c = contrast(t.rgb, t.ground);
      if (c < GOLD_FLOOR) failing.push(`${f}: ${t.where} color ${t.atom} is ${hexOf(t.rgb)} at ${c.toFixed(2)}:1 on ${hexOf(t.ground)}`);
    }
  }
  assert.ok(pages >= 10, `expected at least 10 white static pages, found ${pages}`);
  assert.deepEqual([...new Set(failing)], [], `gold text under ${GOLD_FLOOR}:1 on white static pages`);
});

// ---- (n) gold on navy and the other dark grounds reaches 4.5:1 ------------------------------------------
test('(n) gold on navy reaches 4.5:1: the story page and every other dark static page', () => {
  const files = walkFiles('public', new Set(['.html'])).filter((f) => f !== PME_STATIC);
  const failing = [];
  const dark = [];
  for (const f of files) {
    const { page, out } = textColours(read(f));
    if (isLight(page)) continue;
    dark.push(f);
    for (const t of out) {
      if (!isGold(t.rgb)) continue;
      const c = contrast(t.rgb, t.ground);
      if (c < GOLD_FLOOR) failing.push(`${f}: ${t.where} color ${t.atom} is ${hexOf(t.rgb)} at ${c.toFixed(2)}:1 on ${hexOf(t.ground)}`);
    }
  }
  assert.ok(dark.includes(STORY_PAGE), `the story page is not read as a navy page (dark pages: ${dark.join(', ')})`);
  assert.deepEqual([...new Set(failing)], [], `gold text under ${GOLD_FLOOR}:1 on a dark page`);
});

test('(n) gold on the navy sections of the stylesheet and the persuasion page reaches 4.5:1', () => {
  const failing = [];
  const navy = parseColor('var(--ink)', globalVars).slice(0, 3);
  for (const r of stylesheetGoldText().filter((x) => x.dark)) {
    const c = contrast(r.rgb, navy);
    if (c < GOLD_FLOOR) failing.push(`globals.css ${r.selector} is ${hexOf(r.rgb)} at ${c.toFixed(2)}:1 on the navy`);
  }
  for (const [file, cssOf] of PME_SOURCES) {
    const css = cssOf();
    const vars = customProps(css);
    const ground = parseColor('var(--dark)', vars).slice(0, 3);
    // The bright gold is for the dark sections only; wherever it is the text colour, it sits on --dark.
    const bright = parseColor('var(--gold)', vars).slice(0, 3);
    const c = contrast(bright, ground);
    if (c < GOLD_FLOOR) failing.push(`${file}: --gold is ${c.toFixed(2)}:1 on --dark`);
  }
  assert.deepEqual(failing, [], `gold under ${GOLD_FLOOR}:1 on a navy section`);
});

// ---- (o) no chip or table row uses a warm tint ground --------------------------------------------------
test('(o) the Which AI exposure chips are white boxes with a thin outline, the gold one in C, no warm tint', () => {
  const pills = statusColours('pillColors');
  assert.deepEqual(Object.keys(pills).sort(), ['green', 'red', 'yellow'], 'expected the three exposure levels');
  const failing = [];
  for (const [level, p] of Object.entries(pills)) {
    const ground = over(parseColor(p.bg, {}), WHITE);
    if (isWarmTint(ground) || isCream(ground)) failing.push(`${level}: background ${p.bg} lays down a warm tint ${hexOf(ground)} on white`);
    else if (hexOf(ground) !== '#FFFFFF') failing.push(`${level}: background ${p.bg} lays down ${hexOf(ground)}, not a white box`);
    const edge = parseColor(p.border, {});
    if (edge[3] < 1) failing.push(`${level}: outline ${p.border} is a wash, not a solid line`);
    else if (contrast(edge.slice(0, 3), ground) < 3) failing.push(`${level}: outline ${p.border} is under 3:1 against its ground`);
    const text = over(parseColor(p.text, {}), ground);
    const c = contrast(text, ground);
    if (c < GOLD_FLOOR) failing.push(`${level}: text ${p.text} is ${c.toFixed(2)}:1 on ${hexOf(ground)}`);
  }
  assert.deepEqual(failing, [], 'exposure chips that are not white boxes with a firm outline');
  // The gold chip matches the "US Senate" label on the political-money page: C outline, C text.
  assert.equal(hexOf(parseColor(pills.yellow.text, {})), GOLD_C, `the gold chip text is ${pills.yellow.text}, expected ${GOLD_C}`);
  assert.equal(hexOf(parseColor(pills.yellow.border, {})), GOLD_C, `the gold chip outline is ${pills.yellow.border}, expected ${GOLD_C}`);
  assert.match(src.whichai, /border:\s*`1px solid \$\{pillColors\[cell\.level\]\.border\}`/, 'the chip outline is no longer one thin 1px line');
});

test('(o) no table row on the political-money page lays a warm or dimming tint under the gold figures', () => {
  const html = read(MONEY_PAGE);
  const vars = customProps(ownStyle(html));
  const ac = parseColor('var(--ac)', vars).slice(0, 3);
  const rows = [...html.matchAll(/<tr(?:\s+style="([^"]*)")?\s*>/g)].map((m) => m[1] ?? '');
  assert.ok(rows.length >= 6, `expected the head row and the five midterm rows, found ${rows.length}`);
  const failing = [];
  for (const style of rows) {
    const ground = ownGround(style, vars, WHITE) ?? WHITE;
    if (isWarmTint(ground) || isCream(ground)) failing.push(`row style="${style}" lays down a warm tint ${hexOf(ground)}`);
    for (const [name, gold] of [['--ac', ac], ['option C', hexToRgb(GOLD_C)]]) {
      const c = contrast(gold, ground);
      if (c < GOLD_FLOOR) failing.push(`row style="${style}": ${name} ${hexOf(gold)} is ${c.toFixed(2)}:1 on ${hexOf(ground)}`);
    }
  }
  assert.deepEqual([...new Set(failing)], [], 'table rows that tint the ground under the gold');
});

// ---- (p) the agency inventory's "Uncertain" ------------------------------------------------------------
test('(p) the agency inventory\'s "Uncertain" reaches 4.5:1 on white and on the row hover', () => {
  const html = read(AGENCY_PAGE);
  const css = pageStyles(html);
  const vars = firstProps(css);
  assert.ok((html.match(/class="status-uncertain"/g) ?? []).length >= 10, 'expected the "Uncertain" cells');
  const r = rules(css).find((x) => x.selector === '.status-uncertain');
  assert.ok(r, 'no .status-uncertain rule');
  const colour = parseColor(decls(r.body, 'color')[0], vars).slice(0, 3);
  const hover = rules(css).find((x) => x.selector === 'tr:hover');
  const grounds = [['white', WHITE]];
  if (hover && ownGround(hover.body, vars, WHITE)) grounds.push(['the row hover', ownGround(hover.body, vars, WHITE)]);
  const failing = [];
  for (const [name, g] of grounds) {
    const c = contrast(colour, g);
    if (c < GOLD_FLOOR) failing.push(`"Uncertain" ${hexOf(colour)} is ${c.toFixed(2)}:1 on ${name} ${hexOf(g)}`);
  }
  assert.deepEqual(failing, [], `"Uncertain" under ${GOLD_FLOOR}:1`);
  // The 3.19:1 amber is not left behind as a text colour anywhere on the page.
  assert.ok(!/(?:^|[;{\s])color\s*:\s*#d97706/im.test(css), 'the page still writes text in the 3.19:1 amber #D97706');
});

// ---- (q) fonts are self-hosted --------------------------------------------------------------------------
// The site's content security policy (next.config.ts: style-src 'self', font-src 'self' data:) refuses
// Google's stylesheet and font files, so a page that links them draws in a fallback face. The one file left
// out is the link-preview image route: it fetches Inter on the server to draw a PNG, which no browser loads.
const GOOGLE_FONTS = /fonts\.googleapis\.com|fonts\.gstatic\.com/;
const SELF_HOSTED = ['barlow-semi-condensed', 'dm-sans', 'dm-mono', 'inter', 'jetbrains-mono', 'archivo'];

test('(q) no served page loads a font from fonts.googleapis.com or fonts.gstatic.com', () => {
  const ogRoute = join('src', 'app', 'api', 'og', 'route.tsx');
  const files = [
    ...walkFiles('public', new Set(['.html', '.css', '.js', '.svg', '.json'])),
    ...walkFiles('src', new Set(['.ts', '.tsx', '.css'])).filter((f) => f !== ogRoute),
    'scripts/build-brand-tokens.mjs', // writes public/hoplight-brand-tokens-2026-09-20.html
  ];
  const offenders = files.filter((f) => GOOGLE_FONTS.test(read(f)));
  assert.deepEqual(offenders, [], 'files that load Google fonts, which the content security policy blocks');
});

test('(q) every face a static page declares is on disk under public/fonts, with its licence beside it', () => {
  const failing = [];
  let faces = 0;
  for (const f of walkFiles('public', new Set(['.html', '.css']))) {
    const css = f.endsWith('.css') ? read(f) : pageStyles(read(f));
    for (const r of rules(css).filter((x) => x.selector === '@font-face')) {
      faces += 1;
      for (const m of r.body.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
        const url = m[1];
        if (!url.startsWith('/fonts/')) { failing.push(`${f}: ${url} is not under /fonts/`); continue; }
        try { statSync(join(ROOT, 'public', url)); } catch { failing.push(`${f}: ${url} is not on disk`); }
      }
    }
  }
  for (const family of SELF_HOSTED) {
    try { statSync(join(ROOT, 'public', 'fonts', `OFL-${family}.txt`)); } catch { failing.push(`public/fonts/OFL-${family}.txt is missing`); }
  }
  assert.ok(faces >= 12, `expected at least 12 @font-face rules across the static pages, found ${faces}`);
  assert.deepEqual(failing, [], 'faces that are not self-hosted or have no licence');
});

test('(q) the political-money page draws its headline, body and figures in its own faces, from /fonts', () => {
  const style = ownStyle(read(MONEY_PAGE));
  const vars = customProps(style);
  const family = (stack) => stack.split(',')[0].replace(/['"]/g, '').trim();
  const faces = rules(style).filter((r) => r.selector === '@font-face').map((r) => {
    const w = (decls(r.body, 'font-weight')[0] ?? '400').split(/\s+/).map(Number);
    return {
      family: family(decls(r.body, 'font-family')[0] ?? ''),
      lo: w[0],
      hi: w[1] ?? w[0],
      src: (r.body.match(/url\(\s*['"]?([^'")]+)/) ?? [])[1] ?? '',
    };
  });
  const need = [[family(vars.headline), 900], [family(vars.sans), 400], [family(vars.sans), 700], [family(vars.mono), 500]];
  assert.deepEqual(need.map(([f]) => f), ['Barlow Semi Condensed', 'DM Sans', 'DM Sans', 'DM Mono'], 'the page no longer names the faces it was designed in');
  const missing = need
    .filter(([f, w]) => !faces.some((x) => x.family === f && x.src.startsWith('/fonts/') && w >= x.lo && w <= x.hi))
    .map(([f, w]) => `${f} ${w}`);
  assert.deepEqual(missing, [], 'faces the political-money page names but does not self-host');
});

// =====================================================================================================
// LANE hopgold1, the two findings it filed, ruled in scope by the dispatcher the same day. Each test below
// was written first and seen red on 69a40bd (see the lane's done-file for the observed failures).
// =====================================================================================================

const DNC_PAGE = 'public/portfolio/dnc-autopsy-taken-apart.html';

// The DNC page's two families of category badge, the quote tags (.quote-tag and .quote-tag.<category>)
// and the loss-type badges (.loss-type-badge and .type-<kind>). Each category is read on top of its
// family's base rule, as the browser cascades it, in the light theme (the page's :root) and in the dark
// theme (its [data-theme="dark"] block over the same names).
function dncChips() {
  const css = pageStyles(read(DNC_PAGE));
  const all = rules(css);
  const light = firstProps(css);
  const darkRule = all.find((r) => r.selector === '[data-theme="dark"]');
  assert.ok(darkRule, 'no dark theme block on the DNC page');
  const dark = { ...light, ...customProps(darkRule.body) };
  const chips = [];
  for (const [baseSel, member] of [['.quote-tag', /^\.quote-tag(\.[\w-]+)?$/], ['.loss-type-badge', /^\.type-[\w-]+$/]]) {
    const base = all.find((r) => r.selector === baseSel);
    assert.ok(base, `no ${baseSel} rule on the DNC page`);
    for (const r of all.filter((x) => member.test(x.selector))) {
      const pick = (prop) => decls(r.body, prop).pop() ?? decls(base.body, prop).pop();
      chips.push({ selector: r.selector, background: pick('background'), color: pick('color'), border: pick('border') });
    }
  }
  return { chips, light, dark };
}

// ---- (r) the DNC page's category badges ---------------------------------------------------------------
test('(r) the DNC page\'s category badges are white outlined chips, with text at 4.5:1 in both of its themes', () => {
  const { chips, light, dark } = dncChips();
  assert.ok(chips.length >= 9, `expected the quote tags and the loss-type badges, found ${chips.length} chip rules`);
  const failing = [];
  for (const [theme, vars] of [['light', light], ['dark', dark]]) {
    const page = parseColor('var(--bg)', vars).slice(0, 3);
    for (const c of chips) {
      const bgAtom = (c.background?.match(ATOM) ?? [])[0];
      const ground = bgAtom ? over(parseColor(bgAtom, vars), page) : page;
      if (theme === 'light') {
        if (isWarmTint(ground) || isCream(ground)) failing.push(`${c.selector}: background ${c.background} lays down a warm tint ${hexOf(ground)}`);
        else if (hexOf(ground) !== '#FFFFFF') failing.push(`${c.selector}: background ${c.background} lays down ${hexOf(ground)}, not a white chip`);
      }
      const textAtom = (c.color?.match(ATOM) ?? [])[0];
      assert.ok(textAtom, `${c.selector} has no text colour`);
      const text = over(parseColor(textAtom, vars), ground);
      const ct = contrast(text, ground);
      if (ct < GOLD_FLOOR) failing.push(`${theme}: ${c.selector} text ${c.color} is ${hexOf(text)} at ${ct.toFixed(2)}:1 on ${hexOf(ground)}`);
      if (!c.border || !/^1px\s+solid\s+/i.test(c.border)) {
        if (theme === 'light') failing.push(`${c.selector}: no thin outline (border: ${c.border ?? 'none'}), so a white chip has no edge`);
        continue;
      }
      const edgeAtom = /currentcolor/i.test(c.border) ? textAtom : (c.border.match(ATOM) ?? []).pop();
      const edge = over(parseColor(edgeAtom, vars), ground);
      const ce = contrast(edge, ground);
      if (ce < 3) failing.push(`${theme}: ${c.selector} outline is ${ce.toFixed(2)}:1 against its chip, needs 3:1`);
    }
  }
  assert.deepEqual([...new Set(failing)], [], 'DNC badges that are tinted, faint or edgeless');
  // The "strategy" and "candidate" badges stay orange, not brown: a deeper orange, still saturated.
  for (const sel of ['.quote-tag.strategy', '.type-candidate']) {
    const c = chips.find((x) => x.selector === sel);
    assert.ok(c, `no ${sel} rule on the DNC page`);
    const rgb = parseColor((c.color.match(ATOM) ?? [])[0], light).slice(0, 3);
    const [h, s, l] = hsl(rgb);
    assert.ok(h >= 15 && h <= 35 && s >= 70 && l >= 30, `${sel} ${hexOf(rgb)} no longer reads as orange (hue ${h.toFixed(0)}, saturation ${s.toFixed(0)}, lightness ${l.toFixed(0)})`);
  }
});

// ---- (s) the political-money page's "Citizens United" label ---------------------------------------------
// The label is pinned to the top of its own narrow column between the 2008 and 2012 bars. The chart lines
// its columns up at the bottom (align-items: end) and the column holds nothing with a height of its own,
// so unless the column stretches to the chart's full height its top IS the chart's bottom edge, and the
// label runs down out of the chart, past the year labels and through the note paragraph under it.
test('(s) the political-money page\'s "Citizens United" label hangs inside the chart, not over the note below it', () => {
  const html = read(MONEY_PAGE);
  const style = ownStyle(html);
  const all = rules(style);
  const grid = all.find((r) => r.selector === '.bar-grid');
  const col = all.find((r) => r.selector === '.cu-col');
  const text = all.find((r) => r.selector === '.cu-text');
  assert.ok(grid && col && text, 'the chart, its Citizens United column or its label rule is missing');
  const gridAlign = decls(grid.body, 'align-items').pop();
  const selfAlign = decls(col.body, 'align-self').pop();
  const colHeight = decls(col.body, 'height').pop();
  const fills = selfAlign === 'stretch' || colHeight === '100%' || (!selfAlign && gridAlign === 'stretch');
  assert.ok(fills, `the Citizens United column does not fill the chart's height (chart align-items: ${gridAlign ?? 'unset'}, column align-self: ${selfAlign ?? 'unset'}, height: ${colHeight ?? 'unset'}), so its label starts at the chart's bottom edge and runs into the note`);
  assert.match(decls(text.body, 'top').pop() ?? '', /^-?\d+(\.\d+)?px$/, 'the label is no longer pinned to the top of its column');
  // It fits: the label (a monospace advance is about 0.6em, plus its letter-spacing) is shorter than the
  // chart's tallest bar, which the chart is at least as tall as (test (t)).
  const label = html.match(/<span class="cu-text">([^<]*)<\/span>/);
  assert.ok(label, 'no Citizens United label in the markup');
  const length = label[1].length * (0.6 * px(decls(text.body, 'font-size').pop()) + (px(decls(text.body, 'letter-spacing').pop() ?? '0') || 0));
  const bars = [...html.matchAll(/class="bg-stack" style="height:(\d+)px/g)].map((m) => Number(m[1]));
  assert.ok(bars.length >= 7, `expected the seven federal bars, found ${bars.length}`);
  assert.ok(length < Math.max(...bars), `the label is about ${length.toFixed(0)}px long, longer than the chart's tallest bar ${Math.max(...bars)}px`);
});

// ---- (t) the political-money page's first chart holds its own bars --------------------------------------
// Found while proving (s) at phone width, 2026-10-09. The bars are drawn at fixed heights (up to 260px) with
// a total label above each, so the tallest column is about 278px; the chart box was fixed at 260px (200px on
// a phone). The grid row grew to fit the column and spilled out of the box at the bottom: the bars covered
// the year labels by about 13px at 1440 wide (the box overflowed by 18px), and on a phone ran 25px into the
// note paragraph under the chart.
test('(t) the political-money page\'s first chart is never shorter than its tallest column, so the bars stay above the year labels', () => {
  const html = read(MONEY_PAGE);
  const style = ownStyle(html);
  const bars = [...html.matchAll(/class="bg-stack" style="height:(\d+)px/g)].map((m) => Number(m[1]));
  assert.ok(bars.length >= 7, `expected the seven federal bars, found ${bars.length}`);
  const total = rules(style).find((r) => r.selector === '.bg-total');
  assert.ok(total, 'no .bg-total rule (the figure above each bar)');
  // The figure above the bar: its font size on the page's 1.5 line, plus its bottom margin.
  const labelHeight = 1.5 * px(decls(total.body, 'font-size').pop()) + (px(decls(total.body, 'margin-bottom').pop() ?? '0') || 0);
  const tallest = Math.max(...bars) + labelHeight;
  // Every fixed height the chart box is given, at any width, must hold the tallest column.
  const fixed = [];
  for (const r of rules(style).filter((x) => x.selector === '.bar-grid')) {
    for (const v of decls(r.body, 'height')) fixed.push(px(v));
  }
  const short = fixed.filter((h) => !Number.isNaN(h) && h < tallest);
  assert.deepEqual(short, [], `the chart box is fixed at ${short.join(' and ')}px, shorter than its tallest column (about ${tallest.toFixed(0)}px), so the bars spill out of it over the year labels and the note`);
});
