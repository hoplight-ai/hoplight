// Revenge or Justice share links (src/lib/rj-share.ts, 2026-11-09): a link carries its own signed reading, so
// the share page and its card can trust it, and an edited link is refused so nobody can put a verdict in
// Hoplight's mouth that the grader never gave.
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.PRIVATE_SITE_PASSWORD = 'test-password';
const s = await import('../src/lib/rj-share.ts');

const reading = { u: 'https://townhall.com/news/a', t: 'Jamie Raskin Vows to Lower Costs', o: 'Townhall', h: 'townhall.com', s: 21, v: 'retribution', l: 'It sounds like revenge: it promises to go after named firms.', w: 'The whole text', d: '2026-11-09' };

test('a minted link opens to the same reading', () => {
  const token = s.encodeShare(reading);
  assert.ok(token && token.includes('.'));
  assert.deepEqual(s.decodeShare(token), reading);
});

test('a link stays short enough to paste', () => {
  const token = s.encodeShare({ ...reading, t: 'x'.repeat(240), l: 'y '.repeat(200) });
  assert.ok(s.shareUrl(token).length < 1600, 'the URL is ' + s.shareUrl(token).length + ' characters');
});

test('an edited link is refused', () => {
  const token = s.encodeShare(reading);
  const [data, sig] = token.split('.');
  const flipped = (data[5] === 'A' ? 'B' : 'A');
  assert.equal(s.decodeShare(data.slice(0, 5) + flipped + data.slice(6) + '.' + sig), null);
  assert.equal(s.decodeShare(data + '.' + sig.slice(0, -2) + 'AA'), null);
  assert.equal(s.decodeShare('nonsense'), null);
});

test('a link signed with another key is refused', () => {
  const token = s.encodeShare(reading);
  process.env.PRIVATE_SITE_PASSWORD = 'another-password';
  assert.equal(s.decodeShare(token), null);
  process.env.PRIVATE_SITE_PASSWORD = 'test-password';
});

test('with no key, nothing is minted and nothing is trusted', () => {
  const token = s.encodeShare(reading);
  delete process.env.PRIVATE_SITE_PASSWORD;
  assert.equal(s.encodeShare(reading), null);
  assert.equal(s.decodeShare(token), null);
  process.env.PRIVATE_SITE_PASSWORD = 'test-password';
});

test('the page says revenge, never retribution, and reads the score the tool does', () => {
  assert.equal(s.verdictWord('retribution'), 'Leans revenge');
  assert.equal(s.revengeWords('Retribution and retribution'), 'Revenge and revenge');
  assert.equal(s.sideOf(38), 'revenge');
  assert.equal(s.sideOf(39), 'mixed');
  assert.equal(s.sideOf(62), 'justice');
});
