import type { Metadata } from 'next';
import Link from 'next/link';
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

export const metadata: Metadata = toolMetadata('portfolio', {
  title: 'Portfolio',
  description:
    'A selection of AI systems Hoplight has shipped for labor, advocacy, and mission-driven organizations. Most of them open in your browser.',
  path: '/portfolio',
  ogTitle: 'The Hoplight portfolio',
  ogDescription: 'Systems we’ve shipped. Most of them open in your browser.',
});

export default function Portfolio() {
  const clock = portfolioClock(process.env);
  const pieces = visibleTools(clock.now, undefined, { includeUncleared: clock.includeUncleared });
  return (
    <>
      <div className="page-hero portfolio-hero">
        <div className="wrap">
          <h1>Systems we&rsquo;ve shipped.</h1>
          <p>National organizations are running these tools in production. Not proofs of concept.</p>
        </div>
      </div>

      {/* The gallery opens straight onto the tiles, so a full row sits in the first screen at 1440 by 900
          (visual review, 2026-11-07). Its old heading block and the two mono labels went then. */}
      <section className="slate portfolio-gallery" aria-label="The gallery">
        <div className="wrap">
          <ul className="gallery-grid">
            {pieces.map((p, i) => {
              const external = p.href.startsWith('http');
              const live = p.kind === 'live';
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
                      <span className="wc-tag">{live ? 'Live app' : 'Interactive'}</span>
                      <h3 className="sr-only">{p.name}</h3>
                      <p>{p.line}</p>
                      <span className="wc-go">
                        {live ? 'Open the live app' : 'Open it'}{' '}&rarr;
                        {external && <span aria-hidden="true"> ↗</span>}
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
