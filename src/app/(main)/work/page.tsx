import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'A selection of shipped AI systems built for labor, advocacy, and mission-driven organizations. What each one does, and who it serves.',
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'Work — Hoplight',
    description: 'Shipped AI systems national organizations are already running.',
    url: 'https://hoplight.ai/work',
  },
};

export default function Work() {
  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <span className="label">Work</span>
          <h1>Still not sure what AI can do for you? Look at what national organizations are already running.</h1>
          <p>A selection of shipped systems. What each one does, and who it serves.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="workcards">
            <a className="workcard" href="https://ai-policy-tool.vercel.app/">
              <div>
                <span className="knum">Policy intelligence</span>
                <h3>AGIS, the AI Governance Intelligence System</h3>
                <p>Query AI governance across 2,100+ jurisdictions and 31,900+ sources in plain English. Built as a public good for the movement.</p>
              </div>
              <span className="go">Open the tool &rarr;</span>
            </a>
            <Link className="workcard" href="/persuasion">
              <div>
                <span className="knum">Persuasion</span>
                <h3>The Psychographic Message Engine</h3>
                <p>RCT-validated persuasion you can audit, control, and improve. 3,006-person randomized controlled trial.</p>
              </div>
              <span className="go">View &rarr;</span>
            </Link>
            <div className="workcard">
              <div>
                <span className="knum">Agentic operations</span>
                <h3>Agent-operated systems</h3>
                <p>Agents handle the patterned 80%. People keep the judgment calls.</p>
              </div>
            </div>
            <div className="workcard">
              <div>
                <span className="knum">Regulated commerce</span>
                <h3>A brand voice that could ship</h3>
                <p>Compliant, converting, human-sounding copy for a regulated product on a hostile ad platform. 4x return on ad spend, then ran without its builder in the room.</p>
              </div>
            </div>
            <div className="workcard">
              <div>
                <span className="knum">Labor intelligence</span>
                <h3>AI intelligence for a national labor organization</h3>
                <p>Reframes the week&apos;s AI developments for political and policy staff at a national labor organization.</p>
              </div>
            </div>
          </div>
          <Link className="more" href="/portfolio">See the full portfolio &rarr;</Link>
        </div>
      </section>

      {/* ANCHOR LINE — Ink */}
      <section className="slate">
        <div className="wrap">
          <p className="anchorline">AI works best when it&apos;s designed with, and built for, the people it serves.</p>
        </div>
      </section>

      <section className="slate" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <hr className="rule" style={{ marginBottom: '36px' }} />
          <p className="lede">See something that fits?</p>
          <div className="cta-row" style={{ marginTop: '24px' }}>
            <Link className="btn btn-primary" href="/contact">Start a conversation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
