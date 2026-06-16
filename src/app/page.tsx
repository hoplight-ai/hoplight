import Link from 'next/link';
import JsonLd from '@/components/JsonLd';

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
              <p className="lede">Hoplight is your guide. We start at the front line, build for the people who do the work, and treat AI as a way to <strong>grow capacity, not cut it</strong>.</p>
              <div className="hero-cta">
                <Link className="btn-gold" href="/contact">Start a conversation</Link>
                <a className="btn-outline" href="mailto:whit@hoplight.ai">whit@hoplight.ai</a>
              </div>
            </div>
            <div className="hero-stack" aria-hidden="true">
              <div className="tool-card tc-1">
                <div className="tc-bar">
                  <span className="tc-dot" /><span className="tc-dot" /><span className="tc-dot" />
                  <span className="tc-url">ai-policy-tool.vercel.app</span>
                </div>
                <div className="tc-body">
                  <div className="tc-line" style={{ width: '35%', background: 'rgba(232,168,32,0.4)', height: 6, borderRadius: 3 }} />
                  <div className="tc-line" style={{ width: '80%', background: 'rgba(255,255,255,0.06)' }} />
                  <div className="tc-line" style={{ width: '60%', background: 'rgba(255,255,255,0.04)' }} />
                  <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                    <div style={{ flex: 1, height: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 3 }} />
                    <div style={{ flex: 1, height: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 3 }} />
                  </div>
                </div>
              </div>
              <div className="tool-card tc-2">
                <div className="tc-bar">
                  <span className="tc-dot" /><span className="tc-dot" /><span className="tc-dot" />
                  <span className="tc-url">hoplight.ai/engine</span>
                </div>
                <div className="tc-body">
                  <div className="tc-line" style={{ width: '28%', background: 'var(--gold)', height: 7, borderRadius: 3 }} />
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48, marginTop: 8 }}>
                    <div style={{ width: 16, borderRadius: '2px 2px 0 0', background: 'rgba(255,255,255,0.08)', height: '30%' }} />
                    <div style={{ width: 16, borderRadius: '2px 2px 0 0', background: 'rgba(255,255,255,0.08)', height: '50%' }} />
                    <div style={{ width: 16, borderRadius: '2px 2px 0 0', background: 'rgba(232,168,32,0.35)', height: '40%' }} />
                    <div style={{ width: 16, borderRadius: '2px 2px 0 0', background: 'var(--gold)', height: '85%' }} />
                    <div style={{ width: 16, borderRadius: '2px 2px 0 0', background: 'rgba(232,168,32,0.5)', height: '60%' }} />
                    <div style={{ width: 16, borderRadius: '2px 2px 0 0', background: 'var(--gold)', height: '100%' }} />
                    <div style={{ width: 16, borderRadius: '2px 2px 0 0', background: 'rgba(232,168,32,0.4)', height: '70%' }} />
                  </div>
                  <div className="tc-line" style={{ width: '50%', background: 'rgba(255,255,255,0.06)', marginTop: 8 }} />
                  <div className="tc-line" style={{ width: '72%', background: 'rgba(255,255,255,0.04)' }} />
                </div>
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
              <div className="problem-fig"><span className="pct">95%</span></div>
              <span className="src-line">MIT, State of AI in Business, 2025</span>
            </div>
            <div className="problem-body">
              <p className="lead-line">of enterprise AI pilots deliver zero return.</p>
              <p>The reason is rarely the technology. It&apos;s the corporate playbook: buy the fancy tool, mandate its use, train people badly, and call the headcount you cut an innovation. <strong>We do the opposite.</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* THE CHOICE */}
      <section className="choice-section">
        <div className="wrap">
          <div className="choice-header">
            <h2>Two ways to bring AI into an organization.</h2>
            <p>The most revolutionary technology in recent history just landed in our laps. The billionaire and CEO response has been austerity. There&apos;s another way.</p>
          </div>
          <div className="choice-grid">
            <div className="ch-col bad">
              <span className="ch-tag">AI austerity</span>
              <h3>The corporate playbook</h3>
              <ul>
                <li>Lay people off and cut headcounts.</li>
                <li>Mandate the tool from the top down.</li>
                <li>Surveil and disempower the people using it.</li>
                <li>Double the revenue. Call the cut an innovation.</li>
              </ul>
              <p className="ch-result">97% of AI pilots never exit the pilot phase. They fail because they don&apos;t prioritize the workers.</p>
            </div>
            <div className="ch-col good">
              <span className="ch-tag">AI abundance</span>
              <h3>What Hoplight builds</h3>
              <ul>
                <li>Keep your people.</li>
                <li>Train them up and meet them where they are.</li>
                <li>Build the tools around the workforce you have.</li>
                <li>10x the revenue, not 2x it.</li>
              </ul>
              <p className="ch-result">Do more with the same headcount than you ever have. Your people are pumped, because you empowered them.</p>
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
            <h2>A vertically integrated governance strategy shop.</h2>
            <p>Built for organizations without a Chief AI Officer. Most shops offer one layer: a policy, a training, a pile of tools. Real adoption needs all three in the same room.</p>
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
              <p>They can build almost anything you need. When left out, they ship every idea they have and build tools nobody asked for.</p>
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
              <div className="proof-num">130+</div>
              <div className="proof-cap">Unique AI tools, systems, and workflows built and shipped.</div>
            </div>
            <div className="proof-item">
              <div className="proof-num">4&times;</div>
              <div className="proof-cap">Return on ad spend in regulated, social-issue advertising.</div>
            </div>
            <div className="proof-item">
              <div className="proof-num">Zero</div>
              <div className="proof-cap">Material compliance incidents across shipped systems.</div>
            </div>
          </div>
        </div>
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
                <div className="wcard-mock" aria-hidden="true">
                  <div className="wm-bar"><span className="wm-dot" /><span className="wm-dot" /><span className="wm-dot" /><span className="wm-url">ai-policy-tool.vercel.app</span></div>
                  <div className="wm-body">
                    <div className="wm-ln" style={{ width: '30%', background: 'var(--gold)', height: 6, borderRadius: 3 }} />
                    <div className="wm-ln" style={{ width: '85%', background: 'rgba(255,255,255,0.07)' }} />
                    <div className="wm-ln" style={{ width: '65%', background: 'rgba(255,255,255,0.05)' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginTop: 3 }}>
                      <div style={{ height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 3 }} />
                      <div style={{ height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 3 }} />
                    </div>
                    <div className="wm-ln" style={{ width: '50%', background: 'rgba(255,255,255,0.05)', marginTop: 3 }} />
                  </div>
                </div>
              </div>
              <div className="wcard-body">
                <span className="wc-tag">Policy intelligence</span>
                <h3>AGIS, the AI Governance Intelligence System</h3>
                <p>Query AI governance across 225 jurisdictions in plain English. Cross-references what companies promise publicly against what they lobby for privately.</p>
                <span className="wc-go">View &rarr;</span>
              </div>
            </Link>
            <Link className="wcard" href="/persuasion">
              <div className="wcard-img">
                <div className="wcard-mock" aria-hidden="true">
                  <div className="wm-bar"><span className="wm-dot" /><span className="wm-dot" /><span className="wm-dot" /><span className="wm-url">hoplight.ai/persuasion</span></div>
                  <div className="wm-body">
                    <div className="wm-ln" style={{ width: '40%', background: 'var(--gold)', height: 6, borderRadius: 3 }} />
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 44, marginTop: 6 }}>
                      <div style={{ width: 14, height: '35%', background: 'rgba(255,255,255,0.07)', borderRadius: '2px 2px 0 0' }} />
                      <div style={{ width: 14, height: '55%', background: 'rgba(255,255,255,0.07)', borderRadius: '2px 2px 0 0' }} />
                      <div style={{ width: 14, height: '45%', background: 'rgba(232,168,32,0.3)', borderRadius: '2px 2px 0 0' }} />
                      <div style={{ width: 14, height: '80%', background: 'var(--gold)', borderRadius: '2px 2px 0 0' }} />
                      <div style={{ width: 14, height: '100%', background: 'var(--gold)', borderRadius: '2px 2px 0 0' }} />
                      <div style={{ width: 14, height: '60%', background: 'rgba(232,168,32,0.4)', borderRadius: '2px 2px 0 0' }} />
                    </div>
                    <div className="wm-ln" style={{ width: '60%', background: 'rgba(255,255,255,0.05)', marginTop: 6 }} />
                  </div>
                </div>
              </div>
              <div className="wcard-body">
                <span className="wc-tag">Persuasion</span>
                <h3>The Psychographic Message Engine</h3>
                <p>RCT-validated persuasion you can audit, control, and improve. 11 to 26 points net lift across conservative segments.</p>
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
              <h2>Not adopting AI? You still have to engage with it.</h2>
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

      {/* SERVICES */}
      <section className="svc-section">
        <div className="wrap">
          <h2>Where Hoplight goes to work.</h2>
          <div className="svc-table">
            <div className="svc-row">
              <h3>AI governance and readiness</h3>
              <p>Where AI fits, the guardrails to deploy it, a roadmap your board can act on, and a vendor audit of who is already touching your data.</p>
            </div>
            <div className="svc-row">
              <h3>Workforce and AI threat assessment</h3>
              <p>A leadership-ready read on how AI hits your people, your operations, and your strategic position.</p>
            </div>
            <div className="svc-row">
              <h3>Capacity building and training</h3>
              <p>Conversation-first training that builds real fluency. Cohorts, workshops, infrastructure that sticks.</p>
            </div>
            <div className="svc-row">
              <h3>Custom AI builds</h3>
              <p>Systems built to your workflow and made to run after we leave. Brand-voice environments, RAG, agents for the patterned work.</p>
            </div>
            <div className="svc-row">
              <h3>AI visibility, GEO and AEO</h3>
              <p>How you show up when the answer comes from a language model. Audit, schema, structure.</p>
            </div>
          </div>
          <Link className="see-more" href="/services">See services in full &rarr;</Link>
        </div>
      </section>

      {/* CLOSE */}
      <section className="close-cta">
        <div className="wrap">
          <div style={{ width: 56, height: 2, background: 'var(--gold)', marginBottom: 28 }} />
          <h2>Bring the thing your team hates doing. We&apos;ll start there.</h2>
          <p className="cl-sub">A short conversation is the fastest way to see whether Hoplight is a fit. No deck required.</p>
          <div className="btn-row">
            <Link className="btn-gold" href="/contact">Start a conversation</Link>
            <a className="btn-outline" href="mailto:whit@hoplight.ai">whit@hoplight.ai</a>
          </div>
        </div>
      </section>
    </>
  );
}
