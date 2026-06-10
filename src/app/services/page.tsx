import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'AI governance sprints, capacity building cohorts, agentic systems design, persuasion systems, and GEO audits for labor unions, progressive organizations, and mission-driven businesses. Book a session or scope an engagement.',
  alternates: { canonical: 'https://hoplight.ai/services' },
  openGraph: {
    title: 'Services | Hoplight',
    description:
      'AI governance, agentic operations, persuasion systems, capacity building, and GEO audits for mission-driven organizations.',
    url: 'https://hoplight.ai/services',
  },
}

export default function Services() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: 'Hoplight LLC',
            url: 'https://hoplight.ai/services',
            serviceType: [
              'AI Consulting',
              'AI Governance',
              'AI Systems Architecture',
              'Political Technology',
              'Generative Engine Optimization',
            ],
            areaServed: { '@type': 'Country', name: 'United States' },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'AI Services',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'AI Foundation Sprint',
                    description:
                      'Full-stack AI readiness assessment and implementation roadmap',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'AI Capacity Building Cohort',
                    description:
                      'Multi-organization cohort program with structured curriculum and individual advising',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Agentic AI Systems Design',
                    description:
                      'Convert manual workflows into autonomous agent architectures',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Persuasion & Messaging Systems',
                    description:
                      'RCT-validated psychographic messaging calibrated to audience segments',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Generative Engine Optimization Audit',
                    description:
                      'Ensure accurate AI representation of your organization',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'AI Strategy Session',
                    description:
                      'One-session clarity on where AI fits in your operation',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Vendor Results Audit',
                    description:
                      'Assessment of what your AI vendor actually delivered',
                  },
                },
              ],
            },
          }),
        }}
      />

      <h1>Services</h1>
      <p className="subtitle">
        Engagements and sessions for organizations building serious AI
        infrastructure.
      </p>

      <p className="tier-label">Engagements</p>

      <div className="service-item">
        <h3>AI foundation sprint</h3>
        <p>
          Full-stack AI readiness assessment and implementation roadmap for
          organizations starting from zero. Governance frameworks, vendor
          audits, staff training plans, integration priorities. You leave with a
          document your board can act on and your team can execute.
        </p>
        <p className="audience">
          For: organizations that know they need AI infrastructure and need a
          structured path to building it.
        </p>
      </div>

      <div className="service-item">
        <h3>Capacity building cohort</h3>
        <p>
          Multi-organization cohort program with structured curriculum and
          individual advising. Participants ship working systems by the end of
          the engagement. Hands-on AI adoption, not slide decks about AI
          adoption. Built for foundations and intermediaries funding AI capacity
          across their grantee networks.
        </p>
        <p className="audience">
          For: foundations, intermediaries, and network organizations that need
          to build AI capacity across multiple grantees or affiliates.
        </p>
      </div>

      <div className="service-item">
        <h3>Agentic AI systems design</h3>
        <p>
          Convert manual operational workflows into autonomous agent
          architectures. The systems handle the 80% of operational work that
          follows recognizable patterns, preserving human judgment for the 20%
          that requires it. Production-grade, monitored, and built to improve
          over time.
        </p>
        <p className="audience">
          For: organizations spending significant staff time on pattern-matching
          work that could run autonomously.
        </p>
      </div>

      <div className="service-item">
        <h3>Persuasion and messaging systems</h3>
        <p>
          AI-generated messaging calibrated to psychographic profiles using a
          five-dimension model of message responsiveness. RCT-validated:
          26-point lift over human progressive alternatives with
          conservative-leaning audiences. The policy stays identical. The frame
          personalizes. Domain-agnostic framework spanning campaigns, advocacy,
          healthcare, and organizational communication.
        </p>
        <p className="audience">
          For: campaigns, advocacy organizations, and communications teams that
          need to reach audiences outside their base.
        </p>
      </div>

      <div className="service-item">
        <h3>Generative engine optimization audit</h3>
        <p>
          How does your organization appear when someone asks ChatGPT,
          Perplexity, or Google AI Overviews about your field? GEO audits assess
          your schema markup, content structure, authority signals, and crawler
          access. You leave with a specific action plan for how AI systems
          represent you.
        </p>
        <p className="audience">
          For: any organization that needs to be accurately represented by AI
          answer engines.
        </p>
      </div>

      <div className="service-item">
        <h3>AI governance frameworks</h3>
        <p>
          Governance checklists, vendor AI audit frameworks, AI integration
          plans, staff training programs, and implementation guides. Built for
          institutions that operate across multiple states and jurisdictions
          with compliance obligations older than the technology. Governance that
          meets organizations where they are, not where the AI industry wishes
          they were.
        </p>
        <p className="audience">
          For: unions, membership organizations, and regulated entities that
          need governance before they need technology.
        </p>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <p className="tier-label">Start here</p>
        <p
          style={{
            marginBottom: '1.5rem',
            color: 'var(--stone)',
            fontSize: '0.95rem',
          }}
        >
          Individual sessions for when you need clarity before committing to an
          engagement. Each session is a working meeting. You leave with
          something concrete.
        </p>
      </div>

      <div className="service-item">
        <h3>AI strategy session</h3>
        <p>
          Clarity on where AI fits in your operation. We map your current
          workflows against what AI can realistically handle today, where the
          opsec and bias vulnerabilities lie, and what's worth investing in vs.
          what's hype. Sometimes the answer is "not here, not yet."
        </p>
        <p className="audience">
          For: executives and operators who need direction before committing
          resources.
        </p>
        <a
          href="https://calendly.com/whitpendergast/ai-strategy-session"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-outline"
        >
          Book this session
        </a>
      </div>

      <div className="service-item">
        <h3>Where your data goes when you use AI</h3>
        <p>
          Each major LLM handles your inputs differently: what gets stored, what
          gets trained on, what's visible to third parties. You learn what data
          each one exposes and how to secure it, what each tool is best at, and
          how to match the right tool to the right task without putting
          sensitive information at risk.
        </p>
        <p className="audience">
          For: organizations handling strategic planning, member data, donor
          records, health info, or anything with regulatory exposure.
        </p>
        <a
          href="https://calendly.com/whitpendergast/ai-opsec-w-llm"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-outline"
        >
          Book this session
        </a>
      </div>

      <div className="service-item">
        <h3>Vendor results audit</h3>
        <p>
          Assessment of what your vendor actually delivered. We surface industry
          best practices to benchmark against and create a clear picture of
          what's working and what to push back on. Useful before renewal
          conversations or when something feels off but you can't name it.
        </p>
        <p className="audience">
          For: anyone managing a vendor without exact domain expertise.
        </p>
        <a
          href="https://calendly.com/whitpendergast/vendor-results-audit"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-outline"
        >
          Book this session
        </a>
      </div>

      <div className="service-item">
        <h3>Research roadmap</h3>
        <p>
          You bring the question. We build the path to answering it through
          frontier AI tools. Prompting best practices, the optimal tools for
          each research step, and common missteps to avoid.
        </p>
        <p className="audience">
          For: leaders facing a decision who need structured thinking, not more
          tabs.
        </p>
        <a
          href="https://calendly.com/whitpendergast/session-research-roadmap"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-outline"
        >
          Book this session
        </a>
      </div>

      <div className="service-item">
        <h3>Meeting intelligence setup: Google Workspace</h3>
        <p>
          Secure meeting capture with action items and sensitivity filtering. A
          working system configured before you hang up.
        </p>
        <p className="audience">
          For: anyone drowning in meetings who needs reliable capture without
          privacy risk.
        </p>
        <a
          href="https://calendly.com/whitpendergast/session-meeting-intelligence"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-outline"
        >
          Book this session
        </a>
      </div>
    </>
  )
}
