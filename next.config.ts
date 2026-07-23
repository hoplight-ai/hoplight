import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return []
  },
  async redirects() {
    return [
      { source: '/pme', destination: '/persuasion', permanent: false },
      { source: '/pme.html', destination: '/persuasion', permanent: false },
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
