import type { Metadata } from 'next';
import Arrow from '@/components/Arrow';
import Masthead from '@/components/Masthead';
import { FACTS } from '@/lib/facts';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Products',
  description: 'Six Hoplight products and the state each one is in. Most open in a browser.',
  path: '/products',
  ogDescription: 'Six products, and the state each one is in.',
});

// Whit, 2026-10-19 and 2026-10-20: "i like the products page". Text and order are mockup C
// (public/mockups/c-hybrid/products.html). Rayli has no link: it sits behind the sign-in. Pandora's
// Router links where the portfolio page links it. External links open in a new tab.
type Product = { name: string; state: string; line: string; href?: string; external?: boolean };

const PRODUCTS: Product[] = [
  { name: 'Rayli', state: 'Platform', line: 'Writes voice-true, source-cited copy and maps who heard what.' },
  { name: 'AGIS', state: 'Live app', line: `AI governance search across ${FACTS.agis.jurisdictions} jurisdictions and ${FACTS.agis.sources} sources.`, href: '/agis' },
  { name: 'Which AI', state: 'Free tool', line: 'Which model fits the job, and what it does with data.', href: '/tools/which-ai' },
  { name: 'The Undo List', state: 'Public list', line: 'Second-term Trump actions, sorted by effort to undo.', href: '/undo' },
  { name: 'Pandora’s Router', state: 'Open source, MIT', line: 'Several AI coding agents, one codebase, no overlapping files.', href: 'https://router.hoplight.ai', external: true },
  { name: 'Bet Appetit', state: 'Demo, invented data', line: 'Bets paid in dinners, skinned as the Michelin Guide.', href: '/bet-appetit' },
];

export default function Products() {
  return (
    <Masthead labelledBy="products-title" variant="page">
      <h1 id="products-title">Products</h1>
      <ul className="ptiles">
        {PRODUCTS.map((p) => {
          const body = (
            <>
              <span className="ptile-tag">{p.state}</span>
              <h2>{p.name}</h2>
              <p>{p.line}</p>
              {p.href && <Arrow className="arrow tile-arrow" />}
              {p.external && <span className="sr-only"> (opens in a new tab)</span>}
            </>
          );
          return (
            <li key={p.name}>
              {p.href ? (
                // A plain anchor: /agis and /bet-appetit are rewrites to their own projects, which the
                // client router cannot follow.
                <a className="ptile" href={p.href} {...(p.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {body}
                </a>
              ) : (
                <div className="ptile ptile-still">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Masthead>
  );
}
