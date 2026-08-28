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
// mark. Colours are read off globals.css; nothing new is decided here.
//
// theme_color #0F1B2D is --ink (globals.css:4), which is also the sticky header's own background
// (globals.css:109, rgba(15,27,45,.97)) — the phone status bar sits directly above that header.
//
// background_color #F5F5F0 is --surface (globals.css:10), which is what `body` actually paints
// (globals.css:52). CORRECTED 2026-08-28 by lane preview7: this field was #0F1B2D, matching
// theme_color. It is the splash colour held while the app loads, so an ink splash handing over to
// a bone-white page is a visible dark-to-light flash on every cold launch. It must match the page.
//
// Deliberately NOT declared maskable: the shipped mark fills its rounded-square canvas edge to
// edge, so an Android maskable crop would cut into the glyph.

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
    background_color: "#F5F5F0",
    theme_color: "#0F1B2D",
    icons: [
      { src: "/favicon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
