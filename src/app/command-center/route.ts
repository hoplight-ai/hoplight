// /command-center: the chief-of-staff Command Center prototype behind its own password (Whit,
// 2026-10-23: "give it a password"). GET serves the page to a request that holds the password
// (src/lib/command-center.ts) and the sign-in page to a browser that does not; POST is the sign-in
// form's half of the door. The HTML lives under src/private/, never public/, so the only way to it
// is through this handler. Not in the sitemap; every answer says noindex.

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { grantFromForm } from '../../lib/grant-from-form.mjs'
import { isPageRequest, signInResponse } from '../../lib/sign-in-page.mjs'
import { COOKIE_NAME, MAX_AGE, PATH, SALT, USER, hasAccess } from '../../lib/command-center.ts'

export const dynamic = 'force-dynamic'

const PAGE = {
  title: 'Command Center',
  line: 'A prototype of a chief-of-staff desk, built by Whit Pendergast. Sign in with the password you were given.',
  action: PATH,
}

let cached: string | null = null
function page(): string {
  if (cached === null) cached = readFileSync(path.join(process.cwd(), 'src/private/command-center.html'), 'utf8')
  return cached
}

export async function GET(request: Request) {
  if (await hasAccess(request, process.env)) {
    return new Response(page(), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex',
      },
    })
  }

  if (isPageRequest(request)) return signInResponse({ ...PAGE, next: PATH })

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Command Center", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  })
}

export const HEAD = GET

export async function POST(request: Request) {
  // The form's `next` is ignored on purpose: a cookie for this door only ever lands on this page.
  const form = new URLSearchParams(await request.text())
  form.set('next', PATH)
  const replay = new Request(request.url, { method: 'POST', headers: request.headers, body: form.toString() })
  return grantFromForm(replay, {
    user: USER,
    pass: process.env.COMMAND_CENTER_PASSWORD,
    salt: SALT,
    cookieName: COOKIE_NAME,
    maxAge: MAX_AGE,
    page: PAGE,
  })
}
