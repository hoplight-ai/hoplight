'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HoplightSymbol } from './HoplightSymbol'

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const close = () => setMenuOpen(false)

  return (
    <header style={{
      borderBottom: '1px solid rgba(139, 133, 120, 0.12)',
      background: 'var(--paper)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <nav className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 'var(--nav-height)',
        fontSize: '0.9rem',
        position: 'relative',
      }}>
        <Link href="/" onClick={close} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          fontSize: '1.05rem',
          letterSpacing: '-0.01em',
          borderBottom: 'none',
        }}>
          <HoplightSymbol size={28} />
          <span>oplight</span>
        </Link>

        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`} style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
          <Link href="/services" onClick={close}>Services</Link>
          <Link href="/work" onClick={close}>Work</Link>
          <Link href="/about" onClick={close}>About</Link>
          <Link href="/persuasion" onClick={close}>Persuasion</Link>
          <Link href="/faq" onClick={close}>FAQ</Link>
          <a href="https://ai-policy-tool.vercel.app" target="_blank" rel="noopener noreferrer" onClick={close}>ARIA</a>
          <Link href="/contact" onClick={close} className="cta nav-cta" style={{ marginTop: 0, padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Book a session</Link>
        </div>
      </nav>
    </header>
  )
}
