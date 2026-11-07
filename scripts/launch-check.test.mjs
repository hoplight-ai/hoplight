// The go-public checklist (scripts/launch-check.mjs), driven by fixtures and a fake network. Whit,
// 2026-11-07: "before i share them i want a way for users to give me feedback and for user actions to
// be logged anonymized." Run: node --test scripts/launch-check.test.mjs (part of npm test).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runChecks, format, pngSize, ogImageOf } from './launch-check.mjs';

const FIX = fileURLToPath(new URL('./fixtures/launch-check/', import.meta.url));
const page = (name) => readFileSync(FIX + name, 'utf8');

const TOOLS = [
  { slug: 'undo', name: 'The Undo List', href: '/undo' },
  { slug: 'gut-check', name: 'Gut Check', href: 'https://gut-check-hoplight.vercel.app/play' },
  { slug: 'revenge-or-justice', name: 'Revenge or Justice', href: '/revenge-or-justice' },
];
// The fixture routes end in .txt so the site's type check does not compile them.
const PAID = { 'revenge-or-justice': ['src/app/api/revenge-or-justice/route.ts.txt', 'src/app/api/revenge-or-justice/feed/route.ts.txt'] };

/** A PNG header with the given size; enough for pngSize. */
function png(w, h) {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write('IHDR', 12, 'ascii');
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  return b;
}

/** A fake fetch over a map of url -> { status, type, body, location }. Anything else is a 404. */
function net(routes) {
  return async (url) => {
    const r = routes[url] ?? { status: 404, body: 'not found' };
    const body = r.body ?? '';
    const headers = new Headers({ 'content-type': r.type ?? 'text/html' });
    if (r.location) headers.set('location', r.location);
    return {
      status: r.status ?? 200,
      ok: (r.status ?? 200) < 300,
      headers,
      text: async () => (Buffer.isBuffer(body) ? body.toString('latin1') : body),
      arrayBuffer: async () => {
        const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
        return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      },
    };
  };
}

const run = (slug, routes, extra = {}) => runChecks({ slug, tools: TOOLS, root: FIX, paid: PAID, fetchImpl: net(routes), ...extra });
const byStep = (rs) => Object.fromEntries(rs.map((r) => [r.step, r]));

test('launch: png size and og:image are read off the bytes and the tags', () => {
  assert.deepEqual(pngSize(png(1200, 630)), { width: 1200, height: 630 });
  assert.equal(pngSize(Buffer.from('GIF89a................')), null);
  assert.equal(ogImageOf(page('good-page.html')), 'https://hoplight.ai/api/og/tool/undo');
  assert.equal(ogImageOf(page('bare-page.html')), null);
});

test('launch: a ready hoplight.ai tool passes every step, in order', async () => {
  const rs = await run('undo', {
    'https://hoplight.ai/undo': { body: page('good-page.html') },
    'https://hoplight.ai/api/og/tool/undo': { type: 'image/png', body: png(1200, 630) },
    'https://hoplight.ai/_next/static/chunks/app-undo.js': { type: 'text/javascript', body: 'fetch("/api/signal",{})' },
  });
  assert.deepEqual(rs.map((r) => r.step), ['g', 'a', 'b', 'c', 'd', 'e', 'f']);
  assert.ok(rs.every((r) => r.ok), format(rs));
  assert.match(byStep(rs).d.detail, /app-undo\.js/, 'the signal call was found in a script, not the page');
  assert.match(format(rs).split('\n')[0], /^PASS \(g\) /);
});

test('launch: an unknown slug fails (g) and everything that needs the page', async () => {
  const s = byStep(await run('nope', {}));
  assert.equal(s.g.ok, false);
  assert.equal(s.a.ok, false);
  assert.equal(s.b.ok, false);
});

test('launch: a sign-in hop or a password field fails (a)', async () => {
  const hop = byStep(await run('undo', {
    'https://hoplight.ai/undo': { status: 307, location: '/sign-in?next=/undo' },
    'https://hoplight.ai/sign-in?next=/undo': { body: page('signin-page.html') },
  }));
  assert.equal(hop.a.ok, false);
  assert.match(hop.a.detail, /sign-in redirect/);
  const field = byStep(await run('undo', { 'https://hoplight.ai/undo': { body: page('signin-page.html') } }));
  assert.equal(field.a.ok, false);
  assert.match(field.a.detail, /password/);
});

test('launch: a card of the wrong size or type fails (b); a preview reads the card from --base', async () => {
  const wrong = byStep(await run('undo', {
    'https://hoplight.ai/undo': { body: page('good-page.html') },
    'https://hoplight.ai/api/og/tool/undo': { type: 'image/png', body: png(1200, 600) },
  }));
  assert.equal(wrong.b.ok, false);
  assert.match(wrong.b.detail, /1200x600/);

  const jpeg = byStep(await run('undo', {
    'https://hoplight.ai/undo': { body: page('good-page.html') },
    'https://hoplight.ai/api/og/tool/undo': { type: 'image/jpeg', body: png(1200, 630) },
  }));
  assert.equal(jpeg.b.ok, false);

  const preview = byStep(await run('undo', {
    'https://p.example/undo': { body: page('good-page.html') },
    'https://p.example/api/og/tool/undo': { type: 'image/png', body: png(1200, 630) },
  }, { base: 'https://p.example/' }));
  assert.equal(preview.a.ok, true, preview.a.detail);
  assert.equal(preview.b.ok, true, preview.b.detail);
  assert.match(preview.b.detail, /production does not serve it yet/);
});

test('launch: a bare page fails (b), (c) and (d)', async () => {
  const s = byStep(await run('revenge-or-justice', { 'https://hoplight.ai/revenge-or-justice': { body: page('bare-page.html') } }));
  assert.equal(s.a.ok, true);
  assert.equal(s.b.ok, false);
  assert.equal(s.c.ok, false);
  assert.equal(s.d.ok, false);
});

test('launch: an outside tool passes (c) and (d) on the kit script, and is checked at its own address', async () => {
  const s = byStep(await run('gut-check', {
    'https://gut-check-hoplight.vercel.app/play': { body: page('external-page.html') },
    'https://hoplight.ai/api/og/tool/gut-check': { type: 'image/png', body: png(1200, 630) },
  }));
  assert.equal(s.a.ok, true, s.a.detail);
  assert.equal(s.c.ok, true, s.c.detail);
  assert.equal(s.d.ok, true, s.d.detail);
  assert.equal(s.f.ok, true, 'not a paid tool');
});

test('launch: the security report must say STATUS: PASS on its own line (e)', async () => {
  const pass = byStep(await run('undo', {}));
  assert.equal(pass.e.ok, true);
  assert.match(pass.e.detail, /undo-2026-11-07\.md/);
  const fail = byStep(await run('gut-check', {}));
  assert.equal(fail.e.ok, false);
  assert.match(fail.e.detail, /no "STATUS: PASS" line/);
  const none = byStep(await run('revenge-or-justice', {}));
  assert.equal(none.e.ok, false);
  assert.match(none.e.detail, /no docs\/security\/revenge-or-justice-\*\.md/);
});

test('launch: every paid-model route needs a limiter (f)', async () => {
  const s = byStep(await run('revenge-or-justice', {}));
  assert.equal(s.f.ok, false);
  assert.match(s.f.detail, /feed\/route\.ts\.txt/);
  assert.doesNotMatch(s.f.detail, /justice\/route\.ts\.txt,/);
  const real = byStep(await runChecks({ slug: 'revenge-or-justice', tools: TOOLS, fetchImpl: net({}) }));
  assert.equal(real.f.ok, true, `the real routes: ${real.f.detail}`);
});
