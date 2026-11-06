// The Command Center's own door (Whit, 2026-10-23: "give it a password").
//
//   node --test scripts/command-center.test.mjs      (also part of `npm test`)
//
// Calls src/app/command-center/route.ts directly, through Node's native TypeScript support, the way
// gate.test.mjs reaches the proxy. The password below is made up on every run and lives only in
// this process's environment; no real credential is read or written.
//
// What it proves:
//   1. A browser without the password gets the sign-in page (200, no browser box) and none of the
//      prototype's content; a script without it gets a 401 with a Basic challenge.
//   2. The Basic pair and the cookie both open the page, which says noindex and never caches.
//   3. The form sets the cookie only for the right password, and always sends the browser back to
//      /command-center whatever `next` it was handed.
//   4. With no password configured, nothing opens the page and the form answers 503 (fail closed).
//   5. The page is served from src/private/, not public/, and the sitemap does not name it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { GET, POST } from '../src/app/command-center/route.ts';
import { accessToken, COOKIE_NAME, PATH } from '../src/lib/command-center.ts';
import sitemap from '../src/app/sitemap.ts';

const ORIGIN = 'http://localhost:8793';
const PASS = `test-pass-${randomUUID()}`;
const BROWSER = { accept: 'text/html,application/xhtml+xml' };
const CONTENT = 'Inbound queue'; // a heading only the prototype carries

function withEnv(on, fn) {
  const saved = process.env.COMMAND_CENTER_PASSWORD;
  if (on) process.env.COMMAND_CENTER_PASSWORD = PASS;
  else delete process.env.COMMAND_CENTER_PASSWORD;
  return Promise.resolve(fn()).finally(() => {
    if (saved === undefined) delete process.env.COMMAND_CENTER_PASSWORD;
    else process.env.COMMAND_CENTER_PASSWORD = saved;
  });
}

const req = (headers = {}) => new Request(`${ORIGIN}${PATH}`, { headers });
const post = (fields) =>
  new Request(`${ORIGIN}${PATH}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  });
const basic = `Basic ${Buffer.from(`anyone:${PASS}`).toString('base64')}`;

test('1. a browser without the password gets the sign-in page and none of the content', () =>
  withEnv(true, async () => {
    const res = await GET(req(BROWSER));
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('www-authenticate'), null, 'the browser box must never be raised');
    assert.equal(res.headers.get('x-robots-tag'), 'noindex');
    const body = await res.text();
    assert.ok(body.includes('Command Center'), 'the sign-in page names the thing');
    assert.ok(body.includes('name="password"'), 'the sign-in page has the one field');
    assert.ok(!body.includes(CONTENT), 'the sign-in page carries none of the prototype');
  }));

test('1. a script without the password gets a 401 with a Basic challenge', () =>
  withEnv(true, async () => {
    const res = await GET(req({ accept: '*/*' }));
    assert.equal(res.status, 401);
    assert.match(res.headers.get('www-authenticate') || '', /^Basic /);
  }));

test('2. the Basic pair opens the page, noindex, never cached', () =>
  withEnv(true, async () => {
    const res = await GET(req({ ...BROWSER, authorization: basic }));
    assert.equal(res.status, 200);
    assert.ok((await res.text()).includes(CONTENT));
    assert.equal(res.headers.get('x-robots-tag'), 'noindex');
    assert.match(res.headers.get('cache-control') || '', /no-store/);
  }));

test('2. the cookie opens the page; a wrong cookie does not', () =>
  withEnv(true, async () => {
    const good = await GET(req({ ...BROWSER, cookie: `${COOKIE_NAME}=${await accessToken(PASS)}` }));
    assert.equal(good.status, 200);
    assert.ok((await good.text()).includes(CONTENT));
    const bad = await GET(req({ ...BROWSER, cookie: `${COOKIE_NAME}=${'0'.repeat(64)}` }));
    assert.equal(bad.status, 200);
    assert.ok(!(await bad.text()).includes(CONTENT));
  }));

test('3. the form sets the cookie only for the right password and always lands on /command-center', () =>
  withEnv(true, async () => {
    const wrong = await POST(post({ password: `${PASS}x`, next: PATH }));
    assert.equal(wrong.status, 200);
    assert.equal(wrong.headers.get('set-cookie'), null);
    assert.ok((await wrong.text()).includes('did not match'));

    const right = await POST(post({ password: PASS, next: '/somewhere-else' }));
    assert.equal(right.status, 303);
    assert.equal(right.headers.get('location'), PATH);
    const cookie = right.headers.get('set-cookie') || '';
    assert.ok(cookie.startsWith(`${COOKIE_NAME}=${await accessToken(PASS)}`), 'the cookie is the digest');
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /Secure/);
  }));

test('4. with no password configured nothing opens the page and the form answers 503', () =>
  withEnv(false, async () => {
    const res = await GET(req({ ...BROWSER, authorization: basic }));
    assert.equal(res.status, 200);
    assert.ok(!(await res.text()).includes(CONTENT));
    assert.equal((await POST(post({ password: '' }))).status, 503);
  }));

test('5. the page lives under src/private, not public, and the sitemap does not name it', () => {
  assert.ok(existsSync('src/private/command-center.html'));
  assert.ok(!existsSync('public/command-center.html'));
  assert.ok(!sitemap().some((row) => row.url.includes(PATH)));
});
