import type { Metadata } from 'next';
import Link from 'next/link';
import { FACTS } from '@/lib/facts';

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
          <p>National organizations are running these tools in production. Not proofs of concept.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="portfolio-grid">
            <a className="pfcard link" href="https://ai-policy-tool.vercel.app/" target="_blank" rel="noopener noreferrer">
              <h3 className="pfname">AGIS</h3>
              <div className="pfrow">
                <span className="pflabel">What it does</span>
                <span className="pfval">Query AI governance across {FACTS.agis.jurisdictions} jurisdictions and {FACTS.agis.sources} sources in plain English. Covers federal and state laws, lobbying spend, CEO political donations, enforcement actions, and the governance positions of 15 frontier AI labs. Cross-references what companies promise publicly against what they lobby for privately.</span>
              </div>
              <div className="pfrow">
                <span className="pflabel">Who it serves</span>
                <span className="pfval">Policy and advocacy teams.</span>
              </div>
              <span className="go">Open the tool &rarr;</span>
            </a>

            <div className="pfcard">
              <h3 className="pfname">Change Agent</h3>
              <div className="pfrow">
                <span className="pflabel">What it does</span>
                <span className="pfval">A persuasion assistant rebuilt with a values-aligned system prompt. Refuses anti-worker requests and redirects to worker power.</span>
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
                <span className="pfval">RCT-validated persuasion you can audit, control, and improve. Validated in a 3,006-person voter-file-matched randomized controlled trial: up to 26 points over a no-message baseline.</span>
              </div>
              <div className="pfrow">
                <span className="pflabel">Who it serves</span>
                <span className="pfval">Campaigns and advocacy organizations.</span>
              </div>
              <span className="go">View &rarr;</span>
            </Link>

            <div className="pfcard">
              <h3 className="pfname">Agent-operated systems</h3>
              <div className="pfrow">
                <span className="pflabel">What it does</span>
                <span className="pfval">Systems that run operational workflows autonomously, then monitor their own outputs. Agents handle the patterned 80%, people keep the judgment calls.</span>
              </div>
              <div className="pfrow">
                <span className="pflabel">Who it serves</span>
                <span className="pfval">Organizations with high-volume, repeating operational work.</span>
              </div>
            </div>

            <div className="pfcard">
              <h3 className="pfname">AI brand voice for regulated commerce</h3>
              <div className="pfrow">
                <span className="pflabel">What it does</span>
                <span className="pfval">A brand-voice system for a women-owned, queer-led distillery selling a federally regulated product on a hostile ad platform. Compliant, converting, human-sounding copy at {FACTS.company.roas} return on ad spend.</span>
              </div>
              <div className="pfrow">
                <span className="pflabel">Who it serves</span>
                <span className="pfval">Consumer brands navigating platform restrictions and compliance requirements.</span>
              </div>
            </div>

            <div className="pfcard">
              <h3 className="pfname">Labor AI intelligence product</h3>
              <div className="pfrow">
                <span className="pflabel">What it does</span>
                <span className="pfval">Reframes the week&apos;s AI developments for political and policy staff at one of the largest labor organizations in the US. Built for people who negotiate contracts, run campaigns, and advise elected officials.</span>
              </div>
              <div className="pfrow">
                <span className="pflabel">Who it serves</span>
                <span className="pfval">National labor organizations and their political and policy staff.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="slate" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <hr className="rule" style={{ marginBottom: '36px' }} />
          <p className="lede">Something here you want to talk about?</p>
          <div className="cta-row" style={{ marginTop: '24px' }}>
            <Link className="btn btn-primary" href="/contact">Start a conversation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
