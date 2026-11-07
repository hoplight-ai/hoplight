// /api/signal's rules (src/lib/signal.ts) and the embeddable kit (public/kit/signal.js). Whit,
// 2026-11-07: "a way for users to give me feedback and for user actions to be logged anonymized."
// Run: node --test scripts/signal.test.mjs (part of npm test).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { scrub, parseSignal, visitorHash, originPolicy, handleSignal, EXTERNAL_ORIGINS, storeBody, SIGNAL_TOOLS, ACTION_RE } from '../src/lib/signal.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TOOLS = SIGNAL_TOOLS;
const NOW = new Date('2026-11-10T17:00:00Z');

function req(body, headers = {}, allow = () => true) {
  const h = Object.fromEntries(Object.entries({ host: 'hoplight.ai', 'x-forwarded-for': '203.0.113.9, 10.0.0.1', ...headers }).map(([k, v]) => [k.toLowerCase(), v]));
  return handleSignal({
    bodyText: typeof body === 'string' ? body : JSON.stringify(body),
    header: (n) => h[n.toLowerCase()] ?? null,
    tools: TOOLS,
    salt: 'test-salt',
    now: NOW,
    allow,
  });
}

test('signal: email addresses and phone numbers are cut out', () => {
  assert.equal(scrub('write me at Pat.Doe+x@example.co.uk today'), 'write me at [email] today');
  assert.equal(scrub('call (503) 555-0142 or 503.555.0142 or +1 503 555 0142'), 'call [phone] or [phone] or [phone]');
  assert.equal(scrub('London +44 20 7946 0958.'), 'London [phone].');
  assert.equal(scrub('EO 14151 of 2025-01-20, 280 rows, 6 readings'), 'EO 14151 of 2025-01-20, 280 rows, 6 readings');
});

test('signal: an event is kept with only the allowed fields', () => {
  const r = req({ kind: 'event', tool: 'undo', action: 'search', props: { query: 'tariffs on canada', n: 12, open: true }, path: '/undo/all?q=secret#x' }, { 'x-vercel-ip-country': 'US', 'x-vercel-ip-country-region': 'OR', 'user-agent': 'Mozilla/5.0 secret' });
  assert.equal(r.status, 202);
  const f = r.forward;
  assert.deepEqual(Object.keys(f).sort(), ['action', 'at', 'contact', 'country', 'kind', 'message', 'path', 'props', 'region', 'tool', 'visitor_hash'].sort());
  assert.equal(f.path, '/undo/all');
  assert.equal(f.country, 'US');
  assert.equal(f.region, 'OR');
  assert.equal(f.at, NOW.toISOString());
  const all = JSON.stringify(f);
  assert.ok(!all.includes('203.0.113.9'), 'raw address leaked');
  assert.ok(!all.includes('Mozilla'), 'user agent leaked');
});

test('signal: the visitor hash is 16 hex, stable within a day, new the next day', () => {
  const a = visitorHash('203.0.113.9', 's', NOW);
  assert.match(a, /^[0-9a-f]{16}$/);
  assert.equal(visitorHash('203.0.113.9', 's', new Date('2026-11-10T23:59:00Z')), a);
  assert.notEqual(visitorHash('203.0.113.9', 's', new Date('2026-11-11T00:00:01Z')), a);
  assert.notEqual(visitorHash('203.0.113.9', 'other', NOW), a);
  assert.equal(visitorHash('', 's', NOW), null);
});

test('signal: feedback scrubs the message but keeps a contact the person typed', () => {
  const r = req({ kind: 'feedback', tool: 'revenge-or-justice', message: 'Broke on my phone, text 503-555-0142 or me@x.org', contact: 'me@x.org' });
  assert.equal(r.status, 202);
  assert.equal(r.forward.message, 'Broke on my phone, text [phone] or [email]');
  assert.equal(r.forward.contact, 'me@x.org');
  assert.equal(r.forward.action, 'feedback');
});

test('signal: props are scrubbed, flat and capped', () => {
  const ok = req({ kind: 'event', tool: 'revenge-or-justice', action: 'grade', props: { query: 'Contact press@house.gov or 202-225-5051' } });
  assert.equal(ok.forward.props.query, 'Contact [email] or [phone]');
  assert.equal(req({ kind: 'event', tool: 'undo', action: 'x', props: { a: { b: 1 } } }).status, 400);
  assert.equal(req({ kind: 'event', tool: 'undo', action: 'x', props: [1, 2] }).status, 400);
  assert.equal(req({ kind: 'event', tool: 'undo', action: 'x', props: { a: 'y'.repeat(2100) } }).status, 400);
  assert.equal(req({ kind: 'event', tool: 'undo', action: 'x', props: { 'bad key!': 1 } }).status, 400);
});

