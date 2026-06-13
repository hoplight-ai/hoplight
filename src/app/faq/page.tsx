import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ — Hoplight',
  description: 'Straight answers to the questions mission-driven organizations actually ask before bringing AI into their work.',
};

export default function Faq() {
  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <span className="label">FAQ</span>
          <h1>The questions you are actually asking.</h1>
          <p>Plain answers to what mission-driven leaders raise before they bring AI anywhere near their work.</p>
        </div>
      </div>

      <section>
        <div className="wrap faq">
          <details>
            <summary>How do you protect our data and our members&apos; information? <span className="chev" aria-hidden="true">+</span></summary>
            <div className="a">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
          </details>
          <details>
            <summary>What if we choose the wrong tool, or the wrong direction? <span className="chev" aria-hidden="true">+</span></summary>
            <div className="a">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
          </details>
          <details>
            <summary>What if our members or staff find out we are using AI? <span className="chev" aria-hidden="true">+</span></summary>
            <div className="a">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
          </details>
          <details>
            <summary>We may not want to adopt AI at all. Can you still help? <span className="chev" aria-hidden="true">+</span></summary>
            <div className="a">Lorem ipsum dolor sit amet. See <Link href="/services">Services</Link> for how we help organizations engage with AI risk, policy, and vendors without deploying a single tool.</div>
          </details>
          <details>
            <summary>How much does an engagement cost? <span className="chev" aria-hidden="true">+</span></summary>
            <div className="a">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pricing follows the engagement, scoped after a short conversation.</div>
          </details>
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
