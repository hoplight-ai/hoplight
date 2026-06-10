import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Book a session with Hoplight. AI strategy, vendor audits, research roadmaps, meeting intelligence setup, and AI operations security for labor unions and mission-driven organizations.',
  alternates: { canonical: 'https://hoplight.ai/contact' },
  openGraph: {
    title: 'Book a session | Hoplight',
    description:
      'Book an AI strategy session, vendor audit, research roadmap, or meeting intelligence setup.',
    url: 'https://hoplight.ai/contact',
  },
}

export default function Contact() {
  return (
    <>
      <h1>Book a session</h1>
      <p className="subtitle">
        Pick a session type below. Each is a working meeting. You leave with
        something concrete.
      </p>

      <p>
        If you're exploring a larger engagement (AI foundation sprint, capacity
        building cohort, agentic systems, persuasion systems), start with an{' '}
        <a
          href="https://calendly.com/whitpendergast/ai-strategy-session"
          target="_blank"
          rel="noopener noreferrer"
        >
          AI strategy session
        </a>
        . We scope from there.
      </p>

      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <iframe
          src="https://calendly.com/whitpendergast?hide_gdpr_banner=1&background_color=f7f5f0&text_color=0a1628&primary_color=e8a838"
          width="100%"
          height="700"
          frameBorder="0"
          title="Book a session with Hoplight"
          style={{
            border: 'none',
            borderRadius: '4px',
            minHeight: '700px',
          }}
        />
      </div>
    </>
  )
}
