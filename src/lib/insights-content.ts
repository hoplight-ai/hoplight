// What the Insights page lists, in one place. Whit, 2026-10-21: "i think the insights page could actually
// also highlight my substack writings and other writings".
//
// Sources: the Substack archive (https://whitpendergast.substack.com/archive, read 2026-10-21) lists two
// essays, with the titles and dates below. The CPR Hub Insight is not published yet, so it is not listed;
// it returns when it has a URL (Whit, 2026-10-21: "the CPR piece isnt live yet"). The trial was fielded in
// August 2025 (FACTS.rct.date). The three report rows are the ones still on the Insights page; the seven
// whose portfolio cards left on 2026-10-21 stay off it.

import { FACTS } from '@/lib/facts';

export const SUBSTACK = 'https://whitpendergast.substack.com';

export type InsightItem = {
  kind: 'Essay' | 'Research' | 'Report';
  title: string;
  /** One short line under the title, only where the page already had one. */
  line?: string;
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
    line: `${FACTS.rct.n} adults, randomized. AI-generated frames beat the staff-written frame by ${FACTS.rct.liftVsStaffFrame} points on officer pay among conservative segments. It measured attitudes, not votes.`,
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
  { kind: 'Report', title: 'DNC autopsy, taken apart', line: 'Its own numbers.', href: '/portfolio/dnc-autopsy-taken-apart.html' },
  { kind: 'Report', title: 'Oregon school budget report', line: 'Where it goes.', href: '/portfolio/oregon-school-budget-report.html' },
  { kind: 'Report', title: 'Worker equity dilution at GE', line: '80 years.', href: '/portfolio/worker-equity-dilution-at-ge.html' },
];
