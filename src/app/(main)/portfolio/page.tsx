import type { Metadata } from 'next';
import Link from 'next/link';
import { FACTS } from '@/lib/facts';
import { pageMetadata } from '@/lib/metadata';
import SeedMark from '@/components/SeedMark';
import QuietLattice from '@/components/portfolio/QuietLattice';

// The gallery used to live on the vault app's vercel.app address. Whit, 2026-09-15: it belongs on
// hoplight.ai. The interactive pieces are served from public/portfolio/ (npm run gallery:pull).
type Piece = { slug: string; title: string; blurb: string; href: string; live?: boolean; thumb?: string };

const PIECES: Piece[] = [
  { slug: 'dnc-autopsy-taken-apart', title: 'DNC autopsy, taken apart', blurb: 'The party’s own 2024 after-action report, argued from its own numbers.', href: '/portfolio/dnc-autopsy-taken-apart.html' },
  // "(ARIA)" dropped (copy review, 2026-09-16): the card's own blurb never explains what ARIA
  // stands for, and AGIS is already the load-bearing name here.
  { slug: 'agis-policy-search-aria', title: 'AGIS policy search', blurb: `${FACTS.agis.sources} sources, ${FACTS.agis.jurisdictions} jurisdictions, searchable in plain English.`, href: 'https://ai-policy-tool.vercel.app', live: true },
  { slug: 'ai-governance-checklist', title: 'AI governance checklist', blurb: 'Interactive checklist a mission-driven org can work through.', href: '/portfolio/ai-governance-checklist.html' },
  { slug: 'ai-lobbyist-player-map', title: 'AI lobbyist player map', blurb: 'Who lobbies on AI, for whom, and where the money lands.', href: '/portfolio/ai-lobbyist-player-map.html' },
  { slug: 'bet-appetit', title: 'Bet Appetit', blurb: 'Bet tracker skinned as the Michelin Guide. Bets paid in dinners. Demo copy with invented data.', href: '/bet-appetit', live: true, thumb: '/portfolio/thumbs/bet-appetit-demo.jpg' },
  { slug: 'cba-win-pattern-playbook', title: 'CBA win pattern playbook', blurb: 'AI clauses unions actually won, ranked by strength.', href: '/portfolio/cba-win-pattern-playbook.html' },
  { slug: 'every-political-dollar-buys-less', title: 'Every political dollar buys less', blurb: 'Cost per vote, 2000 to 2024, climbing.', href: '/portfolio/every-political-dollar-buys-less.html' },
  { slug: 'federal-agency-ai-inventory', title: 'Federal agency AI inventory', blurb: 'What every federal agency is doing on AI, browsable.', href: '/portfolio/federal-agency-ai-inventory.html' },
  { slug: 'hoplight-persuasion-story-page', title: 'Hoplight persuasion story page', blurb: 'Scroll-driven story explaining the persuasion offer.', href: '/portfolio/hoplight-persuasion-story-page.html' },
  { slug: 'oregon-school-budget-report', title: 'Oregon school budget report', blurb: 'Where Oregon K-12 money actually goes.', href: '/portfolio/oregon-school-budget-report.html' },
  { slug: 'pdi-trust-dilution-model', title: 'PDI trust dilution model', blurb: 'A small working model of trust dilution.', href: '/portfolio/pdi-trust-dilution-model.html' },
  { slug: 'redistricting-seat-shifts', title: 'Redistricting seat shifts', blurb: 'Likely flips and battleground districts.', href: '/portfolio/redistricting-seat-shifts.html' },
  { slug: 'what-s-human', title: 'What’s Human?', blurb: 'Guess whether a person or a machine wrote the text. Live vote tally.', href: 'https://whatshuman.vercel.app', live: true },
  { slug: 'where-political-money-actually-works', title: 'Where political money actually works', blurb: '24 years of political spending sorted by what moved votes.', href: '/portfolio/where-political-money-actually-works.html' },
  { slug: 'which-ai-should-i-use', title: 'Which AI should I use?', blurb: 'Answer a few questions, get told which model fits the job.', href: '/tools/which-ai', live: true },
  { slug: 'worker-equity-dilution-at-ge', title: 'Worker equity dilution at GE', blurb: '80 years of worker equity draining out of one company.', href: '/portfolio/worker-equity-dilution-at-ge.html' },
];

// Each card is headed by the product lockup from round four of the design system: the seed, "Hoplight",
// a thin rule, then the piece (Whit, 2026-10-16, of the lockup: "clean, strong, feels like a brand").
// The heading's accessible name is the piece alone; the brand half is decoration.
function Lockup({ title }: { title: string }) {
  return (
    <h3 className="pf-lockup">
      <SeedMark className="pf-lockup-seed" px={20} />
      <span className="pf-lockup-wm" aria-hidden="true">Hoplight</span>
      <span className="pf-lockup-bar" aria-hidden="true" />
      <span className="pf-lockup-pn">{title}</span>
    </h3>
  );
}

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
          <span className="pf-label">Portfolio</span>
          <h1 className="pf-display">Systems we&rsquo;ve shipped.</h1>
          <p>National organizations are running these tools in production. Not proofs of concept.</p>
        </div>
      </div>

      <section className="slate pf-gallery">
        <QuietLattice id="pf-gallery-field" />
        <div className="wrap">
          <div className="section-head">
            <span className="pf-label">The gallery</span>
            <h2 className="pf-display">Most of it, you can just open.</h2>
            <p>
              Live applications and interactive analyses, running in a browser, with no sales call in
              between.
            </p>
          </div>
          <ul className="gallery-grid">
            {PIECES.map((p) => {
              const external = p.href.startsWith('http');
              const thumb = p.thumb ?? `/portfolio/thumbs/${p.slug}.jpg`;
              return (
                <li key={p.slug}>
                  <a
                    className="wcard"
                    href={p.href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <div className="wcard-img">
                      {/* Responsive WebP variants (scripts/optimize-portfolio-thumbs.mjs,
                          performance review 2026-09-16 #7): phones get the 600px file instead of
                          the same full-desktop JPG a 1440px screen downloads. The 1200w WebP source
                          covers everyone else on a WebP-capable browser; the plain .jpg stays as
                          the <img> fallback for anything that supports neither <picture> nor WebP.
                          Every piece has a screenshot since 2026-10-16 (npm run portfolio:capture). */}
                      <picture>
                        <source
                          type="image/webp"
                          srcSet={`${thumb.replace(/\.jpg$/, '-600.webp')} 600w, ${thumb.replace(/\.jpg$/, '-1200.webp')} 1200w`}
                          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 380px"
                        />
                        <img src={thumb} alt="" width={1200} height={750} loading="lazy" decoding="async" />
                      </picture>
                    </div>
                    <div className="wcard-body">
                      <span className="pf-kind">{p.live ? 'Live app' : 'Interactive'}</span>
                      <Lockup title={p.title} />
                      <p>{p.blurb}</p>
                      {external && <span className="sr-only"> (opens in a new tab)</span>}
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="pf-label">Open source</span>
            <h2 className="pf-display">A tool other teams can run themselves.</h2>
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
              Open the router
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

      <section className="slate" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="sr-only">Get in touch</h2>
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
