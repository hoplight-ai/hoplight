import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

// A global not-found.tsx renders through the root layout only, outside the (main) route group,
// so it does not inherit MainLayout's Nav/Footer/skip-link automatically. Replicating that
// wrapper here (site review, 2026-09-16: the previous 404 was a bare black page with nothing
// clickable on it) instead of moving 404 handling into (main), which Next does not support for
// the global not-found file.
export default function NotFound() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav />
      <main id="main">
        <div className="page-hero">
          <div className="wrap">
            <span className="label">404</span>
            <h1>This page could not be found.</h1>
            <p>
              The link may be old, or the page may have moved. Start a conversation, or head back
              to the homepage.
            </p>
          </div>
        </div>
        <section>
          <div className="wrap">
            <div className="cta-row">
              <Link className="btn btn-primary" href="/">
                Back to hoplight.ai &rarr;
              </Link>
              <Link className="btn btn-ghost" href="/contact">
                Start a conversation &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
