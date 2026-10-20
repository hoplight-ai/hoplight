import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Masthead from '@/components/Masthead';
import { FACTS } from '@/lib/facts';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Services',
  description:
    'Hoplight services: governance and threat assessment, capacity building, custom systems, and AI visibility. Scoped to the organization in front of us. Pricing follows the engagement.',
  path: '/services',
  ogDescription: 'Governance and threat assessment, capacity building, custom systems, and AI visibility.',
});

// Whit, 2026-10-19 and 2026-10-20: four numbered lines and a close. Text and structure are mockup C
// (public/mockups/c-hybrid/services.html), minus the one word the owner struck from the site.
const LINES = [
  {
    title: 'Governance and threat assessment',
    text: `Where AI fits, the guardrails that keep trust, and who already touches your data. Zero compliance incidents across ${FACTS.company.adSpend} in regulated-industry ad spend.`,
  },
  {
    title: 'Capacity building',
    text: 'Conversation-first training. A 10-module AI curriculum, built and delivered.',
  },
  {
    title: 'Custom systems',
    text: 'Systems built to your workflow, made to run after we leave.',
  },
  {
    title: 'AI visibility',
    text: 'How you show up when a language model writes the answer.',
  },
];

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'AI strategy and governance',
  provider: { '@type': 'Organization', name: 'Hoplight', url: 'https://hoplight.ai' },
  areaServed: 'US',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Hoplight services',
    itemListElement: LINES.map((l) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: l.title } })),
  },
};

export default function Services() {
  return (
    <>
      <JsonLd data={serviceSchema} />

      {/* The same lattice and lens as the front page, as a short band: the field stays on every page. */}
      <Masthead labelledBy="services-title" variant="page">
        <h1 id="services-title">Services</h1>
      </Masthead>

      <section className="svc-lines" aria-label="Services">
        <div className="wrap">
          <ol className="sl">
            {LINES.map((l, i) => (
              <li key={l.title}>
                <span className="sl-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="sl-title">{l.title}</h2>
                <p className="sl-text">{l.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="slate sl-close" aria-label="What this costs">
        <div className="wrap">
          <p className="lede">Pricing follows the engagement. The goal is that you can run it without us.</p>
          <div className="cta-row" style={{ marginTop: '24px' }}>
            <Link className="btn btn-primary" href="/contact">Start a conversation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
