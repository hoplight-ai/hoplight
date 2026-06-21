import type { Metadata } from 'next';
import ResearchStatBand from '@/components/ResearchStatBand';

export const metadata: Metadata = {
  title: 'Research: Psychographic Message Framing RCT | Hoplight',
  description:
    'AI-generated psychographic message frames beat the standard progressive baseline by 11 to 26 points net on conservative segments in a 3,006-person RCT. Read the research brief.',
  alternates: { canonical: '/research' },
  openGraph: {
    title: 'Research: Psychographic Message Framing RCT | Hoplight',
    description:
      'AI-generated psychographic message frames beat the standard progressive baseline by 11 to 26 points net on conservative segments in a 3,006-person RCT. Read the research brief.',
    url: 'https://hoplight.ai/research',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Hoplight' }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ScholarlyArticle',
  name: 'Psychographic Message Framing Outperforms Progressive Baseline on Conservative Segments',
  headline:
    'Psychographic Message Framing Outperforms Progressive Baseline on Conservative Segments',
  description:
    'A 3,006-person randomized controlled trial showing AI-generated psychographic message frames beat the standard progressive messaging approach by 11 to 26 points net on conservative psychographic segments.',
  author: {
    '@type': 'Person',
    name: 'Whit Pendergast',
    jobTitle: 'Founder, Hoplight',
    affiliation: {
      '@type': 'Organization',
      name: 'Hoplight',
    },
  },
  publisher: {
    '@type': 'Organization',
    name: 'Hoplight',
    url: 'https://hoplight.ai',
  },
  datePublished: '2026-06',
  url: 'https://hoplight.ai/research',
  about: [
    'psychographic messaging',
    'randomized controlled trial',
    'progressive messaging',
    'AI-generated persuasion',
    'political communication',
    'psychographic segmentation',
    'voter persuasion',
  ],
  keywords:
    'psychographic messaging, RCT, progressive messaging, AI persuasion, political communication, voter persuasion, psychographic segmentation, message framing',
};

export default function Research() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <div className="page-hero">
        <div className="wrap">
          <span className="label">Hoplight Research</span>
          <h1>
            Psychographic Message Framing Outperforms Progressive Baseline on Conservative
            Segments
          </h1>
          <p>Evidence from a 3,006-person randomized controlled trial, August 2025.</p>
          <p className="rct-author">
            Whit Pendergast, Founder, Hoplight | Published June 2026
          </p>
          <div className="cta-row">
            <a
              href="/hoplight-rct-research-brief.pdf"
              download
              className="btn btn-secondary"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>

      {/* STAT BAND */}
      <ResearchStatBand />

      {/* SUMMARY */}
      <section>
        <div className="wrap">
          <h2 className="rct-section-h2">Summary</h2>
          <p className="rct-body">
            In August 2025, Hoplight tested AI-generated psychographic message frames against
            the standard progressive messaging approach in a 3,006-person randomized controlled
            trial. The AI-generated frames beat the human-written progressive frame by 11 to 26
            points net on every conservative psychographic segment. The progressive base held. On
            populations Democrats lost in 2024, the standard progressive frame produced
            statistically significant backlash, driving union support down rather than up.
            Psychographic cuts of the data produced large, patterned differences across frames.
            Demographic cuts of the same data produced small, noisy ones.
          </p>
        </div>
      </section>

      {/* BACKGROUND */}
      <section style={{ borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <h2 className="rct-section-h2">Background</h2>
          <div className="rct-body">
            <p>
              The 2024 election post-mortem split into two surface debates: a channel argument
              (Joe Rogan, TikTok, podcasts) and a strategic-posture argument (the majoritarian
              vs. base-maximalist false choice). Both missed the deeper failure, which sits at
              the message layer. Standard progressive messaging presumes the listener processes
              the world the way the sender does. When that presumption breaks, the listener hears
              moralizing as condescension, and the message backfires before it persuades.
            </p>
            <p>
              Psychographic segmentation groups audiences by values, worldview, and cognitive
              style rather than demographics. Rather than writing one message for a demographic
              bucket, psychographic framing matches the message to the listener&apos;s operating
              system: what they value, what they trust, what they read as a threat. This study
              tested whether AI-generated psychographic frames could outperform the standard
              progressive approach on a real policy issue.
            </p>
          </div>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="rct-meth">
        <div className="wrap">
          <h2 className="rct-section-h2">Methodology</h2>
          <dl className="rct-dl">
            <dt>Design</dt>
            <dd>
              Randomized controlled trial with four conditions: three message treatments and a
              neutral placebo.
            </dd>
            <dt>Sample</dt>
            <dd>
              3,006 US adults (weighted to 3,004), fielded August 19&ndash;20, 2025. 60.9%
              voter-file match rate. Weighted on age, gender, race, education, and party
              identification.
            </dd>
            <dt>Partner</dt>
            <dd>
              Grow Progress, a progressive research and technology firm with proprietary
              psychographic segmentation (eight values-based segments cutting across race, class,
              and party).
            </dd>
            <dt>Conditions</dt>
            <dd>
              (1) A standard progressive frame, written by senior union communications staff,
              using familiar progressive messaging: community caregiving, racial solidarity,
              collective bargaining. (2) Two AI-generated psychographic alternatives, designed to
              resonate with listeners whose moral architecture prioritizes safety, loyalty,
              authority, and earned respect. (3) A neutral placebo as the control baseline.
            </dd>
            <dt>Outcomes</dt>
            <dd>
              Policy agreement (&ldquo;many security officers are poorly paid and resourced&rdquo;)
              and union-support intent (support or oppose the right of security officers to join a
              labor union).
            </dd>
          </dl>
        </div>
      </section>

      {/* FINDING 1 */}
      <section style={{ borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <h3 className="rct-finding-h3">
            AI-generated frames beat the progressive baseline by 11 to 26 points on conservative
            segments
          </h3>
          <p className="rct-body">
            On the policy-agreement question, the AI-generated psychographic frames outperformed
            the human-written progressive frame by 11 to 26 points net across every conservative
            psychographic segment. The largest gap: 26 points net with religious conservatives.
            The standard progressive frame went negative against the placebo with religious
            conservatives, meaning it performed worse than showing people a salt advertisement.
          </p>
        </div>
      </section>

      {/* FINDING 2 */}
      <section style={{ borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <h3 className="rct-finding-h3">The progressive base held</h3>
          <p className="rct-body">
            Both AI-generated frames maintained support levels among progressive psychographic
            segments. There was no erosion on the left. The psychographic approach did not
            sacrifice the base to reach conservative audiences.
          </p>
        </div>
      </section>

      {/* FINDING 3 — backlash, ink */}
      <section className="slate">
        <div className="wrap">
          <h3 className="rct-finding-h3" style={{ color: '#fff' }}>
            Standard progressive messaging produced backlash on 2024&apos;s decisive populations
          </h3>
          <p className="rct-backlash-intro">
            On the union-support question, the standard progressive frame drove statistically
            significant backlash among the populations Democrats lost in 2024:
          </p>
          <div className="rct-table-wrap">
            <table className="rct-table">
              <thead>
                <tr>
                  <th>Population</th>
                  <th>Progressive frame vs placebo</th>
                  <th>AI frames vs progressive</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Did not vote in 2024</td>
                  <td>
                    <span className="rct-neg">-10 pts (backlash)</span>
                  </td>
                  <td>
                    <span className="rct-pos">+20 to +21 pts</span>
                  </td>
                </tr>
                <tr>
                  <td>Voters under 35</td>
                  <td>
                    <span className="rct-neg">-9 pts (backlash)</span>
                  </td>
                  <td>
                    <span className="rct-pos">+12 to +14 pts</span>
                  </td>
                </tr>
                <tr>
                  <td>Working class (&lt;$50K)</td>
                  <td>
                    <span className="rct-neg">-3 pts</span>
                  </td>
                  <td>
                    <span className="rct-pos">+6 to +10 pts</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="rct-callout">
            The frame the field defaults to is producing the opposite of the intended effect
            with the audiences that now decide elections.
          </p>
        </div>
      </section>

      {/* FINDING 4 */}
      <section style={{ borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <h3 className="rct-finding-h3">
            Psychographic segmentation outperformed demographic segmentation as a predictor
          </h3>
          <p className="rct-body">
            Demographic cuts of the same dataset (race, age, education, income, urbanicity,
            party identification) produced small, noisy differences across the three message
            frames. Psychographic cuts produced large, patterned differences. The frame is the
            lever. Demographics are descriptive shorthand the field has been mistaking for an
            explanation.
          </p>
        </div>
      </section>

      {/* IMPLICATIONS */}
      <section style={{ borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <h2 className="rct-section-h2">What This Means for Practitioners</h2>
          <div style={{ maxWidth: 'var(--measure)' }}>
            <p className="rct-impl-para">
              <strong>The progressive messaging playbook has a structural problem.</strong>{' '}
              <span style={{ color: 'var(--stone-deep)' }}>
                It is not a volume problem, a channel problem, or a courage problem. It is a
                frame problem. The default approach writes messages for people who already
                process the world through a progressive moral framework, then broadcasts those
                messages to everyone.
              </span>
            </p>
            <p className="rct-impl-para">
              <strong>Psychographic framing is not micro-targeting.</strong>{' '}
              <span style={{ color: 'var(--stone-deep)' }}>
                It does not require individual-level data or surveillance infrastructure. It
                works by developing message variants matched to different cognitive styles, then
                deploying the right variant to the right psychographic segment. The segments cut
                across race, class, and party.
              </span>
            </p>
            <p className="rct-impl-para">
              <strong>AI is the scalability mechanism.</strong>{' '}
              <span style={{ color: 'var(--stone-deep)' }}>
                Psychographic code-switching is what deep canvassing and relational organizing do
                at the individual level. Their per-conversation cost confines them to small-scale
                deployment. AI-generated psychographic framing is the path to that code-switching
                at the volume and fidelity a national cycle requires.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* LIMITATIONS */}
      <section className="rct-meth">
        <div className="wrap">
          <h2 className="rct-section-h2">Study Limitations</h2>
          <p className="rct-body">
            This study measured attitudinal shift (policy agreement and union-support intent),
            not behavioral outcomes (votes, sign-ups, donations). The natural next step is a
            field deployment testing whether psychographic frames produce measurable behavioral
            conversion at scale, with voter-file match-back to validate impact on actual turnout
            and vote choice. The study tested one policy domain (security officer working
            conditions and unionization). Generalizability to other issue domains requires
            additional testing, which is underway.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="rct-cta-paper">
        <div className="wrap">
          <p className="rct-cta-line">The frame is the lever. Let&apos;s talk about yours.</p>
          <a href="/contact" className="btn btn-primary" style={{ borderBottom: 'none' }}>
            Start a conversation
          </a>
        </div>
      </section>

      {/* CITATION */}
      <div className="wrap rct-citation">
        <p>
          Citation: Pendergast, W. (2026). Psychographic Message Framing Outperforms
          Progressive Baseline on Conservative Segments: Evidence from a 3,006-Person
          Randomized Controlled Trial. Hoplight Research Brief. https://hoplight.ai/research
        </p>
      </div>
    </>
  );
}
