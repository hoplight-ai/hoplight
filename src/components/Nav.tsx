'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const path = usePathname();
  const links = [
    { href: '/services', label: 'Services' },
    { href: '/work', label: 'Work' },
    { href: '/persuasion', label: 'Persuasion' },
    { href: '/research', label: 'Research' },
    { href: '/about', label: 'About' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ];
  return (
    <header className="site">
      <div className="wrap nav">
        <Link className="brand" href="/" aria-label="Hoplight home">
          <svg className="beacon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4" fill="#E8A820"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Hoplight
        </Link>
        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
        </button>
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className={path === href ? 'current' : ''} onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
          <Link className="nav-cta" href="/contact" onClick={() => setMenuOpen(false)}>Start a conversation</Link>
        </nav>
      </div>
    </header>
  );
}
