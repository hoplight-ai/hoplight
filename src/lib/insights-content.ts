// What the Insights page lists, in one place. Whit, 2026-10-21: "i think the insights page could actually
// also highlight my substack writings and other writings".
//
// Sources: the Substack archive (https://whitpendergast.substack.com/archive, read 2026-10-21) lists two
// essays, with the titles and dates below. The CPR Hub Insight is not published yet, so it is not listed;
// it returns when it has a URL (Whit, 2026-10-21: "the CPR piece isnt live yet"). The trial was fielded in
// August 2025 (FACTS.rct.date). The Reports list (2026-10-23, owner: "mock up these changes"): the Undo List, the CBA playbook and the
// governance checklist, then the three analyses with one line on what each draws on. Their Analysis labels
// went in the HOPSITE2 design review, 2026-11-07. The CBA playbook and the governance checklist came off on
// 2026-11-07 (LOCKREPORTS1; Whit: "hide them all the dnc after action report, the electoral cost, the
// dilution models  can remain a report but locked up."): hidden, listed nowhere. The DNC and GE rows stay,
// gated, so they draw the lock (scripts/reports-locked.test.mjs).

import { FACTS } from '@/lib/facts';

export const SUBSTACK = 'https://whitpendergast.substack.com';

export type InsightItem = {
  kind: 'Essay' | 'Research' | 'Report';
  title: string;
  /** One short line under the title, only where the page already had one. */
  line?: string;
  /** A small mono label above the title, on the reports that are analyses. */
  label?: string;
  href?: string;
  /** Opens on another site, in a new tab. */
  external?: boolean;
  /** ISO date and the words shown for it, only where a date exists. */
  iso?: string;
  shown?: string;
};

export const WRITING: InsightItem[] = [
  {
    kind: 'Essay',
    title: 'Are We Engineering Groupthink at Civilization Scale?',
    line: 'Substack',
    href: `${SUBSTACK}/p/are-we-engineering-groupthink-at`,
    external: true,
    iso: '2026-07-01',
    shown: 'Jul 1, 2026',
  },
  {
    kind: 'Essay',
    title: 'The Wrong Altitude',
    line: 'Substack',
    href: `${SUBSTACK}/p/the-wrong-altitude`,
    external: true,
    iso: '2026-03-05',
    shown: 'Mar 5, 2026',
  },
];

export const RESEARCH: InsightItem[] = [
  {
    kind: 'Research',
    title: 'The trial write-up',
    // Cut to its own first sentence (HOPSITE2 design review, 2026-11-07); the write-up carries the rest.
    line: `${FACTS.rct.n} adults, randomized.`,
    href: '/research',
    iso: '2025-08',
    shown: 'Aug 2025',
  },
  {
    kind: 'Research',
    title: 'The persuasion page',
    line: 'Psychology, not demographics.',
    href: '/persuasion',
  },
];

export const REPORTS: InsightItem[] = [
  { kind: 'Report', title: 'The Undo List', line: 'Live Federal Register feed, by what undoes each.', href: '/undo' },
  { kind: 'Report', title: 'DNC autopsy, taken apart', line: 'From its own report, cited by page.', href: '/portfolio/dnc-autopsy-taken-apart.html' },
  { kind: 'Report', title: 'Oregon school budget report', line: 'From state actuals and Census data.', href: '/portfolio/oregon-school-budget-report.html' },
  { kind: 'Report', title: 'Worker equity dilution at GE', line: 'From public headcount and filings.', href: '/portfolio/worker-equity-dilution-at-ge.html' },
];
