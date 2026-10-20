#!/usr/bin/env node
// Tests for The Undo List (hoplight.ai/undo): the placement rules in src/lib/undo/classify.ts, the
// Federal Register mapper in src/lib/undo/federal-register.ts, and the copy rules the two curated
// data files must obey. Pure: no network, no server. Run: `node --test scripts/undo-classify.test.mjs`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { isCeremonial, isJustIn } from '../src/lib/undo/sections.ts';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyRulings,
  rulingMatches,
  bucketForInstrument,
  countByBucket,
  howForInstrument,
  statusFromDisposition,
  whyForInstrument,
} from '../src/lib/undo/classify.ts';
import { rowsFromFederalRegister } from '../src/lib/undo/federal-register.ts';
import { COPY, copyStrings } from '../src/lib/undo/copy.ts';
import { longDate, orderText } from '../src/lib/undo/order-text.ts';
import {
  countLocked,
  countPenInForce,
  groupByInstrument,
  groupPen,
  footnoteOf,
  howOf,
  isAlreadyDone,
  isLeave,
  isPenInForce,
  matchesQuery,
  tagOf,
  slimRow,
  whyOf,
} from '../src/lib/undo/sections.ts';
import { BUCKETS, INSTRUMENT_LABEL } from '../src/lib/undo/types.ts';
import { ISSUES, ISSUE_KEYS, ISSUE_BY_KEY } from '../src/lib/undo/issues.ts';
import { applyIssues, groupByIssue, MAX_ISSUES_PER_ROW } from '../src/lib/undo/issues-merge.ts';
import { forwardOrderText, forwardOrderView, resolveOrderItems } from '../src/lib/undo/forward-text.ts';
import { issueBars } from '../src/lib/undo/progress.ts';
import { colsFor, fieldBlocks, MAX_COLS } from '../src/lib/undo/field.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel) => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));

test('bucketForInstrument places every instrument', () => {
  const expected = {
    executive_order: 'pen',
    memorandum: 'pen',
    proclamation: 'pen',
    personnel: 'pen',
    treaty: 'pen',
    tariff: 'pen',
    other: 'pen',
    rule: 'pen-process',
    statute: 'sixty',
    cra: 'locked',
    judge: 'locked',
    pardon: 'locked',
    court: 'locked',
  };
  assert.deepEqual(Object.keys(expected).sort(), Object.keys(INSTRUMENT_LABEL).sort(), 'every instrument is covered');
  for (const [instrument, bucket] of Object.entries(expected)) {
    assert.equal(bucketForInstrument(instrument), bucket, instrument);
  }
});

test('statusFromDisposition reads the Federal Register disposition text', () => {
  assert.equal(statusFromDisposition('Revoked by EO 14148'), 'revoked');
  assert.equal(statusFromDisposition('Superseded by EO 14200'), 'revoked');
  assert.equal(statusFromDisposition(''), 'in-force');
  assert.equal(statusFromDisposition(null), 'in-force');
  assert.equal(statusFromDisposition(undefined), 'in-force');
});

const FIXTURE = {
  count: 2,
  total_pages: 1,
  next_page_url: null,
  results: [
    {
      document_number: '2025-01234',
      title: 'Initial Rescissions of Harmful Executive Orders and Actions',
      executive_order_number: 14148,
      signing_date: '2025-01-20',
      publication_date: '2025-01-28',
      html_url: 'https://www.federalregister.gov/documents/2025/01/28/2025-01234/initial-rescissions',
      disposition_notes: 'Revoked by EO 14999',
      topics: ['Executive orders'],
    },
    {
      document_number: '2025-05678',
      title: 'Another Order With No Signing Date',
      executive_order_number: '14200',
      signing_date: null,
      publication_date: '2025-03-05',
      html_url: 'https://www.federalregister.gov/documents/2025/03/05/2025-05678/another-order',
      disposition_notes: null,
    },
  ],
};

test('rowsFromFederalRegister maps a two-item fixture', () => {
  const rows = rowsFromFederalRegister(FIXTURE, 'executive_order');
  assert.equal(rows.length, 2);
  const [a, b] = rows;
  assert.equal(a.id, '2025-01234');
  assert.equal(a.number, 'EO 14148');
  assert.equal(a.date, '2025-01-20');
  assert.equal(a.bucket, 'pen');
  assert.equal(a.status, 'revoked');
  assert.equal(a.reviewed, false);
  assert.deepEqual(a.sources, [{ label: 'Federal Register', url: FIXTURE.results[0].html_url }]);
  assert.equal(b.number, 'EO 14200', 'a string executive_order_number is accepted');
  assert.equal(b.date, '2025-03-05', 'signing_date falls back to publication_date');
  assert.equal(b.status, 'in-force');
  assert.equal(b.sources[0].url, FIXTURE.results[1].html_url);
});

test('rowsFromFederalRegister numbers proclamations, leaves memoranda unnumbered, and skips junk', () => {
  const proc = rowsFromFederalRegister(
    { results: [{ document_number: 'p1', title: 'A proclamation', proclamation_number: 10886, signing_date: '2025-02-01' }] },
    'proclamation',
  );
  assert.equal(proc[0].number, 'Proclamation 10886');
  const memo = rowsFromFederalRegister(
    { results: [{ document_number: 'm1', title: 'A memorandum', signing_date: '2025-02-02' }] },
    'memorandum',
  );
  assert.equal(memo[0].number, undefined);
  assert.deepEqual(rowsFromFederalRegister(null, 'executive_order'), []);
  assert.deepEqual(rowsFromFederalRegister({ results: 'nope' }, 'executive_order'), []);
  assert.deepEqual(rowsFromFederalRegister({ results: [null, 3, { title: 'no id' }] }, 'executive_order'), []);
});

