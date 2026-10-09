#!/usr/bin/env node
// Tests for The Undo List (hoplight.ai/undo): the placement rules in src/lib/undo/classify.ts, the
// Federal Register mapper in src/lib/undo/federal-register.ts, and the copy rules the two curated
// data files must obey. Pure: no network, no server. Run: `node --test scripts/undo-classify.test.mjs`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyRulings,
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
  howOf,
  isAlreadyDone,
  matchesQuery,
  slimRow,
  whyOf,
} from '../src/lib/undo/sections.ts';
import { BUCKETS, INSTRUMENT_LABEL } from '../src/lib/undo/types.ts';

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
  assert.deepEqual(groups.map((g) => g.label), ['Executive orders', 'Proclamations', 'Memoranda', 'Tariffs', 'Withdrawals', 'Appointments and agency moves']);
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
