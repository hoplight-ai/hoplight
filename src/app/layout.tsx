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
  // Emits apple-mobile-web-app-capable=yes and apple-mobile-web-app-title.
  // capable:true is what makes an iOS home-screen launch open without Safari chrome.
  // The title is the label under the home-screen icon, so it is the short name, not
  // the full page title, which iOS would truncate.
  appleWebApp: {
    capable: true,
    title: 'Hoplight',
    statusBarStyle: 'black-translucent',
  },
  // Measured against Next 16.2.12: `appleWebApp.capable` emits only the
  // standards-track `mobile-web-app-capable`, NOT the apple-prefixed legacy name.
  // Older iOS honours only the legacy name, and it is the tag root CLAUDE.md
  // requires by name. Emitting both costs one line and loses nothing.
  other: {
    'apple-mobile-web-app-capable': 'yes',
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
      <body>{children}</body>
    </html>
  );
}
