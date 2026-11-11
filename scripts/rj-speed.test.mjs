// Revenge or Justice never shows a blank wait (lane RJFAST1, 2026-11-10; Whit: "the articles take forever to
// load, we should triage so they populate faster, less latency- we need great ui for maintianing attentoin and
// demonstratting features before someone navigates away"). Offline: fetch is replaced everywhere.
//
//   1. A second link-only reading of the same article makes no upstream call and says `cached: true`.
//   2. Pasted text is never kept or served from the copy, and an error reply is never kept.
//   3. The built page's HTML carries the headline list (skips until `npm run build` has run, and when the
//      build had no site pair to fetch the list with, which it says on the list's own section).
//   4. The page script draws the stage list and the five empty bars in the same turn as the submit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const READING = {
  verdict: 'retribution', mean_position: 24, headline: 'It sounds like revenge: it names a man, not a practice.',
  rows: [{ key: 'practice', title: 'Practice, not person', position: 20 }], fetched: 'https://www.example.com/news/raskin-hearing',
  article: { title: 'Raskin opens the hearing', site: 'Example News' }, voices: {}, issues: [],
};

// A stand-in for the upstream grader that counts its calls and answers with whatever the test gives it.
function upstream(answer) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url: String(url), body: init && init.body ? JSON.parse(init.body) : null });
    const a = typeof answer === 'function' ? answer(calls.length) : answer;
    return new Response(JSON.stringify(a.body), { status: a.status, headers: { 'Content-Type': 'application/json' } });
  };
  return { calls, fetchImpl };
}

async function cacheLib() {
  return import('../src/lib/rj-cache.ts');
}

function deps(lib, fetchImpl, extra = {}) {
  let limited = 0;
  const d = {
    store: lib.memoryStore(),
    fetchImpl,
    upstream: 'https://upstream.test/api/justice-or-retribution',
    auth: 'Basic dGVzdDp0ZXN0',
    allow: () => { limited += 1; return null; },
    now: () => new Date('2026-11-10T15:00:00Z'),
    ...extra,
  };
  return { d, limitCalls: () => limited };
}

test('1. a second link-only reading of the same article makes no upstream call and says cached: true', async () => {
  const lib = await cacheLib();
  const up = upstream({ status: 200, body: READING });
  const { d, limitCalls } = deps(lib, up.fetchImpl);
  const first = await lib.gradeThroughCopy({ text: 'https://www.example.com/news/raskin-hearing?utm_source=x' }, d);
  assert.equal(first.status, 200);
  assert.equal(first.cached, false);
  assert.equal(JSON.parse(first.body).cached, undefined, 'a fresh reading does not claim to be a copy');
  // The same article as a pasted link with a trailing slash, a hash and capitals, and as the url field.
  const second = await lib.gradeThroughCopy({ text: 'https://WWW.example.com/news/raskin-hearing/#top' }, d);
  const third = await lib.gradeThroughCopy({ url: 'https://www.example.com/news/raskin-hearing' }, d);
  assert.equal(up.calls.length, 1, 'the upstream was called ' + up.calls.length + ' times');
  for (const r of [second, third]) {
    assert.equal(r.status, 200);
    assert.equal(r.cached, true);
    const j = JSON.parse(r.body);
    assert.equal(j.cached, true);
    assert.equal(j.read_at, '2026-11-10T15:00:00.000Z');
    assert.equal(j.verdict, 'retribution');
    assert.equal(j.mean_position, 24);
  }
  // A reading served from the copy costs nothing, so it does not count against the visitor's six an hour.
  assert.equal(limitCalls(), 1, 'the rate limit was asked ' + limitCalls() + ' times');
  // The key is the brief's normalisation, the same as quick-tools lib/justice-readings.mjs keyOf.
  assert.equal(lib.keyOf('https://WWW.Example.com/a/b/?q=1#h'), 'https://www.example.com/a/b');
});

