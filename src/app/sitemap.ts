import type { MetadataRoute } from 'next';

const ORIGIN = 'https://hoplight.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  // '/work' removed 2026-08-13: it now 308s to /portfolio, and a sitemap should not list a redirect.
  // '/rayli' added 2026-08-21 (SITE1): the flagship product had no page at all until then.
  // '/tools/which-ai' added 2026-09-16: live, linked from the nav and the portfolio, never listed.
  const paths = ['', '/rayli', '/services', '/persuasion', '/research', '/about', '/faq', '/contact', '/portfolio', '/tools/which-ai'];
  // Fixed date rather than a build-time Date.now(): a `lastModified` that changes on every deploy
  // regardless of whether the page's content changed teaches crawlers to ignore the field. Bump
  // this by hand when a route's content actually changes. Added 2026-09-16 (SEO review #3): the
  // field was absent entirely before this.
  const LAST_MODIFIED = '2026-09-16';
  return paths.map((p) => ({
    url: `${ORIGIN}${p}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: 'monthly' as const,
    priority: p === '' ? 1 : p === '/rayli' ? 0.9 : p === '/research' ? 0.9 : 0.7,
  }));
}
