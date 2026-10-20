import Link from 'next/link';
import Arrow from '@/components/Arrow';
import JsonLd from '@/components/JsonLd';
import Masthead from '@/components/Masthead';
import { FACTS } from '@/lib/facts';

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hoplight',
  url: 'https://hoplight.ai',
  description: 'AI strategy for labor, advocacy, and mission-driven organizations.',
  // logo/contactPoint added 2026-09-16 (review-squad fixes, item 7 / expert-seo.md #9): these
  // are what Google uses for entity/Knowledge Panel association, and there was no way to reach
  // Hoplight from this schema block other than the bare founder Person entry.
  logo: 'https://hoplight.ai/favicon-512.png',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'whit@hoplight.ai',
    contactType: 'sales',
  },
  sameAs: ['https://github.com/hoplight-ai', 'https://www.linkedin.com/in/whit-pendergast/'],
  founder: {
    '@type': 'Person',
    name: 'Whit Pendergast',
    jobTitle: 'Founder, Hoplight',
    sameAs: ['https://www.linkedin.com/in/whit-pendergast/'],
    knowsAbout: ['AI strategy', 'AI governance', 'Labor technology', 'Psychographic message testing', 'AI adoption'],
  },
  areaServed: 'US',
  knowsAbout: ['AI governance', 'AI adoption', 'Workforce AI strategy', 'Psychographic messaging', 'Generative engine optimization'],
};

// Whit, 2026-10-19 and 2026-10-20: the page says the question and points at four places, and stops. The
// structure is mockup C (public/mockups/c-hybrid/index.html); the look is the live site's masthead.
const TILES = [
  { href: '/products', name: 'Products', line: 'Six products, most open in a browser.' },
  { href: '/insights', name: 'Insights', line: 'One trial, ten reports.' },
  { href: '/services', name: 'Services', line: 'Four lines of work.' },
  { href: '/faq', name: 'FAQ', line: 'Plain answers.' },
];

export default function Home() {
  return (
    <>
      <JsonLd data={orgSchema} />

      {/* The seed masthead, round four of the design system (Whit, 2026-10-15): the lattice and lens
          behind the question, the four places to go laid over it. */}
      <Masthead labelledBy="hero-title">
        <h1 id="hero-title" className="long">You have valuable data. You face real challenges. You keep hearing AI has value to offer. How do you unlock it in a way that advances your mission?</h1>
        <p className="lede wide">
          {FACTS.company.pilotFailure} of enterprise AI pilots return nothing (
          <a href="https://nanda.media.mit.edu/" target="_blank" rel="noopener noreferrer">
            MIT<span className="sr-only"> (opens in a new tab)</span>
          </a>
          ). Hoplight delivers the ones that work, for labor, advocacy, and mission-driven organizations.
        </p>
        <ul className="hero-tiles">
          {TILES.map((t) => (
            <li key={t.href}>
              <Link className="hero-tile" href={t.href} prefetch={false}>
                <h2>{t.name}</h2>
                <p>{t.line}</p>
                <Arrow className="arrow tile-arrow" />
              </Link>
            </li>
          ))}
        </ul>
      </Masthead>

      <section className="mailband" aria-label="Email">
        <div className="wrap">
          <p>Or email <a href="mailto:whit@hoplight.ai">whit@hoplight.ai</a></p>
        </div>
      </section>
    </>
  );
}
