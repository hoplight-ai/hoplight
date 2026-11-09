// The Which AI tool's facts (src/data/which-ai.ts): every row well formed, and the check not older than
// REFRESH_DAYS. Whit, 2026-11-09: "it's definitely out of date ... we probably need to set up some sort
// of schedule task that goes about refreshing this tool." The monthly refresh resets CHECKED_AT; if it
// stops running, this test goes red in CI before the page goes stale in public.
// Run: node --test scripts/which-ai-data.test.mjs (part of npm test).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { EXPOSURE, CHECKED_AT, REFRESH_DAYS, SOURCES, OPT_OUT_NOTES, TEAM_NOTES } from '../src/data/which-ai.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEVELS = new Set(['red', 'yellow', 'green']);

test('every tier has one cell per column, a known level and short text', () => {
  for (const p of EXPOSURE.platforms) {
    assert.ok(p.name && p.company && p.models, `${p.name}: name, company and models`);
    assert.ok(p.tiers.length >= 2, `${p.name}: at least two tiers`);
    for (const t of p.tiers) {
      assert.equal(t.cells.length, EXPOSURE.columns.length, `${p.name} ${t.name}: cell count`);
      assert.ok(t.price, `${p.name} ${t.name}: price`);
      for (const c of t.cells) {
        assert.ok(LEVELS.has(c.level), `${p.name} ${t.name}: level ${c.level}`);
        assert.ok(c.text && c.text.length <= 24, `${p.name} ${t.name}: "${c.text}" is one short phrase`);
      }
    }
  }
});

test('each platform has its notes and at least one source page', () => {
  for (const p of EXPOSURE.platforms) {
    assert.ok(OPT_OUT_NOTES[p.name], `${p.name}: opt-out note`);
    assert.ok(TEAM_NOTES[p.name], `${p.name}: team note`);
    assert.ok(SOURCES.some((s) => s.company === p.company), `${p.name}: a source page`);
  }
  for (const s of SOURCES) assert.match(s.url, /^https:\/\//, `${s.label}: absolute https link`);
});

test(`the facts were checked within the last ${REFRESH_DAYS} days`, () => {
  assert.match(CHECKED_AT, /^\d{4}-\d{2}-\d{2}$/);
  const age = (Date.now() - Date.parse(`${CHECKED_AT}T00:00:00Z`)) / 86400000;
  assert.ok(age >= -1, `CHECKED_AT ${CHECKED_AT} is in the future`);
  assert.ok(age <= REFRESH_DAYS, `CHECKED_AT ${CHECKED_AT} is ${Math.floor(age)} days old: run the Which AI refresh (scripts/which-ai-refresh.md)`);
});

test('no em dash and no stale plan names in what the page shows', () => {
  const files = ['src/data/which-ai.ts', 'src/app/(main)/tools/which-ai/WhichAiTool.tsx'];
  for (const f of files) {
    const text = readFileSync(path.join(ROOT, f), 'utf8');
    assert.ok(!text.includes('—'), `${f}: em dash`);
    for (const stale of ['Gemini Advanced', 'ChatGPT Team', 'DALL-E']) {
      assert.ok(!text.includes(stale), `${f}: stale name "${stale}"`);
    }
  }
});
