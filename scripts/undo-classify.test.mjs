#!/usr/bin/env node
// Tests for The Undo List (hoplight.ai/undo): the placement rules in src/lib/undo/classify.ts, the
// Federal Register mapper in src/lib/undo/federal-register.ts, and the copy rules the two curated
// data files must obey. Pure: no network, no server. Run: `node --test scripts/undo-classify.test.mjs`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { isCeremonial } from '../src/lib/undo/sections.ts';
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
    assert.equal(out[0].official, 'CRA repeal: Test rule');
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
