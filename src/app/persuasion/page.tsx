import type { Metadata } from 'next';
import Link from 'next/link';
import VoterStepper from '@/components/VoterStepper';
import ProofBand from '@/components/ProofBand';

export const metadata: Metadata = {
  title: 'Persuasion',
  description:
    'The Psychographic Message Engine: persuasion you can audit, control, and improve. RCT-validated message testing that reaches the people other programs leave out.',
  alternates: { canonical: '/persuasion' },
  openGraph: {
    title: 'Persuasion — Hoplight',
    description: 'Persuasion you can audit, control, and improve. Not a billionaire’s black box.',
    url: 'https://hoplight.ai/persuasion',
  },
};

export default function Persuasion() {
  return (
    <>
      {/* HERO — Paper */}
      <div className="page-hero">
        <div className="wrap">
          <span className="label">The Psychographic Message Engine</span>
          <h1>Persuasion you can audit, control, and improve. Not a billionaire&apos;s black box.</h1>
          <p>Language models are very persuasive. But it&apos;s a black box. We can&apos;t tune it, we can&apos;t reverse engineer it. So we built a thing we can actually audit, then feed, then fine-tune.</p>
        </div>
      </div>

      {/* PROOF BAND — Ink */}
      <section className="slate">
        <div className="wrap">
          <span className="label" style={{ display: 'block', marginBottom: '28px' }}>So we tested a different approach.</span>
          <ProofBand />
          <p className="intro" style={{ marginTop: '28px', maxWidth: '52ch' }}>In this election, demographics did not determine how people voted.</p>
        </div>
      </section>

      {/* THE PROGRESSIVE MAP — Ink statement */}
      <section className="slate" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="statement">
            <h2>The progressive map has been shrinking for 15 years.</h2>
            <p className="sub">From 365 electoral votes to 226.</p>
          </div>
          <div className="evbars">
            <div className="evbar">
              <div className="evhead"><span>2008</span><b>365 EV</b></div>
              <div className="evtrack"><div className="evfill" style={{ width: '67.8%', background: '#4A6FA5' }} /></div>
            </div>
            <div className="evbar">
              <div className="evhead"><span>2024</span><b>226 EV</b></div>
              <div className="evtrack"><div className="evfill" style={{ width: '42%', background: '#7C8CA6' }} /></div>
            </div>
          </div>
        </div>
      </section>

      {/* THE COALITION EXODUS — Paper */}
      <section>
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '28px' }}>
            <span className="label">The coalition exodus</span>
            <h2>The coalition exodus.</h2>
          </div>
          <div className="chips">
            <span className="chip">Drop-off voters decided 2024.</span>
            <span className="chip">The Latino shift toward the right.</span>
            <span className="chip">Black support softening at the margins.</span>
            <span className="chip">Young voters swinging, not anchored.</span>
            <span className="chip">A working-class realignment underway.</span>
          </div>
          <p style={{ marginTop: '28px', color: 'var(--ink-soft)', fontSize: '1.1rem', fontWeight: 500 }}>Demographics stopped predicting the vote.</p>
        </div>
      </section>

      {/* ECHO CHAMBER — Ink statement */}
      <section className="slate">
        <div className="wrap">
          <div className="statement" style={{ maxWidth: '28ch', marginBottom: '28px' }}>
            <h2>Trapped in an echo chamber.</h2>
          </div>
          <div className="chips">
            <span className="chip quote">&ldquo;They&apos;re voting against their own interests.&rdquo;</span>
            <span className="chip quote">&ldquo;If they could just see the facts.&rdquo;</span>
            <span className="chip quote">&ldquo;We need better education.&rdquo;</span>
          </div>
          <p className="intro" style={{ marginTop: '24px', maxWidth: '46ch' }}>If you find yourself saying any of that, this tool is for you.</p>
        </div>
      </section>

      {/* THE FALSE CHOICE — Paper */}
      <section>
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '28px' }}>
            <h2>The false choice.</h2>
          </div>
          <div className="compare">
            <div className="compare-col">
              <div className="top">
                <span className="kicker">Majoritarians</span>
              </div>
              <ul>
                <li>Abandon your issues.</li>
                <li>Talk like a 1990s centrist.</li>
                <li>Hope the base shows up anyway.</li>
              </ul>
            </div>
            <div className="compare-col">
              <div className="top">
                <span className="kicker">Base maximalists</span>
              </div>
              <ul>
                <li>Double down on values.</li>
                <li>Educate the voters.</li>
                <li>Risk winnable races.</li>
              </ul>
            </div>
          </div>
          <p style={{ marginTop: '28px', color: 'var(--ink-soft)', fontSize: '1.1rem', fontWeight: 500 }}>Both are losing.</p>
        </div>
      </section>

      {/* THE SHIFT — Ink statement */}
      <section className="slate">
        <div className="wrap">
          <div className="statement">
            <h2>So we tested a different approach.</h2>
          </div>
        </div>
      </section>

      {/* DEMOGRAPHICS, NOT MONOLITHS — Paper */}
      <section>
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '24px' }}>
            <h2>Demographics aren&apos;t monoliths. So why message like they are?</h2>
          </div>
          <p className="engine-lead big" style={{ maxWidth: '62ch', color: 'var(--ink-soft)' }}>
            Demographics tell you who someone is: age, race, income, education. Psychographics tell you how someone makes sense of the world, what they value, what they trust, what they read as a threat, how much control and respect they feel they have.
          </p>
          <p style={{ maxWidth: '60ch', color: 'var(--ink-soft)', fontSize: '1.1rem', fontWeight: 500, marginTop: '20px' }}>Psychographics let us see within demographics, where the persuasion opportunity lies.</p>
          <p style={{ maxWidth: '60ch', color: 'var(--stone-deep)', marginTop: '10px' }}>These segments cut across race, class, and party. A Latino voter could be in any of them.</p>
        </div>
      </section>

      {/* THE 3-VOTER INTERACTIVE — Ink, the hinge */}
      <section className="slate">
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '28px' }}>
            <span className="label">The hinge</span>
            <h2>Same demographics, different psychographics, different motivators.</h2>
          </div>
          <VoterStepper />
        </div>
      </section>

      {/* THE METHOD — Paper, IP protected */}
      <section>
        <div className="wrap">
          <p className="unlock">Meet them where they are, inside their belief system, instead of trying to change it.</p>
          <h2 className="bigline">We don&apos;t message to who you are. We message to <span className="em">what moves you</span>.</h2>
          <p style={{ maxWidth: '60ch', color: 'var(--ink-soft)', fontSize: '1.1rem', marginTop: '24px' }}>
            The engine code-switches, meeting people in their own values, worldview, and sense of self. How it does that is the part you license, not the part we publish.
          </p>
        </div>
      </section>

      {/* THE LOOP — Ink */}
      <section className="slate">
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '8px' }}>
            <span className="label">The loop</span>
            <h2>It sharpens while you sleep.</h2>
          </div>
          <div className="loopwrap">
            <svg className="loopsvg" viewBox="0 0 420 300" role="img" aria-label="A repeating cycle: Deploy, Measure, Feed back, Improve.">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0L10 5L0 10z" fill="#E3AC42" />
                </marker>
              </defs>
              <g fill="none" stroke="#E3AC42" strokeWidth="2" markerEnd="url(#arrow)">
                <path d="M150 60 A130 130 0 0 1 360 150" />
                <path d="M360 150 A130 130 0 0 1 270 240" />
                <path d="M270 240 A130 130 0 0 1 60 150" />
                <path d="M60 150 A130 130 0 0 1 150 60" />
              </g>
              <g>
                <circle cx="210" cy="40" r="34" fill="rgba(227,172,66,0.14)" stroke="#E3AC42" strokeWidth="1.5" />
                <circle cx="380" cy="150" r="34" fill="rgba(227,172,66,0.14)" stroke="#E3AC42" strokeWidth="1.5" />
                <circle cx="210" cy="260" r="34" fill="rgba(227,172,66,0.14)" stroke="#E3AC42" strokeWidth="1.5" />
                <circle cx="40" cy="150" r="34" fill="rgba(227,172,66,0.14)" stroke="#E3AC42" strokeWidth="1.5" />
              </g>
              <text x="210" y="44">Deploy</text>
              <text x="380" y="154">Measure</text>
              <text x="210" y="264">Feed back</text>
              <text x="40" y="154">Improve</text>
            </svg>
          </div>
          <p className="intro" style={{ maxWidth: '64ch' }}>
            Field a frame over the weekend, put the results back in, and your whole program runs on yesterday&apos;s data, canvass scripts to press releases, talking points to captions. Block to block, coast to coast. The 50th campaign to use it gets better messaging than the first.
          </p>
        </div>
      </section>

      {/* CTA — Paper */}
      <section>
        <div className="wrap">
          <hr className="rule" style={{ marginBottom: '36px' }} />
          <h2>Move the people other programs leave out.</h2>
          <div className="cta-row" style={{ marginTop: '32px' }}>
            <Link className="btn btn-primary" href="/contact">Start a conversation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
