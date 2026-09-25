#!/usr/bin/env node
// Test-first (L8): written and observed FAILING before scripts/check-no-drafts-public.mjs existed,
// because there was nothing to import (lane audit-funder, brief Portfolio AUDITPUB1, 2026-09-25).
// Run: `npm run test` or `node --test scripts/check-no-drafts-public.test.mjs`.
//
// The check exists because every file under public/ is served on hoplight.ai to anyone, and twice
// in two days a draft written for a named outside party went up there by an ordinary push. Whit,
// 2026-09-24: "#1 never ever put a fucking public site up without my explicity approval".
//
// Every case below builds its own tiny public/ tree in a temp folder. No real page is read.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { findDrafts, ALLOW } from './check-no-drafts-public.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'check-no-drafts-public.mjs');

function tree(files) {
  const dir = mkdtempSync(join(tmpdir(), 'no-drafts-'));
  for (const f of files) {
    mkdirSync(dirname(join(dir, f)), { recursive: true });
    writeFileSync(join(dir, f), 'x');
  }
  return dir;
}

test('a dated page, its PDF and a dated file in a subfolder are all refused', () => {
  const dir = tree([
    'og.png',
    'pme-lever.html',
    'funder-brief-2026-09-24.html',
    'funder-brief-2026-09-24.pdf',
    'home-art/night-hall-2026-09-21.jpg',
  ]);
  try {
    assert.deepEqual(findDrafts(dir, []), [
      'funder-brief-2026-09-24.html',
      'funder-brief-2026-09-24.pdf',
      'home-art/night-hall-2026-09-21.jpg',
    ]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('an allow-list entry clears every file that starts with it, and nothing else', () => {
  const dir = tree(['tokens-2026-09-20.css', 'tokens-2026-09-20-manifest.json', 'draft-2026-09-21.html']);
  try {
    const allow = [{ match: 'tokens-2026-09-20', publicFor: 'test fixture' }];
    assert.deepEqual(findDrafts(dir, allow), ['draft-2026-09-21.html']);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('a date written with spaces, as macOS names screenshots, is not a dated draft name', () => {
  const dir = tree(['screenshots/Screenshot 2026-06-26 at 14.20.19.png']);
  try {
    assert.deepEqual(findDrafts(dir, []), []);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('run as a command against a tree with a draft, it exits non-zero and names the file', () => {
  const dir = tree(['one-pager-2026-09-23.html', 'og.png']);
  try {
    const r = spawnSync(process.execPath, [SCRIPT, '--dir', dir], { encoding: 'utf8' });
    assert.equal(r.status, 1, `expected exit 1, got ${r.status}\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout + r.stderr, /one-pager-2026-09-23\.html/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('run as a command against a clean tree, it exits zero', () => {
  const dir = tree(['og.png', 'portfolio/page.html']);
  try {
    const r = spawnSync(process.execPath, [SCRIPT, '--dir', dir], { encoding: 'utf8' });
    assert.equal(r.status, 0, `expected exit 0, got ${r.status}\n${r.stdout}${r.stderr}`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('every allow-list entry says who the file is public for', () => {
  assert.ok(ALLOW.length > 0);
  for (const e of ALLOW) {
    assert.equal(typeof e.match, 'string');
    assert.match(e.match, /-\d{4}-\d{2}-\d{2}/, `${e.match}: an entry that is not a dated name allows nothing`);
    assert.ok(typeof e.publicFor === 'string' && e.publicFor.trim().length >= 10, `${e.match}: needs a publicFor line`);
  }
});
