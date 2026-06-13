import type { Metadata } from 'next';
import VoterStepper from '@/components/VoterStepper';

export const metadata: Metadata = {
  title: 'Persuasion — Hoplight',
  description: 'The Psychographic Message Engine: persuasion you can audit, control, and improve. RCT-validated, built on 50+ traditions and 290+ subscales.',
};

export default function Persuasion() {
  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <span className="label">The Psychographic Message Engine</span>
          <h1>Persuasion you can audit, control, and improve. Not a billionaire&apos;s black box.</h1>
          <p>Language models are good at persuading people. Putting your messaging into a frontier model and getting something back that works for reasons you cannot see, tune, or replicate is not a strategy. We built the engine the other way around.</p>
        </div>
      </div>

      {/* FOUR PILLARS */}
      <section>
        <div className="wrap">
          <div className="grid-2">
            <div className="pcard">
              <span className="knum">Mechanism</span>
              <h3>Built on tradition, not polling</h3>
              <p>The engine overlays 50+ validated psychographic traditions, across 290+ subscales, from behavioral economics to social psychology, and finds the strains of truth that cut across all of them. Anchored in publicly available research, deliberately omitting political and persuasion polling we found too biased to trust.</p>
            </div>
            <div className="pcard">
              <span className="knum">Method</span>
              <h3>Psychographic, not demographic</h3>
              <p>Three 39-year-olds in the same income bracket vote three different ways. The engine maps identity, worldview, locus of control, and salient cognitive biases, then specs a message that meets a person inside their belief system instead of trying to overturn it in a 30-second conversation.</p>
            </div>
            <div className="pcard">
              <span className="knum">Proof</span>
              <h3>Up to 26 points, validated in the field</h3>
              <p>In a 3,000-person RCT, AI-generated frames beat messaging written by a skilled human communicator by up to 26 points among religious conservatives, with double-digit lifts across other hard-to-reach value segments. The progressive base held.</p>
            </div>
            <div className="pcard">
              <span className="knum">Loop</span>
              <h3>Recursive by design</h3>
              <p>Generate the message, field it over the weekend, feed the results back in, fine-tune. Your canvass, your captions, your emails get sharper the next time. The improvement compounds while you sleep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY PSYCHOGRAPHIC — VOTER STEPPER */}
      <section>
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '28px' }}>
            <span className="label">Why psychographic</span>
            <h2>Same demographics. Three different voters.</h2>
          </div>
          <VoterStepper />
        </div>
      </section>

      {/* GOVERNED, NOT JUST POWERFUL */}
      <section className="slate">
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '28px' }}>
            <span className="label">Governed, not just powerful</span>
            <h2>The same architecture is built to refuse anti-worker requests.</h2>
            <p className="intro">Ask an off-the-shelf model how to stop a union drive and it will help. Ask Change Agent, the same capability rebuilt with a values-aligned system prompt, and it refuses, then redirects to worker power. Persuasion you can audit is also persuasion you can govern.</p>
          </div>
        </div>
      </section>

      {/* CLOSE */}
      <section style={{ paddingTop: 'var(--space-section)' }}>
        <div className="wrap">
          <hr className="rule" style={{ marginBottom: '36px' }} />
          <h2>Move the people other programs leave out.</h2>
          <p className="lede" style={{ color: 'var(--stone)' }}>Access to the engine is by license and co-design. Start with a conversation.</p>
          <div className="cta-row" style={{ marginTop: '32px' }}>
            <a className="btn btn-primary" href="https://calendly.com/whitpendergast">Book a conversation</a>
          </div>
        </div>
      </section>
    </>
  );
}
