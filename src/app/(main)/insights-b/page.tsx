import type { Metadata } from 'next';
import Masthead from '@/components/Masthead';
import { RuledList } from '@/components/InsightParts';
import { pageMetadata } from '@/lib/metadata';
import { REPORTS, RESEARCH, WRITING, type InsightItem } from '@/lib/insights-content';

// Variant B of three under review (Whit, 2026-10-21): one list, newest first, a small label on every item
// and a date where one exists. A review route: noindex, canonical to /insights, not in the sitemap or nav.
export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Insights, variant B',
    description: 'Essays, the trial write-up, the persuasion page, and the reports Hoplight has published.',
    path: '/insights',
  }),
  robots: { index: false, follow: false },
};

// Newest first. The CPR essay is not published, so it leads. Then the two essays and the trial, which
// carry dates. The persuasion page and the reports have no date on record, so they follow, in their own order.
const ORDER = ['Pacing is political', 'Are We Engineering Groupthink at Civilization Scale?', 'The Wrong Altitude', 'The trial write-up'];
const ALL: InsightItem[] = [...WRITING, ...RESEARCH, ...REPORTS];
const LIST: InsightItem[] = [
  ...ORDER.map((t) => ALL.find((i) => i.title === t) as InsightItem),
  ...ALL.filter((i) => !ORDER.includes(i.title)),
];

export default function InsightsB() {
  return (
    <>
      <Masthead labelledBy="insights-title" variant="page">
        <h1 id="insights-title">Insights</h1>
      </Masthead>

      <section className="ibands ib-list" aria-label="Everything, newest first">
        <div className="wrap">
          <RuledList items={LIST} lead />
        </div>
      </section>
    </>
  );
}
