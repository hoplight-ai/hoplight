import type { Metadata } from 'next';

// Shared metadata builder for every route under src/app/(main)/. Before this existed, each page
// carried three separate copies of its own title/description string (metadata.title,
// openGraph.title, and nothing at all for twitter — which is exactly why every subpage's Twitter
// Card fell back to the root layout's title). One call here produces a consistent title,
// description, openGraph and twitter block, with the twitter block always mirroring openGraph.
// Site review, 2026-09-16 (expert-seo.md #1, expert-social-meta.md #3).

const ORIGIN = 'https://hoplight.ai';

const DEFAULT_IMAGE = { url: '/og.png', width: 1200, height: 630, alt: 'Hoplight' };

export interface PageMetadataInput {
  /** Page title. The root layout's template appends " — Hoplight". */
  title: string;
  /** SERP / plain <meta name="description">. Keep this under ~160 characters. */
  description: string;
  /** Route path, e.g. '/rayli'. Used for the canonical and for openGraph/twitter urls. */
  path: string;
  /** Overrides the derived "<title> — Hoplight" used for openGraph.title / twitter.title. */
  ogTitle?: string;
  /** Overrides `description` for openGraph.description / twitter.description. */
  ogDescription?: string;
  image?: { url: string; width: number; height: number; alt: string };
}

export function pageMetadata({
  title,
  description,
  path,
  ogTitle,
  ogDescription,
  image,
}: PageMetadataInput): Metadata {
  const resolvedOgTitle = ogTitle ?? `${title} — Hoplight`;
  const resolvedOgDescription = ogDescription ?? description;
  const resolvedImage = image ?? DEFAULT_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: 'Hoplight',
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      url: `${ORIGIN}${path}`,
      images: [resolvedImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      images: [resolvedImage.url],
    },
  };
}
