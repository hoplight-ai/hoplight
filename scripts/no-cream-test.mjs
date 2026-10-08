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
// ADDED 2026-10-08 (lane hopfix1, Whit's "4 yes" on the four findings of hopwhite1). The first lane could
// not reach the files that carry their own palettes, so this lane pins them too:
//   (a) src/app/(main)/tools/which-ai/WhichAiTool.tsx (white cards and callouts with borders, tokens that
//       match the stylesheet) and src/app/manifest.ts (the phone splash colour is the page's white);
//   (b) every static page, mockup, svg and token file under public/ (no cream colour literal at all);
//   (c) the contact page's two choice buttons (title and description on separate lines);
//   (d) the deep gold used for small gold text reaches 7:1 on white, in every file that defines it.
//
// STILL NOT COVERED: the status tints in the Which AI tool's exposure table (red, yellow and green cells are
// data, not a ground), cream-tinted text and rules on navy inside src/app/(main)/services/page.tsx and
// src/app/api/og/route.tsx (named in the lane's done-file), and every image file (the portfolio thumbnails
// show other products' screens).
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
// for small labels and links. Held to AA (4.5:1) by the first lane, raised to the same 7:1 as the other
// small text by lane hopfix1, 2026-10-08.
const BODY_TEXT = [['ink', 12], ['ink-soft', 7]];
const SECONDARY_TEXT = [['stone-deep', 7], ['stone', 7]];

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
    assert.ok(accent >= 7, `${name}: --gold-deep is ${accent.toFixed(2)}:1 on the page, needs 7:1`);
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

// ---- (d) the deep gold reaches 7:1 on white everywhere it is defined ------------------------------
test('(d) every definition of the deep gold clears 7:1 on white', () => {
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
      if (c < 7) failing.push(`${f}: ${hex} is ${c.toFixed(2)}:1`);
    }
  }
  assert.ok(seen >= 8, `expected at least 8 definitions of the deep gold, found ${seen}`);
  assert.deepEqual(failing, [], 'deep gold under 7:1 on white');
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
