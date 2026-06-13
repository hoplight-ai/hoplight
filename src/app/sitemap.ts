import type { MetadataRoute } from 'next';

const ORIGIN = 'https://hoplight.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', '/services', '/work', '/persuasion', '/about', '/faq', '/contact', '/portfolio'];
  return paths.map((p) => ({
    url: `${ORIGIN}${p}`,
    changeFrequency: 'monthly',
    priority: p === '' ? 1 : 0.7,
  }));
}
