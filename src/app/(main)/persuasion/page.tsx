import type { Metadata } from 'next';
import EvMap from '@/components/EvMap';

export const metadata: Metadata = {
  title: 'Persuasion',
  description:
    'The Psychographic Message Engine: an RCT-validated persuasion system you can audit, tune, and improve. It moves the voters who decide elections without eroding the progressive base.',
  alternates: { canonical: '/persuasion' },
  openGraph: {
    title: 'Persuasion — Hoplight',
    description:
      'The human-generated progressive frame produces identity backlash with the voters who decide elections. We built the engine the other way around.',
    url: 'https://hoplight.ai/persuasion',
  },
};

type Diff = { overBaseline: number; overHuman: number };

type Population = {
  pop: string;
  lead?: string;
  note?: string;
  diff?: Diff;
  flag?: string;
};

const POPULATIONS: Population[] = [
  {
    pop: 'Non-voters',
    lead: '+20–21',
    note: 'Care frame cut union support 10 below placebo.',
  },
  {
    pop: 'Under 35',
    lead: '+12–14',
    note: 'Care frame cut support 9 below placebo.',
  },
  {
    pop: 'Working class (under $50K)',
    lead: '+6–10',
    note: 'AI frames outperformed across the board.',
  },
  {
    pop: 'Latinos',
    diff: { overBaseline: 22, overHuman: 18 },
    flag: 'Human-generated frame moved just +4 over baseline.',
  },
  {
    pop: 'Republicans',
    diff: { overBaseline: 25, overHuman: 11 },
    flag: 'Hoplight outpaced the human-generated frame by 11 points.',
  },
  {
    pop: 'Conservatives',
    diff: { overBaseline: 17, overHuman: 5 },
    flag: 'Hoplight beat human-generated copy by 5 pts.',
  },
  {
    pop: 'Religious Conservatives',
    diff: { overBaseline: 21, overHuman: 22 },
    flag: 'Human-generated frame landed below the placebo.',
  },
];