test('signal: shape errors answer 400', () => {
  assert.equal(req('not json').status, 400);
  assert.equal(req({ kind: 'other', tool: 'undo', action: 'x' }).status, 400);
  assert.equal(req({ kind: 'event', tool: 'not-a-tool', action: 'x' }).status, 400);
  assert.equal(req({ kind: 'event', tool: 'undo', action: 'Has Caps' }).status, 400);
  assert.equal(req({ kind: 'event', tool: 'undo', action: 'a'.repeat(65) }).status, 400);
  assert.equal(req({ kind: 'event', tool: 'undo', action: 'x', message: 'hi' }).status, 400);
  assert.equal(req({ kind: 'feedback', tool: 'undo', message: '   ' }).status, 400);
  assert.equal(req({ kind: 'feedback', tool: 'undo', message: 'm'.repeat(2001) }).status, 400);
  assert.equal(req({ kind: 'feedback', tool: 'undo', message: 'ok', contact: 'c'.repeat(201) }).status, 400);
  assert.equal(req('x'.repeat(9000)).status, 413);
});

test('signal: only this site and the three external tools may post', () => {
  for (const o of EXTERNAL_ORIGINS) {
    const r = req({ kind: 'event', tool: 'gut-check', action: 'vote' }, { origin: o });
    assert.equal(r.status, 202, o);
    assert.equal(r.cors, o);
  }
  assert.deepEqual(originPolicy('https://hoplight.ai', 'hoplight.ai'), { allowed: true, cors: null });
  assert.deepEqual(originPolicy(null, 'hoplight.ai'), { allowed: true, cors: null });
  const bad = req({ kind: 'event', tool: 'undo', action: 'x' }, { origin: 'https://evil.example' });
  assert.equal(bad.status, 403);
  assert.equal(bad.forward, null);
});

test('signal: over the limit answers 429 and forwards nothing', () => {
  const seen = [];
  const r = req({ kind: 'feedback', tool: 'undo', message: 'x' }, {}, (kind, key) => (seen.push([kind, key]), false));
  assert.equal(r.status, 429);
  assert.equal(r.forward, null);
  assert.equal(seen[0][0], 'feedback');
  assert.match(seen[0][1], /^[0-9a-f]{16}$/, 'the limiter is keyed on the hash, not the address');
});

test('kit: public/kit/signal.js is under 3KB and exposes track and feedback', () => {
  const p = `${ROOT}public/kit/signal.js`;
  assert.ok(statSync(p).size < 3072, `kit is ${statSync(p).size} bytes`);
  const src = readFileSync(p, 'utf8');
  assert.match(src, /window\.hoplightSignal\s*=\s*\{\s*track: track, feedback: feedback\s*\}/);
  assert.ok(!/import |require\(/.test(src), 'the kit has no dependencies');
});

// The store is quick-tools POST /api/tool-signal (lane signal1, 2026-11-07). Its validator refuses
// any field outside these ten, any tool outside these seven, and any action with an underscore.
const STORE_FIELDS = ['kind', 'tool', 'action', 'props', 'message', 'contact', 'visitor_hash', 'country', 'region', 'path'];
const STORE_TOOLS = ['revenge-or-justice', 'undo', 'which-ai', 'gut-check', 'rumi-espanol', 'letters', 'portfolio'];
const STORE_ACTION = /^[a-z0-9][a-z0-9._:-]*$/;

test('store: the forwarded body carries only the store\'s fields and names', () => {
  const ev = req({ kind: 'event', tool: 'which-ai-should-i-use', action: 'answer', props: { step: 2 } }, { 'x-vercel-ip-country': 'US' });
  const b = storeBody(ev.forward);
  assert.equal(b.tool, 'which-ai');
  assert.ok(Object.keys(b).every((k) => STORE_FIELDS.includes(k)), Object.keys(b).join(','));
  assert.ok(!('message' in b) && !('contact' in b), 'an event carries no message or contact');
  assert.ok(!('at' in b));
  const fb = storeBody(req({ kind: 'feedback', tool: 'rumi', message: 'ok' }).forward);
  assert.equal(fb.tool, 'rumi-espanol');
  assert.equal(fb.message, 'ok');
  for (const t of SIGNAL_TOOLS) assert.ok(STORE_TOOLS.includes(storeBody({ ...ev.forward, tool: t }).tool), t);
  assert.equal(req({ kind: 'event', tool: 'undo', action: 'copy_link' }).status, 400, 'underscore actions are refused here too');
});

test('store: every action name the site sends passes both rules', () => {
  const src = execFileSync('git', ['grep', '-hoE', "(track\\(['\"][a-z0-9._:-]+['\"]|action[=:] ?\\{?['\"][a-z0-9_.:-]+['\"])", '--', 'src'], { cwd: ROOT, encoding: 'utf8' });
  const names = [...src.matchAll(/['"]([a-z0-9_.:-]+)['"]/g)].map((m) => m[1]);
  assert.ok(names.length >= 10, `found ${names.length} action names`);
  for (const n of names) {
    assert.match(n, ACTION_RE, n);
    assert.match(n, STORE_ACTION, n);
  }
});
