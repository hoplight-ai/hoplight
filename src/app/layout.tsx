import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
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
  // Without this a saved copy opens inside Safari's chrome, address bar and all. `title` is the
  // label under the home-screen icon, and it is the short name rather than the <title> above,
  // because iOS truncates at roughly twelve characters — the full title arrives as "Hoplight — A…".
  appleWebApp: {
    capable: true,
    title: 'Hoplight',
    statusBarStyle: 'default',
  },
  // Next emits only the standardised `mobile-web-app-capable` and drops the apple-prefixed
  // spelling. Current Safari honours the manifest's display:"standalone", so this is belt and
  // braces — but older iOS reads only this one, and what it prevents fails silently: the icon
  // saves, it just opens with browser chrome around it.
  other: { 'apple-mobile-web-app-capable': 'yes' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
