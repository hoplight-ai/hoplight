import type { Metadata } from 'next'

const faqs = [
  {
    q: "What is AI governance for nonprofits and labor unions?",
    a: "AI governance for nonprofits and labor unions is a set of policies, checklists, and decision frameworks that control how an organization adopts, deploys, and monitors AI tools. It covers vendor evaluation (what AI features are already running in your existing software, and who controls them), data handling (what information goes into AI systems and who can access the outputs), staff training (who is authorized to use which tools, and under what conditions), and accountability (who reviews AI-generated outputs before they reach members, donors, or the public). For unions specifically, AI governance also addresses collective bargaining implications: what contract language protects workers when an employer deploys AI-driven scheduling, hiring automation, or surveillance tools. Hoplight has authored the governing directional document on AI for a 2-million-member labor union and built governance frameworks deployed across institutional contexts spanning 50 states."
  },
  {
    q: "How do labor unions use AI in 2026?",
    a: "Labor unions use AI across four main categories in 2026. First, policy intelligence: tools like ARIA (the AI Regulation Intelligence Atlas) let policy staff query thousands of AI governance documents across 101 jurisdictions in plain English, replacing weeks of manual research with sourced, synthesized answers in seconds. Second, workforce restructuring analysis: tracking and analyzing the pattern of tech companies cutting tens of thousands of jobs during record revenue quarters and redirecting savings into AI compute infrastructure, then translating that analysis into contract language, bargaining strategy, and public narrative. Third, member communication: AI-generated messaging calibrated to psychographic profiles that reaches audiences outside the progressive base, validated through randomized controlled trials showing 26-point lifts over human alternatives. Fourth, operational automation: agentic AI systems that handle document classification, intelligence monitoring, and multi-source data integration, freeing staff for strategic work. The unions deploying AI most effectively treat it as institutional infrastructure, not a technology experiment."
  },
  {
    q: "What is generative engine optimization (GEO)?",
    a: "Generative engine optimization is the practice of structuring your organization's online presence so that AI answer engines (ChatGPT, Claude, Perplexity, Google AI Overviews, Microsoft Copilot) represent you accurately when users ask questions in your domain. Traditional SEO optimizes for search engine rankings. GEO optimizes for AI-generated answers, which increasingly replace the search results page as the first point of contact between a user and your organization. GEO involves structured data markup (JSON-LD schema that tells AI systems what your organization does, who leads it, and what services you offer), content architecture (pages structured around the questions AI systems are asked), authority signals (citations, credentials, and verifiable claims that AI systems can cross-reference), and crawler access (ensuring AI training pipelines and retrieval systems can reach your content). Hoplight conducts GEO audits that assess how your organization currently appears in AI-generated answers and provides a specific action plan for improving accuracy and visibility."
  },
  {
    q: "What are psychographic messaging systems and how do they work?",
    a: "Psychographic messaging systems generate persuasive communications calibrated to the psychological profiles of target audiences, rather than their demographic or ideological characteristics. Hoplight's system uses a five-dimension model of message responsiveness: Boundary Membership (how individuals define in-group and out-group), Security Strategy (preference for prevention vs. promotion), Authority Architecture (orientation toward hierarchical vs. distributed authority), Change Strategy (incremental vs. transformational change preference), and Time Orientation (present vs. future focus). These dimensions are measured through apolitical psychometric instruments drawing on BIS/BAS, Adult Attachment, HEXACO, Schwartz Values, Need for Cognition, and 15+ other measurement traditions. The mechanism is regulatory fit and message-complexity matching: the policy stays identical, but the frame personalizes. In randomized controlled trials, this approach outperforms human progressive messaging alternatives by 26 points with conservative-leaning audiences. The framework is domain-agnostic: the same architecture predicts response to healthcare messaging, product advertising, organizational change announcements, and political campaigns."
  },
  {
    q: "What is an agentic AI system?",
    a: "An agentic AI system is an autonomous AI architecture that executes multi-step workflows without continuous human supervision. Unlike chatbots (where a person types a question and gets an answer) or AI-assisted tools (where AI suggests edits that a person approves one by one), agentic systems handle the full operational workflow: receiving inputs, making decisions, executing actions, monitoring their own outputs, and flagging exceptions for human review. Hoplight designs agentic systems with an 80/20 philosophy: agents handle the 80% of operational work that follows recognizable patterns, while preserving human judgment for the 20% that requires strategic thinking or relationship management. Production systems built by Hoplight handle policy research at scale, document classification across thousands of records, intelligence monitoring and analysis assembly, multi-source data integration, and marketing automation under simultaneous federal and platform compliance constraints. 70+ such systems have been deployed across electoral, organizing, and regulatory contexts."
  },
  {
    q: "How should organizations evaluate AI vendors?",
    a: "Organizations should evaluate AI vendors by asking ten essential questions. First, data training: is any of your data used to train the vendor's AI models, and can you opt out? Second, disclosure: has the vendor disclosed all AI features in their product, including those enabled by default? Third, model identity: what foundation model powers the AI, and is it proprietary, a third-party API, or a fine-tuned commercial model? Fourth, output distribution: are AI-generated outputs automatically distributed, or is there a human review gate? Fifth, sensitive content: does the AI have safeguards for politically sensitive, legally privileged, or strategically confidential content? Sixth, bias testing: has the vendor tested their AI for bias across race, gender, age, and disability? Seventh, liability: who is liable if the AI produces a biased or legally actionable output? Eighth, contract coverage: does your existing contract address AI-specific risks? Ninth, kill switch: can you turn off AI features entirely and still use the core product? Tenth, change notification: will the vendor notify you before changing the model or retraining on new data? Automatic red flags include: data training on by default with no opt-out, AI outputs auto-distributed without human review, vendor unable to name the specific model, and zero bias testing documentation. Hoplight publishes a vendor AI audit checklist and offers a deeper 36-question scorecard with scoring rubrics."
  },
  {
    q: "What is the difference between AI consulting and AI systems architecture?",
    a: "AI consulting typically delivers advice: assessments, recommendations, roadmaps, and strategy decks. AI systems architecture delivers infrastructure: working tools, deployed agents, integrated pipelines, and governance frameworks that operate in production environments. Hoplight does both, but the emphasis is on the second. An AI Foundation Sprint produces a roadmap your team can execute. An agentic systems engagement produces autonomous agents that are already running. The distinction matters because most organizations that hire AI consultants receive a PDF and a bill. The organizations that hire AI systems architects receive production infrastructure that changes how their teams work. The 70+ systems Hoplight has shipped across electoral, organizing, and compliance contexts are production systems, not recommendations about production systems."
  },
  {
    q: "Can AI-generated content be used in political campaigns and advocacy without ethical risk?",
    a: "AI-generated content in political campaigns carries real ethical risks that must be managed through system design, not disclaimers. The primary risks are: fabrication (AI generating false claims or fake endorsements), manipulation (exploiting psychological vulnerabilities rather than informing), opacity (audiences not knowing they're engaging with AI-generated material), and compliance (violating campaign finance, election, or advertising regulations that vary by jurisdiction). Hoplight's approach addresses each. Fabrication is managed through source-grounded generation: every claim in AI-generated messaging must trace to a verifiable source. Manipulation is managed through the distinction between persuasion and propaganda: the policy stays identical, only the frame personalizes. This is regulatory fit and message-complexity matching, not ideology manipulation. Opacity is managed through the AI compound mark system: every AI-generated deliverable carries a provenance indicator showing which AI model drafted it, who reviewed it, and when. Compliance is managed through jurisdiction-aware systems built from ARIA's coverage of AI regulations across 101 jurisdictions. The ethical question is not whether to use AI in campaigns. AI is already being used. The question is whether it is being used with governance, transparency, and accountability."
  },
]

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about AI governance, generative engine optimization, psychographic messaging, agentic AI systems, and AI consulting for labor unions and progressive organizations.',
  alternates: { canonical: 'https://hoplight.ai/faq' },
  openGraph: {
    title: 'FAQ | Hoplight',
    description: 'AI governance, GEO, psychographic messaging, agentic systems, vendor audits, and ethical AI for progressive organizations.',
    url: 'https://hoplight.ai/faq',
  },
}

export default function FAQ() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": f.a
            }
          }))
        })}}
      />

      <h1>Frequently asked questions</h1>
      <p className="subtitle">How AI governance, persuasion systems, and agentic operations work in practice.</p>

      {faqs.map((f, i) => (
        <div className="faq-item" key={i}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}
    </>
  )
}
