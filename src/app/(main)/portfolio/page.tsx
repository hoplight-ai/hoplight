import type { Metadata } from 'next';
import Link from 'next/link';
import { FACTS } from '@/lib/facts';
import { pageMetadata } from '@/lib/metadata';

// The gallery used to live on the vault app's vercel.app address. Whit, 2026-09-15: it belongs on
// hoplight.ai. The interactive pieces are served from public/portfolio/ (npm run gallery:pull).
type Piece = { slug: string; title: string; blurb: string; href: string; live?: boolean; thumb?: string };

const PIECES: Piece[] = [
  { slug: 'dnc-autopsy-taken-apart', title: 'DNC autopsy, taken apart', blurb: 'The party’s own 2024 after-action report, argued from its own numbers.', href: '/portfolio/dnc-autopsy-taken-apart.html' },
  { slug: 'agis-policy-search-aria', title: 'AGIS policy search (ARIA)', blurb: `${FACTS.agis.sources} sources, ${FACTS.agis.jurisdictions} jurisdictions, searchable in plain English.`, href: 'https://ai-policy-tool.vercel.app', live: true },
  { slug: 'ai-governance-checklist', title: 'AI Governance Checklist', blurb: 'Interactive checklist a mission-driven org can work through.', href: '/portfolio/ai-governance-checklist.html' },
  { slug: 'ai-lobbyist-player-map', title: 'AI Lobbyist Player Map', blurb: 'Who lobbies on AI, for whom, and where the money lands.', href: '/portfolio/ai-lobbyist-player-map.html' },
  { slug: 'bet-appetit', title: 'Bet Appetit', blurb: 'Bet tracker skinned as the Michelin Guide. Bets paid in dinners. Demo copy with invented data.', href: '/bet-appetit', live: true, thumb: '/portfolio/thumbs/bet-appetit-demo.jpg' },
  { slug: 'cba-win-pattern-playbook', title: 'CBA Win Pattern Playbook', blurb: 'AI clauses unions actually won, ranked by strength.', href: '/portfolio/cba-win-pattern-playbook.html' },
  { slug: 'every-political-dollar-buys-less', title: 'Every Political Dollar Buys Less', blurb: 'Cost per vote, 2000 to 2024, climbing.', href: '/portfolio/every-political-dollar-buys-less.html' },
  { slug: 'federal-agency-ai-inventory', title: 'Federal Agency AI Inventory', blurb: 'What every federal agency is doing on AI, browsable.', href: '/portfolio/federal-agency-ai-inventory.html' },
  { slug: 'hoplight-persuasion-story-page', title: 'Hoplight persuasion story page', blurb: 'Scroll-driven story explaining the persuasion offer.', href: '/portfolio/hoplight-persuasion-story-page.html' },
  { slug: 'oregon-school-budget-report', title: 'Oregon school budget report', blurb: 'Where Oregon K-12 money actually goes.', href: '/portfolio/oregon-school-budget-report.html' },
  { slug: 'pdi-trust-dilution-model', title: 'PDI trust dilution model', blurb: 'A small working model of trust dilution.', href: '/portfolio/pdi-trust-dilution-model.html' },
  { slug: 'redistricting-seat-shifts', title: 'Redistricting seat shifts', blurb: 'Likely flips and battleground districts.', href: '/portfolio/redistricting-seat-shifts.html' },
  { slug: 'what-s-human', title: 'What’s Human?', blurb: 'Guess whether a person or a machine wrote the text. Live vote tally.', href: 'https://whatshuman.vercel.app', live: true },
  { slug: 'where-political-money-actually-works', title: 'Where Political Money Actually Works', blurb: '24 years of political spending sorted by what moved votes.', href: '/portfolio/where-political-money-actually-works.html' },
  { slug: 'which-ai-should-i-use', title: 'Which AI Should I Use?', blurb: 'Answer a few questions, get told which model fits the job.', href: '/tools/which-ai', live: true },
  { slug: 'worker-equity-dilution-at-ge', title: 'Worker equity dilution at GE', blurb: 'Eighty years of worker equity draining out of one company.', href: '/portfolio/worker-equity-dilution-at-ge.html' },
];

const NO_THUMB = new Set(['hoplight-persuasion-story-page']);

export const metadata: Metadata = pageMetadata({
  title: 'Portfolio',
  description:
    'A selection of AI systems Hoplight has shipped for labor, advocacy, and mission-driven organizations. Most of them open in your browser.',
  path: '/portfolio',
  ogDescription: 'Systems we’ve shipped. Most of them open in your browser.',
});

