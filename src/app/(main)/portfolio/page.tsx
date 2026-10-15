import type { Metadata } from 'next';
import Link from 'next/link';
import { FACTS } from '@/lib/facts';
import { pageMetadata } from '@/lib/metadata';
import { Bloom, EngravedField, QuietArcs } from '@/components/portfolio/Geometry';
import StillMagnifier from '@/components/portfolio/StillMagnifier';

// The portfolio in round four of the design system (Whit, 2026-10-15: "the portfolio page needs an
// overhaul in light of the design system"). The work is the picture: real screenshots of each piece,
// large and edge to edge, at sizes that vary with weight (the live apps lead), one line each, no card
// boxes, no uppercase or monospace labels, no trailing arrows. Every piece, link and sentence is the
// one the page carried before; only the arrangement changed.
//
// The gallery used to live on the vault app's vercel.app address. Whit, 2026-09-15: it belongs on
// hoplight.ai. The interactive pieces are served from public/portfolio/ (npm run gallery:pull); their
// screenshots come from scripts/capture-portfolio-thumbs.mjs.

type Piece = {
  slug: string;
  title: string;
  blurb: string;
  href: string;
  live?: boolean;
  /** The screenshot's file name in public/portfolio/thumbs/, when it is not the slug. */
  thumb?: string;
  /** Columns of twelve on a wide screen; 'spread' runs the full width with the words beside the picture. */
  span: 4 | 5 | 7 | 8 | 'spread';
  flip?: boolean;
  /** Set the smaller piece of a pair lower than its neighbour, so the rows step like a magazine spread. */
  drop?: boolean;
};

// The lead piece, shown large in the opening.
const LEAD: Omit<Piece, 'span'> = {
  slug: 'agis-policy-search-aria',
  // "(ARIA)" dropped (copy review, 2026-09-16): the card's own blurb never explains what ARIA
  // stands for, and AGIS is already the load-bearing name here.
  title: 'AGIS policy search',
  blurb: `${FACTS.agis.sources} sources, ${FACTS.agis.jurisdictions} jurisdictions, searchable in plain English.`,
  href: 'https://ai-policy-tool.vercel.app',
  live: true,
};

// The rest, in reading order: the live apps first and largest, then the analyses in varied sizes.
const PIECES: Piece[] = [
  { slug: 'what-s-human', title: 'What’s Human?', blurb: 'Guess whether a person or a machine wrote the text. Live vote tally.', href: 'https://whatshuman.vercel.app', live: true, span: 7 },
  { slug: 'which-ai-should-i-use', title: 'Which AI should I use?', blurb: 'Answer a few questions, get told which model fits the job.', href: '/tools/which-ai', live: true, span: 5, drop: true },
  { slug: 'bet-appetit', title: 'Bet Appetit', blurb: 'Bet tracker skinned as the Michelin Guide. Bets paid in dinners. Demo copy with invented data.', href: '/bet-appetit', live: true, thumb: 'bet-appetit-demo', span: 5, drop: true },
  { slug: 'oregon-school-budget-report', title: 'Oregon school budget report', blurb: 'Where Oregon K-12 money actually goes.', href: '/portfolio/oregon-school-budget-report.html', span: 7 },
  { slug: 'dnc-autopsy-taken-apart', title: 'DNC autopsy, taken apart', blurb: 'The party’s own 2024 after-action report, argued from its own numbers.', href: '/portfolio/dnc-autopsy-taken-apart.html', span: 'spread' },
  { slug: 'every-political-dollar-buys-less', title: 'Every political dollar buys less', blurb: 'Cost per vote, 2000 to 2024, climbing.', href: '/portfolio/every-political-dollar-buys-less.html', span: 4 },
  { slug: 'redistricting-seat-shifts', title: 'Redistricting seat shifts', blurb: 'Likely flips and battleground districts.', href: '/portfolio/redistricting-seat-shifts.html', span: 4 },
  { slug: 'where-political-money-actually-works', title: 'Where political money actually works', blurb: '24 years of political spending sorted by what moved votes.', href: '/portfolio/where-political-money-actually-works.html', span: 4 },
  { slug: 'worker-equity-dilution-at-ge', title: 'Worker equity dilution at GE', blurb: '80 years of worker equity draining out of one company.', href: '/portfolio/worker-equity-dilution-at-ge.html', span: 7 },
  { slug: 'hoplight-persuasion-story-page', title: 'Hoplight persuasion story page', blurb: 'Scroll-driven story explaining the persuasion offer.', href: '/portfolio/hoplight-persuasion-story-page.html', span: 5, drop: true },
  { slug: 'federal-agency-ai-inventory', title: 'Federal agency AI inventory', blurb: 'What every federal agency is doing on AI, browsable.', href: '/portfolio/federal-agency-ai-inventory.html', span: 'spread', flip: true },
  { slug: 'ai-lobbyist-player-map', title: 'AI lobbyist player map', blurb: 'Who lobbies on AI, for whom, and where the money lands.', href: '/portfolio/ai-lobbyist-player-map.html', span: 5, drop: true },
  { slug: 'cba-win-pattern-playbook', title: 'CBA win pattern playbook', blurb: 'AI clauses unions actually won, ranked by strength.', href: '/portfolio/cba-win-pattern-playbook.html', span: 7 },
  { slug: 'pdi-trust-dilution-model', title: 'PDI trust dilution model', blurb: 'A small working model of trust dilution.', href: '/portfolio/pdi-trust-dilution-model.html', span: 7 },
  { slug: 'ai-governance-checklist', title: 'AI governance checklist', blurb: 'Interactive checklist a mission-driven org can work through.', href: '/portfolio/ai-governance-checklist.html', span: 5, drop: true },
];

