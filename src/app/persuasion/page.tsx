import type { Metadata } from 'next'
import Link from 'next/link'
import VoterStepper from '@/components/VoterStepper'

export const metadata: Metadata = {
  title: 'Persuasion',
  description: 'The Psychographic Message Engine: RCT-validated, auditable persuasion built on 50+ psychographic traditions across 290+ subscales. Up to 26-point lift with hard-to-reach value segments. Persuasion you can audit, control, and govern.',
  alternates: { canonical: 'https://hoplight.ai/persuasion' },
  openGraph: {
    title: 'Persuasion | Hoplight',
    description: 'Persuasion you can audit, control, and improve. RCT-validated psychographic messaging built on 50+ traditions, not a billionaire\'s black box.',
    url: 'https://hoplight.ai/persuasion',
  },
}

const pillars = [
  {
    label: 'Mechanism',
    title: 'Built on tradition, not polling',
    copy: 'The engine overlays 50+ validated psychographic traditions, across 290+ subscales, from behavioral economics to social psychology, and finds the strains of truth that cut across all of them. Anchored in publicly available research, deliberately omitting political and persuasion polling we found too biased to trust.',
  },
  {
    label: 'Method',
    title: 'Psychographic, not demographic',
    copy: 'Three 39-year-olds in the same income bracket vote three different ways. The engine maps identity, worldview, locus of control, and salient cognitive biases, then specs a message that meets a person inside their belief system instead of trying to overturn it in a 30-second conversation.',
  },
  {
    label: 'Proof',
    title: 'Up to 26 points, validated in the field',
    copy: 'In a 3,000-person RCT, AI-generated frames beat messaging written by a skilled human communicator by up to 26 points among religious conservatives, with double-digit lifts across other hard-to-reach value segments. The progressive base held.',
  },
  {
    label: 'Loop',
    title: 'Recursive by design',
    copy: 'Generate the message, field it over the weekend, feed the results back in, fine-tune. Your canvass, your captions, your emails get sharper the next time. The improvement compounds while you sleep.',
  },
]

export default function Persuasion() {
  return (
    <>
      <div style={{ marginTop: '2rem' }}>
        <p className="tier-label">The Psychographic Message Engine</p>
        <h1>Persuasion you can audit, control, and improve. Not a billionaire&apos;s black box.</h1>
        <p className="subtitle">Language models are good at persuading people. Putting your messaging into a frontier model and getting something back that works for reasons you cannot see, tune, or replicate is not a strategy. We built the engine the other way around.</p>
      </div>

      <div className="grid">
        {pillars.map((p) => (
          <div key={p.label} className="card">
            <p className="tier-label">{p.label}</p>
            <h3>{p.title}</h3>
            <p>{p.copy}</p>
          </div>
        ))}
      </div>

      <h2>Same demographics. Three different voters.</h2>
      <p className="subtitle" style={{ marginBottom: '1.5rem' }}>Why psychographic targeting beats demographic targeting.</p>
      <VoterStepper />

      <h2>The same architecture is built to refuse anti-worker requests.</h2>
      <p>Ask an off-the-shelf model how to stop a union drive and it will help. Ask Change Agent, the same capability rebuilt with a values-aligned system prompt, and it refuses, then redirects to worker power. Persuasion you can audit is also persuasion you can govern.</p>

      <h2>Move the people other programs leave out.</h2>
      <p>Access to the engine is by license and co-design. Start with a conversation.</p>
      <Link href="/contact" className="cta">Book a conversation</Link>
    </>
  )
}
