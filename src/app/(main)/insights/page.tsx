import type { Metadata } from 'next';
import Arrow from '@/components/Arrow';
import Masthead from '@/components/Masthead';
import { FACTS } from '@/lib/facts';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Insights',
  description: 'The trial write-up, the persuasion page, and the reports Hoplight has published.',
  path: '/insights',
  ogDescription: 'The trial write-up, the persuasion page, and the reports Hoplight has published.',
});

// Whit, 2026-10-20: "Insights is fine for now". Text and order are mockup C
// (public/mockups/c-hybrid/insights.html), cut to the word budget. Every link here opens a page behind
// the one-password sign-in (src/lib/gate.ts); the page says so in one line and the gate is untouched.
// Seven of the ten links left on 2026-10-21 with the portfolio cards they pointed at (Whit: "i want these
// removed from my hoplight.ai portfolio").
const REPORTS = [
  { href: '/portfolio/dnc-autopsy-taken-apart.html', title: 'DNC autopsy, taken apart', line: 'Its own numbers.' },
  { href: '/portfolio/oregon-school-budget-report.html', title: 'Oregon school budget report', line: 'Where it goes.' },
  { href: '/portfolio/worker-equity-dilution-at-ge.html', title: 'Worker equity dilution at GE', line: '80 years.' },
];

export default function Insights() {
  return (
    <>
      <Masthead labelledBy="insights-title" variant="page">
        <h1 id="insights-title">Insights</h1>
        <p className="lede">These open with a password.</p>
        <ul className="ptiles ptiles-lead">
          <li>
            <a className="ptile" href="/research">
              <h2>The trial write-up</h2>
              <p>
                {FACTS.rct.n} adults, randomized. AI-generated frames beat the staff-written frame by {FACTS.rct.liftVsStaffFrame} points on officer pay among conservative segments. It measured attitudes, not votes.
              </p>
              <Arrow className="arrow tile-arrow" />
            </a>
          </li>
          <li>
            <a className="ptile" href="/persuasion">
              <h2>The persuasion page</h2>
              <p>Psychology, not demographics.</p>
              <Arrow className="arrow tile-arrow" />
            </a>
          </li>
        </ul>
      </Masthead>

      <section className="reports" aria-labelledby="reports-title">
        <div className="wrap">
          <h2 id="reports-title" className="sr-only">Reports</h2>
          <ul className="rep-list">
            {REPORTS.map((r) => (
              <li key={r.href}>
                <a className="rep" href={r.href}>
                  <span className="rep-title">{r.title}</span>
                  <span className="rep-line">{r.line}</span>
                  <Arrow className="arrow rep-arrow" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
