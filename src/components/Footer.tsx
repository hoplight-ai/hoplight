import Link from 'next/link'

export function Footer() {
  return (
    <footer>
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <p style={{ marginBottom: '0.25rem' }}>
            Hoplight LLC. Portland, Oregon.
          </p>
          <p style={{ marginBottom: 0 }}>
            <a
              href="https://ai-policy-tool.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              ARIA
            </a>
            <span style={{ margin: '0 0.75rem' }}>·</span>
            <Link href="/services">Services</Link>
            <span style={{ margin: '0 0.75rem' }}>·</span>
            <Link href="/contact">Contact</Link>
          </p>
        </div>
        <p style={{ marginBottom: 0, fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} Hoplight LLC
        </p>
      </div>
    </footer>
  )
}