test('applyRulings overrides a matching row, appends a row ruling, marks reviewed, sorts newest first', () => {
  const auto = rowsFromFederalRegister(FIXTURE, 'executive_order');
  const rulings = [
    {
      match: { eo: 14148 },
      bucket: 'locked',
      how: 'Nothing.',
      why: 'Test override.',
      sources: [{ label: 'Test', url: 'https://example.com/ruling' }],
    },
    {
      row: { id: 'test-statute', title: 'A statute', instrument: 'statute', date: '2025-07-04', number: 'Pub. L. 119-21' },
      bucket: 'majority',
      how: 'Reconciliation.',
      why: 'Has a price tag.',
      sources: [{ label: 'Congress.gov', url: 'https://example.com/statute' }],
    },
  ];
  const out = applyRulings(auto, rulings);
  assert.equal(out.length, 3);
  assert.deepEqual(
    out.map((r) => r.id),
    ['test-statute', '2025-05678', '2025-01234'],
    'newest first',
  );
  const overridden = out.find((r) => r.id === '2025-01234');
  assert.equal(overridden.bucket, 'locked');
  assert.equal(overridden.how, 'Nothing.');
  assert.equal(overridden.reviewed, true);
  assert.equal(overridden.sources[0].url, 'https://example.com/ruling', 'ruling sources come first');
  assert.equal(overridden.sources.length, 2, 'the Federal Register source is kept');
  const added = out.find((r) => r.id === 'test-statute');
  assert.equal(added.bucket, 'majority');
  assert.equal(added.status, 'in-force');
  assert.equal(added.reviewed, true);
  const untouched = out.find((r) => r.id === '2025-05678');
  assert.equal(untouched.reviewed, false);
  assert.equal(untouched.bucket, 'pen');
});

test('countByBucket sums to the number of rows', () => {
  const auto = rowsFromFederalRegister(FIXTURE, 'executive_order');
  const out = applyRulings(auto, [
    { row: { id: 'x', title: 'X', instrument: 'judge', date: '2025-05-01' }, bucket: 'locked', how: 'h', why: 'w', sources: [] },
  ]);
  const counts = countByBucket(out);
  assert.deepEqual(Object.keys(counts).sort(), Object.keys(BUCKETS).sort());
  assert.equal(
    Object.values(counts).reduce((a, b) => a + b, 0),
    out.length,
  );
  assert.equal(counts.pen, 2);
  assert.equal(counts.locked, 1);
});

// Copy rules: CLAUDE.md (no clock words on any surface that measures people against time) and the
// house style (no em dashes). Walks every `how`, `why` and `line` string wherever it appears.
const BANNED_WORDS = [
  /days since/i,
  /overdue/i,
  /\bstale\b/i,
  /countdown/i,
  /\bdays (until|to go|left|remaining)\b/i,
  /!/,
];
const EM_DASH = '—';

function collectCopy(node, path, out) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectCopy(v, `${path}[${i}]`, out));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (typeof v === 'string' && (k === 'how' || k === 'why' || k === 'line')) out.push([`${path}.${k}`, v]);
      else collectCopy(v, `${path}.${k}`, out);
    }
  }
}

function assertCleanCopy(entries, where) {
  for (const [path, text] of entries) {
    assert.ok(!text.includes(EM_DASH), `${where} ${path} contains an em dash`);
    for (const re of BANNED_WORDS) assert.ok(!re.test(text), `${where} ${path} matches ${re}`);
  }
}

test('BUCKETS and the instrument defaults carry no em dash and no clock word', () => {
  const entries = [];
  collectCopy(BUCKETS, 'BUCKETS', entries);
  for (const [bucket, b] of Object.entries(BUCKETS)) entries.push([`BUCKETS.${bucket}.label`, b.label]);
  for (const instrument of Object.keys(INSTRUMENT_LABEL)) {
    entries.push([`howForInstrument(${instrument})`, howForInstrument(instrument)]);
    entries.push([`whyForInstrument(${instrument})`, whyForInstrument(instrument)]);
    entries.push([`INSTRUMENT_LABEL.${instrument}`, INSTRUMENT_LABEL[instrument]]);
  }
  assert.ok(entries.length > 30);
  assertCleanCopy(entries, '');
});

for (const file of ['src/data/undo/rulings.json', 'src/data/undo/curated.json']) {
  test(`${file} is an array of rulings with clean copy`, () => {
    const data = readJson(file);
    assert.ok(Array.isArray(data), 'top level is an array');
    for (const [i, r] of data.entries()) {
      assert.ok(r.match || r.row, `entry ${i} has a match or a row`);
      assert.ok(Object.hasOwn(BUCKETS, r.bucket), `entry ${i} has a known bucket`);
      assert.ok(Array.isArray(r.sources), `entry ${i} has a sources array`);
    }
    const entries = [];
    collectCopy(data, file, entries);
    assertCleanCopy(entries, file);
  });
}

test('orderText writes the whole document for an order, a proclamation and a memorandum', () => {
  assert.equal(
    orderText({ instrument: 'executive_order', title: 'Initial Rescissions of Harmful Executive Orders and Actions', date: '2025-01-20', number: 'EO 14148' }),
    'Executive Order 14148 of January 20, 2025 (Initial Rescissions of Harmful Executive Orders and Actions) is hereby revoked.',
  );
  assert.equal(
    orderText({ instrument: 'proclamation', title: 'Adjusting Imports of Steel', date: '2025-02-10', number: 'Proclamation 10896' }),
    'Proclamation 10896 of February 10, 2025 (Adjusting Imports of Steel) is hereby rescinded.',
  );
  assert.equal(
    orderText({ instrument: 'memorandum', title: 'Restoring Merit', date: '2025-12-01' }),
    'The Presidential Memorandum of December 1, 2025 (Restoring Merit) is hereby withdrawn.',
  );
});

test('orderText returns null for anything a pen alone does not finish, and tolerates a missing number', () => {
  for (const instrument of ['statute', 'rule', 'cra', 'judge', 'treaty', 'tariff', 'personnel', 'pardon', 'court', 'other']) {
    assert.equal(orderText({ instrument, title: 'T', date: '2025-05-01', number: 'EO 1' }), null, instrument);
  }
  assert.equal(
    orderText({ instrument: 'executive_order', title: 'T', date: '2025-05-01' }),
    'Executive Order of May 1, 2025 (T) is hereby revoked.',
  );
  assert.equal(longDate('2025-09-30'), 'September 30, 2025');
  assert.equal(longDate('not a date'), 'not a date');
});

const R = (over) => ({
  id: 'x', title: 'T', instrument: 'executive_order', date: '2025-01-20', bucket: 'pen', how: 'h', why: 'w',
  status: 'in-force', reviewed: true, sources: [{ label: 'a', url: 'https://example.com/a' }, { label: 'b', url: 'https://example.com/b' }], ...over,
});

test('the hero numbers: penInForce counts pen rows in force, pending or enjoined, locked counts every locked row', () => {
  const rows = [
    R({ id: '1' }),
    R({ id: '2', status: 'pending' }),
    R({ id: '3', status: 'revoked' }),
    R({ id: '4', status: 'enjoined' }),
    R({ id: '5', bucket: 'pen-process' }),
    R({ id: '6', bucket: 'locked', instrument: 'judge' }),
    R({ id: '7', bucket: 'locked', instrument: 'pardon', status: 'in-force' }),
  ];
  assert.equal(countPenInForce(rows), 3);
  assert.equal(countLocked(rows), 2);
  assert.deepEqual(rows.filter(isAlreadyDone).map((r) => r.id), ['3']);
});

