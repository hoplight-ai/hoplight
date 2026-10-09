// Every static string on /undo that is not a data row, in one place so scripts/undo-classify.test.mjs
// can walk it for em dashes and clock words. A row's own title, how and why are data, not copy.
// Rules that bind here: plain English, no em dash, no exclamation mark, no marketing adjective, and
// no clock word (no "days since", no count of days to the inauguration).

export const COPY = {
  hero: {
    label: 'A to-do list for January 20, 2029',
    title: 'The Undo List',
    lead: [
      'Everything the second Trump administration did, sorted by what it takes to undo it. Most of it takes a signature.',
      'Each item below says exactly what the next president, or Congress, has to do. For the first group, it is one sentence. We wrote the sentence.',
    ],
    penNumberLabel: 'things a pen undoes',
    lockedNumberLabel: 'things nothing undoes',
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
  order: {
    show: 'Show the whole order',
    hide: 'Hide the order',
    copy: 'Copy',
    copied: 'Copied',
    footnote: 'That is the entire document.',
  },
  auto: 'auto, unreviewed',
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
