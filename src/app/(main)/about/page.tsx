import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Hoplight is led by Whit Pendergast, who directs AI strategy inside one of the largest labor unions in the United States. Institutional-grade AI capability for organizations that can’t hire a Chief AI Officer.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About — Hoplight',
    description: 'Led by Whit Pendergast. Institutional-grade AI capability for mission-driven organizations.',
    url: 'https://hoplight.ai/about',
  },
};

export default function About() {
  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <span className="label">About</span>
          <h1>Hoplight is led by Whit Pendergast.</h1>
          <p>Institutional-grade AI capability, brought to the organizations that can&apos;t hire a Chief AI Officer.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="prose" style={{ maxWidth: '65ch' }}>
            <p style={{ color: 'var(--ink-soft)', fontSize: '1.15rem' }}>Whit directs AI strategy inside one of the largest labor unions in the United States, a 2-million-member organization, where he leads AI adoption, governance, and deployment. He founded Hoplight to bring that same institutional-grade capability to organizations that can&apos;t hire a Chief AI Officer.</p>
            <p style={{ color: 'var(--stone-deep)' }}>His lane is the hard stuff: fascism, long-term structural reform, and now AI. He started in the labor movement in 2010, left in 2015 to co-found Republic Restoratives, which became the largest crowdfunded distillery in US history, and spent the next years building AI, first to market a regulated product, then to move voters. He has no engineering background. Everything he knows about AI he learned by asking questions in natural language until the tools gave up how they work.</p>
          </div>

          <h2 style={{ margin: '52px 0 18px' }}>Not a solo shop.</h2>
          <div className="prose" style={{ maxWidth: '65ch' }}>
            <p style={{ color: 'var(--stone-deep)' }}>Whit leads a team: a project manager, a bench of builders, and trusted subcontractors. Engagements ship, and they keep running after we leave.</p>
          </div>

          <div className="pull" style={{ marginTop: '40px' }}>
            <p>We&apos;re always talking to exceptional trainers and builders. If that&apos;s you, reach out.</p>
            <Link className="more" href="/contact?path=talent" style={{ marginTop: '14px' }}>Work with us &rarr;</Link>
          </div>
        </div>
      </section>

      <section className="slate" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <hr className="rule" style={{ marginBottom: '36px' }} />
          <div className="cta-row" style={{ marginTop: '8px' }}>
            <Link className="btn btn-primary" href="/contact">Start a conversation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
