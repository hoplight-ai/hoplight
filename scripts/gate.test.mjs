// The gate: hidden pages sit behind the one-password sign-in (Whit, 2026-10-19: "5 yes").
//
//   node --test scripts/gate.test.mjs      (also part of `npm test`)
//
// It calls src/proxy.ts and src/app/api/grant/route.ts directly with real NextRequest objects,
// through Node's native TypeScript support, the way intake-ratelimit.test.mjs reaches
// src/lib/rate-limit.ts. The password and user below are made up on every run and live only in this
// process's environment; no real credential is read or written.
//
// What it proves:
//   1. An open path answers without a cookie (the proxy passes it through untouched).
//   2. A gated path answers a browser without a cookie with the sign-in page (200, no browser box)
//      and everything else with a 401 and a Basic challenge, and says noindex.
//   3. A gated path passes with the cookie (or the Basic pair), noindex set, and the seven moved
//      tools forward with a 307 to their vercel.app address.
//   4. With no password configured, a gated path stays shut even for a cookie that would otherwise
//      match (fail closed).
//   5. The proxy matcher and the gate list agree, and the sitemap names no gated path.
//   6. The sign-in form's route sets the cookie only for the right password.

import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server.js';
import { proxy, config } from '../src/proxy.ts';
import { POST as grant } from '../src/app/api/grant/route.ts';
import { accessToken, isGated, MOVED_TOOLS, COOKIE_NAME } from '../src/lib/gate.ts';
import sitemap from '../src/app/sitemap.ts';

const ORIGIN = 'http://localhost:8793';
const USER = `test-user-${randomUUID()}`;
const PASS = `test-pass-${randomUUID()}`;
const BROWSER = { accept: 'text/html,application/xhtml+xml' };

function withEnv(on, fn) {
  const saved = { u: process.env.PRIVATE_SITE_USER, p: process.env.PRIVATE_SITE_PASSWORD };
  if (on) {
    process.env.PRIVATE_SITE_USER = USER;
    process.env.PRIVATE_SITE_PASSWORD = PASS;
  } else {
    delete process.env.PRIVATE_SITE_USER;
    delete process.env.PRIVATE_SITE_PASSWORD;
  }
  const restore = () => {
    if (saved.u === undefined) delete process.env.PRIVATE_SITE_USER;
    else process.env.PRIVATE_SITE_USER = saved.u;
    if (saved.p === undefined) delete process.env.PRIVATE_SITE_PASSWORD;
    else process.env.PRIVATE_SITE_PASSWORD = saved.p;
  };
  return Promise.resolve(fn()).finally(restore);
}

const req = (path, headers = {}, init = {}) => new NextRequest(`${ORIGIN}${path}`, { headers, ...init });
const passedThrough = (res) => res.headers.get('x-middleware-next') === '1';

const OPEN = [
  '/', '/services', '/about', '/faq', '/contact', '/undo', '/undo/all', '/agis', '/agis/x',
  '/bet-appetit', '/tools/which-ai', '/api/intake', '/api/og', '/robots.txt', '/sitemap.xml',
];

// One path per entry on the owner's list, plus children and the seven moved tools.
const GATED = [
  '/persuasion', '/research', '/hoplight-rct-research-brief.pdf', '/portfolio',
  '/portfolio/dnc-autopsy-taken-apart.html', '/portfolio/thumbs/x.png', '/rayli', '/rayli/x',
  '/pme-lever.html', '/hoplight-brand-tokens-2026-09-20.html', '/shelf-options/a.html',
  '/shelf-options/shots/x.png', '/mockups/a-discretion/index.html',
  ...MOVED_TOOLS.flatMap((t) => [`/${t.name}`, `/${t.name}/x`]),
];

test('open path returns 200 without the cookie', async () => {
  await withEnv(true, async () => {
    for (const path of OPEN) {
      const res = await proxy(req(path, BROWSER));
      assert.equal(res.status, 200, path);
      assert.ok(passedThrough(res), `${path} should pass straight through`);
      assert.equal(res.headers.get('x-robots-tag'), null, `${path} must not be marked noindex`);
    }
  });
});