test('groupPen follows the owner order, sends unnamed instruments to the last group, drops empty groups', () => {
  const rows = ['personnel', 'executive_order', 'treaty', 'rule', 'tariff', 'other', 'memorandum', 'proclamation'].map((instrument) => R({ id: instrument, instrument }));
  const groups = groupPen(rows);
  assert.deepEqual(groups.map((g) => g.label), ['Executive orders', 'Proclamations', 'Memoranda', 'Tariffs', 'Things America quit', 'Appointments and agency moves']);
  assert.deepEqual(groups[5].rows.map((r) => r.id).sort(), ['other', 'personnel', 'rule']);
  assert.equal(groups.reduce((n, g) => n + g.rows.length, 0), rows.length, 'no row falls out');
  assert.deepEqual(groupPen([R({ instrument: 'tariff' })]).map((g) => g.key), ['tariff']);
  const locked = groupByInstrument([R({ instrument: 'pardon' }), R({ instrument: 'judge' }), R({ instrument: 'judge' })], INSTRUMENT_LABEL);
  assert.deepEqual(locked.map((g) => [g.key, g.rows.length]), [['judge', 2], ['pardon', 1]]);
});

test('matchesQuery reads title or number, ignoring case and space', () => {
  assert.ok(matchesQuery({ title: 'Tariff on steel' }, ' TARIFF '));
  assert.ok(matchesQuery({ title: 'x', number: 'EO 14148' }, 'eo 14148'));
  assert.ok(!matchesQuery({ title: 'x' }, 'zzz'));
  assert.ok(matchesQuery({ title: 'x' }, ''));
});

test('slimRow drops boilerplate from unreviewed rows and the client rebuilds it exactly', () => {
  const auto = rowsFromFederalRegister(FIXTURE, 'executive_order')[0];
  auto.agency = 'Agency';
  auto.topics = ['t'];
  const slim = slimRow(auto);
  assert.equal(slim.how, undefined);
  assert.equal(slim.why, undefined);
  assert.equal(howOf(slim), auto.how);
  assert.equal(whyOf(slim), auto.why);
  assert.ok(!('agency' in slim) && !('topics' in slim));
  assert.equal(slim.sources.length, 1);
  // A reviewed row keeps its own words, even when they equal the default.
  const kept = slimRow(R({ how: 'Sign an order revoking it.' }));
  assert.equal(howOf(kept), 'Sign an order revoking it.');
  assert.equal(whyOf(kept), 'w');
  // An unreviewed row whose text was changed keeps it.
  const edited = slimRow({ ...auto, how: 'Something else.' });
  assert.equal(howOf(edited), 'Something else.');
});

test('the page copy carries no em dash, clock word or exclamation mark', () => {
  const entries = copyStrings();
  assert.ok(entries.length > 25, `only ${entries.length} strings found`);
  assertCleanCopy(entries, '');
  assert.equal(COPY.hero.lead.length, 2);
  assert.ok(COPY.cta.mailto.startsWith('mailto:whit@hoplight.ai'));
});

test('a commemorative proclamation is kept off the to-do list; a substantive one stays on it', () => {
  const P = (title) => ({ instrument: 'proclamation', title });
  for (const t of [
    'National Manufacturing Day, 2026',
    "Gold Star Mother's and Family's Day, 2026",
    'Patriot Day 2026, the 25th Anniversary of the September 11 Terrorist Attacks',
    'Honoring the Memory of Charlie Kirk',
    'Martin Luther King, Jr., Federal Holiday, 2026',
    'Days of Remembrance of Victims of the Holocaust, 2025',
    'National Fallen Firefighters Memorial Weekend, 2025',
    'Death of Senator Lindsey Graham',
  ]) assert.equal(isCeremonial(P(t)), true, t);
  for (const t of [
    'Adjusting Imports of Copper Into the United States',
    'Modifying the Bears Ears National Monument',
    'Restricting the Entry of Foreign Nationals To Protect the United States From Foreign Terrorists and Other National Security and Public Safety Threats',
    'Granting Pardons for Certain Offenses Related to the 2020 Presidential Election',
    'Ratepayer Protection Pledge',
    'Establishing Project Homecoming',
  ]) assert.equal(isCeremonial(P(t)), false, t);
  assert.equal(isCeremonial({ instrument: 'executive_order', title: 'National Manufacturing Day, 2026' }), false);
});

// ---- Headlines: our own line for every row (2026-10-09) -------------------------------------------

const HEADLINE_DIR = join(ROOT, 'src/data/undo/headlines');
const STATUSES = ['in-force', 'enjoined', 'vacated', 'revoked', 'expired', 'struck', 'pending'];
const VERDICTS = ['undo', 'leave'];
const MATCH_KEYS = ['eo', 'proclamation', 'document_number', 'title', 'id'];
const MIDDLE_DOT = '\u00b7';

const HEADLINE_RULING = {
  match: { eo: 14148 },
  headline: 'Cancelled dozens of Biden-era protections in one stroke',
  how: 'Restore the protections it cancelled.',
  why: 'An order that cancels other orders is only an order.',
  bucket: 'pen',
  status: 'in-force',
  verdict: 'undo',
  sources: [{ label: 'Headline source', url: 'https://example.com/headline' }],
};
const OFFICIAL = 'Initial Rescissions of Harmful Executive Orders and Actions';

test('rulingMatches reads an exact title, trimmed and case-blind, and a row id', () => {
  const [row] = rowsFromFederalRegister(FIXTURE, 'executive_order');
  assert.ok(rulingMatches({ match: { title: `  ${OFFICIAL.toUpperCase()} ` } }, row));
  assert.ok(!rulingMatches({ match: { title: 'Initial Rescissions' } }, row), 'a partial title does not match');
  assert.ok(rulingMatches({ match: { id: '2025-01234' } }, row));
  assert.ok(!rulingMatches({ match: { id: '2025-0123' } }, row));
  assert.ok(!rulingMatches({ bucket: 'pen' }, row), 'no match key, no match');
});

