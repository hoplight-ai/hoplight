import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://hoplight.ai'),
  title: {
    default: 'Hoplight — AI strategy for labor, advocacy, and mission-driven organizations',
    template: '%s — Hoplight',
  },
  description:
    'Hoplight is a vertically integrated AI governance and strategy shop for unions, nonprofits, advocacy groups, and foundations.',
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Hoplight',
    title: 'Hoplight — AI strategy for labor, advocacy, and mission-driven organizations',
    description:
      'AI strategy for labor, advocacy, and mission-driven organizations. Governance, adoption, custom builds, and message testing.',
    url: 'https://hoplight.ai',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Hoplight' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hoplight — AI strategy for labor, advocacy, and mission-driven organizations',
    description: 'AI strategy for labor, advocacy, and mission-driven organizations.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
