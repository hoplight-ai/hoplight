import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Hoplight is led by Whit Pendergast, who directs AI strategy inside one of the largest labor unions in the United States. Enterprise-grade AI strategy for organizations that can’t hire a Chief AI Officer.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About — Hoplight',
    description: 'Led by Whit Pendergast. Enterprise-grade AI strategy for mission-driven organizations.',
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
          <p>Enterprise-grade AI strategy, brought to the organizations that can&apos;t hire a Chief AI Officer.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="prose" style={{ maxWidth: '65ch' }}>
            <p style={{ color: 'var(--ink-soft)', fontSize: '1.15rem' }}>Whit leads AI strategy inside one of the largest labor unions in North America, guiding adoption, governance, and deployment across a 2-million-member organization. He founded Hoplight to fill a gap in the AI ecosystem: values-aligned, pro-growth AI adoption that centers and empowers workers.</p>
            <p style={{ color: 'var(--stone-deep)' }}>Twenty years of building at the cutting edge. He started in the labor movement in 2010, where he built a network intelligence system for managing movement relationships and political capital during the campaign to defeat right-to-work legislation - one of the few bright spots for labor in that political era. He left in 2015 to co-found Republic Restoratives, producers of Fascist Tears Vodka and Dissent Gin, which became the largest crowdfunded distillery in US history - because the banks wouldn&apos;t fund them. He got the distillery registered with the FDA, pivoted it to become the second distillery in the country to produce hand sanitizer during the pandemic, and got the product listed on Amazon Prime.</p>
            <p style={{ color: 'var(--stone-deep)' }}>From frontline congressional races to blind door-knock programs that drove turnout in New Hampshire to selling hand sanitizer in the depths of the pandemic, his career has been defined by building things other people said couldn&apos;t work. He spent the next years building AI: first to market a regulated product on a hostile ad platform at 4x return on ad spend, then to move voters in a 3,006-person randomized controlled trial.</p>
            <p style={{ color: 'var(--stone-deep)' }}>He has no engineering background. Everything he knows about AI he learned by asking questions in natural language until the tools gave up how they work. He holds a certificate from MIT in Agentic AI for Organizational Transformation.</p>
          </div>

          <div className="mit-credential">
            <img src="/mit-logo.png" alt="Massachusetts Institute of Technology" width={600} height={400} />
            <span className="mc-text">Certificate in Agentic AI for Organizational Transformation, MIT.</span>
          </div>

          <h2 style={{ margin: '52px 0 18px' }}>Not a solo shop.</h2>
          <div className="prose" style={{ maxWidth: '65ch' }}>
            <p style={{ color: 'var(--stone-deep)' }}>Whit leads a team: a project manager, a bench of builders, and trusted subcontractors.</p>
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
          <p className="lede">Ready to talk?</p>
          <div className="cta-row" style={{ marginTop: '24px' }}>
            <Link className="btn btn-primary" href="/contact">Start a conversation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
