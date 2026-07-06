import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [{ source: '/pme', destination: '/pme.html' }]
  },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/services.html', destination: '/services', permanent: true },
      { source: '/work.html', destination: '/work', permanent: true },
      { source: '/persuasion.html', destination: '/persuasion', permanent: true },
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/faq.html', destination: '/faq', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/portfolio.html', destination: '/portfolio', permanent: true },
    ]
  },
}

export default nextConfig