const ENGAGEMENTS: Array<{ name: string; does: string; serves: string }> = [
  {
    name: 'Change Agent',
    does: 'A persuasion assistant rebuilt with a values-aligned system prompt. Refuses anti-worker requests and redirects to worker power.',
    serves: 'Unions and organizers.',
  },
  {
    name: 'Agent-operated systems',
    does: 'Systems that run operational workflows autonomously, then monitor their own outputs. Agents handle the patterned 80%, people keep the judgment calls.',
    serves: 'Organizations with high-volume, repeating operational work.',
  },
  {
    name: 'AI brand voice for regulated commerce',
    does: `A brand-voice system for a women-owned, queer-led distillery selling a federally regulated product on a hostile ad platform. Compliant, converting, human-sounding copy at ${FACTS.company.roas} return on ad spend.`,
    serves: 'Consumer brands navigating platform restrictions and compliance requirements.',
  },
  {
    name: 'Labor AI intelligence product',
    does: 'Reframes the week’s AI developments for political and policy staff at one of the largest labor organizations in the US. Built for people who negotiate contracts, run campaigns, and advise elected officials.',
    serves: 'National labor organizations and their political and policy staff.',
  },
];

export const metadata: Metadata = pageMetadata({
  title: 'Portfolio',
  description:
    'A selection of AI systems Hoplight has shipped for labor, advocacy, and mission-driven organizations. Most of them open in your browser.',
  path: '/portfolio',
  ogDescription: 'Systems we’ve shipped. Most of them open in your browser.',
});