export default function Persuasion() {
  return (
    <>
      {/* SECTION 1 — HERO (Paper) */}
      <div className="page-hero">
        <div className="wrap">
          <span className="label">The Psychographic Message Engine</span>
          <h1>
            The progressive frame doesn&apos;t just fail to persuade. It produces identity backlash with the voters who decide elections.
          </h1>
          <p>
            Language models are good at persuading people. Putting something in a black box and getting something out that works for reasons you cannot see, tune, or replicate is not a strategy. We built the engine the other way around.
          </p>
        </div>
      </div>

      {/* SECTION 1.5 — THE STAKES (Ink): the 2008 -> 2024 shift */}
      <section className="slate">
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '34px', maxWidth: '42ch' }}>
            <span className="label">The stakes</span>
            <h2>The map the old playbook built has been shrinking for 15 years.</h2>
            <p className="map-stat">365 <span className="evo-arrow" aria-hidden="true">&rarr;</span> 226 <span className="evo-unit">electoral votes</span></p>
          </div>
          <EvMap />
        </div>
      </section>

      {/* SECTION 2 — THE CONDITION (Ink) */}
      <section className="slate">
        <div className="wrap">
          <div className="statement" style={{ maxWidth: '34ch', marginBottom: '32px' }}>
            <h2>We are sorted into different moral worlds.</h2>
          </div>
          <p className="intro" style={{ maxWidth: '60ch', fontSize: 'clamp(1.1rem, 1rem + 0.5vw, 1.35rem)', lineHeight: 1.5 }}>
            We are tribally sorted, algorithmically siloed, and operating from fundamentally different moral worldviews. A message that presumes shared values with someone who doesn&apos;t share them doesn&apos;t land as persuasion. It lands as condescension, or a threat, or both.
          </p>
        </div>
      </section>

      {/* SECTION 3 — THE MIRROR (Ink, centerpiece card grid) */}
      <section className="slate" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '36px', maxWidth: '64ch' }}>
            <span className="label">The mirror</span>
            <p className="mirror-context">
              3,006-person randomized controlled trial. Four conditions: a human-generated progressive frame written by senior union communications staff, two AI-generated psychographic alternatives, and a placebo (Morton Salt advertisement). August 2025.
            </p>
          </div>

          <div className="mirror">
            {POPULATIONS.map((p) => (
              <article className="mcard" key={p.pop}>
                <span className="mpop">{p.pop}</span>
                {p.lead && (
                  <p className="mlead">
                    {p.lead}
                    <span className="munit">pts</span>
                  </p>
                )}
                {p.note && <p className="mnote">{p.note}</p>}
                {p.diff && (
                  <div className="mdiff">
                    <span className="mdiff-cap">Hoplight message</span>
                    {[
                      { name: 'vs. baseline', val: p.diff.overBaseline, primary: true },
                      { name: 'vs. human-generated', val: p.diff.overHuman, primary: false },
                    ].map((d) => (
                      <div className={`mdiff-row${d.primary ? '' : ' secondary'}`} key={d.name}>
                        <div className="mdiff-head">
                          <span className="mdiff-name">{d.name}</span>
                          <span className="mdiff-val">+{d.val} pts</span>
                        </div>
                        <div className="mdiff-track">
                          <span
                            className="mdiff-fill"
                            style={{ width: `${(d.val / Math.max(p.diff!.overBaseline, p.diff!.overHuman)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {p.flag && <p className="mflag">{p.flag}</p>}
              </article>
            ))}
          </div>

          <p className="mirror-bottom">
            <span className="em">The progressive base held.</span> The psychographic approach didn&apos;t sacrifice the base to reach conservative audiences.
          </p>
        </div>
      </section>

      {/* SECTION 4 — WHY IT WORKS (Paper) */}
      <section>
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '24px' }}>
            <span className="label">Why it works</span>
            <h2>Build the bridge first.</h2>
          </div>
          <p style={{ maxWidth: '62ch', color: 'var(--ink-soft)', fontSize: '1.12rem' }}>
            Deep canvassing builds a bridge into the voter&apos;s worldview before delivering policy. The engine does the same thing through message engineering. Deep canvassing costs $50–100 a conversation and reaches hundreds. The engine reaches millions.
          </p>
          <div className="pull">
            <p>
              The engine enters the voter&apos;s worldview first, then communicates policy within it.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5 — THE PLATFORM FALLACY (Ink) */}
      <section className="slate">
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '24px' }}>
            <span className="label">The platform fallacy</span>
            <h2>It is not a platform problem.</h2>
          </div>
          <p className="intro" style={{ maxWidth: '62ch', fontSize: '1.12rem' }}>
            The Democracy Alliance is investing tens of millions in creators for 2026. They think it&apos;s a platform problem. But if progressive creators push progressive moral language to non-progressive audiences, the RCT shows it won&apos;t work, and could backfire.
          </p>
          <div className="pull">
            <p>Renting persuasion from a black box you can&apos;t see into is not a scalable strategy.</p>
          </div>
        </div>
      </section>

      {/* SECTION 6 — RECURSIVE BY DESIGN (Paper) */}
      <section>
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '8px' }}>
            <span className="label">Recursive by design</span>
            <h2>It sharpens while you sleep.</h2>
          </div>
          <div className="loopwrap loop-light">
            <svg className="loopsvg" viewBox="0 0 400 400" role="img" aria-label="A repeating cycle: Generate, Field, Feed back, Fine-tune.">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                  <path d="M0 0L10 5L0 10z" fill="var(--gold-deep)" />
                </marker>
              </defs>
              <g fill="none" stroke="var(--gold-deep)" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrow)">
                <path d="M251.3 59.0 A150 150 0 0 1 341.0 148.7" />
                <path d="M341.0 251.3 A150 150 0 0 1 251.3 341.0" />
                <path d="M148.7 341.0 A150 150 0 0 1 59.0 251.3" />
                <path d="M59.0 148.7 A150 150 0 0 1 148.7 59.0" />
              </g>
              <g>
                <circle cx="200" cy="50" r="50" fill="rgba(200,146,42,0.1)" stroke="var(--gold-deep)" strokeWidth="1.5" />
                <circle cx="350" cy="200" r="50" fill="rgba(200,146,42,0.1)" stroke="var(--gold-deep)" strokeWidth="1.5" />
                <circle cx="200" cy="350" r="50" fill="rgba(200,146,42,0.1)" stroke="var(--gold-deep)" strokeWidth="1.5" />
                <circle cx="50" cy="200" r="50" fill="rgba(200,146,42,0.1)" stroke="var(--gold-deep)" strokeWidth="1.5" />
              </g>
              <g style={{ fontSize: '13px' }} dominantBaseline="middle">
                <text x="200" y="51">Generate</text>
                <text x="350" y="201">Field</text>
                <text x="200" y="351">Feed back</text>
                <text x="50" y="201">Fine-tune</text>
              </g>
            </svg>
          </div>
          <p style={{ maxWidth: '60ch', color: 'var(--ink-soft)', fontSize: '1.1rem', margin: '0 auto', textAlign: 'center' }}>
            Generate, field, feed back, fine-tune. The improvement compounds while you sleep.
          </p>
        </div>
      </section>

      {/* SECTION 7 — GOVERNANCE (Ink) */}
      <section className="slate">
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '24px' }}>
            <span className="label">Governance</span>
            <h2>The same capability, with a conscience.</h2>
          </div>
          <p className="intro" style={{ maxWidth: '64ch', fontSize: '1.12rem' }}>
            Ask an off-the-shelf model how to stop a union drive and it will help. Ask Change Agent, the same capability rebuilt with a values-aligned system prompt, and it refuses, then redirects to worker power. Persuasion you can audit is also persuasion you can govern.
          </p>
        </div>
      </section>

      {/* SECTION 8 — CTA (Paper) */}
      <section>
        <div className="wrap">
          <hr className="rule" style={{ marginBottom: '36px' }} />
          <h2>Move the people other programs leave out.</h2>
          <div className="cta-row" style={{ marginTop: '32px' }}>
            <a className="btn btn-primary" href="https://calendly.com/whitpendergast">Book a conversation</a>
          </div>
        </div>
      </section>
    </>
  );
}