test('1b. a copy older than seven days is read again', async () => {
  const lib = await cacheLib();
  const up = upstream({ status: 200, body: READING });
  let t = new Date('2026-11-01T00:00:00Z');
  const { d } = deps(lib, up.fetchImpl, { now: () => t });
  await lib.gradeThroughCopy({ url: READING.fetched }, d);
  t = new Date('2026-11-07T23:00:00Z');
  assert.equal((await lib.gradeThroughCopy({ url: READING.fetched }, d)).cached, true);
  t = new Date('2026-11-08T01:00:00Z');
  assert.equal((await lib.gradeThroughCopy({ url: READING.fetched }, d)).cached, false);
  assert.equal(up.calls.length, 2);
});

test('2. pasted text is never kept or served from the copy, and an error reply is never kept', async () => {
  const lib = await cacheLib();
  const up = upstream({ status: 200, body: { ...READING, fetched: null } });
  const { d } = deps(lib, up.fetchImpl);
  const pasted = 'Rep. Raskin said today that the firm overcharged families. https://www.example.com/news/raskin-hearing';
  for (let i = 0; i < 2; i++) {
    const r = await lib.gradeThroughCopy({ text: pasted }, d);
    assert.equal(r.cached, false);
    assert.equal(JSON.parse(r.body).cached, undefined);
  }
  assert.equal(up.calls.length, 2, 'pasted text was served from a copy');
  // The link inside the pasted text is not a link-only reading, so nothing was kept under it either.
  assert.equal(await d.store.get(lib.keyOf(READING.fetched)), null);

  // An upstream failure, and a 200 that carries an error, are passed through and never kept.
  const bad = upstream((n) => (n === 1 ? { status: 502, body: { error: 'the grader failed: overloaded' } } : { status: 200, body: { error: 'could not read that page' } }));
  const b = deps(lib, bad.fetchImpl);
  const r1 = await lib.gradeThroughCopy({ url: 'https://example.com/x' }, b.d);
  assert.equal(r1.status, 502);
  const r2 = await lib.gradeThroughCopy({ url: 'https://example.com/x' }, b.d);
  assert.equal(r2.cached, false);
  const r3 = await lib.gradeThroughCopy({ url: 'https://example.com/x' }, b.d);
  assert.equal(r3.cached, false);
  assert.equal(bad.calls.length, 3, 'an error reply was served from a copy');
  assert.equal(await b.d.store.get(lib.keyOf('https://example.com/x')), null);

  // A visitor over their limit still gets an article that is already held.
  const held = upstream({ status: 200, body: READING });
  const h = deps(lib, held.fetchImpl);
  await lib.gradeThroughCopy({ url: READING.fetched }, h.d);
  h.d.allow = () => 'That is six readings in an hour from your address. Come back in a bit.';
  assert.equal((await lib.gradeThroughCopy({ url: READING.fetched }, h.d)).cached, true);
  const limited = await lib.gradeThroughCopy({ url: 'https://example.com/new-one' }, h.d);
  assert.equal(limited.status, 429);
  assert.equal(held.calls.length, 1);
});

test('2b. the list marks each headline whose full reading is held, and fills a missing dial from it', async () => {
  const lib = await cacheLib();
  const up = upstream({ status: 200, body: READING });
  const { d } = deps(lib, up.fetchImpl);
  await lib.gradeThroughCopy({ url: READING.fetched }, d);
  const items = await lib.markHeld([
    { url: 'https://www.example.com/news/raskin-hearing', title: 'Raskin opens the hearing' },
    { url: 'https://example.com/other', title: 'Another', reading: { position: 70, verdict: 'justice' } },
  ], d.store);
  assert.equal(items[0].held.read_at, '2026-11-10T15:00:00.000Z');
  assert.equal(items[0].reading.position, 24);
  assert.equal(items[0].reading.verdict, 'retribution');
  assert.equal(items[1].held, undefined);
  assert.equal(items[1].reading.position, 70);
});

