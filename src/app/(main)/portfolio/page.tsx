import type { Metadata } from 'next';
import { portfolioClock, visibleTools } from '@/data/tools';
import { toolMetadata } from '@/lib/metadata';

// The list lives in src/data/tools.ts with a release day and a cleared flag per entry (Whit,
// 2026-11-07: "launch portfolio page w 3 builds and i keep adding on a posting schedule"). Rebuilt at
// most once an hour, so an entry whose day has come appears with no deploy.
export const revalidate = 3600;

// Nine pieces left the gallery on 2026-10-21 (Whit: "i want these removed from my hoplight.ai portfolio"):
// the PDI trust dilution model, Where political money actually works, Redistricting seat shifts, the
// Hoplight persuasion story page, Every political dollar buys less, the CBA win pattern playbook, the
// Federal agency AI inventory, the AI lobbyist player map and the AI governance checklist. Their files
// stay under public/portfolio/ (the design tests read them); nothing links to them.

// HOPSITE2, 2026-11-07 (Whit: "less is more. be coco chanel and take on thing off before leaving the
// house"): every line that explained what the visitor can already see went, starting with the "open"
// line in both descriptions, the production subline under the heading, the tile tags and the router
// band's label, heading and second sentence. scripts/portfolio-public.test.mjs keeps them gone.
export const metadata: Metadata = toolMetadata('portfolio', {
  title: 'Portfolio',
  description:
    'A selection of AI systems Hoplight has shipped for labor, advocacy, and mission-driven organizations.',
  path: '/portfolio',
  ogTitle: 'The Hoplight portfolio',
  ogDescription: 'Systems we’ve shipped.',
});

// Tiles whose line only says the tool's name again in other words, so the line is not drawn here (the
// card above it already shows the name). The line itself stays in src/data/tools.ts, which belongs to the
// tool drops and is not edited from here. HOPSITE2, 2026-11-07.
const RESTATES_NAME = new Set(['which-ai-should-i-use', 'oregon-school-budget-report']);

export default function Portfolio() {
  const clock = portfolioClock(process.env);
  const pieces = visibleTools(clock.now, undefined, { includeUncleared: clock.includeUncleared });
  return (
    <>
      <div className="page-hero portfolio-hero">
        <div className="wrap">
          <h1>Systems we&rsquo;ve shipped.</h1>
        </div>
      </div>

      {/* The gallery opens straight onto the tiles, so a full row sits in the first screen at 1440 by 900
          (visual review, 2026-11-07). Its old heading block and the two mono labels went then. */}
      <section className="slate portfolio-gallery" aria-label="The gallery">
        <div className="wrap">
          <ul className="gallery-grid">
            {pieces.map((p, i) => {
              const external = p.href.startsWith('http');
              return (
                <li key={p.slug}>
                  <a
                    className="wcard"
                    href={p.href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <div className="wcard-img wcard-img-card">
                      {/* Every tile is the tool's own link-preview card without the Hoplight band
                          (this page is already Hoplight's), so the gallery and a pasted link show
                          the same face. The card carries the name, so the text below does not
                          repeat it except for screen readers. */}
                      <img
                        className="wcard-card"
                        src={`/api/og/tool/${p.slug}?band=0`}
                        alt=""
                        width={1200}
                        height={630}
                        loading={i < 3 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    </div>
                    <div className="wcard-body">
                      <h2 className="sr-only">{p.name}</h2>
                      {!RESTATES_NAME.has(p.slug) && <p>{p.line}</p>}
                      <span className="wc-go">
                        {/* One action, one label (HOPSITE2 review, 2026-11-07): "Open the live app" went. A tile that
                            leaves the site shows the outward arrow alone (design review, same day). */}
                        Open it{' '}
                        {external ? <span aria-hidden="true">↗</span> : <>&rarr;</>}
                        {external && <span className="sr-only"> (opens in a new tab)</span>}
                      </span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* The design review of 2026-11-07, fix 1: the router block (its sentence and its two buttons) went.
          The router is a one-off and is never surfaced; scripts/portfolio-public.test.mjs keeps it off. */}
      {/* The Chanel pass (HOPSITE2, 2026-11-07): the closing "Something here you want to talk about?" band and
          its Start a conversation button went; the Contact button sits in the header on every screen. */}
    </>
  );
}
