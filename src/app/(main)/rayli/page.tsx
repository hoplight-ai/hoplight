import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';

// SITE1, 2026-08-21. Every claim on this page is traceable to one of two places: the Rayli pitch
// canon (quoted in the SITE1 brief) or copy already live elsewhere on this site. Nothing here is a
// new positioning claim — no pricing, no availability or maturity language, no customer or partner
// names, no second lift figure. Prose in Whit's voice is verbatim from canon and nothing else;
// the surrounding descriptive copy is in the site's own neutral register, matching /services.
//
// Two joins needed connective tissue and both are marked [stitch] at the line.

export const metadata: Metadata = {
  title: 'Rayli',
  description:
    'Rayli is a communications intelligence platform for mission-driven organizations: psychographically targeted, voice-true, source-cited copy for every destination you publish to, plus the map nobody else has — who heard what, when, across which channels, by audience.',
  alternates: { canonical: '/rayli' },
  openGraph: {
    title: 'Rayli — Hoplight',
    description:
      'Psychographically targeted, voice-true, source-cited copy for every destination you publish to, plus the map nobody else has: who heard what, when, across which channels, by audience.',
    url: 'https://hoplight.ai/rayli',
  },
};

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
            publish to, plus the map nobody else has &mdash; who heard what, when, across which
            channels, by audience.
          </p>
        </div>
      </div>

      {/* THE QUESTION — cold open, canon */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="label">The question</span>
            <h2>
              The DNC autopsy ran 110 pages and not one page could tell you what a given voter
              bucket actually heard across platforms in a given week.
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
            <h2>What people need are not more toolkits and communications. They need more tools.</h2>
          </div>
          <div className="pull">
            <p>
              Right now people are being handed bicycle parts. They&rsquo;re being handed tires and
              a chain and gears and a couple of brakes and a kickstand and being told that now they
              can go ride a bike to get to work faster instead of walking. What people need is to be
              handed a bike. And I have built the bike.
            </p>
            <span className="attr">Whit Pendergast, founder</span>
          </div>
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
          <div className="pull">
            {/* [stitch] canon reads "They help you write it faster"; "They" has no referent
                outside the pitch deck, so the subject is named. One phrase, no claim added. */}
            <p>
              Other tools help you write it faster; Rayli helps you say the thing that actually
              moves the person you&rsquo;re aiming at.
            </p>
          </div>
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

      {/* CLOSE — verbatim, his voice */}
      <section className="close-cta">
        <div className="wrap">
          <h2>We have an F1 between our ears and we shouldn&rsquo;t be using it to commute.</h2>
          {/* [stitch] one sentence of connective tissue to turn a stump line into a page ending.
              Factual and in the site's neutral register, not written in his voice. */}
          <p className="cl-sub">
            If that sounds like your organization, the fastest way to find out whether Rayli fits is
            a short conversation.
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