// 3. The built page.
const built = ['.next/server/app/revenge-or-justice.html', '.next/server/app/(main)/revenge-or-justice.html'].map((p) => join(ROOT, p)).find((p) => existsSync(p));
const html = built ? readFileSync(built, 'utf8') : '';
const source = (html.match(/data-feed-source="([a-z-]+)"/) || [])[1] || '';
const skip3 = !built ? 'no build present' : source === 'unconfigured' ? 'built without the site pair, so there was no list to fetch' : false;

test('3. the built page carries the headline list in its HTML', { skip: skip3 }, () => {
  assert.ok(source, 'the built page has no server-drawn headline list (no data-feed-source on the list)');
  const picks = html.match(/class="pick[ "]/g) || [];
  assert.ok(picks.length >= 1, 'the built page carries ' + picks.length + ' headlines (list source: ' + source + ')');
  assert.match(html, /<section[^>]*id="feed"(?![^>]*\shidden)[^>]*>/, 'the list column is hidden in the built HTML');
});

// 4. The page script against a minimal DOM: enough of document and window for tool.js to run its submit.
function fakeDom() {
  const els = new Map();
  function el(id) {
    const cls = new Set();
    const e = {
      id, innerHTML: '', textContent: '', className: '', hidden: false, value: '', disabled: false, dataset: {}, style: {}, attrs: {}, listeners: {},
      classList: {
        add: (...c) => c.forEach((x) => cls.add(x)), remove: (...c) => c.forEach((x) => cls.delete(x)),
        toggle: (c) => (cls.has(c) ? (cls.delete(c), false) : (cls.add(c), true)), contains: (c) => cls.has(c),
      },
      addEventListener(t, f) { (this.listeners[t] ||= []).push(f); },
      setAttribute(k, v) { this.attrs[k] = String(v); }, getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      querySelector: () => null, querySelectorAll: () => [], appendChild() {}, removeChild() {}, focus() {}, contains: () => false,
      getBoundingClientRect: () => ({ left: 0, top: 0, bottom: 0 }), scrollIntoView() {}, closest: () => null,
    };
    return e;
  }
  const document = {
    getElementById(id) { if (!els.has(id)) els.set(id, el(id)); return els.get(id); },
    createElement: () => el(''), addEventListener() {}, querySelectorAll: () => [], body: el('body'), title: '',
  };
  const window = {
    matchMedia: () => ({ matches: false }), addEventListener() {}, removeEventListener() {}, scrollTo() {},
    location: { search: '' }, innerWidth: 1440, innerHeight: 900,
  };
  return { document, window, el: (id) => document.getElementById(id) };
}

