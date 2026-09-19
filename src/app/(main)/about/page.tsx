import type { Metadata } from 'next';
import Link from 'next/link';
import { FACTS } from '@/lib/facts';
import JsonLd from '@/components/JsonLd';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'About',
  description:
    'Hoplight is led by Whit Pendergast. Enterprise-grade AI strategy for organizations that can’t hire a Chief AI Officer.',
  path: '/about',
  ogDescription: 'Led by Whit Pendergast. Enterprise-grade AI strategy for mission-driven organizations.',
});

const founderSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Whit Pendergast',
  jobTitle: 'Founder, Hoplight',
  worksFor: { '@type': 'Organization', name: 'Hoplight', url: 'https://hoplight.ai' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'MIT' },
  sameAs: ['https://www.linkedin.com/in/whit-pendergast/'],
  url: 'https://hoplight.ai/about',
};

export default function About() {
  return (
    <>
      <JsonLd data={founderSchema} />
      <div className="page-hero">
        <div className="wrap">
          <span className="label">About</span>
          <h1>Hoplight is led by Whit Pendergast.</h1>
          <p>Enterprise-grade AI strategy, brought to the organizations that can&rsquo;t hire a Chief AI Officer.</p>
          <p className="about-linkedin">
            <a href="https://www.linkedin.com/in/whit-pendergast/" target="_blank" rel="noopener noreferrer">
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="prose" style={{ maxWidth: '65ch' }}>
            <p style={{ color: 'var(--ink-soft)', fontSize: '1.15rem' }}>Whit founded Hoplight to fill a gap in the AI ecosystem: values-aligned, pro-growth AI adoption that centers and empowers workers.</p>
            <p style={{ color: 'var(--stone-deep)' }}>Twenty years of building at the cutting edge. He started in the labor movement in 2010, where he built a network intelligence system for managing movement relationships and political capital during the campaign to defeat right-to-work legislation &mdash; one of the few bright spots for labor in that political era. He left in 2015 to co-found Republic Restoratives, the largest crowdfunded distillery in US history. He got the distillery registered with the FDA, pivoted it to become the second distillery in the country to produce hand sanitizer during the pandemic, and got the product listed on Amazon Prime.</p>
            <p style={{ color: 'var(--stone-deep)' }}>From running frontline congressional races, to building blind door-knock programs that drove turnout in New Hampshire, to selling hand sanitizer in the depths of the pandemic, his career has been defined by building things other people said couldn&rsquo;t work. He spent the next several years building AI: first to market a regulated product on a hostile ad platform at {FACTS.company.roas} return on ad spend, then to shift attitudes in a {FACTS.rct.n}-person randomized controlled trial.</p>
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

          <p className="about-recruit" style={{ marginTop: '40px' }}>
            We&rsquo;re always talking to exceptional trainers and builders. If that&rsquo;s you,{' '}
            <Link href="/contact?path=talent">reach out &rarr;</Link>
          </p>

          <div className="cta-row" style={{ marginTop: '24px' }}>
            <Link className="btn btn-primary" href="/contact">Start a conversation &rarr;</Link>
          </div>
        </div>
      </section>
    </>
  );
}
