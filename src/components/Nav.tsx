import Link from 'next/link'
import { HoplightSymbol } from './HoplightSymbol'

export function Nav() {
  return (
    <header
      style={{
        borderBottom: '1px solid rgba(139, 133, 120, 0.12)',
        background: 'var(--paper)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <nav
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'var(--nav-height)',
          fontSize: '0.9rem',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            fontSize: '1.05rem',
            letterSpacing: '-0.01em',
            borderBottom: 'none',
          }}
        >
          <HoplightSymbol size={28} />
          <span>oplight</span>
        </Link>
        <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
          <Link href="/about">About</Link>
          <Link href="/work">Work</Link>
          <Link href="/services">Services</Link>
          <Link href="/faq">FAQ</Link>
          <a
            href="https://ai-policy-tool.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            AGIS
          </a>
          <Link
            href="/contact"
            className="cta"
            style={{
              marginTop: 0,
              padding: '0.4rem 1rem',
              fontSize: '0.85rem',
            }}
          >
            Book a session
          </Link>
        </div>
      </nav>
    </header>
  )
}
