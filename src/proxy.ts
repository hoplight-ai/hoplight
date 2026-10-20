// THE GATE'S DOOR (Next 16 calls this file `proxy`; it was `middleware`). Whit, 2026-10-19: "5 yes",
// hidden pages go behind the existing one-password sign-in, not merely unlinked.
//
// What it does, in plain words:
//   - A path that is not on the gated list passes straight through, untouched.
//   - A gated path with the Basic pair or the qt_access cookie passes through, with
//     `X-Robots-Tag: noindex` added. The seven moved tools (src/lib/gate.ts) are then forwarded
//     with a 307 to their vercel.app address.
//   - A gated path with neither gets the one-password sign-in page (200, no browser box) when a
//     browser asks for a page, and a 401 with a Basic challenge for everything else (curl, fetch,
//     `?dialog=1`), exactly as quick-tools does.
//   - With the env pair missing nothing can match, so every gated path stays shut.
//
// The sign-in form posts to /api/grant (src/app/api/grant/route.ts), which sets the cookie.
// `config.matcher` below must list the same paths as src/lib/gate.ts; scripts/gate.test.mjs fails
// when they drift.

// 'next/server.js' rather than 'next/server': the same module, spelled so plain Node can load this
// file for scripts/gate.test.mjs (Node's ESM loader will not complete an extensionless package path).
import { NextResponse } from 'next/server.js'
import type { NextRequest } from 'next/server.js'
import { hasAccess, isGated, movedToolTarget } from './lib/gate.ts'
import { isPageRequest, signInResponse } from './lib/sign-in-page.mjs'

export async function proxy(request: NextRequest) {
  const url = request.nextUrl
  if (!isGated(url.pathname)) return NextResponse.next()

  if (await hasAccess(request, process.env)) {
    const forward = movedToolTarget(url.pathname, url.search)
    const response = forward ? NextResponse.redirect(forward, 307) : NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex')
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }

  if (isPageRequest(request)) return signInResponse({ next: url.pathname + url.search })

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Hoplight tools", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  })
}

export const config = {
  matcher: [
    '/persuasion',
    '/persuasion/:path*',
    '/research',
    '/research/:path*',
    '/hoplight-rct-research-brief.pdf',
    '/portfolio',
    '/portfolio/:path*',
    '/rayli',
    '/rayli/:path*',
    '/pme-lever.html',
    '/pme-lever-manifest.json',
    '/hoplight-brand-tokens-2026-09-20.html',
    '/hoplight-brand-tokens-2026-09-20-manifest.json',
    '/shelf-options/:path*',
    '/mockups/:path*',
    '/tools-hub',
    '/tools-hub/:path*',
    '/visualizations',
    '/visualizations/:path*',
    '/whatshuman',
    '/whatshuman/:path*',
    '/pme',
    '/pme/:path*',
    '/research-books',
    '/research-books/:path*',
    '/board',
    '/board/:path*',
    '/daily',
    '/daily/:path*',
  ],
}
