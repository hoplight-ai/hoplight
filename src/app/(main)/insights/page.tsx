import type { Metadata } from 'next';
import Masthead from '@/components/Masthead';
import { Card, RuledList, SubstackLink } from '@/components/InsightParts';
import { pageMetadata } from '@/lib/metadata';
import { REPORTS, RESEARCH, WRITING } from '@/lib/insights-content';

export const metadata: Metadata = pageMetadata({
  title: 'Insights',
  description: 'Essays, the trial write-up, the persuasion page, and the reports Hoplight has published.',
  path: '/insights',
  ogDescription: 'Essays, research and reports.',
});

// Whit, 2026-10-21: "new insights page works as option three that has the blue box". Two columns: Writing
// and Research as cards on the navy field band, Reports as the ruled list beside it. The links to the trial
// write-up, the persuasion page and the reports open pages behind the one-password sign-in (src/lib/gate.ts).
export default function Insights() {
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
