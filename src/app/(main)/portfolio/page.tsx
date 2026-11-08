import type { Metadata } from 'next';
import { onShelf, portfolioClock, visibleTools } from '@/data/tools';
import { tileMarkSvg } from '@/data/tool-marks';
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

// Every entry draws its line. HOPSITE2 (2026-11-07) hid the line on two tiles whose line restated the
// name; PORTSPLIT1's design review the same day put Oregon's back (its empty gap read as a fault), and the
// dispatcher's follow-up put Which AI's back, so the hidden list went. scripts/portfolio-shelf.test.mjs
// keeps every line drawn.

export default function Portfolio() {
  const clock = portfolioClock(process.env);
  const products = onShelf('product', visibleTools(clock.now, undefined, { includeUncleared: clock.includeUncleared }));
  return (
    <>
      <div className="page-hero portfolio-hero">
        <div className="wrap">
          <h1>Systems we&rsquo;ve shipped.</h1>
        </div>
      </div>

      {/* The gallery opens straight onto the tiles, so a full row sits in the first screen at 1440 by 900
          (visual review, 2026-11-07). Its old heading block and the two mono labels went then.
          PORTSPLIT1 round two, 2026-11-07 (Whit, after seeing Products and Reports as two parts here: "the
          reports need to live more as ... a research section of the website or something may be tied into my
          writings"): the portfolio shows products only. The reports are listed on /insights beside his
          writing, read from the same tool list. With one part left, its heading went too. */}
      <section className="slate portfolio-gallery portfolio-products" aria-label="The gallery">
        <div className="wrap">
          <ul className="gallery-grid">
            {products.map((p, i) => {
              const external = p.href.startsWith('http');
              const mark = tileMarkSvg(p.slug);
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
                      {/* MARKSLIVE1, 2026-11-07: a tool whose mark Whit picked draws it over the card's
                          corner picture, on the tile only (src/data/tool-marks.ts); the card is unchanged. */}
                      {mark && <div className="wcard-mark" aria-hidden="true" dangerouslySetInnerHTML={{ __html: mark }} />}
                    </div>
                    <div className="wcard-body">
                      <h2 className="sr-only">{p.name}</h2>
                      <p>{p.line}</p>
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
