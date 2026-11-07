import type { Metadata } from 'next';
import Masthead from '@/components/Masthead';
import { Card, RuledList, SubstackLink } from '@/components/InsightParts';
import { pageMetadata } from '@/lib/metadata';
import { REPORTS, RESEARCH, WRITING, type InsightItem } from '@/lib/insights-content';
import { latestWriting } from '@/lib/substack';
import { onShelf, portfolioClock, visibleTools, type Tool } from '@/data/tools';

export const metadata: Metadata = pageMetadata({
  title: 'Insights',
  description: 'Essays, the trial write-up, the persuasion page, and the reports Hoplight has published.',
  path: '/insights',
  ogDescription: 'Essays, research and reports.',
});

// Rebuilt at most once an hour, so a new Substack post and a report whose release day has come both appear
// with no deploy (PORTSPLIT1 round two, 2026-11-07).
export const revalidate = 3600;

// Whit, 2026-10-21: "new insights page works as option three that has the blue box". Two columns: Writing
// and Research as cards on the navy field band, Reports as the ruled list beside it. The links to the trial
// write-up, the persuasion page and the gated reports open pages behind the one-password sign-in (src/lib/gate.ts).
// The Chanel pass (HOPSITE2, 2026-11-07): each essay card's tag said "Substack" under a link that already
// says "Whit Pendergast on Substack", so the card shows its date alone. Drawn the way a dated Research card
// is drawn (date as the tag, no line), since the shared card puts the source in an essay's tag.
const datedOnly = (item: InsightItem): InsightItem => ({ ...item, kind: 'Research', line: undefined });

// PORTSPLIT1 round two, 2026-11-07 (Whit: "the reports need to live more as ... a research section of the
// website or something may be tied into my writings or like a blog or a Substack connection"). The public
// reports come off /portfolio and are read here from the tool list (shelf 'report', on its release
// schedule), first in Reports because a stranger can open them; the hand-kept reports follow. Writing is
// his Substack feed, with the hand-kept list as the fallback.
const asReport = (t: Tool): InsightItem => ({
  kind: 'Report',
  title: t.name,
  line: t.line,
  href: t.href,
  external: t.href.startsWith('http'),
});

export default async function Insights() {
  const clock = portfolioClock(process.env);
  const reports = onShelf('report', visibleTools(clock.now, undefined, { includeUncleared: clock.includeUncleared })).map(asReport);
  const writing = await latestWriting(WRITING);
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
              {writing.map((item) => (
                <li key={item.href ?? item.title}>
                  <Card item={datedOnly(item)} />
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
          <RuledList items={[...reports, ...REPORTS]} />
        </section>
      </div>
    </>
  );
}
