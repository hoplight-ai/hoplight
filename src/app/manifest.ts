import type { MetadataRoute } from 'next';

/**
 * Web app manifest, served by Next at /manifest.webmanifest and linked automatically
 * from every page. This is what turns "save to home screen" from a screenshot thumbnail
 * into the Hoplight mark, and what makes the launch open without Safari chrome.
 *
 * Every colour and every icon below is taken from what this site already ships. Nothing
 * here is inferred from a design record (PO-HOPLIGHT-001):
 *   - name          : the existing metadata title in src/app/layout.tsx (frozen copy, unchanged)
 *   - theme_color   : #0F1B2D = --ink, src/app/globals.css:4, the sticky header's own
 *                     background at globals.css:109 (rgba(15,27,45,.97)). The phone status
 *                     bar sits directly above that header, so they should match.
 *   - background_color: #F5F5F0 = --surface, globals.css:10, which is the actual body
 *                     background at globals.css:52 and therefore the correct splash colour.
 *   - icons         : public/favicon-192.png and public/favicon-512.png, already generated
 *                     from public/favicon.svg by scripts/gen-favicons.mjs.
 *
 * Deliberately NOT declared maskable: the shipped mark fills its rounded-square canvas
 * edge to edge, so an Android maskable crop would cut into the glyph. Declaring it would
 * be a claim the artwork does not support.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Hoplight — AI strategy for labor, advocacy, and mission-driven organizations',
    short_name: 'Hoplight',
    description:
      'Hoplight is a vertically integrated AI governance and strategy shop for unions, nonprofits, advocacy groups, and foundations.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    theme_color: '#0F1B2D',
    background_color: '#F5F5F0',
    icons: [
      { src: '/favicon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
