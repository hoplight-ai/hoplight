import type { MetadataRoute } from 'next';

const ORIGIN = 'https://hoplight.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  // '/work' removed 2026-08-13: it now 308s to /portfolio, and a sitemap should not list a redirect.
  const paths = ['', '/services', '/persuasion', '/research', '/about', '/faq', '/contact', '/portfolio'];
  return paths.map((p) => ({
    url: `${ORIGIN}${p}`,
    changeFrequency: 'monthly' as const,
    priority: p === '' ? 1 : p === '/research' ? 0.9 : 0.7,
  }));
}
