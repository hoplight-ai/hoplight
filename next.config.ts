import type { NextConfig } from 'next'

// The seven moved tools (/tools-hub /visualizations /whatshuman /pme /research-books /board /daily,
// Whit 2026-10-19: "4 yes") are NOT listed here. They are 307 redirects to their vercel.app
// addresses, issued by src/proxy.ts behind the sign-in (list: MOVED_TOOLS in src/lib/gate.ts),
// because a redirect in this file runs before the proxy and would skip the gate. They are
// redirects and not rewrites because a trial rewrite on a local build served each page (200) and
// then 404'd the asset each page names, for all seven: the targets name their files from the root.

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    // Added 2026-09-16 after the site review found no security headers at all: any origin could
    // frame hoplight.ai, including the contact form. SAMEORIGIN rather than DENY so the site can
    // still embed its own portfolio pieces.
    //
    // CSP widened from frame-ancestors-only to a real policy (review-squad fix lane, same day,
    // expert-security.md IMPORTANT #3). 'unsafe-inline' on script-src and style-src is a real
    // loosening, not the ideal policy: Next.js inlines its own bootstrap/hydration script and
    // this app renders inline `style={{...}}` props and inline <style> tags (IntakeForm, portfolio
    // header fragment, WhichAiTool) throughout, and a nonce-based policy would need every one of
    // those converted first. Verified against a local production build with zero CSP console
    // violations on every route (see the commit body for the route list). frame-src is scoped to
    // Calendly only (the contact form's booking embed target); no other third party is allowed to
    // frame in, and object-src/base-uri/form-action are locked to 'self'/'none'.
    // HSTS is added below, conditionally, after confirming both hostnames serve HTTPS.
    const csp =
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; " +
      "frame-src https://calendly.com https://*.calendly.com; frame-ancestors 'self'; " +
      "object-src 'none'; base-uri 'self'; form-action 'self'";
    return [
      {
        // Everything except /agis, which is the AGIS app proxied from its own Vercel project (see
        // rewrites below). That app sends its own security headers, and its policy must allow what
        // this one forbids: Supabase calls (connect-src) and Google Fonts. Stacking this CSP on its
        // responses would block every query. Added 2026-10-19 with the /agis rewrites.
        // /ai-election-errors is excluded for the same reason (same day): its form uploads
        // screenshots straight to Vercel Blob storage (connect-src) and loads Google Fonts, and the
        // project sends its own nosniff, referrer and frame headers.
        source: '/((?!agis/|agis$|ai-election-errors/|ai-election-errors$).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Added only after confirming both hostnames serve HTTPS with a 2xx/3xx (curl -sI,
          // 2026-09-16) — see the commit body for the exact results. No `preload`, per brief.
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
      // Static images under public/ were revalidated on every visit; a day in the browser cache
      // plus a week of stale-while-revalidate keeps them fresh without the repeat downloads.
      // Was scoped to three folders only (screenshots/portfolio/shots); performance review,
      // 2026-09-16, found everything else in public/ — og.png, favicon.ico, apple-touch-icon.png,
      // mit-logo.png, the research PDF, the fonts — still served with no cache-control at all
      // (`public, max-age=0, must-revalidate`). Matched by extension instead of by folder so any
      // static asset anywhere under public/ gets the same treatment, at any nesting depth.
      {
        source: '/:all*(png|jpg|jpeg|webp|svg|ico|pdf|woff2|json)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ]
  },
  async rewrites() {
    // Bet Appetit's demo copy (invented data, no database) runs as its own Vercel project with
    // basePath /bet-appetit, and hoplight.ai serves it under that path. Whit, 2026-09-15: portfolio
    // pieces live on hoplight.ai, and the real Bet Appetit carries personal information.
    return [
      { source: '/bet-appetit', destination: 'https://bet-appetit-demo.vercel.app/bet-appetit' },
      { source: '/bet-appetit/:path*', destination: 'https://bet-appetit-demo.vercel.app/bet-appetit/:path*' },
      // The Hoplight AGIS, same pattern: the Vercel project ai-policy-tool-3www builds the
      // ai-policy-tool repo with VITE_BRAND=hoplight and VITE_BASE_PATH=/agis/, so it answers under
      // /agis itself. Whit, 2026-10-19: "can we just make ti hoplight.ai/agis". The analytics
      // path goes first, to that project's own /_vercel route, which only answers at its root.
      { source: '/agis/_vercel/:path*', destination: 'https://ai-policy-tool-3www.vercel.app/_vercel/:path*' },
      { source: '/agis', destination: 'https://ai-policy-tool-3www.vercel.app/agis' },
      { source: '/agis/:path*', destination: 'https://ai-policy-tool-3www.vercel.app/agis/:path*' },
      // AI Election Errors (the public report form), same pattern: the ai-election-errors project
      // answers under /ai-election-errors itself (its vercel.json maps that prefix to its files and
      // functions), so the prefix passes through unchanged. Whit, 2026-10-19: "this should be a
      // webpage that goes off of Hoplight.ai".
      { source: '/ai-election-errors', destination: 'https://ai-election-errors.vercel.app/ai-election-errors' },
      { source: '/ai-election-errors/:path*', destination: 'https://ai-election-errors.vercel.app/ai-election-errors/:path*' },
    ]
  },
  async redirects() {
    return [
      // hoplight-rouge.vercel.app is a still-attached Vercel alias that serves the full site at
      // 200 with identical content (SEO/social/security reviews, 2026-09-16, all flagged it as
      // duplicate content with no crawler protection). hoplight.ai is the one canonical, public
      // address; this consolidates anyone who lands on the vercel.app hostname onto it. Host-
      // conditioned so it only fires for that hostname, not for hoplight.ai/www itself.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'hoplight-rouge.vercel.app' }],
        destination: 'https://hoplight.ai/:path*',
        permanent: true,
      },
      // /engine retired 2026-09-16 (review squad: six reviewers found it as a live, unlinked,
      // older copy of /persuasion with the wrong tab title and no preview image).
      { source: '/engine', destination: '/persuasion', permanent: true },
      // '/pme' used to land on /persuasion; it is the Message Engine's address now (src/proxy.ts,
      // Whit 2026-10-19 "4 yes"), so only the .html spelling keeps the old move.
      { source: '/pme.html', destination: '/persuasion', permanent: false },
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/services.html', destination: '/services', permanent: true },
      // /work retired 2026-08-13 — it near-duplicated /portfolio. Both the route and the
      // legacy .html path land on /portfolio directly, so there is no redirect chain.
      { source: '/work', destination: '/portfolio', permanent: true },
      { source: '/work.html', destination: '/portfolio', permanent: true },
      { source: '/persuasion.html', destination: '/persuasion', permanent: true },
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/faq.html', destination: '/faq', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/portfolio.html', destination: '/portfolio', permanent: true },
      // Draft home pages came off the public site 2026-09-25 (Portfolio AUDITPUB1): they were
      // drafts for Whit's review served to anyone. They now live behind the visualizations
      // password; anyone holding an old link lands on the password prompt, not a 404.
      // Not permanent, so a browser does not cache the move if Whit ever brings one back.
      ...[
        'hoplight-home-picks-2026-09-21',
        'hoplight-home-labor-print-2026-09-21',
        'hoplight-home-night-exterior-2026-09-21',
        'hoplight-home-high-altitude-2026-09-21',
      ].map((page) => ({
        source: `/${page}.html`,
        destination: `https://visualizations-eta.vercel.app/private/hoplight/${page}`,
        permanent: false,
      })),
      // 2026-10-06 (Portfolio MOCKGATE2): the 2026-09-09 services mockup was a draft for Whit's review
      // served to anyone; its copy now lives behind the visualizations password.
      {
        source: '/productized-services-2026-09-09.html',
        destination: 'https://visualizations-eta.vercel.app/private/hoplight/productized-services-2026-09-09',
        permanent: false,
      },
      {
        source: '/home-art/:path*',
        destination: 'https://visualizations-eta.vercel.app/private/hoplight/home-art/:path*',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
