import type { Metadata } from 'next';
import Arrow from '@/components/Arrow';
import Masthead from '@/components/Masthead';
import { FACTS } from '@/lib/facts';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Products',
  description: 'Five Hoplight products and the state each one is in.',
  path: '/products',
  ogDescription: 'Five products, and the state each one is in.',
});

// Whit, 2026-10-19 and 2026-10-20: "i like the products page". Text and order are mockup C
// (public/mockups/c-hybrid/products.html). Rayli has no link: it sits behind the sign-in.
// Two products left this page on 2026-10-23 (owner: mock up these changes). External links open in a new tab.
type Product = { name: string; state: string; line: string; ask?: string; href?: string; external?: boolean };

const PRODUCTS: Product[] = [
  { name: 'Rayli', state: 'Platform', line: 'Writes voice-true, source-cited copy and maps who heard what.' },
  { name: 'AGIS', state: 'Live app', line: `AI governance search across ${FACTS.agis.jurisdictions} jurisdictions and ${FACTS.agis.sources} sources.`, ask: 'Which states have enacted algorithmic management protections for workers?', href: '/agis' },
  { name: 'Which AI', state: 'Free tool', line: 'What it does with your organization’s data.', href: '/tools/which-ai' },
  { name: 'AI Election Errors', state: 'Public form', line: 'For AI tools that give wrong election information.', href: '/ai-election-errors' },
  { name: 'The Undo List', state: 'Public list', line: 'Second-term Trump actions, sorted by effort to undo.', href: '/undo' },
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
              {p.ask && <p className="ptile-ask">Ask it: “{p.ask}”</p>}
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
