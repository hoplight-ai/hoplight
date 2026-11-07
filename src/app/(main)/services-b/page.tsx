import type { Metadata } from 'next';
import Link from 'next/link';
import Masthead from '@/components/Masthead';
import { pageMetadata } from '@/lib/metadata';
import { HOW, WHAT, WHY } from '@/lib/services-content';

// Shape 2 of three under review (Whit, 2026-10-21): Why, What, How. A review route: noindex, canonical to
// /services, not in the sitemap or nav. Why and What are the owner's own words; How is the four step titles.
export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Services, shape 2',
    description: 'Hoplight services.',
    path: '/services',
  }),
  robots: { index: false, follow: false },
};

export default function ServicesB() {
  return (
    <>
      <Masthead labelledBy="services-title" variant="page">
        <h1 id="services-title">Services</h1>
      </Masthead>

      <div className="wrap wwh">
        <section className="wwh-row" aria-labelledby="why-title">
          <h2 id="why-title">Why</h2>
          <div className="wwh-text wwh-big">
            {WHY.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </section>
        <section className="wwh-row" aria-labelledby="what-title">
          <h2 id="what-title">What</h2>
          <div className="wwh-text wwh-big">
            <p>{WHAT.join(' ')}</p>
          </div>
        </section>
        <section className="wwh-row" aria-labelledby="how-title">
          <h2 id="how-title">How</h2>
          <div className="wwh-text">
            <p>{HOW}</p>
          </div>
        </section>
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
