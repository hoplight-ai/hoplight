import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Production AI systems, research infrastructure, and institutional tools built by Hoplight.',
  alternates: {
    canonical: 'https://hoplight.ai/work',
  },
  openGraph: {
    title: 'Work | Hoplight',
    description: 'Production AI systems, research infrastructure, and institutional tools built by Hoplight.',
    url: 'https://hoplight.ai/work',
    siteName: 'Hoplight',
    type: 'website',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Hoplight Portfolio',
  description: 'Production AI systems, research infrastructure, and institutional tools.',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'SoftwareApplication',
        name: 'ARIA: AI Regulation Intelligence Atlas',
        url: 'https://ai-policy-tool.vercel.app',
        description: 'Comprehensive AI policy database covering 5600+ documents across 101 jurisdictions.',
        applicationCategory: 'ResearchApplication',
        creator: { '@type': 'Organization', name: 'Hoplight' },
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'CreativeWork',
        name: 'Frontier AI Lab Policy Database',
        description: 'Structured database of policy documents from 15 frontier AI labs, totaling 283 documents.',
        creator: { '@type': 'Organization', name: 'Hoplight' },
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'CreativeWork',
        name: 'AI Intelligence Newsletter',
        description: 'Weekly AI analysis for political and policy staff at SEIU.',
        creator: { '@type': 'Organization', name: 'Hoplight' },
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'CreativeWork',
        name: 'Psychometric Assessment Architecture Audit',
        description: 'Comprehensive audit across 65+ psychometric traditions and 290+ subscales.',
        creator: { '@type': 'Organization', name: 'Hoplight' },
      },
    },
    {
      '@type': 'ListItem',
      position: 5,
      item: {
        '@type': 'CreativeWork',
        name: 'AI-Driven Workforce Restructuring Analysis',
        description: '2025-2026 workforce restructuring pattern analysis using data from Meta, Amazon, and Microsoft.',
        creator: { '@type': 'Organization', name: 'Hoplight' },
      },
    },
    {
      '@type': 'ListItem',
      position: 6,
      item: {
        '@type': 'CreativeWork',
        name: 'Agentic AI Systems for Operations',
        description: 'Design and deployment of 70+ agentic AI systems for operational automation.',
        creator: { '@type': 'Organization', name: 'Hoplight' },
      },
    },
    {
      '@type': 'ListItem',
      position: 7,
      item: {
        '@type': 'CreativeWork',
        name: 'Persuasion & Messaging Systems',
        description: 'RCT-validated five-dimension psychographic messaging model producing 26-point lift.',
        creator: { '@type': 'Organization', name: 'Hoplight' },
      },
    },
    {
      '@type': 'ListItem',
      position: 8,
      item: {
        '@type': 'CreativeWork',
        name: 'AI Governance Frameworks',
        description: 'Authored governing AI policy document for SEIU, a 2-million-member labor union.',
        creator: { '@type': 'Organization', name: 'Hoplight' },
      },
    },
    {
      '@type': 'ListItem',
      position: 9,
      item: {
        '@type': 'CreativeWork',
        name: 'Republic Restoratives (2015-2025)',
        description: 'Co-founded LGBTQ-led DTC spirits brand reaching $10M valuation with full federal compliance.',
        creator: { '@type': 'Organization', name: 'Hoplight' },
      },
    },
  ],
}