export default function Portfolio() {
  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <span className="label">Portfolio</span>
          <h1>Systems we&rsquo;ve shipped.</h1>
          <p>National organizations are running these tools in production. Not proofs of concept.</p>
        </div>
      </div>

      <section className="slate">
        <div className="wrap">
          <div className="section-head">
            <span className="label">The gallery</span>
            <h2>Most of it, you can just open.</h2>
            <p>
              Live applications and interactive analyses, running in a browser, with no sales call in
              between.
            </p>
          </div>
          <div className="gallery-grid">
            {PIECES.map((p) => {
              const external = p.href.startsWith('http');
              const thumb = p.thumb ?? (NO_THUMB.has(p.slug) ? null : `/portfolio/thumbs/${p.slug}.jpg`);
              return (
                <a
                  key={p.slug}
                  className="wcard"
                  href={p.href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <div className="wcard-img">
                    {thumb ? (
                      <img src={thumb} alt={`${p.title}, as it renders`} width={1200} height={750} loading="lazy" decoding="async" />
                    ) : (
                      <span className="wcard-plate">{p.title}</span>
                    )}
                  </div>
                  <div className="wcard-body">
                    <span className="wc-tag">{p.live ? 'Live app' : 'Interactive'}</span>
                    <h3>{p.title}</h3>
                    <p>{p.blurb}</p>
                    <span className="wc-go">{p.live ? 'Open the live app →' : 'Open it →'}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="label">Open source</span>
            <h2>A tool other teams can run themselves.</h2>
            <p>
              Pandora&rsquo;s Router lets several AI coding agents work on one codebase at once. It
              proves their file claims don&rsquo;t overlap before any agent starts, then checks what
              each one says it finished. MIT licensed, live at router.hoplight.ai.
            </p>
          </div>
          <div className="cta-row">
            <a
              className="btn btn-primary"
              href="https://router.hoplight.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open the router &rarr;
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              className="btn btn-secondary"
              href="https://github.com/hoplight-ai/pandoras-router"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="label">Client engagements</span>
            <h2>And some of it, you can&rsquo;t.</h2>
            <p>
              These run inside client organizations, on their data, so there is no link to hand you.
              Here is what each one does and who it serves.
            </p>
          </div>

          <div className="portfolio-grid">
            <div className="pfcard">
              <h3 className="pfname">Change Agent</h3>
              <div className="pfrow">
                <span className="pflabel">What it does</span>
                <span className="pfval">A persuasion assistant rebuilt with a values-aligned system prompt. Refuses anti-worker requests and redirects to worker power.</span>
              </div>
              <div className="pfrow">
                <span className="pflabel">Who it serves</span>
                <span className="pfval">Unions and organizers.</span>
              </div>
            </div>

            <div className="pfcard">
              <h3 className="pfname">Agent-operated systems</h3>
              <div className="pfrow">
                <span className="pflabel">What it does</span>
                <span className="pfval">Systems that run operational workflows autonomously, then monitor their own outputs. Agents handle the patterned 80%, people keep the judgment calls.</span>
              </div>
              <div className="pfrow">
                <span className="pflabel">Who it serves</span>
                <span className="pfval">Organizations with high-volume, repeating operational work.</span>
              </div>
            </div>

            <div className="pfcard">
              <h3 className="pfname">AI brand voice for regulated commerce</h3>
              <div className="pfrow">
                <span className="pflabel">What it does</span>
                <span className="pfval">A brand-voice system for a women-owned, queer-led distillery selling a federally regulated product on a hostile ad platform. Compliant, converting, human-sounding copy at {FACTS.company.roas} return on ad spend.</span>
              </div>
              <div className="pfrow">
                <span className="pflabel">Who it serves</span>
                <span className="pfval">Consumer brands navigating platform restrictions and compliance requirements.</span>
              </div>
            </div>

            <div className="pfcard">
              <h3 className="pfname">Labor AI intelligence product</h3>
              <div className="pfrow">
                <span className="pflabel">What it does</span>
                <span className="pfval">Reframes the week&rsquo;s AI developments for political and policy staff at one of the largest labor organizations in the US. Built for people who negotiate contracts, run campaigns, and advise elected officials.</span>
              </div>
              <div className="pfrow">
                <span className="pflabel">Who it serves</span>
                <span className="pfval">National labor organizations and their political and policy staff.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="slate" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <hr className="rule" style={{ marginBottom: '36px' }} />
          <p className="lede">Something here you want to talk about?</p>
          <div className="cta-row" style={{ marginTop: '24px' }}>
            <Link className="btn btn-primary" href="/contact">Start a conversation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
