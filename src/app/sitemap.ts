import type { MetadataRoute } from 'next';

const ORIGIN = 'https://hoplight.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  // '/work' removed 2026-08-13: it now 308s to /portfolio, and a sitemap should not list a redirect.
  // '/rayli' added 2026-08-21 (SITE1): the flagship product had no page at all until then.
  // '/tools/which-ai' added 2026-09-16: live, linked from the nav and the portfolio, never listed.
  const paths = ['', '/rayli', '/services', '/persuasion', '/research', '/about', '/faq', '/contact', '/portfolio', '/tools/which-ai'];
  // The 12 static portfolio pieces under public/portfolio/*.html (review squad, 2026-09-16,
  // expert-seo.md #8: titled pages with no sitemap entry at all). Listed separately from `paths`
  // above because they live under a shared /portfolio/ prefix and carry their own, lower priority
  // rather than the 0.7 every top-level route gets.
  const portfolioPages = [
    'ai-governance-checklist',
    'ai-lobbyist-player-map',
    'cba-win-pattern-playbook',
    'dnc-autopsy-taken-apart',
    'every-political-dollar-buys-less',
    'federal-agency-ai-inventory',
    'hoplight-persuasion-story-page',
    'oregon-school-budget-report',
    'pdi-trust-dilution-model',
    'redistricting-seat-shifts',
    'where-political-money-actually-works',
    'worker-equity-dilution-at-ge',
  ];
  // Fixed date rather than a build-time Date.now(): a `lastModified` that changes on every deploy
  // regardless of whether the page's content changed teaches crawlers to ignore the field. Bump
  // this by hand when a route's content actually changes. Added 2026-09-16 (SEO review #3): the
  // field was absent entirely before this.
  const LAST_MODIFIED = '2026-09-16';
  const topLevel = paths.map((p) => ({
    url: `${ORIGIN}${p}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: 'monthly' as const,
    priority: p === '' ? 1 : p === '/rayli' ? 0.9 : p === '/research' ? 0.9 : 0.7,
  }));
  const portfolio = portfolioPages.map((slug) => ({
    url: `${ORIGIN}/portfolio/${slug}.html`,
    lastModified: LAST_MODIFIED,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));
  return [...topLevel, ...portfolio];
}
