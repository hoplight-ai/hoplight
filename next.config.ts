import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    // Added 2026-09-16 after the site review found no security headers at all: any origin could
    // frame hoplight.ai, including the contact form. SAMEORIGIN rather than DENY so the site can
    // still embed its own portfolio pieces. HSTS is left to Vercel, which already sets it.
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Static images under public/ were revalidated on every visit; a day in the browser cache
      // plus a week of stale-while-revalidate keeps them fresh without the repeat downloads.
      {
        source: '/(screenshots|portfolio|shots)/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ]
  },
  async rewrites() {
    // Bet Appetit's demo copy (invented data, no database) runs as its own Vercel project with
    // basePath /bet-appetit, and hoplight.ai serves it under that path. Whit, 2026-09-15: portfolio
    // pieces live on hoplight.ai, and the real Bet Appetit carries personal information.
    return [
      { source: '/bet-appetit', destination: 'https://bet-appetit-demo.vercel.app/bet-appetit' },
      { source: '/bet-appetit/:path*', destination: 'https://bet-appetit-demo.vercel.app/bet-appetit/:path*' },
    ]
  },
  async redirects() {
    return [
      { source: '/pme', destination: '/persuasion', permanent: false },
      { source: '/pme.html', destination: '/persuasion', permanent: false },
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/services.html', destination: '/services', permanent: true },
      // /work retired 2026-08-13 — it near-duplicated /portfolio. Both the route and the
      // legacy .html path land on /portfolio directly, so there is no redirect chain.
      { source: '/work', destination: '/portfolio', permanent: true },
      { source: '/work.html', destination: '/portfolio', permanent: true },
      { source: '/persuasion.html', destination: '/persuasion', permanent: true },
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/faq.html', destination: '/faq', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/portfolio.html', destination: '/portfolio', permanent: true },
    ]
  },
}

export default nextConfig
