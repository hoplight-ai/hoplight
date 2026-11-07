#!/usr/bin/env node
// The go-public checklist for one tool. Whit, 2026-11-07: "before i share them i want a way for users
// to give me feedback and for user actions to be logged anonymized" and "any linked thing should have a
// preview image and tile like it would if i sent it by text". A tool's `cleared` flag in
// src/data/tools.ts flips to true only after this passes; the portfolio never shows an uncleared tool.
//
// Run: npm run launch:check -- <slug> [--base <url>]
//   --base points the check at a preview deploy or a local server instead of https://hoplight.ai. For a
//   tool hosted elsewhere, its own address is used for the page and --base only for the card.
//
// One PASS or FAIL line per step, exit 1 on any FAIL:
//   (g) the tool has an entry in src/data/tools.ts
//   (a) the page answers 200 with no sign-in on the way
//   (b) its og:image is a 1200 by 630 PNG
//   (c) the page carries the feedback box (data-hoplight-feedback), or the kit script for an outside tool
//   (d) the page or its scripts call the signal route (/api/signal) or the kit (hoplightSignal)
//   (e) a security report exists at docs/security/<slug>-*.md with a line "STATUS: PASS"
//   (f) a tool that spends money on a model call has a rate limiter on every route that makes the call
// Tested with fixtures in scripts/launch-check.test.mjs.

import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Tools whose use calls a paid model, and the route files that make the call. */
export const PAID_MODEL_ROUTES = {
  'revenge-or-justice': ['src/app/api/revenge-or-justice/route.ts', 'src/app/api/revenge-or-justice/feed/route.ts'],
};

const LIMITER = /\bcheck(?:LimitIn|RateLimit)\s*\(/;
const SIGN_IN = /sign[-_ ]?in|log[-_ ]?in|\/auth\b|password/i;

export function pngSize(buf) {
  if (!buf || buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

export function ogImageOf(html) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (/property=["']og:image["']/i.test(tag)) {
      const m = tag.match(/content=["']([^"']+)["']/i);
      if (m) return m[1].replace(/&amp;/g, '&');
    }
  }
  return null;
}

function scriptSrcs(html, pageUrl) {
  const out = [];
  for (const m of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)) {
    try {
      const u = new URL(m[1].replace(/&amp;/g, '&'), pageUrl);
      if (u.origin === new URL(pageUrl).origin) out.push(u.href);
    } catch {}
  }
  return out;
}

/** Follows up to five redirects by hand so a sign-in hop is seen, not swallowed. */
async function fetchPage(url, fetchImpl) {
  let at = url;
  const hops = [];
  for (let i = 0; i < 6; i++) {
    const res = await fetchImpl(at, { redirect: 'manual' });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      at = new URL(res.headers.get('location'), at).href;
      hops.push(at);
      continue;
    }
    return { res, url: at, hops, html: await res.text() };
  }
  return { res: null, url: at, hops, html: '' };
}

/**
 * Runs every step for `slug` and returns [{ step, ok, detail }]. Everything outside is injected, so
 * the test drives it with fixtures: `fetchImpl`, `tools`, `root` (where docs/security and the route
 * files are read), `paid`.
 */