test('a headline ruling puts our line in title and the official title in official', () => {
  const auto = rowsFromFederalRegister(FIXTURE, 'executive_order');
  const out = applyRulings(auto, [HEADLINE_RULING]);
  const row = out.find((r) => r.id === '2025-01234');
  assert.equal(row.title, HEADLINE_RULING.headline);
  assert.equal(row.official, OFFICIAL);
  assert.equal(row.verdict, 'undo');
  assert.equal(row.unsure, undefined);
  assert.equal(row.reviewed, true);
  assert.equal(row.how, HEADLINE_RULING.how);
  assert.equal(row.sources[0].url, 'https://example.com/headline');
  const untouched = out.find((r) => r.id === '2025-05678');
  assert.equal(untouched.official, undefined);
  assert.equal(untouched.title, 'Another Order With No Signing Date');
});

test('a later ruling overrides an earlier one, and official keeps the first title', () => {
  const auto = rowsFromFederalRegister(FIXTURE, 'executive_order');
  const plain = { match: { eo: 14148 }, bucket: 'locked', how: 'Nothing.', why: 'Plain ruling.', sources: [{ label: 'p', url: 'https://example.com/plain' }] };
  const later = { ...HEADLINE_RULING, match: { title: OFFICIAL }, verdict: 'leave', unsure: true };
  const evenLater = { ...HEADLINE_RULING, match: { eo: 14148 }, headline: 'A second, surer line', unsure: undefined };
  let row = applyRulings(auto, [plain, later]).find((r) => r.id === '2025-01234');
  assert.equal(row.bucket, 'pen', 'the headline ruling written after the plain one wins');
  assert.equal(row.title, later.headline);
  assert.equal(row.verdict, 'leave');
  assert.equal(row.unsure, true);
  assert.equal(row.sources.length, 3, 'headline source, plain source, Federal Register source');
  row = applyRulings(auto, [later, plain]).find((r) => r.id === '2025-01234');
  assert.equal(row.bucket, 'locked', 'the plain ruling written last wins on the fields it sets');
  assert.equal(row.title, later.headline, 'and leaves the headline alone');
  assert.equal(row.verdict, 'leave', 'a ruling that does not name a verdict keeps the earlier one');
  row = applyRulings(auto, [later, evenLater]).find((r) => r.id === '2025-01234');
  assert.equal(row.title, 'A second, surer line');
  assert.equal(row.official, OFFICIAL, 'official is the administration title, not the first headline');
  assert.equal(row.unsure, undefined, 'a later headline ruling clears unsure');
  assert.equal(row.sources.filter((x) => x.url === 'https://example.com/headline').length, 1, 'sources are not doubled');
});

test('a row ruling can be re-worded by a later id ruling, wherever it sits in the array', () => {
  const rowRuling = {
    row: { id: 'cur-1', title: 'CRA repeal: Test rule', instrument: 'cra', date: '2025-03-14', number: 'Pub. L. 119-2' },
    bucket: 'locked', how: 'Only Congress.', why: 'CRA.', sources: [{ label: 'c', url: 'https://example.com/c' }],
  };
  const idRuling = { match: { id: 'cur-1' }, headline: 'Let polluters off the hook', bucket: 'locked', how: 'Only Congress restores it.', why: 'CRA.', verdict: 'undo', sources: [] };
  for (const order of [[rowRuling, idRuling], [idRuling, rowRuling]]) {
    const out = applyRulings([], order);
    assert.equal(out.length, 1);
    assert.equal(out[0].title, 'Let polluters off the hook');
    assert.equal(out[0].official, undefined, 'a curated row has no official title: its old title was ours');
    assert.equal(out[0].how, 'Only Congress restores it.');
    assert.equal(out[0].sources.length, 1, 'an empty sources list keeps the row sources');
  }
});

test('isLeave pulls a row out of Before lunch, the hero number and the locked number', () => {
  const rows = [
    R({ id: 'a' }),
    R({ id: 'b', verdict: 'leave' }),
    R({ id: 'c', verdict: 'undo' }),
    R({ id: 'd', bucket: 'locked', instrument: 'judge' }),
    R({ id: 'e', bucket: 'locked', instrument: 'judge', verdict: 'leave' }),
    R({ id: 'f', status: 'revoked', verdict: 'leave' }),
  ];
  assert.equal(isLeave(rows[1]), true);
  assert.equal(isLeave(rows[0]), false);
  assert.equal(isLeave({}), false);
  assert.deepEqual(rows.filter(isPenInForce).map((r) => r.id), ['a', 'c']);
  assert.equal(countPenInForce(rows), 2);
  assert.equal(countLocked(rows), 1);
  assert.deepEqual(rows.filter(isAlreadyDone).map((r) => r.id), [], 'a leave row is not also "already done"');
});

test('orderText names the order by its official title when we re-worded it', () => {
  assert.equal(
    orderText({ instrument: 'executive_order', title: 'Cancelled dozens of protections', official: OFFICIAL, date: '2025-01-20', number: 'EO 14148' }),
    `Executive Order 14148 of January 20, 2025 (${OFFICIAL}) is hereby revoked.`,
  );
  assert.equal(
    orderText({ instrument: 'memorandum', title: 'Our line', official: 'Their line', date: '2025-12-01' }),
    'The Presidential Memorandum of December 1, 2025 (Their line) is hereby withdrawn.',
  );
});

test('footnoteOf joins number, date and the official title with middle dots', () => {
  assert.equal(footnoteOf({ number: 'EO 14148', date: '2025-01-20', official: OFFICIAL }), `EO 14148 ${MIDDLE_DOT} 2025-01-20 ${MIDDLE_DOT} Officially: ${OFFICIAL}`);
  assert.equal(footnoteOf({ number: 'EO 14148', date: '2025-01-20' }), `EO 14148 ${MIDDLE_DOT} 2025-01-20`);
  assert.equal(footnoteOf({ date: '2025-01-20', official: 'X' }), `2025-01-20 ${MIDDLE_DOT} Officially: X`);
  assert.ok(!footnoteOf({ number: 'EO 1', date: '2025-01-20', official: 'X' }).includes('-- '));
});

test('mechanism tags: one signature, a new rule, 51 votes, 60 votes, nothing for locked', () => {
  assert.equal(tagOf('pen'), 'one signature');
  assert.equal(tagOf('pen-process'), 'a new rule');
  assert.equal(tagOf('majority'), '51 votes');
  assert.equal(tagOf('sixty'), '60 votes');
  assert.equal(tagOf('locked'), null);
});

test('slimRow ships official, verdict and unsure, and search finds the official title', () => {
  const slim = slimRow(R({ official: 'Their title', verdict: 'leave', unsure: true }));
  assert.equal(slim.official, 'Their title');
  assert.equal(slim.verdict, 'leave');
  assert.equal(slim.unsure, true);
  const plain = slimRow(R());
  assert.ok(!('official' in plain) && !('verdict' in plain) && !('unsure' in plain));
  assert.ok(matchesQuery({ title: 'Our line', official: 'Protecting The Meaning Of Citizenship' }, 'meaning of citizenship'));
  assert.ok(!matchesQuery({ title: 'Our line' }, 'meaning'));
});

