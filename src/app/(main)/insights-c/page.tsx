import type { Metadata } from 'next';
import Masthead from '@/components/Masthead';
import { Card, RuledList, SubstackLink } from '@/components/InsightParts';
import { pageMetadata } from '@/lib/metadata';
import { REPORTS, RESEARCH, WRITING } from '@/lib/insights-content';

// Variant C of three under review (Whit, 2026-10-21): two columns. Writing and Research are cards on a
// navy field band on the left, Reports are the ruled list on the right. A review route: noindex, canonical
// to /insights, not in the sitemap or nav.
export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Insights, variant C',
    description: 'Essays, the trial write-up, the persuasion page, and the reports Hoplight has published.',
    path: '/insights',
  }),
  robots: { index: false, follow: false },
};

export default function InsightsC() {
  return (
    <>
      <Masthead labelledBy="insights-title" variant="page">
        <h1 id="insights-title">Insights</h1>
      </Masthead>

      <div className="wrap ic-grid">
        <div className="ic-field">
          <section aria-labelledby="writing-title">
            <h2 id="writing-title">Writing</h2>
            <SubstackLink />
            <ul className="ic-cards">
              {WRITING.map((item) => (
                <li key={item.title}>
                  <Card item={item} />
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="research-title">
            <h2 id="research-title">Research</h2>
            <ul className="ic-cards">
              {RESEARCH.map((item) => (
                <li key={item.title}>
                  <Card item={item} />
                </li>
              ))}
            </ul>
          </section>
        </div>
        <section className="ic-reports" aria-labelledby="reports-title">
          <h2 id="reports-title">Reports</h2>
          <RuledList items={REPORTS} />
        </section>
      </div>
    </>
  );
}