export async function runChecks({ slug, base = 'https://hoplight.ai', fetchImpl = fetch, tools, root = ROOT, paid = PAID_MODEL_ROUTES }) {
  const out = [];
  const step = (id, ok, detail) => out.push({ step: id, ok, detail });
  base = base.replace(/\/$/, '');

  const tool = tools.find((t) => t.slug === slug);
  step('g', Boolean(tool), tool ? `src/data/tools.ts has "${tool.name}"` : `no entry for "${slug}" in src/data/tools.ts`);

  const external = tool ? /^https?:\/\//.test(tool.href) : false;
  const pageUrl = tool ? (external ? tool.href : `${base}${tool.href}`) : null;

  let page = null;
  if (pageUrl) {
    try {
      page = await fetchPage(pageUrl, fetchImpl);
    } catch (err) {
      page = { res: null, url: pageUrl, hops: [], html: '', error: err.message };
    }
  }
  const html = page?.html ?? '';

  // (a)
  if (!page) step('a', false, 'no page to fetch');
  else {
    const signHop = page.hops.find((h) => SIGN_IN.test(new URL(h).pathname));
    const passwordField = /<input\b[^>]*type=["']password["']/i.test(html);
    const status = page.res?.status ?? 0;
    const ok = status === 200 && !signHop && !passwordField;
    step('a', ok, ok ? `${pageUrl} answers 200` : `${pageUrl}: ${page.error ?? `status ${status}`}${signHop ? `, sign-in redirect to ${signHop}` : ''}${passwordField ? ', page asks for a password' : ''}`);
  }

  // (b)
  const og = ogImageOf(html);
  if (!og) step('b', false, 'no og:image on the page');
  else {
    const tryImage = async (u) => {
      try {
        const r = await fetchImpl(u);
        const buf = Buffer.from(await r.arrayBuffer());
        const size = pngSize(buf);
        const type = (r.headers.get('content-type') || '').split(';')[0];
        return { ok: r.ok && type === 'image/png' && size?.width === 1200 && size?.height === 630, detail: `${r.status} ${type} ${size ? `${size.width}x${size.height}` : 'not a PNG'}` };
      } catch (err) {
        return { ok: false, detail: err.message };
      }
    };
    let res = await tryImage(og);
    let via = og;
    // A preview deploy's tags point at hoplight.ai, which may not carry a new card until the merge.
    if (!res.ok && base !== 'https://hoplight.ai' && og.startsWith('https://hoplight.ai/')) {
      via = base + og.slice('https://hoplight.ai'.length);
      const again = await tryImage(via);
      if (again.ok) res = { ok: true, detail: `${again.detail} (read from ${base}; production does not serve it yet)` };
    }
    step('b', res.ok, `og:image ${via}: ${res.detail}${res.ok ? '' : ', want 200 image/png 1200x630'}`);
  }

  // (c)
  const hasBox = /data-hoplight-feedback/.test(html);
  const hasKit = /\/kit\/signal\.js/.test(html);
  step('c', hasBox || (external && hasKit), hasBox ? 'feedback box on the page' : hasKit ? (external ? 'kit script on the page' : 'kit script only; a hoplight.ai page needs the feedback box') : 'no feedback box (data-hoplight-feedback) and no kit script');

  // (d)
  let signal = /\/api\/signal|hoplightSignal|\/kit\/signal\.js/.test(html);
  let where = 'the page';
  if (!signal && page && !external) {
    for (const src of scriptSrcs(html, page.url).slice(0, 60)) {
      try {
        const js = await (await fetchImpl(src)).text();
        if (js.includes('/api/signal')) {
          signal = true;
          where = new URL(src).pathname;
          break;
        }
      } catch {}
    }
  }
  step('d', signal, signal ? `signal helper referenced in ${where}` : 'neither the page nor its scripts reference /api/signal or the kit');

  // (e)
  const secDir = join(root, 'docs', 'security');
  let reports = [];
  try {
    reports = readdirSync(secDir).filter((f) => f.startsWith(`${slug}-`) && f.endsWith('.md'));
  } catch {}
  const passing = reports.filter((f) => /^STATUS: PASS\s*$/m.test(readFileSync(join(secDir, f), 'utf8')));
  step('e', passing.length > 0, passing.length ? `docs/security/${passing[passing.length - 1]} says STATUS: PASS` : reports.length ? `docs/security/${reports.join(', ')} has no "STATUS: PASS" line` : `no docs/security/${slug}-*.md`);

  // (f)
  const routes = paid[slug];
  if (!routes) step('f', true, 'not a paid-model tool');
  else {
    const missing = routes.filter((r) => {
      try {
        return !LIMITER.test(readFileSync(join(root, r), 'utf8'));
      } catch {
        return true;
      }
    });
    step('f', missing.length === 0, missing.length ? `no rate limiter in ${missing.join(', ')}` : `rate limiter in ${routes.join(', ')}`);
  }

  const order = ['g', 'a', 'b', 'c', 'd', 'e', 'f'];
  return out.sort((x, y) => order.indexOf(x.step) - order.indexOf(y.step));
}

const LABEL = {
  g: 'entry in tools.ts',
  a: 'page is public',
  b: 'preview card',
  c: 'feedback box',
  d: 'usage logging',
  e: 'security report',
  f: 'rate limit',
};

export function format(results) {
  return results.map((r) => `${r.ok ? 'PASS' : 'FAIL'} (${r.step}) ${LABEL[r.step]}: ${r.detail}`).join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const args = process.argv.slice(2);
  const bi = args.indexOf('--base');
  const base = bi > -1 ? args[bi + 1] : undefined;
  const slug = args.filter((a, i) => !a.startsWith('--') && (bi === -1 || i !== bi + 1))[0];
  if (!slug) {
    console.error('usage: npm run launch:check -- <slug> [--base <url>]');
    process.exit(2);
  }
  const { TOOLS } = await import('../src/data/tools.ts');
  const results = await runChecks({ slug, base, tools: TOOLS });
  console.log(format(results));
  process.exit(results.every((r) => r.ok) ? 0 : 1);
}
