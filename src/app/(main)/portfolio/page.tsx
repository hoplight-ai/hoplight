import type { Metadata } from 'next';
import Link from 'next/link';
import { FACTS } from '@/lib/facts';

const GALLERY_URL = 'https://vault-sigma-two.vercel.app/portfolio';

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'A selection of AI systems Hoplight has shipped for labor, advocacy, and mission-driven organizations. Most of them open in your browser.',
  alternates: { canonical: '/portfolio' },
  openGraph: {
    title: 'Portfolio — Hoplight',
    description: 'Systems we’ve shipped. Most of them open in your browser.',
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

      <section className="slate">
        <div className="wrap">
          <div className="section-head">
            <span className="label">The gallery</span>
            <h2>Most of it, you can just open.</h2>
            <p>
              Live applications and interactive analyses, running in a browser, with no sales call in
              between. The gallery is the working set, so it changes when the work changes and not
              when this page gets rebuilt.
            </p>
          </div>
          <div className="cta-row">
            <a
              className="btn btn-primary"
              href={GALLERY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open the gallery &rarr;
            </a>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="label">Client engagements</span>
            <h2>And some of it, you can&apos;t.</h2>
            <p>
              These run inside client organizations, on their data, so there is no link to hand you.
              Here is what each one does and who it serves.
            </p>
          </div>

          <div className="portfolio-grid">
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
