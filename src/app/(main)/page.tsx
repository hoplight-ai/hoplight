import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { FACTS } from '@/lib/facts';

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hoplight',
  url: 'https://hoplight.ai',
  description: 'AI strategy for labor, advocacy, and mission-driven organizations.',
  founder: {
    '@type': 'Person',
    name: 'Whit Pendergast',
    jobTitle: 'Founder, Hoplight',
    knowsAbout: ['AI strategy', 'AI governance', 'Labor technology', 'Psychographic message testing', 'AI adoption'],
  },
  areaServed: 'US',
  knowsAbout: ['AI governance', 'AI adoption', 'Workforce AI strategy', 'Psychographic messaging', 'Generative engine optimization'],
};

export default function Home() {
  return (
    <>
      <JsonLd data={orgSchema} />

      {/* HERO: dark, dense, tools visible */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <h1>Most organizations are bushwhacking their way through AI.</h1>
              <p className="lede">{FACTS.company.pilotFailure} of enterprise AI pilots return nothing (MIT). Hoplight builds the ones that do: <strong>{FACTS.company.systems} production AI systems</strong> for the labor, advocacy, and mission-driven organizations that can&apos;t hire a Chief AI Officer.</p>
              <div className="hero-cta">
                <Link className="btn-gold" href="/contact">Start a conversation</Link>
              </div>
              <p className="lede" style={{ marginTop: 18, fontSize: '0.9rem' }}>Hoplight&apos;s founder {FACTS.founder}.</p>
            </div>
            <div className="hero-stack" aria-hidden="true">
              <div className="hero-shot hs-1">
                <img src="/screenshots/agis.png" alt="" width={1228} height={925} loading="eager" />
              </div>
              <div className="hero-shot hs-2">
                <img src="/screenshots/pme.png" alt="" width={1270} height={794} loading="eager" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AUDIENCE: gold band */}
      <div className="aud-strip">
        <div className="wrap">
          <div className="aud-inner">
            <span className="aud-label">Who we work with</span>
            <div className="aud-list">
              <span>Unions</span>
              <span>Nonprofits</span>
              <span>Advocacy groups</span>
              <span>Foundations</span>
              <span>Progressive agencies</span>
              <span>Mission-driven campaigns</span>
            </div>
          </div>
        </div>
      </div>

      {/* PROBLEM */}
      <section className="problem">
        <div className="wrap">
          <div className="problem-row">
            <div>
              <div className="problem-fig"><span className="pct">{FACTS.company.pilotFailure}</span></div>
              <span className="src-line">MIT, State of AI in Business, 2025</span>
            </div>
            <div className="problem-body">
              <p className="lead-line">of enterprise AI pilots deliver zero return.</p>
              <p>The reason is rarely technology. It&apos;s a stale corporate playbook: buy the fancy tool, mandate its use, train people badly, and call the headcount you cut an innovation. <strong>We do the opposite.</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* THE CHOICE */}
      <section className="choice-section">
        <div className="wrap">
          <div className="choice-header">
            <h2>The Choice: Austerity or Abundance</h2>
            <p>The most revolutionary technology in recent history just landed in our laps. The billionaire and CEO response has been austerity. <strong>There&apos;s another way.</strong></p>
          </div>
          <div className="choice-grid">
            <div className="ch-col bad">
              <span className="ch-tag">AI austerity</span>
              <h3>The Corporate Playbook</h3>
              <ul>
                <li>Unilaterally determine AI use cases and governance.</li>
                <li>Mandate tools from the top down.</li>
                <li>Surveil and disempower the people using it.</li>
                <li>Lay people off, cut headcount, double revenue.</li>
                <li>Call the cut an innovation.</li>
              </ul>
              <p className="ch-result">The thesis: increase profit by decreasing headcount.</p>
            </div>
            <div className="ch-col good">
              <span className="ch-tag">AI abundance</span>
              <h3>Building with Hoplight</h3>
              <ul>
                <li>Your team identifies the highest ROI deployments for AI.</li>
                <li>Build the tools and workflows around their priority use cases.</li>
                <li>Train your team by meeting them where they are.</li>
                <li>Keep your people. Unlock the institutional knowledge they carry.</li>
                <li>Do more with the same headcount than you ever have before.</li>
              </ul>
            </div>
          </div>
          <div className="pull" style={{ marginTop: 40 }}>
            <p>Using the greatest technological innovation in history as a Trojan horse for austerity is visionless.</p>
            <span className="attr">The Hoplight thesis</span>
          </div>
        </div>
      </section>

      {/* IDENTITY */}
      <section className="ident">
        <div className="wrap">
          <div className="ident-top">
            <h2>Built for organizations without a Chief AI Officer.</h2>
            <p>Most shops offer one layer: a policy, a training, a pile of tools. Real adoption needs all three in the same room.</p>
          </div>
          <div className="venn-wrap">
            <svg className="venn" viewBox="0 0 600 500" role="img" aria-label="Three overlapping spheres — Governance, Builders, and Practitioners — meeting at real adoption.">
              <g>
                <circle cx="300" cy="180" r="150" fill="rgba(255,255,255,0.04)" stroke="#E8A820" strokeOpacity="0.5" strokeWidth="1.5" />
                <circle cx="215" cy="320" r="150" fill="rgba(255,255,255,0.04)" stroke="#E8A820" strokeOpacity="0.5" strokeWidth="1.5" />
                <circle cx="385" cy="320" r="150" fill="rgba(255,255,255,0.04)" stroke="#E8A820" strokeOpacity="0.5" strokeWidth="1.5" />
                <circle cx="300" cy="272" r="52" fill="#D4950A" stroke="#E8A820" strokeWidth="2" />
              </g>
              <text className="vlabel" x="300" y="118">GOVERNANCE</text>
              <text className="vlabel" x="168" y="362">BUILDERS</text>
              <text className="vlabel" x="432" y="362">PRACTITIONERS</text>
              <text className="vcenter" x="300" y="270">REAL</text>
              <text className="vcenter" x="300" y="286">ADOPTION</text>
            </svg>
          </div>
          <div className="ident-cols">
            <div className="ident-col">
              <span className="ic-num">01</span>
              <h3>Practitioners</h3>
              <p>The front line, closest to the actual work. When left out, they run shadow AI, open security holes, or quietly sabotage the rollout.</p>
            </div>
            <div className="ident-col">
              <span className="ic-num">02</span>
              <h3>Builders</h3>
              <p>They can build almost anything you need. When left out, they ship every idea they have and may build tools nobody asked for.</p>
            </div>
            <div className="ident-col">
              <span className="ic-num">03</span>
              <h3>Governance</h3>
              <p>Legal, HR, compliance, and security. They own risk and operational exposure. When left out, they freeze the work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF: gold-backed */}
      <div className="proof-band">
        <div className="wrap">
          <div className="proof-grid">
            <div className="proof-item">
              <div className="proof-num">{FACTS.company.systems}</div>
              <div className="proof-cap">Unique AI tools, systems, and workflows built and shipped.</div>
            </div>
            <div className="proof-item">
              <div className="proof-num">{FACTS.company.roas}</div>
              <div className="proof-cap">Return on {FACTS.company.adSpend} in regulated, social-issue ad spend.</div>
            </div>
            <div className="proof-item">
              <div className="proof-num">Zero</div>
              <div className="proof-cap">compliance incidents across {FACTS.company.adSpend} in regulated-industry ad spend.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ textAlign: 'center', paddingTop: '32px' }}>
        <Link className="see-more" href="/services">See services in full &rarr;</Link>
      </div>

      {/* WORK */}
      <section className="work-section">
        <div className="wrap">
          <div className="work-top">
            <h2>What we&apos;ve shipped.</h2>
            <p>Tools that national organizations are using. Not proofs of concept.</p>
          </div>
          <div className="work-cards">
            <Link className="wcard" href="/work">
              <div className="wcard-img">
                <img className="wcard-shot" src="/screenshots/agis.png" alt="AGIS search interface showing a world map and plain-English AI governance queries." width={1228} height={925} />
              </div>
              <div className="wcard-body">
                <span className="wc-tag">Policy intelligence</span>
                <h3>AGIS, the AI Governance Intelligence System</h3>
                <p>Query AI governance across 2,100+ jurisdictions in plain English. Cross-references what companies promise publicly against what they lobby for privately.</p>
                <span className="wc-go">View &rarr;</span>
              </div>
            </Link>
            <Link className="wcard" href="/persuasion">
              <div className="wcard-img">
                <img className="wcard-shot" src="/screenshots/pme.png" alt="The Psychographic Message Engine one-pager showing its four auditable layers and recursive loop." width={1270} height={794} />
              </div>
              <div className="wcard-body">
                <span className="wc-tag">Persuasion</span>
                <h3>The Psychographic Message Engine</h3>
                <p>Validated in a {FACTS.rct.n}-person voter-file-matched RCT: up to {FACTS.rct.liftVsBaseline} points over a no-message baseline. Persuasion you can audit, control, and improve.</p>
                <span className="wc-go">View &rarr;</span>
              </div>
            </Link>
          </div>
          <Link className="see-more" href="/portfolio">See the full portfolio &rarr;</Link>
        </div>
      </section>

      {/* BARN DOOR */}
      <section className="barn">
        <div className="wrap">
          <div className="barn-grid">
            <div>
              <h2>Not adopting AI? Governance is still essential.</h2>
              <p>You need to understand your exposure, set an AI policy, vet the vendors layering AI into your stack, and secure against shadow AI.</p>
              <Link className="see-more" href="/services">See how we help &rarr;</Link>
            </div>
            <div className="barn-items">
              <div className="barn-item">Exposure assessment</div>
              <div className="barn-item">AI policy framework</div>
              <div className="barn-item">Vendor audit</div>
              <div className="barn-item">Team talking points</div>
              <div className="barn-item">Shadow AI security</div>
              <div className="barn-item">Board-ready briefing</div>
            </div>
          </div>
        </div>
      </section>

      {/* LLM PICKER PROMO */}
      <section className="tool-promo">
        <div className="wrap">
          <div className="tool-promo-inner">
            <span className="label">Free tool</span>
            <h2>Trying to pick an AI tool?</h2>
            <p>Use Which AI, our free guide to what each platform does well and what it does with your data.</p>
            <Link className="btn btn-primary" href="/tools/which-ai">Use Which AI &rarr;</Link>
          </div>
        </div>
      </section>

    </>
  );
}
