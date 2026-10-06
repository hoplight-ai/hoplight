// Guards the /api/og route against GHSA-vcvr-r3jv-pc5j (CVE-2026-94545): remote code execution in
// next/og ImageResponse on the Node runtime when attacker-controlled values reach the rendered SVG.
// Two assertions: the installed next is patched (>= 16.3.6), and the route clamps ?title= and ?sub=
// before rendering.
//
// A Next.js route file may only export route fields (GET, runtime, ...), so the clamp cannot be
// exported for import. The test reads the route source as text, cuts the block between the
// OG-CLAMP-START / OG-CLAMP-END markers, strips the TypeScript types with node:module, and
// evaluates it. What runs here is the exact code the route ships.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

function parseVersion(v) {
  const [major, minor, patch] = v.split('-')[0].split('.').map(Number);
  return { major, minor, patch };
}

test('og route: installed next is at least 16.3.6 (patched for GHSA-vcvr-r3jv-pc5j)', () => {
  const pkg = JSON.parse(readFileSync(`${root}node_modules/next/package.json`, 'utf8'));
  const v = parseVersion(pkg.version);
  const ok =
    v.major > 16 ||
    (v.major === 16 && (v.minor > 3 || (v.minor === 3 && v.patch >= 6)));
  assert.ok(ok, `installed next is ${pkg.version}, needs >= 16.3.6`);
});

function loadClamp() {
  const src = readFileSync(`${root}src/app/api/og/route.tsx`, 'utf8');
  const start = src.indexOf('// OG-CLAMP-START');
  const end = src.indexOf('// OG-CLAMP-END');
  assert.ok(start !== -1 && end > start, 'route.tsx must carry OG-CLAMP-START / OG-CLAMP-END markers around the clamp');
  const block = src.slice(start, end);
  const js = stripTypeScriptTypes(block);
  return new Function(`${js}\nreturn { clampText, TITLE_MAX, SUB_MAX };`)();
}

test('og route: clamp strips SVG-breaking characters', () => {
  const { clampText } = loadClamp();
  const out = clampText('</text><script>alert("x")</script>', 'fallback', 120);
  assert.ok(!/[<>"]/.test(out), `still contains <, > or ": ${JSON.stringify(out)}`);
  assert.ok(!out.includes('<script'), 'script tag survived');
});

test('og route: clamp strips control and non-printable characters', () => {
  const { clampText } = loadClamp();
  // Codes built with fromCharCode so no control character sits in this source file.
  const nasty = [0, 7, 31, 127, 133, 0x2028, 0x2029, 0x200b, 0x202e, 0xfeff, 10, 9];
  const input = 'a' + nasty.map((c) => String.fromCharCode(c) + 'b').join('') + 'j';
  const out = clampText(input, 'fallback', 120);
  const bad = [...out].filter((ch) => {
    const c = ch.charCodeAt(0);
    return c < 32 || (c >= 127 && c <= 159) || c === 0x2028 || c === 0x2029 || (c >= 0x200b && c <= 0x200f) || (c >= 0x202a && c <= 0x202e) || (c >= 0x2066 && c <= 0x2069) || c === 0xfeff;
  });
  assert.deepEqual(bad, [], `control characters survived: ${JSON.stringify(out)}`);
  assert.ok(out.startsWith('a') && out.includes('b') && out.includes('j'), 'printable characters must survive');
});

test('og route: clamp caps title at 120 and sub at 160 characters', () => {
  const { clampText, TITLE_MAX, SUB_MAX } = loadClamp();
  assert.equal(TITLE_MAX, 120);
  assert.equal(SUB_MAX, 160);
  assert.equal(clampText('x'.repeat(500), 'fallback', TITLE_MAX).length, 120);
  assert.equal(clampText('y'.repeat(500), 'fallback', SUB_MAX).length, 160);
});

test('og route: clamp keeps ordinary text unchanged and falls back when empty', () => {
  const { clampText } = loadClamp();
  assert.equal(clampText('Rayli: a communications platform, for labor & advocacy', 'fallback', 160), 'Rayli: a communications platform, for labor & advocacy');
  assert.equal(clampText(null, 'Hoplight', 120), 'Hoplight');
  assert.equal(clampText('', 'Hoplight', 120), 'Hoplight');
  assert.equal(clampText('<>"', 'Hoplight', 120), 'Hoplight');
});