test('gated path returns the sign-in page to a browser without the cookie', async () => {
  await withEnv(true, async () => {
    for (const path of GATED) {
      const res = await proxy(req(path, BROWSER));
      assert.equal(res.status, 200, path);
      assert.equal(passedThrough(res), false, `${path} must not pass through`);
      assert.equal(res.headers.get('www-authenticate'), null, `${path}: no browser box`);
      assert.equal(res.headers.get('x-robots-tag'), 'noindex', path);
      const body = await res.text();
      assert.match(body, /type="password"/, path);
      assert.match(body, /action="\/api\/grant"/, path);
    }
  });
});

test('gated path returns 401 with a Basic challenge to a script, and to ?dialog=1', async () => {
  await withEnv(true, async () => {
    for (const path of GATED) {
      const res = await proxy(req(path, { accept: '*/*' }));
      assert.equal(res.status, 401, path);
      assert.match(res.headers.get('www-authenticate') ?? '', /^Basic realm=/, path);
      assert.equal(res.headers.get('x-robots-tag'), 'noindex', path);
    }
    const dialog = await proxy(req('/rayli?dialog=1', BROWSER));
    assert.equal(dialog.status, 401);
    assert.match(dialog.headers.get('www-authenticate') ?? '', /^Basic realm=/);
  });
});

test('gated path returns 200 with the cookie, marked noindex, and a wrong cookie is refused', async () => {
  await withEnv(true, async () => {
    const good = `${COOKIE_NAME}=${await accessToken(USER, PASS)}`;
    const wrong = `${COOKIE_NAME}=${'0'.repeat(64)}`;
    for (const path of GATED.filter((p) => !MOVED_TOOLS.some((t) => p.startsWith(`/${t.name}`)))) {
      const res = await proxy(req(path, { ...BROWSER, cookie: good }));
      assert.equal(res.status, 200, path);
      assert.ok(passedThrough(res), `${path} should pass with the cookie`);
      assert.equal(res.headers.get('x-robots-tag'), 'noindex', path);
      const refused = await proxy(req(path, { ...BROWSER, cookie: wrong }));
      assert.equal(refused.status === 200 && passedThrough(refused), false, `${path} must refuse a wrong cookie`);
    }
  });
});

test('the Basic pair opens a gated path for scripts and proofs', async () => {
  await withEnv(true, async () => {
    const basic = `Basic ${Buffer.from(`${USER}:${PASS}`).toString('base64')}`;
    const res = await proxy(req('/portfolio', { authorization: basic, accept: '*/*' }));
    assert.ok(passedThrough(res));
    const bad = `Basic ${Buffer.from(`${USER}:nope`).toString('base64')}`;
    assert.equal((await proxy(req('/portfolio', { authorization: bad, accept: '*/*' }))).status, 401);
  });
});

test('each moved tool forwards with a 307 to its vercel.app address once signed in, and not before', async () => {
  await withEnv(true, async () => {
    const cookie = `${COOKIE_NAME}=${await accessToken(USER, PASS)}`;
    for (const { name, target } of MOVED_TOOLS) {
      const res = await proxy(req(`/${name}`, { ...BROWSER, cookie }));
      assert.equal(res.status, 307, name);
      assert.equal(res.headers.get('location'), `${target}/`, name);
      assert.equal(res.headers.get('x-robots-tag'), 'noindex', name);
      const deep = await proxy(req(`/${name}/a/b?x=1`, { ...BROWSER, cookie }));
      assert.equal(deep.headers.get('location'), `${target}/a/b?x=1`, `${name} deep path`);
      const before = await proxy(req(`/${name}`, BROWSER));
      assert.equal(before.status, 200, `${name} without the cookie shows the sign-in page`);
      assert.equal(before.headers.get('location'), null, `${name} must not redirect before sign-in`);
    }
  });
});

