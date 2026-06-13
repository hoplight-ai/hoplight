import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Hoplight',
  description: 'Hoplight is led by Whit Pendergast, a political strategist and AI practitioner working at the intersection of labor, advocacy, and AI.',
};

export default function About() {
  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <span className="label">About</span>
          <h1>Built in the work, not above it.</h1>
          <p>A decade in labor and a high-stakes run in regulated commerce. The methods were forged under real constraints, with real money and real outcomes on the line.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="prose" style={{ maxWidth: '65ch' }}>
            <p style={{ color: 'var(--ink-soft)', fontSize: '1.15rem' }}>Hoplight is led by Whit Pendergast, a political strategist who learned AI the way his clients will: in natural language, by building tools to solve problems nobody else was solving.</p>
            <p style={{ color: 'var(--stone)' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p style={{ color: 'var(--stone)' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
          <Link className="more" href="/work">See the work &rarr;</Link>
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
