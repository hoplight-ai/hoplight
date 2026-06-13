import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Work — Hoplight',
  description: 'A portfolio of AI tools and systems built for labor, advocacy, and mission-driven organizations.',
};

export default function Work() {
  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <span className="label">Work</span>
          <h1>Are you still unsure what AI can do for you? Take a look at the tools that national organizations are using.</h1>
          <p>A selection of shipped systems. What each one does and who it serves. The architecture is what you pay us to learn.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="workcards">
            <a className="workcard" href="https://ai-policy-tool.vercel.app/">
              <div>
                <span className="knum">Policy intelligence</span>
                <h3>AGIS, the AI Governance Intelligence System</h3>
                <p>Query AI governance across 225 jurisdictions and 6,450 sources in plain English. Cross-references what companies promise publicly against what they lobby for privately. Built as a public good for the movement.</p>
              </div>
              <span className="go">Open the tool &rarr;</span>
            </a>
            <Link className="workcard" href="/persuasion">
              <div>
                <span className="knum">Persuasion</span>
                <h3>The Psychographic Message Engine</h3>
                <p>RCT-validated persuasion you can audit, control, and improve. Up to 26 points over human-written messaging, built on 50+ traditions and 290+ subscales.</p>
              </div>
              <span className="go">View &rarr;</span>
            </Link>
            <div className="workcard">
              <div>
                <span className="knum">Governance corpus</span>
                <h3>Frontier AI Lab Policy Database</h3>
                <p>A structured database of the governance positions of 15 frontier labs, 283 documents, with CEO dossiers and power maps tracking lobbying and trade-association funding.</p>
              </div>
            </div>
            <div className="workcard">
              <div>
                <span className="knum">Agentic operations</span>
                <h3>Agent-operated systems</h3>
                <p>Systems that run operational workflows autonomously, then monitor their own outputs. Agents handle the patterned 80%, people keep the judgment calls.</p>
              </div>
            </div>
            <div className="workcard">
              <div>
                <span className="knum">Regulated commerce</span>
                <h3>A brand voice that could ship</h3>
                <p>An AI brand-voice system for a women-owned, queer-led distillery selling a federally regulated product on a hostile ad platform. Compliant, converting, human-sounding copy at a 4x return, then ran without its builder in the room.</p>
              </div>
            </div>
            <div className="workcard">
              <div>
                <span className="knum">Labor intelligence</span>
                <h3>AI intelligence for a national labor organization</h3>
                <p>An AI intelligence product for the political and policy staff of one of the largest labor organizations in the US. Reframes the week&apos;s AI developments for people who negotiate contracts, run campaigns, and advise elected officials.</p>
              </div>
            </div>
          </div>
          <a className="more" href="https://visualizations-eta.vercel.app/">See the full portfolio &rarr;</a>
        </div>
      </section>

      <section className="slate" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <hr className="rule" style={{ marginBottom: '36px' }} />
          <h2>Bring the thing your team hates doing. We will start there.</h2>
          <p className="lede">A short conversation is the fastest way to see whether Hoplight is a fit. No deck required.</p>
          <div className="cta-row" style={{ marginTop: '32px' }}>
            <a className="btn btn-primary" href="https://calendly.com/whitpendergast">Book a conversation</a>
          </div>
        </div>
      </section>
    </>
  );
}
