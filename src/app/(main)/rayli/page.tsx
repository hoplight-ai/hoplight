import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { pageMetadata } from '@/lib/metadata';

// SITE1, 2026-08-21. Every claim on this page is traceable to one of two places: the Rayli pitch
// canon (quoted in the SITE1 brief) or copy already live elsewhere on this site. Nothing here is a
// new positioning claim — no pricing, no availability or maturity language, no customer or partner
// names, no second lift figure. Prose in Whit's voice is verbatim from canon and nothing else;
// the surrounding descriptive copy is in the site's own neutral register, matching /services.
//
// Two joins needed connective tissue and both are marked [stitch] at the line.

export const metadata: Metadata = pageMetadata({
  title: 'Rayli',
  // Trimmed from 266 to 154 characters (SEO review, 2026-09-16: 1.7x the ~155-char SERP budget).
  // Same four claims, shorter sentence: platform + audience, three traits, coverage accounting.
  description:
    'Rayli: communications intelligence for mission-driven organizations. Psychographically targeted, voice-true, source-cited copy, plus who heard what, when.',
  path: '/rayli',
  ogDescription:
    'Psychographically targeted, voice-true, source-cited copy for every destination you publish to, plus the map nobody else has: who heard what, when, across which channels, by audience.',
  // Per-route preview card (expert-social-meta.md #5): every route inherited the generic
  // /og.png before this. Absolute URL, per the served-pages standard.
  image: {
    url: 'https://hoplight.ai/api/og?title=Rayli&sub=A+communications+intelligence+platform',
    width: 1200,
    height: 630,
    alt: 'Rayli - Hoplight',
  },
});

// Minimal and factual: name, category and description are the canon one-liner and nothing more.
// Deliberately NO `offers` block — pricing is unsettled and the canon bars any public number.
const rayliSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Rayli',
  applicationCategory: 'Communications intelligence platform',
  description:
    'Psychographically targeted, voice-true, source-cited copy for every destination you publish to, plus coverage accounting: who heard what, when, across which channels, by audience.',
  publisher: { '@type': 'Organization', name: 'Hoplight', url: 'https://hoplight.ai' },
};

export default function Rayli() {
  return (
    <>
      <JsonLd data={rayliSchema} />

      <div className="page-hero">
        <div className="wrap">
          <span className="label">Rayli</span>
          <h1>A communications intelligence platform for mission-driven organizations.</h1>
          <p>
            Psychographically targeted, voice-true, source-cited copy for every destination you
            publish to, plus the map nobody else has: who heard what, when, across which
            channels, by audience.
          </p>
          <div className="rayli-shots">
            <figure>
              <div className="rayli-shot">
                <img
                  src="/screenshots/rayli-composer.webp"
                  alt="The Rayli composer screen: audience, destination, and frame selectors above a draft in progress."
                  width={1200}
                  height={750}
                  loading="eager"
                />
              </div>
              <figcaption>
                The composer: pick the audience, the destination and the frame, then write.
              </figcaption>
            </figure>
            <figure>
              <div className="rayli-shot">
                <img
                  src="/screenshots/rayli-reading.webp"
                  alt="The Rayli reading screen: a finished draft next to the provenance and source checks that ran against it."
                  width={1200}
                  height={750}
                  loading="lazy"
                />
              </div>
              <figcaption>
                The reading screen: the draft, and the checks that ran against it.
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      {/* THE QUESTION — cold open, canon */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="label">The question</span>
            <h2>
              The <Link href="/portfolio/dnc-autopsy-taken-apart.html">DNC autopsy</Link> ran 110
              pages and not one page could tell you what a given voter bucket actually heard
              across platforms in a given week.
            </h2>
            <p>
              Rayli is the tool that makes that question answerable inside your own organization.
            </p>
          </div>
        </div>
      </section>

      {/* THE BIKE — verbatim, his voice */}
      <section className="slate">
        <div className="wrap">
          <div className="statement">
            <h2>What people need is not more toolkits and communications. They need more tools.</h2>
          </div>
          <blockquote className="pull">
            <p>
              Right now people are being handed bicycle parts. They&rsquo;re being handed tires and
              a chain and gears and a couple of brakes and a kickstand and being told that now they
              can go ride a bike to get to work faster instead of walking. What people need is to be
              handed a bike. And I have built the bike.
            </p>
            <footer><cite className="attr">Whit Pendergast, founder</cite></footer>
          </blockquote>
        </div>
      </section>

      {/* WHAT IT DOES — four factual claims, canon */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="label">What it does</span>
            <h2>Four things, and each one leaves a record.</h2>
          </div>
          <div className="svc">
            <div className="svc-row">
              <h3>Psychographic audience models</h3>
              <p>
                Frames tuned to values and identity rather than demographics, so the message is
                built for the person you are actually aiming at.
              </p>
            </div>
            <div className="svc-row">
              <h3>A voice profile every generation passes through</h3>
              <p>
                Interview-built or derived from your own corpus, with a 76-rule AI-tells scanner
                reading every draft before it reaches you.
              </p>
            </div>
            <div className="svc-row">
              <h3>Source-cited generation</h3>
              <p>
                Provenance flags a user cannot silently ship past, and 37 maintained destination
                playbooks, so channel copy is written against per-platform rules rather than model
                memory.
              </p>
            </div>
            <div className="svc-row">
              <h3>Coverage accounting</h3>
              <p>
                Who heard what, across which channels, over time. Plus critique-improve-explain
                coaching on every draft, so the person using it gets better and not just the copy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE FLYWHEEL — exact canon wording; "the AI learns what wins" is banned */}
      <section className="slate">
        <div className="wrap">
          <div className="section-head">
            <span className="label">How it compounds</span>
            <h2>Your results attach to your assets.</h2>
            <p>
              Your top performers become the exemplars grounding the next generation. It stays your
              material the whole way through.
            </p>
          </div>
          <blockquote className="pull">
            {/* [stitch] canon reads "They help you write it faster"; "They" has no referent
                outside the pitch deck, so the subject is named. One phrase, no claim added. */}
            <p>
              Other tools help you write it faster; Rayli helps you say the thing that actually
              moves the person you&rsquo;re aiming at.
            </p>
            <footer><cite className="attr">Whit Pendergast, founder</cite></footer>
          </blockquote>
        </div>
      </section>

      {/* THE PROOF — link out, do not restate the numbers */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="label">The evidence</span>
            <h2>The approach was tested before it was built into a product.</h2>
            <p>
              The randomized controlled trial behind the psychographic approach, its methodology and
              its limits are all on the research page, in full.
            </p>
          </div>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/research">
              Read the research &rarr;
            </Link>
            <Link className="btn btn-outline" href="/persuasion">
              How the frames work &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* CLOSE */}
      {/* UX review, 2026-09-16: the bicycle-parts quote above is the page's pull-quote; this
          section's F1-engine line duplicated the same metaphor immediately before the CTA, so it
          is cut. [stitch] neutral, factual headline in its place — not his voice, not a new claim,
          same pattern as the other [stitch] joins on this page. */}
      <section className="close-cta">
        <div className="wrap">
          <h2>Ready to see whether Rayli fits your organization?</h2>
          <p className="cl-sub">
            The fastest way to find out is a short conversation.
          </p>
          <div className="btn-row">
            <Link className="btn btn-gold" href="/contact">
              Start a conversation &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
