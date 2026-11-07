// The sign-in page's form posts here: one password in, the year-long qt_access cookie out. The proxy
// (src/proxy.ts) does not gate this route; grantFromForm() checks the password itself, as digests,
// before it sets anything, and answers 503 when the site has no password configured.
// Env vars, names only: PRIVATE_SITE_USER, PRIVATE_SITE_PASSWORD (the pair quick-tools reads).
//
// Security check SITESEC1, 2026-11-07: this route was an unthrottled oracle for the one password that
// opens every private page here, on quick-tools and on Gut Check. Twenty tries per address per fifteen
// minutes, soft and per instance like every limiter in src/lib/rate-limit.ts; the hard limit is a
// Vercel Firewall rate-limit rule on /api/grant, Whit's to set. Generous on purpose: a mistyped
// password twenty times in a quarter hour is not how Whit signs in, and the window passes on its own.

import { grantFromForm } from '../../../lib/grant-from-form.mjs'
import { COOKIE_NAME, QT_ACCESS_SALT } from '../../../lib/gate.ts'
import { checkLimitIn, clientIp } from '../../../lib/rate-limit.ts'

export const dynamic = 'force-dynamic'

// Not exported: a route file may only export its handlers and Next's own config names.
const GRANT_LIMIT = { max: 20, windowMs: 15 * 60 * 1000 }

export async function POST(request: Request) {
  if (!checkLimitIn('grant-ip', clientIp(request), GRANT_LIMIT.max, GRANT_LIMIT.windowMs)) {
    return new Response('Too many sign-in attempts from your address. Wait fifteen minutes and try again.', {
      status: 429,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '900' },
    })
  }
  return grantFromForm(request, {
    user: process.env.PRIVATE_SITE_USER,
    pass: process.env.PRIVATE_SITE_PASSWORD,
    salt: QT_ACCESS_SALT,
    cookieName: COOKIE_NAME,
  })
}