export default function WorkPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main>
        <h1>Work</h1>
        <p className="subtitle">Production systems, research, and institutional infrastructure.</p>

        <div className="project">
          <h2>
            <a href="https://ai-policy-tool.vercel.app" target="_blank" rel="noopener noreferrer">
              ARIA: AI Regulation Intelligence Atlas
            </a>
          </h2>
          <p className="project-meta">SoftwareApplication</p>
          <p>
            A public-facing AI policy research tool indexing 5,600+ regulatory documents across 101
            jurisdictions. Built for policy professionals, researchers, and advocates navigating the
            global AI governance landscape.
          </p>
          <div>
            <span className="tag">AI Governance</span>
            <span className="tag">Policy Research</span>
            <span className="tag">101 Jurisdictions</span>
            <span className="tag">Public Good</span>
          </div>
        </div>

        <div className="project">
          <h2>Frontier AI Lab Policy Database</h2>
          <p className="project-meta">Research Infrastructure</p>
          <p>
            Structured competitive intelligence database covering 15 frontier AI labs and 283 policy,
            safety, and governance documents. Designed for rapid cross-lab comparison and longitudinal
            tracking.
          </p>
          <div>
            <span className="tag">Competitive Intelligence</span>
            <span className="tag">15 Labs</span>
            <span className="tag">283 Documents</span>
            <span className="tag">Policy Research</span>
          </div>
        </div>

        <div className="project">
          <h2>AI Intelligence Newsletter</h2>
          <p className="project-meta">Content Strategy</p>
          <p>
            Weekly AI analysis written for political and policy staff at one of the largest labor
            organizations in the US. Translates frontier model developments, regulatory shifts, and
            workforce implications into actionable strategic context.
          </p>
          <div>
            <span className="tag">Political Strategy</span>
            <span className="tag">Labor Relations</span>
            <span className="tag">Content Strategy</span>
            <span className="tag">AI Policy</span>
          </div>
        </div>

        <div className="project">
          <h2>Psychometric Assessment Architecture Audit</h2>
          <p className="project-meta">Research Design</p>
          <p>
            Comprehensive mapping of the psychometric landscape across 65+ traditions and 290+
            subscales. Used to identify measurement gaps, redundancies, and architectural anchors for
            a next-generation assessment framework.
          </p>
          <div>
            <span className="tag">Psychometrics</span>
            <span className="tag">Research Design</span>
            <span className="tag">65+ Traditions</span>
            <span className="tag">290+ Subscales</span>
          </div>
        </div>

        <div className="project">
          <h2>AI-Driven Workforce Restructuring Analysis</h2>
          <p className="project-meta">Strategic Analysis</p>
          <p>
            Pattern analysis of 2025-2026 workforce restructuring decisions at Meta, Amazon, and
            Microsoft. Identifies the role of AI capability advancement in headcount decisions and
            provides forward-looking exposure estimates for labor-intensive functions.
          </p>
          <div>
            <span className="tag">Labor Economics</span>
            <span className="tag">Strategic Analysis</span>
            <span className="tag">Workforce Automation</span>
            <span className="tag">Financial Analysis</span>
          </div>
        </div>

        <div className="project">
          <h2>Agentic AI Systems for Operations</h2>
          <p className="project-meta">Systems Design</p>
          <p>
            Design and deployment of 70+ agentic AI systems built on an 80/20 philosophy: automate
            the high-frequency, low-judgment work so human attention concentrates where it compounds.
            Covers research, drafting, scheduling, tracking, and cross-platform coordination.
          </p>
          <div>
            <span className="tag">Process Automation</span>
            <span className="tag">Systems Design</span>
            <span className="tag">Operations</span>
            <span className="tag">70+ Systems</span>
          </div>
        </div>

        <div className="project">
          <h2>Persuasion &amp; Messaging Systems</h2>
          <p className="project-meta">Psychographics</p>
          <p>
            A five-dimension psychographic messaging model validated through RCT, producing a
            26-point lift in persuasion outcomes. Domain-agnostic architecture built for electoral,
            advocacy, and commercial applications.
          </p>
          <div>
            <span className="tag">Psychographics</span>
            <span className="tag">RCT Validated</span>
            <span className="tag">26-Point Lift</span>
            <span className="tag">Domain Agnostic</span>
          </div>
        </div>

        <div className="project">
          <h2>AI Governance Frameworks</h2>
          <p className="project-meta">Institutional</p>
          <p>
            Authored the governing AI policy document for a 2-million-member labor union. Covers
            permitted use cases, prohibited applications, disclosure requirements, member data
            protections, and staff training standards.
          </p>
          <div>
            <span className="tag">AI Governance</span>
            <span className="tag">Institutional</span>
            <span className="tag">Compliance</span>
            <span className="tag">Training</span>
          </div>
        </div>

        <div className="project">
          <h2>Republic Restoratives (2015-2025)</h2>
          <p className="project-meta">DTC Operations</p>
          <p>
            Co-founded an LGBTQ-led craft spirits brand from concept to $10M valuation over a decade.
            Built direct-to-consumer operations, managed federal TTB compliance, and navigated
            three-tier distribution across multiple states.
          </p>
          <div>
            <span className="tag">DTC Operations</span>
            <span className="tag">$10M Valuation</span>
            <span className="tag">Federal Compliance</span>
            <span className="tag">LGBTQ-Led</span>
          </div>
        </div>
      </main>
    </>
  )
}
