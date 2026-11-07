import type { Metadata } from 'next';
import Link from 'next/link';
import Masthead from '@/components/Masthead';
import { pageMetadata } from '@/lib/metadata';
import { CAPABILITIES, SITE_LINE } from '@/lib/services-content';

// Shape 3 of three under review (Whit, 2026-10-21): four capabilities under the site's own description line.
// A review route: noindex, canonical to /services, not in the sitemap or nav.
export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Services, shape 3',
    description: 'Hoplight services.',
    path: '/services',
  }),
  robots: { index: false, follow: false },
};

export default function ServicesC() {
  return (
    <>
      <Masthead labelledBy="services-title" variant="page">
        <h1 id="services-title">Services</h1>
      </Masthead>

      <div className="wrap caps">
        <p className="caps-line">{SITE_LINE}</p>
        <ul className="caps-grid">
          {CAPABILITIES.map((c) => (
            <li key={c.title}>
              <h2>{c.title}</h2>
              <p>{c.text}</p>
            </li>
          ))}
        </ul>
      </div>

      <section className="slate sl-close" aria-label="Contact">
        <div className="wrap">
          <div className="cta-row">
            <Link className="btn btn-primary" href="/contact">Start a conversation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
