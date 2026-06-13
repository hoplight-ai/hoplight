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

      {/* THE PROGRESSIVE MAP — Ink statement, two-column */}
      <section className="slate" style={{ paddingTop: 0 }}>
        <div className="wrap mapsplit">
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
            <div className="evdrop" aria-hidden="true">139 electoral votes, gone.</div>
          </div>
        </div>
      </section>

      {/* THE COALITION EXODUS — Paper, headline collage */}
      <section>
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '36px' }}>
            <span className="label">The coalition exodus</span>
            <h2>Demography is not destiny.</h2>
          </div>
          <div className="exodus">
            <article className="clip col-7 lg">
              <span className="clip-kick">Post-election</span>
              <p className="clip-head">Drop-off voters decided 2024.</p>
            </article>
            <article className="clip col-5">
              <span className="clip-kick">The realignment</span>
              <p className="clip-head">The Latino shift toward the right.</p>
            </article>
            <article className="clip col-5">
              <span className="clip-kick">At the margins</span>
              <p className="clip-head">Black support softening at the margins.</p>
            </article>
            <article className="clip col-7 lg">
              <span className="clip-kick">The generation gap</span>
              <p className="clip-head">Young voters swinging, not anchored.</p>
            </article>
            <article className="clip col-12 xl">
              <span className="clip-kick">The big picture</span>
              <p className="clip-head">A working-class realignment underway.</p>
            </article>
          </div>
          <p className="exodus-close">Demographics stopped predicting the vote.</p>
        </div>
      </section>

      {/* ECHO CHAMBER — Ink statement, floating quotes */}
      <section className="slate">
        <div className="wrap">
          <div className="statement" style={{ maxWidth: '28ch', marginBottom: '36px' }}>
            <h2>Trapped in an echo chamber.</h2>
          </div>
          <div className="echoes">
            <blockquote className="echo echo-1">They&apos;re voting against their own interests.</blockquote>
            <blockquote className="echo echo-2">If they could just see the facts.</blockquote>
            <blockquote className="echo echo-3">We need better education.</blockquote>
          </div>
          <p className="intro" style={{ marginTop: '36px', maxWidth: '46ch' }}>If you find yourself saying any of that, this tool is for you.</p>
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

      {/* THE SHIFT — Ink statement, centered */}
      <section className="slate">
        <div className="wrap">
          <div className="statement statement-center">
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
            <svg className="loopsvg" viewBox="0 0 400 400" role="img" aria-label="A repeating cycle: Deploy, Measure, Feed back, Improve.">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                  <path d="M0 0L10 5L0 10z" fill="#E3AC42" />
                </marker>
              </defs>
              {/* Four arc segments, each ending in the gap before the next node */}
              <g fill="none" stroke="#E3AC42" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrow)">
                <path d="M251.3 59.0 A150 150 0 0 1 341.0 148.7" />
                <path d="M341.0 251.3 A150 150 0 0 1 251.3 341.0" />
                <path d="M148.7 341.0 A150 150 0 0 1 59.0 251.3" />
                <path d="M59.0 148.7 A150 150 0 0 1 148.7 59.0" />
              </g>
              {/* Nodes sit on the ring; arcs stop short so nothing overlaps */}
              <g>
                <circle cx="200" cy="50" r="50" fill="rgba(227,172,66,0.12)" stroke="#E3AC42" strokeWidth="1.5" />
                <circle cx="350" cy="200" r="50" fill="rgba(227,172,66,0.12)" stroke="#E3AC42" strokeWidth="1.5" />
                <circle cx="200" cy="350" r="50" fill="rgba(227,172,66,0.12)" stroke="#E3AC42" strokeWidth="1.5" />
                <circle cx="50" cy="200" r="50" fill="rgba(227,172,66,0.12)" stroke="#E3AC42" strokeWidth="1.5" />
              </g>
              <g style={{ fontSize: '13px' }} dominantBaseline="middle">
                <text x="200" y="51">Deploy</text>
                <text x="350" y="201">Measure</text>
                <text x="200" y="351">Feed back</text>
                <text x="50" y="201">Improve</text>
              </g>
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
