import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Hoplight | AI systems for labor, advocacy, and mission-driven organizations',
  alternates: { canonical: 'https://hoplight.ai/' },
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Hoplight LLC",
          "url": "https://hoplight.ai",
          "founder": {
            "@type": "Person",
            "name": "Whit Kathner",
            "alternateName": "Whit Pendergast",
            "jobTitle": "Founder",
            "description": "AI strategist directing adoption for a 2-million-member labor union. Previously Regional Campaigns Director at SEIU, co-founder of Republic Restoratives, and operator of 130+ production AI systems across electoral, organizing, and compliance contexts.",
            "knowsAbout": ["AI Governance", "AI Systems Architecture", "Labor Technology", "Political Campaign Technology", "Psychometric Assessment Design", "Agentic AI Systems", "Generative Engine Optimization", "AI Policy Research", "Workforce Automation Strategy", "Persuasion Systems"],
            "sameAs": ["https://www.linkedin.com/in/whitkathner"]
          },
          "description": "AI systems consultancy for labor unions, political campaigns, progressive organizations, and values-first businesses.",
          "areaServed": "United States",
          "knowsAbout": ["AI Governance for Nonprofits", "AI for Labor Unions", "Political Campaign AI", "Agentic AI Operations", "AI Policy Intelligence", "Psychometric Messaging", "Generative Engine Optimization"]
        })}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "name": "Hoplight LLC",
          "url": "https://hoplight.ai",
          "serviceType": ["AI Consulting", "AI Systems Architecture", "AI Governance", "Political Technology"],
          "areaServed": { "@type": "Country", "name": "United States" },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "AI Services",
            "itemListElement": [
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AI Foundation Sprint", "description": "Full-stack AI readiness assessment and implementation roadmap for organizations starting from zero AI adoption" }},
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AI Capacity Building Cohort", "description": "Multi-organization cohort program with structured curriculum and individual advising on AI adoption" }},
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Generative Engine Optimization Audit", "description": "Ensure your organization is accurately represented by AI systems like ChatGPT, Perplexity, and Google AI Overviews" }},
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Agentic AI Systems Design", "description": "Convert manual operational workflows into autonomous agent architectures that run with minimal supervision" }}
            ]
          }
        })}}
      />

      <div style={{ marginTop: '2rem' }}>
        <h1>AI systems for labor, advocacy, and mission-driven organizations.</h1>
        <p className="subtitle">Hoplight builds AI infrastructure for organizations operating under constraints that most consultancies have never encountered: federal labor law, election compliance, multi-state political operations, collective bargaining strategy, and regulated consumer industries.</p>
      </div>

      <p>Founded by Whit Kathner, who directs AI strategy for one of the largest labor unions in the United States and previously ran $10M+ in political programs across 20 states. Before AI: co-founded the largest crowdfunded distillery in U.S. history, scaling it to a $10M valuation with no venture capital while managing federal alcohol compliance, $1M+ in regulated advertising, and coast-to-coast distribution.</p>

      <div className="credentials">
        <p><strong>Current:</strong> Directing AI adoption for a 2-million-member labor union. Authored the organization's governing document on AI. Built <a href="https://ai-policy-tool.vercel.app" target="_blank" rel="noopener noreferrer">ARIA</a>, a policy intelligence tool covering 5,600+ documents across 101 jurisdictions.</p>
        <p><strong>Validated:</strong> AI-generated messaging that outperforms human progressive alternatives by 26 points with conservative-leaning audiences in randomized controlled trials. Persuasion methodology licensed by a national labor institution for 2026 deployment.</p>
        <p><strong>Research:</strong> Psychometric assessment audit spanning 65+ theoretical traditions and 290+ subscales. Workforce restructuring analysis tracking the 2025-2026 layoff-to-compute conversion pattern across major tech companies.</p>
      </div>

      <h2>What we build</h2>

      <div className="grid">
        <div className="card">
          <h3>AI governance and readiness</h3>
          <p>Full-stack AI assessment and implementation for organizations starting from zero. Governance frameworks, vendor audits, staff training, integration roadmaps.</p>
        </div>
        <div className="card">
          <h3>Policy intelligence systems</h3>
          <p>AI-powered research tools that synthesize thousands of documents into sourced, queryable answers. Live example: ARIA covers 101 jurisdictions.</p>
        </div>
        <div className="card">
          <h3>Agentic operations</h3>
          <p>Autonomous AI systems that handle the 80% of operational work that follows recognizable patterns, preserving human judgment for the 20% that requires it.</p>
        </div>
        <div className="card">
          <h3>Persuasion and messaging systems</h3>
          <p>AI-generated messaging calibrated to psychographic profiles. RCT-validated. Domain-agnostic framework spanning campaigns, advocacy, and organizational communication.</p>
        </div>
        <div className="card">
          <h3>Capacity building and training</h3>
          <p>Multi-org cohort programs and team workshops. Hands-on AI adoption. Participants ship working systems by end of engagement.</p>
        </div>
        <div className="card">
          <h3>Generative engine optimization</h3>
          <p>Ensure AI systems represent your organization accurately. Schema markup, content structure, authority signals, crawler access. How you show up when people ask ChatGPT about your field.</p>
        </div>
      </div>

      <h2>Who this is for</h2>

      <p>Labor unions navigating AI-driven workforce restructuring. Progressive organizations deploying AI without compromising mission. Advocacy groups that need policy intelligence at scale. Political campaigns that need persuasion systems that hold up under compliance review. Foundations funding AI capacity-building cohorts. Social-justice-anchored businesses operating in regulated industries.</p>

      <p>If you're exploring what serious AI infrastructure looks like inside an organization like yours, book a session and we'll scope it.</p>

      <Link href="/contact" className="cta">Book a session</Link>
    </>
  )
}
