import type { Metadata } from 'next'
import './globals.css'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://hoplight.ai'),
  title: {
    default:
      'Hoplight | AI systems for labor, advocacy, and mission-driven organizations',
    template: '%s | Hoplight',
  },
  description:
    'Hoplight builds production AI systems for labor unions, political campaigns, and mission-driven organizations operating under high-stakes constraints. Founded by Whit Kathner.',
  authors: [{ name: 'Whit Kathner' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hoplight.ai',
    siteName: 'Hoplight',
    title:
      'Hoplight | AI systems for labor, advocacy, and mission-driven organizations',
    description:
      'Production AI systems for unions, campaigns, and organizations where failure has real consequences. 70+ systems shipped. Zero compliance violations.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hoplight | AI for labor and advocacy',
    description:
      'Production AI systems for unions, campaigns, and mission-driven organizations. Founded by Whit Kathner.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main
          className="container"
          style={{
            paddingTop: '2rem',
            paddingBottom: '2rem',
            minHeight: 'calc(100vh - 200px)',
          }}
        >
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
