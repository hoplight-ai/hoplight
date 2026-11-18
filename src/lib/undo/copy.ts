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
    /** The one filled button: it signs every order at once (UNDOTREE1, 2026-11-18). */
    cta: (orders: number) => `Sign all ${countWord(orders).toLowerCase()}`,
    count: (signed: number, total: number) => `${signed} of ${total} signed`,
  },
  /** The link-preview words (og and twitter), from the headline's two counts: the signing orders and the
   *  executive actions still standing (UNDOPEN2, 2026-11-17; Whit: "need a cat nippy preview description
   *  for it"). The page's plain description stays typed in page.tsx. */
  share: {
    title: (orders: number, pen: number) => `${countWord(orders)} signatures undo ${pen} of Trump's executive actions`,
    description: (orders: number, pen: number) =>
      `What a pen did, a pen can undo. ${orders} ${orders === 1 ? 'signature' : 'signatures'} on January 20, 2029 could undo ${pen} ${pen === 1 ? 'action' : 'actions'}. Find the ones that touch your life.`,
  },
  field: {
    unbundled: 'Not yet in an order',
  },
  /** The tree of lit squares, the first screen of /undo (UNDOTREE1, 2026-11-18). */
  tree: {
    label: 'The thirteen signing orders, one rectangle each, one square for each executive action it undoes',
    keyLabel: 'Themes. Press one to show only its executive actions.',
    /** The count on every rectangle, in one form. */
    count: (n: number) => `${n} ${n === 1 ? 'action' : 'actions'}`,
    rect: (frame: string, n: number, signed: number) => `${frame}: ${actions(n)}, ${signed} signed. Show the order.`,
    chip: (name: string, n: number) => `${name}: ${actions(n)}. Show only these.`,
    /** The teaching line under the frame heading, built from the order's own line. */
    teach: (line: string, n: number, withOne: boolean) =>
      `One signature ${String(line).charAt(0).toLowerCase()}${String(line).slice(1)} ${n} ${n === 1 ? 'action' : 'actions'}${withOne ? ', this one among them' : ''}.`,
    signedOn: (kind: string, date: string) => `${kind}, signed ${date}`,
    bundled: 'Bundled with',
    more: (n: number) => `and ${n} more`,
    close: 'Close',
    prev: 'Previous',
    next: 'Next',
  },
  /** The table of every standing executive action, under the tree. */
  table: {
    caption: 'Every executive action still standing',
    shown: (n: number) => `${n} shown`,
    inOrder: (frame: string) => `in ${frame}`,
    inTheme: (name: string) => `in ${name}`,
    showAll: (n: number) => `Show all ${n}`,
    cols: { action: 'Action', order: 'Order', theme: 'Theme', kind: 'Kind', date: 'Signed', sign: 'Sign' },
    sign: 'Sign',
    signed: 'Signed',
    /** The kind of document, one row at a time, keyed as pen.ts keys it. */
    kind: { eo: 'Executive order', proc: 'Proclamation', memo: 'Memorandum', other: 'Other' } as Record<string, string>,
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
  /** The order's own actions, in the popup a square or a rectangle opens (UNDOTREE1, 2026-11-18). */
  forward: {
    sign: 'Sign this order',
    signed: 'Signed',
    draftShow: 'Draft the order',
    draftHide: 'Hide the draft',
    copy: 'Copy',
    copied: 'Copied',
    footnote: (n: number) => `${actions(n)}, one signature.`,
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
