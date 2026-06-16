import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
