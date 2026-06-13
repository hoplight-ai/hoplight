import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'A selection of AI systems Hoplight has shipped for labor, advocacy, and mission-driven organizations. What each one does, and who it serves.',
  alternates: { canonical: '/portfolio' },
  openGraph: {
    title: 'Portfolio — Hoplight',
    description: 'Systems we’ve shipped. What each one does, and who it serves.',
    url: 'https://hoplight.ai/portfolio',
  },
};

export default function Portfolio() {
  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <span className="label">Portfolio</span>
          <h1>Systems we&apos;ve shipped.</h1>
          <p>A selection of systems we&apos;ve shipped. What each one does, and who it serves.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="portfolio-grid">
            <div className="pfcard">
              <h3 className="pfname">AGIS</h3>
              <div className="pfrow">
                <span className="pflabel">What it does</span>
                <span className="pfval">AI policy and regulation intelligence over thousands of policy documents across many jurisdictions.</span>
              </div>
              <div className="pfrow">
                <span className="pflabel">Who it serves</span>
                <span className="pfval">Policy and advocacy teams.</span>
              </div>
            </div>

            <div className="pfcard">
              <h3 className="pfname">Change Agent</h3>
              <div className="pfrow">
                <span className="pflabel">What it does</span>
                <span className="pfval">A persuasion assistant rebuilt with a values-aligned system prompt, it refuses anti-worker requests and redirects to worker power.</span>
              </div>
              <div className="pfrow">
                <span className="pflabel">Who it serves</span>
                <span className="pfval">Unions and organizers.</span>
              </div>
            </div>

            <Link className="pfcard link" href="/persuasion">
              <h3 className="pfname">The Psychographic Message Engine</h3>
              <div className="pfrow">
                <span className="pflabel">What it does</span>
                <span className="pfval">Auditable, tunable persuasion messaging validated in a 3,000-person RCT.</span>
              </div>
              <div className="pfrow">
                <span className="pflabel">Who it serves</span>
                <span className="pfval">Campaigns and advocacy organizations.</span>
              </div>
              <span className="go">View &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="slate" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <hr className="rule" style={{ marginBottom: '36px' }} />
          <h2>Bring the thing your team hates doing. We&apos;ll start there.</h2>
          <p className="lede">A short conversation is the fastest way to see whether Hoplight is a fit. No deck required.</p>
          <div className="cta-row" style={{ marginTop: '32px' }}>
            <Link className="btn btn-primary" href="/contact">Start a conversation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
