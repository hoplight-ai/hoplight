import Link from 'next/link';
import Collapse from '@/components/Collapse';

export default function Home() {
  return (
    <>
      {/* HERO */}
      <div className="hero">
        <div className="wrap">
          <span className="eyebrow">AI strategy for labor, advocacy, and mission-driven organizations</span>
          <h1>Most organizations are bushwhacking their way through AI. Hoplight is your guide.</h1>
          <p className="lede">We start at the front line, build for the people who do the work, and treat AI as a way to <strong>grow capacity, not cut it</strong>.</p>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/contact">Start a conversation</Link>
          </div>
        </div>
      </div>

      {/* WHO WE WORK WITH */}
      <section>
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '28px' }}>
            <span className="label">Who we work with</span>
            <h2>Organizations doing values-aligned work who need someone who already knows what to do with AI.</h2>
          </div>
          <div className="aud">
            <span>Unions</span>
            <span>Nonprofits</span>
            <span>Advocacy groups</span>
            <span>Foundations</span>
            <span>Progressive agencies</span>
            <span>Mission-driven campaigns</span>
          </div>
        </div>
      </section>

      {/* MIT beat (the problem) */}
      <div className="beat">
        <div className="wrap">
          <div>
            <div className="figure"><b>95%</b> of enterprise AI pilots deliver zero return.</div>
            <span className="src">MIT, State of AI in Business, 2025</span>
          </div>
          <p className="read">The reason is rarely the technology. It&apos;s the corporate playbook: buy the fancy tool, mandate its use, train people badly, and call the headcount you cut an innovation. <strong>We do the opposite.</strong></p>
        </div>
      </div>

      {/* THE CHOICE (slate, collapsible) */}
      <section className="slate">
        <div className="wrap">
          <div className="cgroup">
            <Collapse
              title={
                <span>
                  <span className="label" style={{ display: 'block', marginBottom: '12px' }}>The choice</span>
                  <span className="lead-head" style={{ fontSize: 'clamp(1.5rem, 1.1rem + 1.7vw, 2.25rem)', fontWeight: 500, lineHeight: 1.18, display: 'block' }}>Two ways to bring AI into an organization. Only one returns value.</span>
                </span>
              }
            >
              <p className="intro" style={{ maxWidth: '60ch', margin: '0 0 36px' }}>The most revolutionary technology in recent history just landed in our laps. The billionaire and CEO response has been austerity. There&apos;s another way.</p>
              <div className="choice">
                <div className="choice-col">
                  <div className="top">
                    <span className="kicker">AI austerity</span>
                    <h3>The corporate playbook</h3>
                  </div>
                  <ul>
                    <li>Lay people off and cut headcounts.</li>
                    <li>Mandate the tool from the top down.</li>
                    <li>Surveil and disempower the people using it.</li>
                    <li>Double the revenue. Call the cut an innovation.</li>
                  </ul>
                  <p className="result">97% of AI pilots never exit the pilot phase. More than 70% of deployments return no positive ROI. They fail because they don&apos;t prioritize the workers.</p>
                </div>
                <div className="choice-col good">
                  <div className="top">
                    <span className="kicker">AI abundance</span>
                    <h3>What Hoplight builds</h3>
                  </div>
                  <ul>
                    <li>Keep your people.</li>
                    <li>Train them up and meet them where they are.</li>
                    <li>Build the tools around the workforce you have.</li>
                    <li>10x the revenue, not 2x it.</li>
                  </ul>
                  <p className="result">Do more with the same headcount than you ever have. Your people are pumped, because you empowered them instead of mandating it, and upskilled them past the existential economic dread.</p>
                </div>
              </div>
              <div className="pull">
                <p>Using the greatest technological innovation in history as a Trojan horse for austerity is visionless.</p>
                <span className="attr">The Hoplight thesis</span>
              </div>
            </Collapse>
          </div>
        </div>
      </section>

      {/* WHAT HOPLIGHT IS */}
      <section>
        <div className="wrap">
          <span className="label" style={{ display: 'block', marginBottom: '22px' }}>What Hoplight is</span>
          <h2 className="bigline">A vertically integrated governance strategy shop, built for organizations <span className="em">without a Chief AI Officer</span>.</h2>
          <p style={{ maxWidth: '60ch', color: 'var(--stone-deep)', margin: '24px 0 48px', fontSize: '1.08rem' }}>Most shops offer one layer: a policy, a training, a pile of tools. Real adoption needs all three layers in the same room, each one respected, empowered, and included.</p>

          <div className="venn-wrap">
            <svg className="venn" viewBox="0 0 600 500" role="img" aria-label="Three overlapping spheres — Governance, Builders, and Practitioners — meeting at real adoption.">
              <g>
                <circle cx="300" cy="180" r="150" fill="rgba(28,24,19,0.05)" stroke="#C8922A" strokeOpacity="0.5" strokeWidth="1.5"/>
                <circle cx="215" cy="320" r="150" fill="rgba(28,24,19,0.05)" stroke="#C8922A" strokeOpacity="0.5" strokeWidth="1.5"/>
                <circle cx="385" cy="320" r="150" fill="rgba(28,24,19,0.05)" stroke="#C8922A" strokeOpacity="0.5" strokeWidth="1.5"/>
                <circle cx="300" cy="272" r="52" fill="rgba(200,146,42,0.92)" stroke="#946514" strokeWidth="2"/>
              </g>
              <text className="vlabel" x="300" y="118">GOVERNANCE</text>
              <text className="vlabel" x="168" y="362">BUILDERS</text>
              <text className="vlabel" x="432" y="362">PRACTITIONERS</text>
              <text className="vcenter" x="300" y="270" style={{ fill: '#1C1813' }}>REAL</text>
              <text className="vcenter" x="300" y="286" style={{ fill: '#1C1813' }}>ADOPTION</text>
            </svg>
          </div>

          <div className="cols">
            <div className="col">
              <span className="knum">01 / Practitioners</span>
              <h3>The people who do the work</h3>
              <p>The front line, closest to the actual work. They know exactly what would help. When left out of the loop, they run shadow AI, open security holes, or quietly sabotage the rollout.</p>
            </div>
            <div className="col">
              <span className="knum">02 / Builders</span>
              <h3>The people who can build almost anything</h3>
              <p>They can build almost anything you need. When left out of the loop, they ship every idea they have, burn tokens, and build tools nobody asked for.</p>
            </div>
            <div className="col">
              <span className="knum">03 / Governance</span>
              <h3>The people who set the rules</h3>
              <p>Legal, HR, compliance, and security. They own risk, regulation, and operational exposure. When left out of the loop, they freeze the work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BARN DOOR: the non-adopter */}
      <section className="slate">
        <div className="wrap">
          <div className="barn">
            <span className="label" style={{ display: 'block', marginBottom: '18px' }}>Even if you say no</span>
            <h2>Not adopting AI? You still have to engage with it.</h2>
            <p className="intro" style={{ fontSize: '1.1rem' }}>You need to understand your exposure, set an AI policy, vet the vendors layering AI into your stack, give your team talking points, and secure against shadow AI. That holds whether or not you deploy a single tool, and we help you justify the call to your own people.</p>
            <Link className="more" href="/services">See how we help &rarr;</Link>
          </div>
        </div>
      </section>

      {/* CREDENTIAL TRIPTYCH */}
      <div className="stats">
        <div className="wrap">
          <div className="stat">
            <div className="num">130+</div>
            <div className="cap">Unique AI tools, systems, and workflows Hoplight has built.</div>
          </div>
          <div className="stat">
            <div className="num">4&times;</div>
            <div className="cap">Return on ad spend in regulated, social-issue advertising, generated by an AI brand-voice system.</div>
          </div>
          <div className="stat">
            <div className="num">Zero</div>
            <div className="cap">Material compliance incidents across the systems Hoplight has shipped.</div>
          </div>
        </div>
      </div>

      {/* WORK (cards) */}
      <section id="work">
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '36px' }}>
            <span className="label">Work</span>
            <h2>Are you still unsure what AI can do for you? Take a look at the tools that national organizations are using.</h2>
          </div>
          <div className="workcards">
            <Link className="workcard" href="/work">
              <div>
                <span className="knum">Policy intelligence</span>
                <h3>AGIS, the AI Governance Intelligence System</h3>
                <p>Query AI governance across 225 jurisdictions in plain English.</p>
              </div>
              <span className="go">View &rarr;</span>
            </Link>
            <Link className="workcard" href="/persuasion">
              <div>
                <span className="knum">Persuasion</span>
                <h3>The Psychographic Message Engine</h3>
                <p>RCT-validated persuasion you can audit, control, and improve.</p>
              </div>
              <span className="go">View &rarr;</span>
            </Link>
          </div>
          <Link className="more" href="/portfolio">See the full portfolio &rarr;</Link>
        </div>
      </section>

      {/* SERVICES TEASER (links out) */}
      <section className="slate">
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '24px' }}>
            <span className="label">Services</span>
            <h2>Where Hoplight goes to work.</h2>
            <p className="intro">Governance and readiness, workforce and AI threat assessment, capacity building, custom builds, and AI visibility. Scoped to the organization in front of us.</p>
          </div>
          <Link className="more" href="/services">See services in full &rarr;</Link>
        </div>
      </section>

      {/* CLOSE */}
      <section className="slate" id="contact" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <hr className="rule" style={{ marginBottom: '36px' }} />
          <h2>Bring the thing your team hates doing. We&apos;ll start there.</h2>
          <p className="lede">A short conversation is the fastest way to see whether Hoplight is a fit. No deck required.</p>
          <div className="cta-row" style={{ marginTop: '32px' }}>
            <Link className="btn btn-primary" href="/contact">Start a conversation</Link>
            <a className="btn btn-ghost" href="mailto:whit@hoplight.ai">whit@hoplight.ai</a>
          </div>
        </div>
      </section>
    </>
  );
}
