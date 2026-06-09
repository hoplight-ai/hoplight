import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Whit Kathner',
  description: 'Whit Kathner directs AI strategy for a 2-million-member labor union, co-founded the largest crowdfunded distillery in US history, and ran political programs across 20+ states. Building AI systems for organizations where failure has real consequences.',
  alternates: { canonical: 'https://hoplight.ai/about' },
  openGraph: {
    title: 'About Whit Kathner | Hoplight',
    description: 'AI strategist directing adoption for a 2-million-member labor union. Co-founded Republic Restoratives. Ran $10M+ in political programs. Built 130+ production AI systems.',
    url: 'https://hoplight.ai/about',
    type: 'profile',
  },
}

export default function About() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Whit Kathner",
          "alternateName": "Whit Pendergast",
          "url": "https://hoplight.ai/about",
          "jobTitle": "Founder, Hoplight LLC",
          "description": "AI strategist directing adoption for a 2-million-member labor union. Builds production AI systems for organizations operating under political, regulatory, and reputational constraints. Previously SEIU Regional Campaigns Director managing $10M+ in electoral programs across 20 states. Co-founder of Republic Restoratives, the largest crowdfunded distillery in US history.",
          "sameAs": ["https://www.linkedin.com/in/whitkathner"],
          "knowsAbout": ["Artificial Intelligence Strategy", "AI Governance", "Labor Union Technology", "Political Campaign Operations", "Agentic AI Systems", "Psychometric Assessment Design", "AI Policy Research", "Persuasion Systems", "Generative Engine Optimization", "Workforce Automation Analysis"],
          "worksFor": [{ "@type": "Organization", "name": "Hoplight LLC", "url": "https://hoplight.ai" }],
          "founder": { "@type": "Organization", "name": "Hoplight LLC", "url": "https://hoplight.ai", "foundingDate": "2024" },
          "alumniOf": [{ "@type": "EducationalOrganization", "name": "Wheaton College", "address": { "@type": "PostalAddress", "addressLocality": "Norton", "addressRegion": "MA" }}],
          "address": { "@type": "PostalAddress", "addressLocality": "Portland", "addressRegion": "OR", "addressCountry": "US" }
        })}}
      />

      <h1>About Whit Kathner</h1>

      <p>Whit Kathner directs AI strategy for one of the largest labor unions in the United States, building policy intelligence tools, governance architecture, and deployment frameworks for a 2-million-member organization. He authored the union's governing directional document on AI, built <a href="https://ai-policy-tool.vercel.app" target="_blank" rel="noopener noreferrer">ARIA</a> (a policy intelligence tool covering 5,600+ documents across 101 jurisdictions), and presents to the International Executive Board on AI adoption strategy. His AI-generated messaging outperforms human progressive alternatives by 26 points with conservative-leaning audiences in randomized controlled trials.</p>

      <p>He founded Hoplight in 2024 to bring that institutional-grade AI capability to progressive organizations, political campaigns, and social-justice-anchored businesses. The firm has shipped 130+ production systems across electoral, organizing, and compliance contexts with no material compliance incidents.</p>

      <p>Before AI: Kathner co-founded Republic Restoratives, the largest crowdfunded distillery in United States history and the first women-owned distillery in Washington, DC. He scaled it from a crowdfunding campaign to a $10M valuation with no venture capital, building coast-to-coast distribution, managing $1M+ in federally regulated advertising, and running 20+ AI systems across marketing, operations, and customer experience before the AI industry had a name for what he was doing.</p>

      <p>Before the distillery: four years as a Regional Campaigns Director at one of the country's largest labor unions, managing $10M+ in electoral and organizing programs across 20+ states. Before that: field organizer on Obama for America in 2008, campaign manager and deputy campaign manager on New Hampshire state races, and state field director running programs in Nevada and Pennsylvania.</p>

      <h2>The through line</h2>

      <p>Every role required the same skill: making systems perform under constraints that most practitioners never encounter. Electoral programs have compliance deadlines measured in hours. Federal alcohol law does not forgive creative interpretation. Union political operations span 50 states with different rules in each. AI systems built for these environments can't be fragile, aspirational, or demo-quality. They have to hold.</p>

      <p>The AI work started from operational necessity: the pandemic hit the distillery, demand surged 27,000% overnight, and Kathner had to rebuild the entire DTC infrastructure in real-time while navigating an FDA certification pivot to hand sanitizer production. The AI systems that emerged from that pressure, handling compliance, marketing automation, brand voice, same-day delivery logistics, became the proving ground for everything that followed.</p>

      <h2>Current work</h2>

      <p>At the union: directing the organization's AI strategy, authoring governance frameworks, building policy intelligence infrastructure (ARIA), onboarding and directing the policy team's strategic focus, advising on AI-driven workforce restructuring, and presenting build capabilities to the International Executive Board.</p>

      <p>At Hoplight: AI governance sprints for organizations with public-interest obligations, capacity-building cohorts for foundations and intermediaries, agentic AI systems for operational automation, GEO audits, and a psychometric research program spanning 65+ theoretical traditions investigating how message frames interact with personality architecture.</p>

      <h2>Research interests</h2>

      <p>Psychographic message responsiveness: a five-dimension model predicting how individuals respond to different message frames (gain vs. loss, simple vs. complex, belonging vs. autonomy) without reference to political ideology. Drawing on BIS/BAS, Adult Attachment, HEXACO, Schwartz Values, Need for Cognition, and 15+ other measurement traditions. Domain-agnostic by design: same architecture predicts healthcare message response, product advertising response, organizational change response, and political campaign response.</p>

      <p>AI governance for the labor movement: what contract language looks like when the employer is simultaneously claiming "AI creates jobs" and cutting thousands of positions during record profit quarters. How collective bargaining adapts when workforce reduction is a capital reallocation decision rather than a distress response.</p>

      <p>Policy diffusion: how AI regulatory ideas spread between jurisdictions. Which governments lead, which follow, and where the gaps persist. Tracked live through ARIA across 101 jurisdictions.</p>

      <h2>Background</h2>

      <div className="timeline">
        <div className="timeline-item">
          <span className="date">2024 - present</span>
          <div className="role">Founder, Hoplight LLC</div>
          <p>AI systems consultancy for labor, advocacy, and values-first organizations.</p>
        </div>
        <div className="timeline-item">
          <span className="date">2020 - present</span>
          <div className="role">Senior Political Strategist, national labor union</div>
          <p>Elevated to head AI strategist. Directing AI adoption, governance, and infrastructure for the 2-million-member union.</p>
        </div>
        <div className="timeline-item">
          <span className="date">2015 - 2025</span>
          <div className="role">Co-founder, Republic Restoratives</div>
          <p>First women-owned distillery in DC history. Largest crowdfunded distillery in the US. $10M valuation, no VC.</p>
        </div>
        <div className="timeline-item">
          <span className="date">2013 - 2020</span>
          <div className="role">Regional Campaigns Director, SEIU</div>
          <p>$10M+ in political programs across 20+ states. Multi-state organizing, coalition campaigns, electoral operations.</p>
        </div>
        <div className="timeline-item">
          <span className="date">2011 - 2013</span>
          <div className="role">State Field Director, SEIU</div>
          <p>Nevada and Pennsylvania field programs.</p>
        </div>
        <div className="timeline-item">
          <span className="date">2009 - 2011</span>
          <div className="role">Campaign Manager / Deputy CM</div>
          <p>Goley for State Senate (SD-16), Carol Shea-Porter for Congress (NH-01).</p>
        </div>
        <div className="timeline-item">
          <span className="date">2008</span>
          <div className="role">Field Organizer, Obama for America</div>
          <p>Manchester, New Hampshire. Field and Minority Outreach.</p>
        </div>
        <div className="timeline-item">
          <span className="date">2005 - 2009</span>
          <div className="role">Wheaton College</div>
          <p>Visual Sociology. Norton, Massachusetts.</p>
        </div>
      </div>

      <p>Based in Portland, Oregon. Trans and queer. Built the first LGBTQ panel at Tales of the Cocktail. Raised $150K+ for social justice causes through integrated product campaigns at Republic Restoratives.</p>
    </>
  )
}
