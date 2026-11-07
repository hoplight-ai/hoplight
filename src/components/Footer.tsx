import Link from 'next/link';
import SeedMark from '@/components/SeedMark';
import { SEED_INK } from '@/lib/brand/seed';
import { FOOTER_LINKS } from '@/lib/nav-links';

// Whit, 2026-10-20: the footer is the seed, the year, the address and LinkedIn. The tagline and the
// Research link left with the restructure (Research is behind the sign-in now).
export default function Footer() {
  const [mail, linkedin] = FOOTER_LINKS;
  return (
    <footer className="site">
      <div className="wrap foot">
        <Link className="brand" href="/" aria-label="Hoplight home">
          {/* On white the seed is drawn in ink with its gold centre; 22 is 1.25em of the 18px word. */}
          <SeedMark className="seed" px={22} color={SEED_INK} />
          Hoplight
        </Link>
        <span className="meta">© {new Date().getFullYear()} Hoplight</span>
        <ul className="foot-links">
          <li><a href={mail.href}>{mail.label}</a></li>
          <li>
            <a href={linkedin.href} target="_blank" rel="noopener noreferrer">
              {linkedin.label}<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
