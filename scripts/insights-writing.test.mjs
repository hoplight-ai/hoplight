// Writing on /insights comes from Whit's Substack feed (PORTSPLIT1 round two, 2026-11-07: "may be tied into
// my writings or like a blog or a Substack connection"), refreshed hourly, and falls back to the hand-kept
// list when the feed fails, so the Writing section is never empty. Every test here runs on a saved copy of
// the feed (scripts/fixtures/substack-feed-2026-11-07.xml, read from the live feed that day with each post's
// body left out) and an injected fetch; none touches the network.
// Run: node --test scripts/insights-writing.test.mjs (part of npm test).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { FEED, parseFeed, latestWriting } from '../src/lib/substack.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SAMPLE = readFileSync(path.join(ROOT, 'scripts/fixtures/substack-feed-2026-11-07.xml'), 'utf8');
const FALLBACK = [{ kind: 'Essay', title: 'Hand-kept essay', line: 'Substack', href: 'https://whitpendergast.substack.com/p/x', external: true, iso: '2026-01-01', shown: 'Jan 1, 2026' }];

const answer = (body, status = 200) => async (url, init) => {
  answer.calls.push({ url, init });
  return new Response(body, { status });
};
answer.calls = [];

test('parseFeed reads the saved feed: two essays, newest first, with link and date', () => {
  const items = parseFeed(SAMPLE);
  assert.deepEqual(items.map((i) => i.title), ['Are We Engineering Groupthink at Civilization Scale?', 'The Wrong Altitude']);
  assert.deepEqual(items[0], {
    kind: 'Essay',
    title: 'Are We Engineering Groupthink at Civilization Scale?',
    line: 'Substack',
    href: 'https://whitpendergast.substack.com/p/are-we-engineering-groupthink-at',
    external: true,
    iso: '2026-07-01',
    shown: 'Jul 1, 2026',
  });
  assert.equal(items[1].href, 'https://whitpendergast.substack.com/p/the-wrong-altitude');
  assert.equal(items[1].shown, 'Mar 5, 2026');
});

test('parseFeed sorts by date, decodes entities, skips an item with no link, and keeps at most the limit', () => {
  const xml = `<rss><channel>
    <item><title>Old &amp; slow</title><link>https://whitpendergast.substack.com/p/old</link><pubDate>Mon, 05 Jan 2026 10:00:00 GMT</pubDate></item>
    <item><title><![CDATA[New one]]></title><link>https://whitpendergast.substack.com/p/new</link><pubDate>Tue, 03 Nov 2026 10:00:00 GMT</pubDate></item>
    <item><title>No link</title><pubDate>Tue, 03 Nov 2026 10:00:00 GMT</pubDate></item>
    <item><title>Not his</title><link>https://example.com/p/x</link><pubDate>Tue, 03 Nov 2026 10:00:00 GMT</pubDate></item>
  </channel></rss>`;
  const items = parseFeed(xml);
  assert.deepEqual(items.map((i) => i.title), ['New one', 'Old & slow']);
  assert.deepEqual(parseFeed(xml, 1).map((i) => i.title), ['New one']);
});

test('latestWriting asks the feed once, with an hourly refresh, and returns its essays', async () => {
  answer.calls = [];
  const items = await latestWriting(FALLBACK, answer(SAMPLE));
  assert.equal(items.length, 2);
  assert.equal(answer.calls.length, 1);
  assert.equal(answer.calls[0].url, FEED);
  assert.equal(FEED, 'https://whitpendergast.substack.com/feed');
  assert.equal(answer.calls[0].init.next.revalidate, 3600);
});

test('latestWriting falls back to the hand-kept list when the feed fails, errors or is empty', async () => {
  assert.deepEqual(await latestWriting(FALLBACK, answer('', 503)), FALLBACK);
  assert.deepEqual(await latestWriting(FALLBACK, answer('<rss><channel></channel></rss>')), FALLBACK);
  assert.deepEqual(await latestWriting(FALLBACK, answer('not xml at all')), FALLBACK);
  assert.deepEqual(await latestWriting(FALLBACK, async () => { throw new Error('offline'); }), FALLBACK);
});

test('the Insights page reads Writing through latestWriting, with the hand-kept list as its fallback', () => {
  const page = readFileSync(path.join(ROOT, 'src/app/(main)/insights/page.tsx'), 'utf8');
  assert.match(page, /latestWriting\(WRITING\)/);
  assert.match(page, /export const revalidate = 3600;/);
});

const BUILT = ['.next/server/app/insights.html', '.next/server/app/(main)/insights.html']
  .map((rel) => path.join(ROOT, rel))
  .find((p) => existsSync(p));

test('built: the Writing section is never empty', { skip: BUILT ? false : 'no build present' }, () => {
  const html = readFileSync(BUILT, 'utf8');
  const part = html.match(/<section[^>]*aria-labelledby="writing-title"[^>]*>([\s\S]*?)<\/section>/);
  assert.ok(part, 'no Writing section');
  assert.ok((part[1].match(/class="ptile"/g) ?? []).length >= 1, 'Writing shows no essay');
});
