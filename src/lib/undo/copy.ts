// Every static string on /undo that is not a data row, in one place so scripts/undo-classify.test.mjs
// can walk it for em dashes and clock words. A row's own title, how and why are data, not copy.
// Rules that bind here: plain English, no em dash, no exclamation mark, no marketing adjective, and
// no clock word (no "days since", no count of days to the inauguration).

import type { Bucket } from './types';

const COUNT_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
];

/** The page's one unit (round 3, 2026-11-08): "25 executive actions", never "25 items". */
export function actions(n: number): string {
  return `${n} executive ${n === 1 ? 'action' : 'actions'}`;
}

/** The heading spells small counts ("Twelve") and prints the rest as digits. */
export function countWord(n: number): string {
  return COUNT_WORDS[n] ?? String(n);
}

export const COPY = {
  hero: {
    label: 'A to-do list for January 20, 2029',
    title: 'The Undo List',
    lead: [
      'Every executive action of the second Trump administration that a pen undoes, bundled into signing orders.',
      'Each executive action below says exactly what the next president signs to undo it. It is one sentence. We wrote the sentence.',
    ],
    /** The first line on the page: the job, as a count of signatures and a count of executive actions. */
    headline: (orders: number, pen: number) =>
      `${countWord(orders)} signatures undo ${pen} executive ${pen === 1 ? 'action' : 'actions'}.`,
    /** What the field is, in one breath, for the line under the headline. */
    read: 'Each square is one executive action the next president undoes with a signature. Each block is one order that undoes its whole bundle. Sign an order and its block turns gold.',
    cta: 'Sign the first order',
    count: (signed: number, total: number) => `${signed} of ${total} signed`,
  },
  field: {
    label: 'The signature field: one square for each executive action a pen undoes, one block for each order',
    block: (n: number, title: string, total: number, done: number) =>
      `${n > 0 ? `Order ${n}, ` : ''}${title}: ${actions(total)}, ${done} signed. Open the order.`,
    /** The count under each block, in the page's unit. */
    count: (total: number, done: number) => (done > 0 ? `${done}/${actions(total)}` : actions(total)),
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
    count: (shown: number, total: number) => `${shown} of ${total} executive actions`,
  },
  issues: {
    filterLabel: 'Filter by issue',
    /** The one control that opens the issue filters on a phone, naming the issue picked, if any. */
    toggle: (label?: string) => (label ? `Filter by issue: ${label}` : 'Filter by issue'),
    all: 'All issues',
    who: 'Filter by who feels it',
    hint: 'Tap one. The field, the orders and the list narrow to it.',
    filteredTo: (label: string) => `Showing ${label}.`,
    clear: 'Show all',
    noIssue: 'No issue tag yet',
    chipsLabel: 'Issues: ',
  },
  /** The one sort control on /undo/all, in the order PEN_SORTS offers it, the default first. */
  sort: {
    label: 'Sort',
    newest: 'Newest',
    oldest: 'Oldest',
    bundle: 'By order',
  },
  land: {
    title: 'Who feels it',
    intro: 'Every executive action, by who feels it. Tap a bar and the field and the orders narrow to it.',
    more: (n: number) => `Show ${n} more`,
    fewer: 'Show fewer',
    countLabel: (pen: number) => `${pen}`,
    // Read out by a screen reader for each bar, so the numbers are in words and not only in widths.
    bar: (label: string, pen: number, signed: number) =>
      pen === 1
        ? `${label}: 1 executive action. You have ${signed > 0 ? 'signed' : 'not signed'} it. Show it.`
        : `${label}: ${pen} executive actions. You have signed ${signed} of them. Show these.`,
  },
  forward: {
    title: (n: number) => `${countWord(n)} ${n === 1 ? 'order' : 'orders'}, one afternoon`,
    intro:
      "The precedent is the other side's: one order on January 20, 2025 cancelled 78 orders and memoranda at once. These do the same, in the other direction. Open one to read what it bundles and where the country goes next.",
    sign: 'Sign this order',
    signed: 'Signed',
    open: 'Read the order',
    close: 'Close the order',
    items: (n: number) => actions(n),
    itemsFor: (hit: number, n: number, label: string) => `${hit} of ${actions(n)} for ${label}`,
    noneFor: (label: string) => `No order touches ${label}.`,
    undoes: (n: number) => `undoes ${actions(n)}`,
    draftShow: 'Draft the order',
    draftHide: 'Hide the draft',
    copy: 'Copy',
    copied: 'Copied',
    footnote: (n: number) => `${actions(n)}, one signature.`,
  },
  key: {
    title: (n: number) => `${n} executive ${n === 1 ? 'action' : 'actions'}, by kind`,
    intro: 'Every one is undone with a signature. The orders below bundle them.',
  },
  list: {
    title: 'Every executive action, one by one',
    showMore: (n: number, rest: number) => (rest > n ? `Show ${n} more of ${rest}` : `Show the last ${n}`),
  },
  all: {
    title: 'Every executive action, one by one',
    intro: (n: number) =>
      `The ${n} executive actions still standing, one row each, with the exact sentence that undoes each. Search them, filter them by who feels it, sort them.`,
    link: (n: number) => `Open all ${n} executive actions`,
    back: 'Back to the orders',
  },
  row: {
    more: 'Details',
    source: 'Read the source',
  },
  /** The groups on /undo/all, in plain words; a heading prints its count in brackets. */
  groups: {
    standing: 'To undo',
    done: 'Already undone',
    justIn: 'Not yet written up',
    leave: 'Worth keeping',
    ceremonial: 'Ceremonial',
    titled: (label: string, n: number) => `${label} (${n})`,
    rest: (n: number) => `Off the to-undo list (${n})`,
    restLine: 'Already undone, not yet written up, worth keeping, or ceremonial. None needs a signature now.',
    restIntro: (total: number) => `With the list above, the pen reached ${total} in all.`,
  },
  done: {
    intro: 'Courts, or the administration itself, already undid these. They stay on the list so the count is honest.',
  },
  justIn: {
    intro: 'Newly published and not yet written up in our words. The administration\'s own title shows until we write ours; nothing here counts toward the list above.',
  },
  leave: {
    intro: 'Orders a Democratic president would keep or that change nothing worth the ink. Listed so the count is honest.',
  },
  ceremonial: {
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
    body: 'Every executive action on this list can be undone by one person on one afternoon, if the person and the afternoon are ready. This list is how you get ready.',
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
