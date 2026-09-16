'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const path = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Mobile menu review, 2026-09-16: the menu had no tap-outside-to-close, no Escape, and no
  // scroll lock, so a visitor could scroll the page behind an open menu or leave it stuck open.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (navRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      setMenuOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const links = [
    // Rayli leads: SITE1 found the flagship product was not named anywhere a visitor could see it,
    // which read at first contact as a consulting shop with a side project.
    { href: '/rayli', label: 'Rayli' },
    { href: '/services', label: 'Services' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/persuasion', label: 'Persuasion' },
    // { href: '/research', label: 'Research' }, // hidden from nav, page still accessible
    { href: '/about', label: 'About' },
    // Label matches the page it opens ("Which AI Should I Use?"); "LLM Guide" promised a written guide.
    { href: '/tools/which-ai', label: 'Which AI' },
    { href: '/faq', label: 'FAQ' },
    // { href: '/contact', label: 'Contact' }, // hidden from nav
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
          ref={toggleRef}
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
        </button>
        <nav id="primary-nav" ref={navRef} className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={path === href ? 'current' : ''}
              aria-current={path === href ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link className="nav-cta" href="/contact" onClick={() => setMenuOpen(false)}>Start a conversation</Link>
        </nav>
      </div>
    </header>
  );
}
