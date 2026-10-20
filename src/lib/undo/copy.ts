// Every static string on /undo that is not a data row, in one place so scripts/undo-classify.test.mjs
// can walk it for em dashes and clock words. A row's own title, how and why are data, not copy.
// Rules that bind here: plain English, no em dash, no exclamation mark, no marketing adjective, and
// no clock word (no "days since", no count of days to the inauguration).

import type { Bucket } from './types';

const COUNT_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
];

/** The heading spells small counts ("Twelve") and prints the rest as digits. */
export function countWord(n: number): string {
  return COUNT_WORDS[n] ?? String(n);
}

export const COPY = {
  hero: {
    label: 'A to-do list for January 20, 2029',
    title: 'The Undo List',
    lead: [
      'Everything the second Trump administration did, sorted by what it takes to undo it. Most of it takes a signature.',
      'Each item below says exactly what the next president, or Congress, has to do. For the first group, it is one sentence. We wrote the sentence.',
    ],
    /** The first line on the page: the job, as a count of signatures and a count of things. */
    headline: (orders: number, pen: number) => `${countWord(orders)} signatures undo ${pen} things.`,
    /** What the field is, in one breath, for the line under the headline. */
    read: 'Each square is one thing the next president undoes with a signature. Each block is one order that undoes its whole bundle. Sign an order and its block turns gold.',
    /** The rest of the list, in one sentence under the field. */
    rest: (locked: number, rule: number, congress: number) =>
      `Another ${locked} nothing undoes. ${rule} take a new rule, and ${congress} take a vote in Congress.`,
    cta: 'Sign the first order',
    count: (signed: number, total: number) => `${signed} of ${total} signed`,
    penNumberLabel: 'things a pen undoes',
    lockedNumberLabel: 'things nothing undoes',
  },
  field: {
    label: 'The signature field: one square for each item a pen undoes, one block for each order',
    block: (n: number, title: string, total: number, done: number) =>
      `${n > 0 ? `Order ${n}, ` : ''}${title}: ${total} ${total === 1 ? 'item' : 'items'}, ${done} signed. Open the order.`,
    unbundled: 'Not yet in an order',
  },
  strip: {
    signedOf: (signed: number, total: number) => `${signed} of ${total} signed`,
    reset: 'Reset',
  },
  search: {
    label: 'Search title or number',
    placeholder: 'Tariff, EO 14148, birthright',
    empty: 'No row matches that search. Clear it to see the whole list.',
    noRows: 'There are no rows to show in this render. Check the feed status under Sources and method below.',
    count: (shown: number, total: number) => `${shown} of ${total} rows`,
  },
  issues: {
    filterLabel: 'Filter by issue',
    all: 'All issues',
    who: 'Filter by who feels it',
    hint: 'Tap one. The field, the orders and the list narrow to it.',
    filteredTo: (label: string) => `Showing ${label}.`,
    clear: 'Show all',
    sortLabel: 'Sort',
    newest: 'Newest first',
    byIssue: 'By issue',
    noIssue: 'No issue tag yet',
    chipsLabel: 'Issues: ',
  },
  land: {
    title: 'Who feels it',
    intro: 'Every item, by who feels it. The gold is what one signature fixes. Tap a bar and the field and the orders narrow to it.',
    more: (n: number) => `Show ${n} more`,
    fewer: 'Show fewer',
    countLabel: (pen: number, total: number) => `${pen} of ${total} by pen`,
    legend: [
      { key: 'pen', label: 'a pen' },
      { key: 'process', label: 'a pen then a process' },
      { key: 'congress', label: 'Congress' },
      { key: 'locked', label: 'locked' },
    ],
    legendTicks: 'the line is how far your ticks have gone',
    // Read out by a screen reader for each bar, so the numbers are in words and not only in widths.
    bar: (label: string, total: number, pen: number, process: number, congress: number, locked: number, signed: number) =>
      `${label}: ${total} ${total === 1 ? 'item' : 'items'}. ${pen} by a pen, ${process} by a pen then a process, ${congress} need Congress, ${locked} locked. You have signed ${signed} of the ${pen} pen items. Show these items.`,
  },
  forward: {
    title: (n: number) => `${countWord(n)} ${n === 1 ? 'order' : 'orders'}, one afternoon`,
    intro:
      "The precedent is the other side's: one order on January 20, 2025 cancelled 78 orders and memoranda at once. These do the same, in the other direction. Open one to read what it bundles and where the country goes next.",
    sign: 'Sign this order',
    signed: 'Signed',
    open: 'Read the order',
    close: 'Close the order',
    items: (n: number) => `${n} ${n === 1 ? 'item' : 'items'}`,
    itemsFor: (hit: number, n: number, label: string) => `${hit} of ${n} for ${label}`,
    noneFor: (label: string) => `No order touches ${label}.`,
    undoes: (n: number) => `undoes ${n} ${n === 1 ? 'item' : 'items'}`,
    draftShow: 'Draft the order',
    draftHide: 'Hide the draft',
    copy: 'Copy',
    copied: 'Copied',
    footnote: (n: number) => `${n} ${n === 1 ? 'item' : 'items'}, one signature.`,
  },
  key: {
    title: (n: number) => `${n} things, five kinds of undo`,
    intro: 'The gold is the job of the thirteen orders. The rest takes a rule, a vote, or stays.',
    more: 'How Congress undoes a thing',
    reconciliation:
      'Budget reconciliation is a yearly budget process that passes the Senate with a simple majority instead of sixty votes. It only reaches provisions that change federal spending or revenue, which is why a law with a price tag can be undone by a majority and a pure policy statute cannot.',
    cra:
      'The Congressional Review Act lets Congress overturn a federal rule by simple majority inside a window after the rule is finished. Rules finished after roughly late July 2028 land in the window that opens in early 2029, so the new Congress can kill them without sixty votes.',
  },
  list: {
    title: 'Every item, one by one',
    intro: 'The orders above bundle the pen items. Here is each item on its own, with the exact sentence that undoes it. Each group opens on a tap.',
    showMore: (n: number, rest: number) => (rest > n ? `Show ${n} more of ${rest}` : `Show the last ${n}`),
  },
  all: {
    title: 'Every item, one by one',
    intro: (n: number) => `All ${n} rows on their own page: search by title or number, sort by who feels it, open any row for the exact sentence that undoes it.`,
    link: (n: number) => `Open all ${n} items`,
    back: 'Back to the orders',
  },
  row: {
    more: 'Details',
    source: 'Read the source',
  },
  lunch: {
    title: 'Before lunch',
    intro: 'One signature each. No vote, no hearing, no comment period.',
  },
  thisYear: {
    title: 'This year',
    intro: 'A new rule for each old one: notice, comment, reasons, months. Still no vote.',
  },
  congress: {
    title: 'Needs Congress',
    majority: {
      title: 'A simple majority',
      intro: 'Budget reconciliation or the Congressional Review Act. Fifty-one senators.',
    },
    sixty: {
      title: 'Sixty votes',
      intro: "A statute with no budget hook, a treaty, or the Senate's consent.",
    },
  },
  locked: {
    title: 'Nothing undoes these',
    intro:
      'Lifetime judges, rules killed under the Congressional Review Act, pardons, money already spent, Supreme Court precedent. No pen reaches these, and no majority.',
  },
  done: {
    title: 'Already done for you',
    intro: 'Courts, or the administration itself, already undid these. They stay on the list so the count is honest.',
  },
  justIn: {
    title: 'Just in',
    intro: 'Newly published and not yet written up in our words. The administration\'s own title shows until we write ours; nothing here counts toward the list above.',
  },
  leave: {
    title: 'Leave these',
    intro: 'Orders a Democratic president would keep or that change nothing worth the ink. Listed so the count is honest.',
  },
  ceremonial: {
    title: 'Commemorative proclamations',
    intro: 'National days, weeks and months, and proclamations of mourning. Nothing here needs undoing. They are listed so the count is complete.',
  },
  order: {
    show: 'Show the whole order',
    hide: 'Hide the order',
    copy: 'Copy',
    copied: 'Copied',
    footnote: 'That is the entire document.',
  },
  auto: 'auto, unreviewed',
  unconfirmed: 'unconfirmed',
  officially: 'Officially:',
  // The mono tag at the end of a task line: what kind of act finishes the row. Locked has none.
  tags: {
    pen: 'one signature',
    'pen-process': 'a new rule',
    majority: '51 votes',
    sixty: '60 votes',
  } as Partial<Record<Bucket, string>>,
  cta: {
    title: 'Pick one. Draft it.',
    body: 'Most of what happened in these four years can be reversed by one person on one afternoon, if the person and the afternoon are ready. This list is how you get ready.',
    copyLink: 'Copy the link',
    copied: 'Copied',
    correction: 'Send a correction',
    mailto: 'mailto:whit@hoplight.ai?subject=The%20Undo%20List',
  },
  sources: {
    ticksLabel: 'Your ticks',
    ticks: 'Ticking a box changes nothing but this page; it is stored in your own browser only.',
  },
};

/** Every plain string in COPY, for the copy test. Function members are called with sample numbers. */
export function copyStrings(node: unknown = COPY, path = 'COPY'): [string, string][] {
  if (typeof node === 'string') return [[path, node]];
  if (typeof node === 'function') {
    const out = (node as (...a: number[]) => unknown)(12, 345);
    return typeof out === 'string' ? [[`${path}()`, out]] : [];
  }
  if (Array.isArray(node)) return node.flatMap((v, i) => copyStrings(v, `${path}[${i}]`));
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) => copyStrings(v, `${path}.${k}`));
  }
  return [];
}
