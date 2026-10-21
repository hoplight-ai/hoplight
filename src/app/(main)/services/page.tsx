import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Masthead from '@/components/Masthead';
import { pageMetadata } from '@/lib/metadata';
import { CAPABILITIES, METHOD_H1, STEPS } from '@/lib/services-content';

export const metadata: Metadata = pageMetadata({
  title: 'Services',
  description:
    'Hoplight services: governance and threat assessment, capacity building, custom systems, and AI visibility. Scoped to the organization in front of us.',
  path: '/services',
  ogDescription: 'Governance and threat assessment, capacity building, custom systems, and AI visibility.',
});

// Shape 1 of three under review (Whit, 2026-10-21: "mock up 15- i need to see what you mean"): the method.
// Four numbered lines, one sentence each, under the owner's approved headline. Shape 2 is /services-b and
// shape 3 is /services-c; both are review routes. Copy lives in src/lib/services-content.ts.
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'AI strategy and governance',
  provider: { '@type': 'Organization', name: 'Hoplight', url: 'https://hoplight.ai' },
  areaServed: 'US',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Hoplight services',
    itemListElement: CAPABILITIES.map((c) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: c.title } })),
  },
};

export default function Services() {
  return (
    <>
      <JsonLd data={serviceSchema} />

      {/* The same lattice and lens as the front page, as a short band: the field stays on every page. */}
      <Masthead labelledBy="services-title" variant="page">
        <h1 id="services-title" className="method">{METHOD_H1}</h1>
      </Masthead>

      <section className="svc-lines" aria-label="Services">
        <div className="wrap">
          <ol className="sl">
            {STEPS.map((l, i) => (
              <li key={l.title}>
                <span className="sl-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="sl-title">{l.title}</h2>
                <p className="sl-text">{l.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

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
