// The sign-in page's form posts here: one password in, the year-long qt_access cookie out. The proxy
// (src/proxy.ts) does not gate this route; grantFromForm() checks the password itself, as digests,
// before it sets anything, and answers 503 when the site has no password configured.
// Env vars, names only: PRIVATE_SITE_USER, PRIVATE_SITE_PASSWORD (the pair quick-tools reads).

import { grantFromForm } from '../../../lib/grant-from-form.mjs'
import { COOKIE_NAME, QT_ACCESS_SALT } from '../../../lib/gate.ts'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return grantFromForm(request, {
    user: process.env.PRIVATE_SITE_USER,
    pass: process.env.PRIVATE_SITE_PASSWORD,
    salt: QT_ACCESS_SALT,
    cookieName: COOKIE_NAME,
  })
}
