import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap foot">
        <Link className="brand" href="/" aria-label="Hoplight home">
          <svg className="beacon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4" fill="#C8922A"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" stroke="#1C1813" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Hoplight
        </Link>
        <span className="meta">AI strategy for labor, advocacy, and mission-driven organizations</span>
        <span className="foot-links">
          <Link href="/contact">Contact us</Link>
          <a href="mailto:whit@hoplight.ai">whit@hoplight.ai</a>
        </span>
      </div>
    </footer>
  );
}
