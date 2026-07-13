import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { FACTS } from '@/lib/facts';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Hoplight services: AI governance and readiness, workforce and AI threat assessment, capacity building, custom builds, and AI visibility. Scoped to the organization in front of us.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Services — Hoplight',
    description: 'AI governance, workforce threat assessment, capacity building, custom builds, and AI visibility.',
    url: 'https://hoplight.ai/services',
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'AI strategy and governance',
  provider: { '@type': 'Organization', name: 'Hoplight', url: 'https://hoplight.ai' },
  areaServed: 'US',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Hoplight capabilities',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI governance and readiness' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Workforce and AI threat assessment' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Capacity building and training' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Custom AI builds' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI visibility, GEO and AEO' } },
    ],
  },
};

export default function Services() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <div className="page-hero">
        <div className="wrap">
          <span className="label">Services</span>
          <h1>Where Hoplight goes to work.</h1>
          <p>Five capabilities, scoped to the organization in front of us. Pricing follows the engagement.</p>
        </div>
      </div>

      {/* CAPABILITIES */}
      <section>
        <div className="wrap">
          <div className="svc">
            <div className="svc-row">
              <h3>Ethical AI governance and readiness</h3>
              <p>Where AI fits, the guardrails to deploy it without breaking trust or security, a roadmap your board can act on, and a vendor audit of who is already touching your data. Zero compliance incidents across {FACTS.company.adSpend} in regulated-industry ad spend.</p>
            </div>
            <div className="svc-row">
              <h3>Workforce and AI threat assessment</h3>
              <p>A leadership-ready read on how AI hits your people, your operations, and your strategic position, with a response your executives can move on.</p>
            </div>
            <div className="svc-row">
              <h3>Capacity building and training</h3>
              <p>Conversation-first training that builds real fluency. Cohorts for funders, workshops for a team, and the infrastructure that makes it stick. A 10-module AI curriculum, built and delivered.</p>
            </div>
            <div className="svc-row">
              <h3>Custom AI builds</h3>
              <p>Systems built to your workflow and made to run after we leave. Brand-voice environments, RAG over your own documents, agents for the patterned work. AGIS, one such build, queries AI governance across {FACTS.agis.jurisdictions} jurisdictions and {FACTS.agis.sources} sources in plain English.</p>
            </div>
            <div className="svc-row">
              <h3>AI visibility, GEO and AEO</h3>
              <p>How you show up when the answer comes from a language model. Audit, schema, and structure so AI represents you accurately, before your competitors get there.</p>
            </div>
          </div>
          <p className="formats">We work through a foundation sprint, a funder cohort, a standalone audit, a single build, or licensed access to the message engine. Pricing follows the engagement, and the fastest way to find the right scope is a short conversation.</p>
        </div>
      </section>

      {/* THE HOPLIGHT APPROACH */}
      <section className="slate">
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '32px' }}>
            <span className="label">The Hoplight approach</span>
            <h2>Start with the thing people hate doing every week. Solve that first.</h2>
          </div>
          <div className="steps">
            <div className="step" style={{ borderTopColor: 'rgba(244,240,231,0.18)' }}>
              <div className="n" style={{ color: 'var(--gold-bright)' }}>01</div>
              <div>
                <h3>Sentiment and stack audit</h3>
                <p style={{ color: 'rgba(244,240,231,0.7)' }}>Anonymous, no wrong answers. What are people already using, what are they afraid of, and where is the shadow AI. You can&apos;t govern what you can&apos;t see.</p>
              </div>
            </div>
            <div className="step" style={{ borderTopColor: 'rgba(244,240,231,0.18)' }}>
              <div className="n" style={{ color: 'var(--gold-bright)' }}>02</div>
              <div>
                <h3>Build for real pain points</h3>
                <p style={{ color: 'rgba(244,240,231,0.7)' }}>A custom prompt that pulls the politically sensitive items into their own section. A brand-voice system. A RAG project over your own documents. Bespoke beats a generic training on Claude every time.</p>
              </div>
            </div>
            <div className="step" style={{ borderTopColor: 'rgba(244,240,231,0.18)' }}>
              <div className="n" style={{ color: 'var(--gold-bright)' }}>03</div>
              <div>
                <h3>Upskill, don&apos;t just train</h3>
                <p style={{ color: 'rgba(244,240,231,0.7)' }}>You have an intern with access to everything ever written, who starts fresh every morning unless you build the infrastructure for them to step into. We teach people to hold a conversation with that intern, not to Google in a smarter way.</p>
              </div>
            </div>
            <div className="step" style={{ borderTopColor: 'rgba(244,240,231,0.18)', borderBottomColor: 'rgba(244,240,231,0.18)' }}>
              <div className="n" style={{ color: 'var(--gold-bright)' }}>04</div>
              <div>
                <h3>Stand it up so it&apos;s yours.</h3>
                <p style={{ color: 'rgba(244,240,231,0.7)' }}>We help you build the maintenance muscle in-house: your people, trained, owning what we built together. You&apos;re not locked into perpetual fees to us. If you want us to stay close, we can, but the goal is that you can run it without us.</p>
              </div>
            </div>
          </div>
          <p className="unlock" style={{ borderLeftColor: 'var(--gold-bright)', color: 'var(--paper)', margin: '44px 0 0' }}>The a-ha moment in AI adoption happens when one of your team asks: wait, if it can do this, can it do that? Everything else follows from there.</p>
        </div>
      </section>

      {/* THE NON-ADOPTER */}
      <section>
        <div className="wrap">
          <div className="barn">
            <span className="label" style={{ display: 'block', marginBottom: '18px' }}>Even if you say no</span>
            <h2>Not adopting AI? You still have to engage with it.</h2>
            <p>Even if you never deploy a single tool, you need to understand your exposure, set an AI policy, vet the vendors layering AI into your stack, give your team talking points, and secure against shadow AI. We help you do that, and justify the call to your own people.</p>
          </div>
        </div>
      </section>

      {/* CLOSE */}
      <section className="slate" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <hr className="rule" style={{ marginBottom: '36px' }} />
          <p className="lede">The fastest way to scope the right engagement is a short conversation.</p>
          <div className="cta-row" style={{ marginTop: '24px' }}>
            <Link className="btn btn-primary" href="/contact">Start a conversation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