test('4. on submit the page draws the article, the stage list and the five empty bars before any reply', async () => {
  const dom = fakeDom();
  const posts = [];
  globalThis.document = dom.document;
  globalThis.window = dom.window;
  globalThis.requestAnimationFrame = (f) => setTimeout(f, 0);
  globalThis.fetch = (url, init) => {
    if (init && init.method === 'POST') { posts.push(init.body); return new Promise(() => {}); } // the reply never comes
    return new Promise(() => {}); // nor the rubric: the page must draw from what it already holds
  };
  const { initRevengeOrJustice } = await import('../src/app/(main)/revenge-or-justice/tool.js');
  const root = dom.el('root');
  const item = {
    url: 'https://www.example.com/news/raskin-hearing', title: 'Raskin opens the hearing on the overcharges', source: 'Example News', host: 'example.com',
    officials: [{ name: 'Jamie Raskin', role: 'Representative', kind: 'elected' }],
    reading: { position: 24, verdict: 'retribution', headline: 'It names a man, not a practice.' },
  };
  initRevengeOrJustice(root, { items: [item] });
  dom.el('t').value = item.url;
  const submit = dom.el('f').listeners.submit[0];
  submit({ preventDefault() {} });
  // Same turn as the submit: nothing awaited.
  assert.equal(posts.length, 1, 'the reading was asked for');
  const stages = dom.el('stages').innerHTML;
  for (const s of ['Getting the article', 'Separating the politicians from the outlet', 'Finding the issues', 'Reading the five measures', 'Matching the precedent', 'Writing the rewrites']) {
    assert.ok(stages.includes(s), 'the stage list is missing "' + s + '"');
  }
  const rows = dom.el('rows').innerHTML;
  assert.equal((rows.match(/class="ir wait"/g) || []).length, 5, 'five empty bars');
  assert.ok(rows.includes('Is the subject a practice'), 'each empty bar carries its question');
  assert.doesNotMatch(rows, /class="bar /, 'an empty bar draws no reading');
  // The article takes the stage: its outlet, its headline and its officials, from the list item in hand.
  const art = dom.el('art').innerHTML;
  assert.ok(art.includes('Raskin opens the hearing on the overcharges'));
  assert.ok(art.includes('Example News'));
  assert.ok(art.includes('Jamie Raskin'));
  // Its light reading draws at once as the quick read.
  assert.match(dom.el('dial').innerHTML, /<svg/);
  assert.match(dom.el('verdict').textContent + ' ' + dom.el('meta').innerHTML, /Quick read/);
  // The two precedent slots and the three rewrite slots wait in the shapes they will fill.
  assert.equal((dom.el('prec').innerHTML.match(/class="prec wait"/g) || []).length, 2);
  assert.equal((dom.el('reframes').innerHTML.match(/class="reframe wait"/g) || []).length, 3);
  assert.ok(dom.el('out').classList.contains('on') && dom.el('out').classList.contains('wait'));
  // No clock words, no em dash, no percentage anywhere on the waiting screen.
  const all = [stages, rows, art, dom.el('meta').innerHTML, dom.el('prec').innerHTML, dom.el('reframes').innerHTML].join(' ');
  assert.doesNotMatch(all, /\b(ago|stale|fresh)\b|—|\d+%/);
  // "Read another" drops the reading still on its way and stops the stage marker.
  dom.el('again').listeners.click[0]();
  assert.equal(dom.el('stages').innerHTML, '');
  assert.ok(!dom.el('out').classList.contains('wait'));
});

test('4b. when the reply lands it fills the same slots, and a copy says the day it was read', async () => {
  const dom = fakeDom();
  globalThis.document = dom.document;
  globalThis.window = dom.window;
  const rows = ['practice', 'price', 'remedy', 'umpire', 'knot'].map((key, i) => ({ key, title: key, position: 20 + i * 10, evidence: 'words', critique: 'how it reads' }));
  const reply = { ...READING, rows, reframes: [{ label: 'One', text: 'a', why: 'b' }], precedent: {}, cached: true, read_at: '2026-11-09T15:00:00.000Z' };
  let answer;
  globalThis.fetch = (url, init) => (init && init.method === 'POST' ? new Promise((r) => { answer = r; }) : new Promise(() => {}));
  const { initRevengeOrJustice } = await import('../src/app/(main)/revenge-or-justice/tool.js');
  initRevengeOrJustice(dom.el('root2'), { items: [{ url: READING.fetched, title: 'Raskin opens the hearing', source: 'Example News', host: 'example.com' }] });
  dom.el('t').value = READING.fetched;
  dom.el('f').listeners.submit[0]({ preventDefault() {} });
  answer({ ok: true, json: () => Promise.resolve(reply) });
  await new Promise((r) => setTimeout(r, 20));
  assert.ok(!dom.el('out').classList.contains('failed'), 'the reply was drawn as a failure: ' + dom.el('stages').innerHTML.replace(/<[^>]+>/g, ' '));
  assert.ok(!dom.el('out').classList.contains('wait'));
  assert.equal(dom.el('stages').innerHTML, '');
  assert.equal((dom.el('rows').innerHTML.match(/class="ir"/g) || []).length, 5);
  assert.match(dom.el('meta').innerHTML, /Read on Nov 9/);
  assert.match(dom.el('dial').innerHTML, /<svg/);
});
