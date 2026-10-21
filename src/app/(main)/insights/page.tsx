import type { Metadata } from 'next';
import Masthead from '@/components/Masthead';
import { RuledList, SubstackLink } from '@/components/InsightParts';
import { pageMetadata } from '@/lib/metadata';
import { RESEARCH, REPORTS, WRITING } from '@/lib/insights-content';

export const metadata: Metadata = pageMetadata({
  title: 'Insights',
  description: 'Essays, the trial write-up, the persuasion page, and the reports Hoplight has published.',
  path: '/insights',
  ogDescription: 'Essays, research and reports.',
});

// Variant A of three under review (Whit, 2026-10-21: "what could that look like?"): three bands stacked,
// Writing, Research, Reports, each a ruled list. B is /insights-b, C is /insights-c. The lines under the
// masthead title are gone (Whit: "just cut all the sub headers"). The links to the trial write-up, the
// persuasion page and the reports open pages behind the one-password sign-in (src/lib/gate.ts).
export default function Insights() {
  return (
    <>
      <Masthead labelledBy="insights-title" variant="page">
        <h1 id="insights-title">Insights</h1>
      </Masthead>

      <div className="ibands">
        <section className="iband" aria-labelledby="writing-title">
          <div className="wrap iband-in">
            <div>
              <h2 id="writing-title">Writing</h2>
              <SubstackLink />
            </div>
            <RuledList items={WRITING} />
          </div>
        </section>
        <section className="iband" aria-labelledby="research-title">
          <div className="wrap iband-in">
            <h2 id="research-title">Research</h2>
            <RuledList items={RESEARCH} />
          </div>
        </section>
        <section className="iband" aria-labelledby="reports-title">
          <div className="wrap iband-in">
            <h2 id="reports-title">Reports</h2>
            <RuledList items={REPORTS} />
          </div>
        </section>
      </div>
    </>
  );
}
