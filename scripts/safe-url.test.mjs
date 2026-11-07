// The links the Revenge or Justice forwarder refuses before they reach the grader's fetch
// (src/lib/safe-url.ts). Security check SITESEC1, 2026-11-07. Run: node --test scripts/safe-url.test.mjs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicHttpUrl, LOOKS_LIKE_LINK } from '../src/lib/safe-url.ts';

const refused = (s) => assert.equal(publicHttpUrl(s).ok, false, `${s} should be refused`);
const allowed = (s) => assert.equal(publicHttpUrl(s).ok, true, `${s} should pass`);

test('safe-url: public web addresses pass, normalised', () => {
  allowed('https://www.senate.gov/about/powers-procedures/investigations/truman.htm');
  allowed('http://example.org/a?b=c');
  allowed('https://8.8.8.8/');
  assert.equal(publicHttpUrl('  https://Example.org/x ').url, 'https://example.org/x');
});

test('safe-url: only http and https', () => {
  refused('file:///etc/passwd');
  refused('gopher://example.org/');
  refused('ftp://example.org/');
  refused('javascript:alert(1)');
  refused('not a link');
  refused('');
});

test('safe-url: loopback, private, link-local and metadata addresses are refused', () => {
  refused('http://127.0.0.1:3000/');
  refused('http://127.1.2.3/');
  refused('http://10.0.0.7/');
  refused('http://172.16.0.1/');
  refused('http://172.31.255.255/');
  refused('http://192.168.1.1/');
  refused('http://169.254.169.254/latest/meta-data/');
  refused('http://100.64.0.1/');
  refused('http://0.0.0.0/');
  refused('http://224.0.0.1/');
  refused('http://metadata.google.internal/computeMetadata/v1/');
  refused('http://localhost/');
  refused('http://localhost:8080/x');
  refused('http://[::1]/');
  refused('http://[::]/');
  refused('http://[fe80::1]/');
  refused('http://[fd00::1]/');
  refused('http://[::ffff:127.0.0.1]/');
  refused('http://[::ffff:7f00:1]/');
});

test('safe-url: the numeric spellings of loopback are refused once the URL parser normalises them', () => {
  refused('http://2130706433/'); // decimal 127.0.0.1
  refused('http://0x7f000001/'); // hex
  refused('http://0177.0.0.1/'); // octal first octet
  refused('http://127.1/'); // short form
});

test('safe-url: bare machine names and private suffixes are refused', () => {
  refused('http://intranet/');
  refused('http://db.internal/');
  refused('http://printer.local/');
  refused('http://x.localhost/');
  refused('http://1.0.0.127.in-addr.arpa/');
});

test('safe-url: a sign-in inside the link is refused', () => {
  refused('https://user:pw@example.org/');
});

test('safe-url: the upstream reads a text that is one link as a link', () => {
  assert.equal(LOOKS_LIKE_LINK.test('https://example.org/story'), true);
  assert.equal(LOOKS_LIKE_LINK.test('https://example.org/story and more words'), false);
  assert.equal(LOOKS_LIKE_LINK.test('Senator Smith said'), false);
});