test('the "Leave these" and mechanism-tag copy follows the house rules', () => {
  assert.equal(COPY.leave.title, 'Leave these');
  assert.equal(
    COPY.leave.intro,
    'Orders a Democratic president would keep or that change nothing worth the ink. Listed so the count is honest.',
  );
  assert.deepEqual(Object.values(COPY.tags).sort(), ['51 votes', '60 votes', 'a new rule', 'one signature']);
});

// The headline files other lanes write. Whatever exists is walked; the folder may be empty.
const headlineFiles = existsSync(HEADLINE_DIR) ? readdirSync(HEADLINE_DIR).filter((f) => f.endsWith('.json')).sort() : [];
const curatedIds = new Set(readJson('src/data/undo/curated.json').map((r) => r.row?.id).filter(Boolean));

test('every headline file is imported by headlines/index.ts, so a gap is a build error', () => {
  const index = readFileSync(join(HEADLINE_DIR, 'index.ts'), 'utf8');
  for (const f of headlineFiles) assert.ok(index.includes(`'./${f}'`), `${f} is not imported in src/data/undo/headlines/index.ts`);
});

for (const f of headlineFiles) {
  test(`headlines/${f}: valid entries, plain copy, headline <= 80 chars, how <= 60 chars`, () => {
    const data = readJson(`src/data/undo/headlines/${f}`);
    assert.ok(Array.isArray(data), 'top level is an array');
    for (const [i, e] of data.entries()) {
      const at = `${f}[${i}]`;
      assert.ok(e.match && typeof e.match === 'object', `${at} has a match`);
      const keys = Object.keys(e.match);
      assert.equal(keys.length, 1, `${at} match names exactly one key`);
      assert.ok(MATCH_KEYS.includes(keys[0]), `${at} match key ${keys[0]} is known`);
      if (keys[0] === 'id') assert.ok(curatedIds.has(e.match.id), `${at} id ${e.match.id} is not a curated row id`);
      assert.equal(typeof e.headline, 'string', `${at} has a headline`);
      assert.ok(e.headline.trim().length > 0 && e.headline.length <= 80, `${at} headline is ${e.headline.length} chars`);
      assert.equal(typeof e.how, 'string', `${at} has a how`);
      assert.ok(e.how.trim().length > 0 && e.how.length <= 60, `${at} how is ${e.how.length} chars`);
      assert.equal(typeof e.why, 'string', `${at} has a why`);
      assert.ok(Object.hasOwn(BUCKETS, e.bucket), `${at} bucket ${e.bucket}`);
      assert.ok(STATUSES.includes(e.status), `${at} status ${e.status}`);
      assert.ok(VERDICTS.includes(e.verdict), `${at} verdict ${e.verdict}`);
      assert.ok(Array.isArray(e.sources), `${at} has a sources array`);
      for (const src of e.sources) assert.ok(src.label && /^https?:\/\//.test(src.url), `${at} source has a label and a url`);
      if (e.unsure !== undefined) assert.equal(e.unsure, true, `${at} unsure is true or absent`);
    }
    const entries = [];
    for (const [i, e] of data.entries()) {
      for (const k of ['headline', 'how', 'why']) entries.push([`${f}[${i}].${k}`, e[k] ?? '']);
    }
    assertCleanCopy(entries, `headlines/${f}`);
  });
}

test('a feed row with no headline yet waits in Just in and is out of the pen count', () => {
  const fresh = R({ id: '2026-99999', reviewed: false });
  const written = R({ id: '2026-99998', reviewed: false, title: 'National Manufacturing Day, 2026', instrument: 'proclamation' });
  assert.equal(isJustIn(fresh), true);
  assert.equal(isJustIn(written), false, 'a commemorative proclamation has its own group');
  assert.equal(isJustIn(R({ reviewed: true })), false);
  assert.equal(isJustIn(R({ reviewed: false, bucket: 'locked', instrument: 'judge' })), false);
  assert.equal(countPenInForce([fresh, R({ id: 'ok' })]), 1);
});

// ---- Issues, progress by issue, Forward Orders (2026-10-15) ----------------------------------------

const ISSUE_DIR = join(ROOT, 'src/data/undo/issues');
const issueFiles = existsSync(ISSUE_DIR) ? readdirSync(ISSUE_DIR).filter((f) => f.endsWith('.json')).sort() : [];
const FORWARD_FILE = 'src/data/undo/forward.json';
const forwardData = existsSync(join(ROOT, FORWARD_FILE)) ? readJson(FORWARD_FILE) : [];
const FR_NUMBER = /^\d{4}-\d+$/;
const BANNED_IN_HEADINGS = /\b(reverse|reversal|roll(?:ing)? back|rollback|restor\w*)\b/i;

test('every issue in ISSUES has a key, a label and a one-line description, and none repeats', () => {
  assert.equal(ISSUES.length, 16);
  assert.equal(new Set(ISSUE_KEYS).size, ISSUES.length, 'keys are unique');
  assert.equal(new Set(ISSUES.map((i) => i.label)).size, ISSUES.length, 'labels are unique');
  for (const i of ISSUES) {
    assert.ok(i.key && typeof i.label === 'string' && i.label.trim().length > 0, `${i.key} has a label`);
    assert.ok(typeof i.line === 'string' && i.line.trim().length > 0, `${i.key} has a line`);
    assert.equal(ISSUE_BY_KEY[i.key], i);
  }
  assertCleanCopy(ISSUES.flatMap((i) => [[`${i.key}.label`, i.label], [`${i.key}.line`, i.line]]), 'ISSUES');
});

const ROWS = [
  R({ id: '2025-00001', number: 'EO 14160', title: 'Protecting the Meaning and Value of American Citizenship' }),
  R({ id: '2025-00002', instrument: 'proclamation', number: 'Proclamation 10888', title: 'Adjusting Imports of Steel', date: '2025-02-10' }),
  R({ id: '2025-00003', instrument: 'memorandum', title: 'Restoring Merit in Hiring', official: 'Memorandum on Merit', date: '2025-06-07' }),
  R({ id: 'tariff-canada', instrument: 'tariff', title: 'Tariffs on Canadian goods', date: '2025-03-04' }),
  R({ id: 'other-row', title: 'Untouched' }),
];

test('applyIssues attaches by eo, proclamation, document_number, title and id, and leaves [] otherwise', () => {
  const tags = [
    { match: { eo: 14160 }, issues: ['immigrants'] },
    { match: { proclamation: 10888 }, issues: ['prices', 'farms-rural'] },
    { match: { document_number: '2025-00003' }, issues: ['government-works'] },
    { match: { title: '  tariffs on canadian GOODS ' }, issues: ['prices'] },
    { match: { id: 'tariff-canada' }, issues: ['allies', 'prices'] },
  ];
  const out = applyIssues(ROWS, tags);
  assert.equal(out.length, ROWS.length);
  assert.deepEqual(out[0].issues, ['immigrants']);
  assert.deepEqual(out[1].issues, ['prices', 'farms-rural']);
  assert.deepEqual(out[2].issues, ['government-works']);
  assert.deepEqual(out[3].issues, ['prices', 'allies'], 'two entries hit one row: distinct keys, first entry first');
  assert.deepEqual(out[4].issues, [], 'untagged is an empty list');
  assert.ok(!('issues' in ROWS[0]), 'the input rows are not changed');
  // The memorandum also answers to its official title.
  assert.deepEqual(applyIssues(ROWS, [{ match: { title: 'Memorandum on Merit' }, issues: ['paycheck'] }])[2].issues, ['paycheck']);
  // A row never carries more than three.
  const crowded = applyIssues(ROWS.slice(0, 1), [
    { match: { eo: 14160 }, issues: ['health', 'prices', 'women'] },
    { match: { id: '2025-00001' }, issues: ['schools', 'science'] },
  ]);
  assert.deepEqual(crowded[0].issues, ['health', 'prices', 'women']);
  assert.equal(MAX_ISSUES_PER_ROW, 3);
});

test('slimRow ships issues when a row has them and leaves them out when it has none', () => {
  assert.deepEqual(slimRow(R({ issues: ['health', 'women'] })).issues, ['health', 'women']);
  assert.ok(!('issues' in slimRow(R({ issues: [] }))));
  assert.ok(!('issues' in slimRow(R())));
});

test('groupByIssue puts a row under its first issue only, in table order, untagged last', () => {
  const rows = [
    R({ id: 'a', issues: ['health', 'paycheck', 'women'] }),
    R({ id: 'b', issues: ['paycheck'] }),
    R({ id: 'c' }),
    R({ id: 'd', issues: ['women', 'health'] }),
  ];
  const groups = groupByIssue(rows);
  assert.deepEqual(groups.map((g) => [g.key, g.rows.map((r) => r.id)]), [
    ['paycheck', ['b']],
    ['health', ['a']],
    ['women', ['d']],
    ['none', ['c']],
  ]);
  assert.equal(groups.reduce((n, g) => n + g.rows.length, 0), rows.length, 'nothing doubles or drops');
  assert.deepEqual(groupByIssue([]), []);
});

test('issueBars counts each issue by what it takes, drops leave, commemorative, done and just-in rows', () => {
  const rows = [
    R({ id: 'p1', issues: ['health'] }),
    R({ id: 'p2', issues: ['health', 'women'] }),
    R({ id: 'p3', issues: ['health'], status: 'enjoined' }),
    R({ id: 'pp', issues: ['health'], bucket: 'pen-process', instrument: 'rule' }),
    R({ id: 'm1', issues: ['health'], bucket: 'majority', instrument: 'statute' }),
    R({ id: 's1', issues: ['health'], bucket: 'sixty', instrument: 'statute' }),
    R({ id: 'l1', issues: ['health'], bucket: 'locked', instrument: 'judge' }),
    R({ id: 'x-leave', issues: ['health'], verdict: 'leave' }),
    R({ id: 'x-ceremonial', issues: ['health'], instrument: 'proclamation', title: 'National Health Day, 2026' }),
    R({ id: 'x-done', issues: ['health'], status: 'revoked' }),
    R({ id: 'x-done-rule', issues: ['health'], bucket: 'pen-process', instrument: 'rule', status: 'vacated' }),
    R({ id: 'x-justin', issues: ['health'], reviewed: false }),
    R({ id: 'x-untagged' }),
    R({ id: 'w1', issues: ['women', 'women'] }),
  ];
  const bars = issueBars(rows, new Set(['p1', 'p3', 'x-done', 'not-a-row']));
  assert.deepEqual(bars.map((b) => b.key), ['health', 'women'], 'biggest first, empty issues dropped');
  const health = bars[0];
  assert.deepEqual(
    { total: health.total, pen: health.pen, process: health.process, congress: health.congress, locked: health.locked, signedPen: health.signedPen },
    { total: 7, pen: 3, process: 1, congress: 2, locked: 1, signedPen: 2 },
  );
  assert.equal(health.pen + health.process + health.congress + health.locked, health.total, 'segments add up to the total');
  assert.equal(health.label, 'Your health care');
  assert.deepEqual(
    { total: bars[1].total, pen: bars[1].pen, signedPen: bars[1].signedPen },
    { total: 2, pen: 2, signedPen: 0 },
    'a row listing an issue twice counts once, and women has p2 and w1',
  );
  assert.equal(bars[1].total, 2);
  // Ties keep the order of the table; the hero's pen count agrees with the pen column when every pen row is tagged.
  const tie = issueBars([R({ id: 't1', issues: ['women'] }), R({ id: 't2', issues: ['paycheck'] })]);
  assert.deepEqual(tie.map((b) => b.key), ['paycheck', 'women']);
  assert.deepEqual(issueBars([]), []);
});

const ORDER_ROWS = [
  R({ id: '2025-00001', number: 'EO 14160', date: '2025-01-20', title: 'Protecting the Meaning and Value of American Citizenship' }),
  R({ id: '2025-00002', instrument: 'proclamation', number: 'Proclamation 10888', title: 'Adjusting Imports of Steel', date: '2025-01-20' }),
  R({ id: '2025-00003', instrument: 'memorandum', title: 'Our line', official: 'Restoring Merit in Hiring', date: '2025-06-07' }),
  R({ id: 'tariff-canada', instrument: 'tariff', title: 'Tariffs on Canadian goods', date: '2025-03-04' }),
  R({ id: 'tariff-mexico', instrument: 'tariff', title: 'Tariffs on Mexican goods', date: '2025-03-04' }),
];
const FIXTURE_ORDER = {
  id: 'fx',
  title: 'Fair prices for what families buy',
  purpose: 'This order ends the taxes at the register.',
  issues: ['prices'],
  items: [{ eo: 14160 }, { proclamation: 10888 }, { document_number: '2025-00003' }, { id: 'tariff-canada' }, { id: 'tariff-mexico' }, { id: 'tariff-canada' }, { eo: 99999 }],
};

test('forwardOrderText writes the four sections and lists every item the way a president would name it', () => {
  const text = forwardOrderText(FIXTURE_ORDER, ORDER_ROWS);
  const parts = text.split('\n\n');
  assert.equal(parts[0], 'EXECUTIVE ORDER');
  assert.equal(parts[1], 'FAIR PRICES FOR WHAT FAMILIES BUY');
  assert.equal(parts[2], 'By the authority vested in me as President by the Constitution and the laws of the United States of America, it is hereby ordered:');
  assert.equal(parts[3], 'Section 1. Purpose. This order ends the taxes at the register.');
  assert.equal(
    parts[4],
    'Sec. 2. Revocations. The following are revoked: Executive Order 14160 of January 20, 2025, Proclamation 10888 of January 20, 2025 and the Presidential Memorandum of June 7, 2025 (Restoring Merit in Hiring). ' +
      'The heads of the relevant agencies shall, within 30 days, take all lawful steps to end the following actions: Tariffs on Canadian goods and Tariffs on Mexican goods.',
  );
  assert.ok(parts[5].startsWith('Sec. 3. Implementation. The heads of agencies shall promptly rescind any guidance, policy or rule issued to implement the actions revoked by this order'));
  assert.ok(parts[6].startsWith('Sec. 4. General Provisions. Nothing in this order shall be construed to impair the authority granted by law'));
  assert.ok(parts[6].endsWith('subject to the availability of appropriations.'));
  assert.equal(parts.length, 7);
  assert.ok(!text.includes('Tariffs on Canadian goods, Tariffs on Canadian goods'), 'an item named twice appears once');
});

test('forwardOrderText leaves out the sentence it has nothing for, and an unmatched item is skipped and counted', () => {
  const onlyAgencies = forwardOrderText({ ...FIXTURE_ORDER, items: [{ id: 'tariff-canada' }] }, ORDER_ROWS);
  assert.ok(!onlyAgencies.includes('The following are revoked'));
  assert.ok(onlyAgencies.includes('The heads of the relevant agencies shall, within 30 days'));
  const onlyOrders = forwardOrderText({ ...FIXTURE_ORDER, items: [{ eo: 14160 }] }, ORDER_ROWS);
  assert.ok(onlyOrders.includes('The following are revoked: Executive Order 14160 of January 20, 2025.'));
  assert.ok(!onlyOrders.includes('heads of the relevant agencies shall, within'));
  const resolved = resolveOrderItems(FIXTURE_ORDER, ORDER_ROWS);
  assert.equal(resolved.rows.length, 5);
  assert.equal(resolved.missing, 1, 'eo 99999 matches no row');
  assert.deepEqual(forwardOrderView(FIXTURE_ORDER, ORDER_ROWS).ids, ['2025-00001', '2025-00002', '2025-00003', 'tariff-canada', 'tariff-mexico']);
  // The page hands the browser ids; the text from ids is the text from the original match keys.
  const fromIds = forwardOrderText({ ...FIXTURE_ORDER, items: forwardOrderView(FIXTURE_ORDER, ORDER_ROWS).ids.map((id) => ({ id })) }, ORDER_ROWS);
  assert.equal(fromIds, forwardOrderText(FIXTURE_ORDER, ORDER_ROWS));
});

for (const f of issueFiles) {
  test(`issues/${f}: an array of tags with a known match, valid issue keys, one to three each`, () => {
    const data = readJson(`src/data/undo/issues/${f}`);
    assert.ok(Array.isArray(data), 'top level is an array');
    for (const [i, t] of data.entries()) {
      const at = `${f}[${i}]`;
      assert.ok(t.match && typeof t.match === 'object', `${at} has a match`);
      const keys = Object.keys(t.match);
      assert.equal(keys.length, 1, `${at} match names exactly one key`);
      assert.ok(MATCH_KEYS.includes(keys[0]), `${at} match key ${keys[0]} is known`);
      if (keys[0] === 'id') {
        assert.ok(curatedIds.has(t.match.id) || FR_NUMBER.test(t.match.id), `${at} id ${t.match.id} is neither a curated row id nor a Federal Register number`);
      }
      assert.ok(Array.isArray(t.issues), `${at} has an issues list`);
      assert.ok(t.issues.length >= 1 && t.issues.length <= 3, `${at} has ${t.issues.length} issues`);
      assert.equal(new Set(t.issues).size, t.issues.length, `${at} repeats an issue`);
      for (const k of t.issues) assert.ok(ISSUE_KEYS.includes(k), `${at} issue ${k} is not in ISSUES`);
    }
  });
}

test('every issues file is imported by issues/index.ts, so a gap is a build error', () => {
  const index = readFileSync(join(ISSUE_DIR, 'index.ts'), 'utf8');
  for (const f of issueFiles) assert.ok(index.includes(`'./${f}'`), `${f} is not imported in src/data/undo/issues/index.ts`);
});

test('forward.json: every order has a title, a purpose, one to three issues, real items, and no item is in two orders', () => {
  assert.ok(Array.isArray(forwardData), 'top level is an array');
  const seenIds = new Set();
  const seenItems = new Map();
  for (const [i, o] of forwardData.entries()) {
    const at = `forward.json[${i}]`;
    assert.ok(typeof o.id === 'string' && o.id.length > 0 && !seenIds.has(o.id), `${at} has a unique id`);
    seenIds.add(o.id);
    assert.ok(typeof o.title === 'string' && o.title.trim().length > 0, `${at} has a title`);
    assert.ok(typeof o.purpose === 'string' && o.purpose.trim().length > 0, `${at} has a purpose`);
    assert.ok(Array.isArray(o.issues) && o.issues.length >= 1 && o.issues.length <= 3, `${at} has one to three issues`);
    for (const k of o.issues) assert.ok(ISSUE_KEYS.includes(k), `${at} issue ${k} is not in ISSUES`);
    assert.ok(Array.isArray(o.items) && o.items.length > 0, `${at} has items`);
    for (const [j, m] of o.items.entries()) {
      const keys = Object.keys(m);
      assert.equal(keys.length, 1, `${at}.items[${j}] names exactly one key`);
      assert.ok(MATCH_KEYS.includes(keys[0]), `${at}.items[${j}] key ${keys[0]} is known`);
      if (keys[0] === 'id') assert.ok(curatedIds.has(m.id) || FR_NUMBER.test(m.id), `${at}.items[${j}] id ${m.id} is not a row id`);
      const sig = `${keys[0]}:${String(m[keys[0]]).trim().toLowerCase()}`;
      assert.ok(!seenItems.has(sig), `${at}.items[${j}] ${sig} is also in order ${seenItems.get(sig)}`);
      seenItems.set(sig, o.id);
    }
    assert.ok(!BANNED_IN_HEADINGS.test(o.title), `${at} title says reverse, roll back or restore`);
    assertCleanCopy([[`${at}.title`, o.title], [`${at}.purpose`, o.purpose]], FORWARD_FILE);
  }
});

test('the new page copy follows the house rules: spelled heading, no reverse, roll back or restore in a heading', () => {
  assert.equal(COPY.forward.title(12), 'Twelve orders, one afternoon');
  assert.equal(COPY.forward.title(13), 'Thirteen orders, one afternoon');
  assert.equal(COPY.forward.title(1), 'One order, one afternoon');
  assert.equal(COPY.forward.title(21), '21 orders, one afternoon');
  for (const [path, text] of [
    ['land.title', COPY.land.title],
    ['forward.title(12)', COPY.forward.title(12)],
    ['forward.title(13)', COPY.forward.title(13)],
    ['forward.draftShow', COPY.forward.draftShow],
    ['forward.sign', COPY.forward.sign],
  ]) assert.ok(!BANNED_IN_HEADINGS.test(text), `${path} says reverse, roll back or restore`);
  assert.ok(COPY.land.intro.startsWith('Every item, by who feels it. The gold is what one signature fixes.'));
  assert.equal(COPY.land.countLabel(22, 41), '22 of 41 by pen');
  assert.equal(COPY.forward.undoes(41), 'undoes 41 items');
  assert.equal(COPY.forward.undoes(1), 'undoes 1 item');
  assert.equal(COPY.forward.footnote(41), '41 items, one signature.');
  assert.ok(COPY.land.bar('Your health care', 7, 3, 1, 2, 1, 2).includes('3 by a pen, 1 by a pen then a process, 2 need Congress, 1 locked'));
});

test('the signature field: every pen item sits in exactly one block, orders first, strays last', () => {
  const orders = [
    { id: 'o1', title: 'One', issues: ['health'], ids: ['a', 'b', 'c'] },
    { id: 'o2', title: 'Two', issues: ['prices'], ids: ['d', 'x', 'b'] },
    { id: 'o3', title: 'Three', issues: ['allies'], ids: ['x'] },
  ];
  // 'x' is not a pen item (revoked already); 'e' is a pen item no order names; 'b' is named twice.
  const blocks = fieldBlocks(orders, ['a', 'b', 'c', 'd', 'e'], 'Not yet in an order');
  assert.deepEqual(blocks.map((b) => [b.id, b.n, b.ids]), [
    ['o1', 1, ['a', 'b', 'c']],
    ['o2', 2, ['d']],
    ['unbundled', 0, ['e']],
  ]);
  const all = blocks.flatMap((b) => b.ids);
  assert.equal(all.length, new Set(all).size, 'no id twice');
  assert.equal(all.length, 5, 'every pen item drawn');
  assert.deepEqual(fieldBlocks(orders, ['a'], 'x').map((b) => b.id), ['o1'], 'an order with nothing standing draws no block');
});

test('colsFor packs a block about 1.7 wide for 1 tall, between 2 and MAX_COLS columns', () => {
  assert.equal(colsFor(0), 1);
  assert.equal(colsFor(1), 2);
  assert.equal(colsFor(6), 4);
  assert.equal(colsFor(25), 7);
  assert.equal(colsFor(83), MAX_COLS);
  assert.equal(colsFor(1000), MAX_COLS);
});

test('the reshaped hero and order copy follows the house rules and spells the count', () => {
  assert.equal(COPY.hero.headline(13, 287), 'Thirteen signatures undo 287 things.');
  assert.equal(COPY.hero.headline(21, 5), '21 signatures undo 5 things.');
  assert.equal(COPY.hero.count(3, 287), '3 of 287 signed');
  assert.equal(COPY.forward.items(1), '1 item');
  assert.equal(COPY.forward.items(25), '25 items');
  assert.equal(COPY.forward.itemsFor(4, 25, 'Veterans and troops'), '4 of 25 for Veterans and troops');
  assert.ok(COPY.field.block(3, 'Citizenship as the Constitution wrote it', 18, 2).startsWith('Order 3, Citizenship'));
  assert.ok(COPY.field.block(0, 'Not yet in an order', 2, 0).startsWith('Not yet in an order'));
  for (const [path, text] of [
    ['hero.headline(13, 287)', COPY.hero.headline(13, 287)],
    ['hero.cta', COPY.hero.cta],
    ['list.title', COPY.list.title],
    ['issues.who', COPY.issues.who],
  ]) assert.ok(!BANNED_IN_HEADINGS.test(text), `${path} says reverse, roll back or restore`);
});

test('no curated row is a twin of a Federal Register row (counted 2026-10-19: 19 twins inflated the hero to 287)', () => {
  const curatedRows = readJson('src/data/undo/curated.json').map((e) => e.row);
  // A curated row that names a Federal Register number as its own number is the same action as
  // the feed row that carries that number, and the page would count it twice.
  for (const r of curatedRows) {
    assert.ok(!/^(EO|Proclamation) \d{5}( and \d{5})*$/.test(r.number ?? ''), `${r.id} carries a feed number as its own: ${r.number}`);
  }
  const ids = curatedRows.map((r) => r.id);
  assert.equal(ids.length, new Set(ids).size, 'no curated id twice');
  // A feed republication (an R1- document) is the same order printed again, never a second row.
  assert.deepEqual(rowsFromFederalRegister({ results: [{ ...FIXTURE.results[0], document_number: 'R1-2025-02005' }] }, 'executive_order'), []);
});

test('the key, the all page and the bar filter copy follows the house rules', () => {
  assert.equal(COPY.key.title(384), '384 things, five kinds of undo');
  assert.equal(COPY.all.link(708), 'Open all 708 items');
  assert.equal(COPY.land.more(11), 'Show 11 more');
  assert.equal(COPY.list.showMore(25, 262), 'Show 25 more of 262');
  assert.equal(COPY.list.showMore(12, 12), 'Show the last 12');
  for (const [path, text] of [
    ['key.title', COPY.key.title(384)],
    ['all.title', COPY.all.title],
    ['land.title', COPY.land.title],
  ]) assert.ok(!BANNED_IN_HEADINGS.test(text), `${path} says reverse, roll back or restore`);
});
