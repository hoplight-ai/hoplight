'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SeedMark from '@/components/SeedMark';
import { CONTACT_LINK, NAV_LINKS } from '@/lib/nav-links';

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

  // The links live in src/lib/nav-links.ts so scripts/nav.test.mjs can prove none of them is gated.
  const links = NAV_LINKS;
  return (
    <header className="site">
      <div className="wrap nav">
        <Link className="brand" href="/" aria-label="Hoplight home">
          {/* 28: the mark's rendered width (1.25em of the 22px word), which sets its line weight. */}
          <SeedMark className="seed" px={28} />
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
          <ul>
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={path === href ? 'current' : ''}
                  aria-current={path === href ? 'page' : undefined}
                  onClick={() => setMenuOpen(false)}
                  prefetch={false}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          {/* The one filled button on every first screen: the pages carry no button of their own above the fold. */}
          <Link className="nav-cta" href={CONTACT_LINK.href} onClick={() => setMenuOpen(false)} prefetch={false}>{CONTACT_LINK.label}</Link>
        </nav>
      </div>
    </header>
  );
}
