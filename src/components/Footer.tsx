import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap foot-tri">
        <div className="foot-col">
          <span className="foot-heading">Work with us</span>
          <p className="foot-text">AI strategy for labor, advocacy, and mission-driven organizations.</p>
          <Link className="foot-cta" href="/contact">Get in touch &rarr;</Link>
        </div>
        <div className="foot-col">
          <span className="foot-heading">Substack</span>
          <p className="foot-text">Essays on AI, labor, and the politics of technology adoption.</p>
          <a className="foot-cta" href="https://whitpendergast.substack.com" target="_blank" rel="noopener noreferrer">Read &rarr;</a>
        </div>
        <div className="foot-col">
          <span className="foot-heading">Start a convo</span>
          <p className="foot-text">A short conversation is the fastest way to see if we are a fit.</p>
          <a className="foot-cta" href="https://calendly.com/whitpendergast">Book time &rarr;</a>
        </div>
      </div>
    </footer>
  );
}
