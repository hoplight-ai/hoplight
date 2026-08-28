// The web manifest, which is what makes hoplight.ai installable rather than merely bookmarkable.
//
// The site already had the parts you can see: a 1200x630 card at /og.png, an absolute og:image
// courtesy of metadataBase, a 180px apple-touch-icon and an SVG favicon. What it had no way to say
// was its own NAME on a phone. Without a manifest iOS labels the home-screen icon from <title>,
// and this site's title is "Hoplight — AI strategy for labor, advocacy, and mission-driven
// organizations", which arrives cut to about twelve characters. `short_name` is one word.
//
// `display: "standalone"`, with the appleWebApp block in layout.tsx, is what opens a saved copy
// full screen instead of inside Safari's chrome.
//
// The icons are the PNGs already in public/ — no new artwork, no second source of truth for the
// mark. Colours are --ink and --gold read off globals.css; nothing new is decided here.

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Hoplight — AI strategy for labor, advocacy, and mission-driven organizations",
    short_name: "Hoplight",
    description:
      "AI strategy for labor, advocacy, and mission-driven organizations. Governance, adoption, custom builds, and message testing.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0F1B2D",
    theme_color: "#0F1B2D",
    icons: [
      { src: "/favicon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
