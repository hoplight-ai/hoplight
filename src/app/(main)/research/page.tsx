import type { Metadata } from 'next';
import ResearchStatBand from '@/components/ResearchStatBand';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  // The root layout's title template appends " — Hoplight"; a suffix here rendered the brand twice.
  title: 'Research: Psychographic Message Framing RCT',
  // CORRECTED 2026-09-19 under Whit's ruling. The old line said "beat the standard progressive
  // baseline by 11 to 26 points net". The comparison meant was the staff-written frame, not the
  // placebo, and the range was wrong. True range, officer pay, conservative values segments:
  // 10 to 23 points (vendor report p12).
  description:
    'AI-generated frames outperformed the staff-written progressive frame by 10 to 23 points on officer pay across conservative segments. A 3,006-person randomized trial.',
  path: '/research',
  // ogTitle omitted: previously hardcoded with a " | Hoplight" pipe separator here while every
  // other route used an em dash (expert-social-meta.md #6). The helper now derives the em-dash
  // form used everywhere else.
  // Per-route preview card (expert-social-meta.md #5): absolute URL, per the served-pages standard.
  image: {
    url: 'https://hoplight.ai/api/og?title=The+research&sub=A+3%2C006-person+randomized+controlled+trial',
    width: 1200,
    height: 630,
    alt: 'The research — Hoplight',
  },
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ScholarlyArticle',
  name: 'Psychographic Message Framing Outperforms the Staff-Written Progressive Frame on Conservative Segments',
  headline:
    'Psychographic Message Framing Outperforms the Staff-Written Progressive Frame on Conservative Segments',
  description:
    'A 3,006-person randomized controlled trial in which AI-generated psychographic message frames outperformed the staff-written progressive frame by 10 to 23 points on officer pay across the conservative values segments.',
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
            Psychographic Message Framing Outperforms the Staff-Written Progressive Frame on
            Conservative Segments
          </h1>
          <p>Evidence from a 3,006-person randomized controlled trial, <time dateTime="2025-08">August 2025</time>.</p>
          <p className="rct-author">
            Whit Pendergast, Founder, Hoplight | Published <time dateTime="2026-06">June 2026</time>
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
            In August 2025, Hoplight tested two AI-generated psychographic message frames against
            a staff-written progressive frame and a placebo group who read an unrelated message,
            in a 3,006-person randomized controlled trial. On the officer-pay question, the
            AI-generated frames outperformed the staff-written frame by 10 to 23 points across the
            conservative values segments. With liberals and Democrats, the AI-generated frames
            performed about the same as the staff-written frame. On populations Democrats lost in
            2024, the staff-written frame drove union support down rather than up. Values segments
            separated the frames more cleanly than party or race did.
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
              bucket, psychographic framing matches the message to the listener&rsquo;s operating
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
              placebo group who read an unrelated message about a salt company.
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
              authority, and earned respect. (3) A placebo group who read an unrelated message.
            </dd>
            <dt>Outcomes</dt>
            <dd>
              Policy agreement (&ldquo;many security officers are poorly paid and resourced&rdquo;)
              and union-support intent (support or oppose the right of security officers to join a
              labor union).
            </dd>
            {/* Methods note added 2026-09-19 under Whit's ruling: one short note here, rather
                than "at the 90% threshold" appended to every sentence on the page. */}
            <dt>Significance</dt>
            <dd>
              Significance as flagged by the vendor: 90% confidence versus the placebo.
              Respondents were general-population adults; the trial measured attitudes, not votes.
            </dd>
          </dl>
        </div>
      </section>

      {/* FINDING 1 */}
      <section style={{ borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <h3 className="rct-finding-h3">
            AI-generated frames outperformed the staff-written frame by 10 to 23 points on
            officer pay across conservative segments
          </h3>
          <p className="rct-body">
            On the officer-pay question, the AI-generated psychographic frames outperformed the
            staff-written progressive frame by 10 to 23 points across the three conservative
            values segments. With religious conservatives the staff-written frame reached 56%
            agreement and the AI frames reached 78% and 79%. With enterprising conservatives, the
            Personal Safety frame reached 82% against 56% for the placebo group, a 26-point gap
            and the largest in the study. Overall, agreement rose from 59% in the placebo group
            to 75% under the Personal Safety frame.
          </p>
        </div>
      </section>

      {/* FINDING 2 */}
      <section style={{ borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <h3 className="rct-finding-h3">The AI frames held the progressive base</h3>
          <p className="rct-body">
            The AI-generated frames read like a departure from progressive values, because of
            their pride and valor tone. With liberals and Democrats they performed about the same
            as the message progressive human communicators were already using. On union support,
            the staff-written frame was the only one to lose ground overall, from 65% to 60%,
            while the AI frames held at 65% and 64%.
          </p>
        </div>
      </section>

      {/* FINDING 3 — backlash, ink */}
      <section className="slate">
        <div className="wrap">
          <h3 className="rct-finding-h3" style={{ color: '#fff' }}>
            The staff-written frame produced backlash on 2024&rsquo;s decisive populations
          </h3>
          <p className="rct-backlash-intro">
            On the union-support question, the staff-written progressive frame drove backlash
            among the populations Democrats lost in 2024. The vendor flagged the first two moves
            as significant against the placebo:
          </p>
          <div className="rct-table-wrap">
            <table className="rct-table">
              <caption className="sr-only">Backlash by population: staff-written frame vs. placebo, AI frames vs. staff-written frame</caption>
              <thead>
                <tr>
                  <th>Population</th>
                  <th>Staff-written frame vs placebo</th>
                  <th>AI frames vs staff-written frame</th>
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
                  <td>Respondents under 35</td>
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
            Values segments separated the frames more cleanly than party or race did. Across the
            eight values segments the three frames moved in opposite directions, by as much as 23
            points on officer pay. Cut the same data by party identification and the frames move
            together. The frame is the lever. Demographics are descriptive shorthand the field has
            been mistaking for an explanation.
          </p>
        </div>
      </section>

      {/* IMPLICATIONS */}
      <section style={{ borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <h2 className="rct-section-h2">What This Means for Practitioners</h2>
          <div style={{ maxWidth: 'var(--measure)' }}>
            {/* UX review, 2026-09-16: eleven unbroken paragraphs with one table gave a skimmer
                nowhere to land. These three sentences were already bolded as the lead of each
                point; promoting them to subheads costs no new copy. */}
            <h3 className="rct-finding-h3">The progressive messaging playbook has a structural problem.</h3>
            <p className="rct-impl-para" style={{ color: 'var(--stone-deep)' }}>
              It is not a volume problem, a channel problem, or a courage problem. It is a
              frame problem. The default approach writes messages for people who already
              process the world through a progressive moral framework, then broadcasts those
              messages to everyone.
            </p>
            <h3 className="rct-finding-h3">Psychographic framing is not micro-targeting.</h3>
            <p className="rct-impl-para" style={{ color: 'var(--stone-deep)' }}>
              It does not require individual-level data or surveillance infrastructure. It
              works by developing message variants matched to different cognitive styles, then
              deploying the right variant to the right psychographic segment. The segments cut
              across race, class, and party.
            </p>
            <h3 className="rct-finding-h3">AI is the scalability mechanism.</h3>
            <p className="rct-impl-para" style={{ color: 'var(--stone-deep)' }}>
              Psychographic code-switching is what deep canvassing and relational organizing do
              at the individual level. Their per-conversation cost confines them to small-scale
              deployment. AI-generated psychographic framing is the path to that code-switching
              at the volume and fidelity a national cycle requires.
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
          <h2 className="sr-only">Get in touch</h2>
          <p className="rct-cta-line">The frame is the lever. Let&rsquo;s talk about yours.</p>
          <a href="/contact" className="btn btn-primary" style={{ borderBottom: 'none' }}>
            Start a conversation
          </a>
        </div>
      </section>

      {/* CITATION */}
      <div className="wrap rct-citation">
        <p>
          Citation: Pendergast, W. (2026). <cite>Psychographic Message Framing Outperforms the
          Staff-Written Progressive Frame on Conservative Segments: Evidence from a 3,006-Person
          Randomized Controlled Trial.</cite> Hoplight Research Brief. https://hoplight.ai/research
        </p>
      </div>
    </>
  );
}