const external = (href: string) => href.startsWith('http');
const linkProps = (href: string) => (external(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {});

// Responsive WebP variants (scripts/optimize-portfolio-thumbs.mjs, performance review 2026-09-16 #7):
// phones get the 600px file; the plain .jpg stays as the fallback.
function Shot({ name, sizes, eager }: { name: string; sizes: string; eager?: boolean }) {
  const base = `/portfolio/thumbs/${name}`;
  return (
    <picture>
      <source type="image/webp" srcSet={`${base}-600.webp 600w, ${base}-1200.webp 1200w`} sizes={sizes} />
      <img
        src={`${base}.jpg`}
        alt=""
        width={1200}
        height={750}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        {...(eager ? { fetchPriority: 'high' as const } : {})}
      />
    </picture>
  );
}

function Caption({ p, as: H = 'h3' }: { p: Omit<Piece, 'span'>; as?: 'h2' | 'h3' }) {
  return (
    <span className="pf-cap">
      <span className="pf-kind">{p.live ? 'Live app' : 'Interactive'}</span>
      <H className="pf-title">{p.title}</H>
      <span className="pf-blurb">{p.blurb}</span>
      {external(p.href) && <span className="sr-only"> (opens in a new tab)</span>}
    </span>
  );
}

const SIZES: Record<string, string> = {
  4: '(max-width: 760px) 100vw, 360px',
  5: '(max-width: 760px) 100vw, 460px',
  7: '(max-width: 760px) 100vw, 660px',
  8: '(max-width: 760px) 100vw, 760px',
  spread: '(max-width: 760px) 100vw, 740px',
};

export default function Portfolio() {
  return (
    <>
      {/* The opening: the headline in one breath, then the lead piece rising out of the lit lattice and
          cropped at the right edge (the page's one bold move). */}
      <section className="slate pf-hero" aria-labelledby="pf-title">
        <EngravedField id="pf-hero-field" lit={[0.8, 0.58]} reach={0.5} />
        <div className="wrap pf-hero-copy">
          <span className="pf-label">Portfolio</span>
          <h1 id="pf-title">Systems we&rsquo;ve shipped.</h1>
          <p>National organizations are running these tools in production. Not proofs of concept.</p>
        </div>
      </section>

      <section className="pf-lead" aria-label={LEAD.title}>
        <div className="wrap">
          <a className="pf-link pf-lead-link" href={LEAD.href} {...linkProps(LEAD.href)}>
            <span className="pf-shot pf-lead-shot">
              <Shot name={LEAD.slug} sizes="(max-width: 760px) 160vw, 1180px" eager />
            </span>
            <Caption p={LEAD} as="h2" />
          </a>
        </div>
      </section>

      <section className="pf-gallery" aria-labelledby="pf-gallery-title">
        <Bloom />
        <div className="wrap">
          <div className="pf-head">
            <span className="pf-label">The gallery</span>
            <h2 id="pf-gallery-title">Most of it, you can just open.</h2>
            <p>
              Live applications and interactive analyses, running in a browser, with no sales call in
              between.
            </p>
          </div>
          <ul className="pf-work">
            {PIECES.map((p) => (
              <li key={p.slug} className={`pf-piece pf-span-${p.span}${p.flip ? ' pf-flip' : ''}${p.drop ? ' pf-drop' : ''}`}>
                <a className="pf-link" href={p.href} {...linkProps(p.href)}>
                  <span className="pf-shot">
                    <Shot name={p.thumb ?? p.slug} sizes={SIZES[String(p.span)]} />
                  </span>
                  <Caption p={p} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pf-router" aria-labelledby="pf-router-title">
        <div className="wrap pf-router-grid">
          <div className="pf-head">
            <span className="pf-label">Open source</span>
            <h2 id="pf-router-title">A tool other teams can run themselves.</h2>
            <p>
              Pandora&rsquo;s Router lets several AI coding agents work on one codebase at once. It
              proves their file claims don&rsquo;t overlap before any agent starts, then checks what
              each one says it finished. MIT licensed, live at router.hoplight.ai.
            </p>
            <div className="cta-row">
              <a className="btn btn-primary" href="https://router.hoplight.ai" target="_blank" rel="noopener noreferrer">
                Open the router
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="btn btn-secondary" href="https://github.com/hoplight-ai/pandoras-router" target="_blank" rel="noopener noreferrer">
                View on GitHub
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
          <a className="pf-link pf-router-shot" href="https://router.hoplight.ai" target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
            <span className="pf-shot">
              <Shot name="pandoras-router" sizes="(max-width: 760px) 100vw, 660px" />
            </span>
          </a>
        </div>
      </section>

      <section className="slate pf-clients" aria-labelledby="pf-clients-title">
        <QuietArcs center={[1120, 300]} opacity={0.16} />
        <div className="wrap">
          <div className="pf-head">
            <span className="pf-label">Client engagements</span>
            <h2 id="pf-clients-title">And some of it, you can&rsquo;t.</h2>
            <p>
              These run inside client organizations, on their data, so there is no link to hand you.
              Here is what each one does and who it serves.
            </p>
          </div>
          <ul className="pf-engagements">
            {ENGAGEMENTS.map((e) => (
              <li key={e.name} className="pf-engagement">
                <h3>{e.name}</h3>
                <dl>
                  <div>
                    <dt>What it does</dt>
                    <dd>{e.does}</dd>
                  </div>
                  <div>
                    <dt>Who it serves</dt>
                    <dd>{e.serves}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="slate pf-close" aria-labelledby="pf-close-title">
        <StillMagnifier />
        <div className="wrap pf-close-copy">
          <h2 id="pf-close-title" className="sr-only">Get in touch</h2>
          <p className="pf-close-line">Something here you want to talk about?</p>
          <div className="cta-row">
            <Link className="btn-gold" href="/contact">Start a conversation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
