import Link from 'next/link';
import SeedMark from '@/components/SeedMark';
import { SEED_INK } from '@/lib/brand/seed';

export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap foot">
        <Link className="brand" href="/" aria-label="Hoplight home">
          {/* On white the seed is drawn in ink with its gold centre; 22 is 1.25em of the 18px word. */}
          <SeedMark className="seed" px={22} color={SEED_INK} />
          Hoplight
        </Link>
        <span className="meta">AI strategy for labor, advocacy, and mission-driven organizations</span>
        <span className="meta">© {new Date().getFullYear()} Hoplight</span>
        <ul className="foot-links">
          <li><Link href="/research">Research</Link></li>
          <li><Link href="/contact">Contact us</Link></li>
          <li><a href="mailto:whit@hoplight.ai">whit@hoplight.ai</a></li>
          <li>
            <a href="https://www.linkedin.com/in/whit-pendergast/" target="_blank" rel="noopener noreferrer">
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
