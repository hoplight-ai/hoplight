import type { MetadataRoute } from 'next';

const ORIGIN = 'https://hoplight.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', '/services', '/work', '/persuasion', '/research', '/about', '/faq', '/contact', '/portfolio'];
  return paths.map((p) => ({
    url: `${ORIGIN}${p}`,
    changeFrequency: 'monthly' as const,
    priority: p === '' ? 1 : p === '/research' ? 0.9 : 0.7,
  }));
}
