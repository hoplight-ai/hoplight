import type { MetadataRoute } from 'next';

const ORIGIN = 'https://hoplight.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  // '/work' removed 2026-08-13: it now 308s to /portfolio, and a sitemap should not list a redirect.
  // '/rayli' added 2026-08-21 (SITE1): the flagship product had no page at all until then.
  const paths = ['', '/rayli', '/services', '/persuasion', '/research', '/about', '/faq', '/contact', '/portfolio'];
  return paths.map((p) => ({
    url: `${ORIGIN}${p}`,
    changeFrequency: 'monthly' as const,
    priority: p === '' ? 1 : p === '/rayli' ? 0.9 : p === '/research' ? 0.9 : 0.7,
  }));
}