test('with no password configured every gated path stays shut, even for a cookie that would match', async () => {
  const good = `${COOKIE_NAME}=${await accessToken(USER, PASS)}`;
  const basic = `Basic ${Buffer.from(`${USER}:${PASS}`).toString('base64')}`;
  await withEnv(false, async () => {
    for (const path of GATED) {
      const page = await proxy(req(path, { ...BROWSER, cookie: good }));
      assert.equal(passedThrough(page), false, `${path} must stay shut with no env`);
      assert.match(await page.text(), /type="password"/, path);
      const script = await proxy(req(path, { accept: '*/*', authorization: basic, cookie: good }));
      assert.equal(script.status, 401, path);
    }
    // and the open half still opens
    assert.ok(passedThrough(await proxy(req('/', BROWSER))));
  });
});

test('the proxy matcher and the gate list agree', () => {
  const asRegex = (m) => new RegExp(`^${m.replace('/:path*', '(?:/.*)?')}$`);
  const matchers = config.matcher.map(asRegex);
  const matched = (path) => matchers.some((re) => re.test(path));
  for (const path of GATED) assert.ok(matched(path), `matcher misses ${path}`);
  for (const path of OPEN) assert.equal(matched(path), false, `matcher catches the open path ${path}`);
  // every matcher entry stands for a gated path
  for (const m of config.matcher) {
    const sample = m.replace('/:path*', '/x');
    assert.ok(isGated(sample.replace(/\/x$/, '')) && isGated(sample), `gate list misses matcher entry ${m}`);
  }
  // the owner's list, spelled out
  for (const p of ['/persuasion', '/research', '/hoplight-rct-research-brief.pdf', '/portfolio', '/portfolio/a', '/rayli',
    '/pme-lever.html', '/hoplight-brand-tokens-2026-09-20.html', '/shelf-options/a.html', '/mockups/a/b']) {
    assert.ok(isGated(p), p);
  }
  for (const p of ['/', '/services', '/about', '/faq', '/contact', '/undo', '/agis', '/bet-appetit', '/tools/which-ai']) {
    assert.equal(isGated(p), false, p);
  }
  // one address written several ways is one address
  for (const p of ['/RAYLI', '/rayli/', '//rayli', '/%72ayli', '/portfolio//x']) assert.ok(isGated(p), p);
});

test('the sitemap names no gated path', () => {
  const urls = sitemap().map((e) => new URL(e.url).pathname || '/');
  assert.ok(urls.length > 0);
  for (const u of urls) assert.equal(isGated(u), false, `sitemap lists the gated path ${u}`);
});

test('the sign-in form sets the cookie for the right password only, and the cookie then opens the gate', async () => {
  const form = (password, next = '/rayli') =>
    new Request(`${ORIGIN}/api/grant`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ password, next }).toString(),
    });
  await withEnv(true, async () => {
    const wrong = await grant(form('not-the-password'));
    assert.equal(wrong.status, 200);
    assert.equal(wrong.headers.get('set-cookie'), null);
    assert.match(await wrong.text(), /That password did not match/);

    const right = await grant(form(PASS));
    assert.equal(right.status, 303);
    assert.equal(right.headers.get('location'), '/rayli');
    const setCookie = right.headers.get('set-cookie') ?? '';
    assert.match(setCookie, new RegExp(`^${COOKIE_NAME}=[a-f0-9]{64};`));
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /Secure/);
    assert.match(setCookie, /Max-Age=31536000/);

    const cookie = setCookie.split(';')[0];
    assert.ok(passedThrough(await proxy(req('/rayli', { ...BROWSER, cookie }))));

    // an off-site `next` is not followed
    const offsite = await grant(form(PASS, 'https://evil.example/'));
    assert.equal(offsite.headers.get('location'), '/');
  });
  await withEnv(false, async () => {
    const res = await grant(form('anything'));
    assert.equal(res.status, 503);
    assert.equal(res.headers.get('set-cookie'), null);
  });
});
