import type { MetadataRoute } from 'next';

const ORIGIN = 'https://hoplight.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  // '/work' removed 2026-08-13: it now 308s to /portfolio, and a sitemap should not list a redirect.
  // '/tools/which-ai' added 2026-09-16: live, linked from the nav and the portfolio, never listed.
  // '/undo' added 2026-10-09: The Undo List, live but deliberately unlinked from the nav.
  //
  // Whit, 2026-10-19 ("5 yes"): hidden pages go behind the one-password sign-in. Everything behind it
  // came out of this list the same day: /rayli, /persuasion, /research, /portfolio and the twelve
  // portfolio pieces under it (the full gated list is src/lib/gate.ts, enforced by src/proxy.ts). A
  // sitemap that names a page a crawler cannot open is a sitemap that lies. scripts/gate.test.mjs
  // fails if a gated path comes back.
  const paths = ['', '/services', '/about', '/faq', '/contact', '/tools/which-ai', '/undo'];
  // Fixed date rather than a build-time Date.now(): a `lastModified` that changes on every deploy
  // regardless of whether the page's content changed teaches crawlers to ignore the field. Bump
  // this by hand when a route's content actually changes. Added 2026-09-16 (SEO review #3): the
  // field was absent entirely before this.
  const LAST_MODIFIED = '2026-09-16';
  return paths.map((p) => ({
    url: `${ORIGIN}${p}`,
    lastModified: p === '/undo' ? '2026-10-09' : LAST_MODIFIED,
    changeFrequency: 'monthly' as const,
    priority: p === '' ? 1 : p === '/undo' ? 0.8 : 0.7,
  }));
}
