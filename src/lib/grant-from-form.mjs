// THE FORM'S HALF OF THE DOOR: one password in, the year-long cookie out.
//
// A read-only copy of quick-tools/lib/grant-from-form.mjs (Ops LOGIN1, 2026-09-26), lifted into this
// repo on 2026-10-19 (Whit: "5 yes"). The sign-in page (sign-in-page.mjs) posts here through the
// site's grant route (src/app/api/grant/route.ts):
//   POST, application/x-www-form-urlencoded, fields `password` and `next`.
// On the right password: the same cookie quick-tools mints, and a 303 to `next`.
// On anything else: the sign-in page again with "That password did not match.", a 200, and no
// cookie. The browser's own box is never raised by this route.
//
// It reads no env var itself, so a site that forgets to pass the pair fails closed with a 503
// rather than minting a cookie for an empty password.
//
// The cookie is sha256(user:pass:salt), so the username still matters to the TOKEN even though
// nobody types it: the pair the site already holds is the one secret, and rotating it revokes
// every cookie at once. Same pair and same salt as quick-tools means the same token, which is why
// one password works on every site.

import { signInPage, safeNext } from './sign-in-page.mjs';

const YEAR = 60 * 60 * 24 * 365;

async function sha256(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return new Uint8Array(digest);
}

function hex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Constant time over two equal-length digests: every byte is visited whatever the first
// difference is, so the answer's timing says nothing about how much of the password was right.
function sameDigest(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * @param {Request} request  the form POST
 * @param {{user?: string, pass?: string, salt?: string, cookieName?: string, maxAge?: number, page?: object}} opts
 *   page: extra options for signInPage() (title, line) so a site keeps its own words.
 * @returns {Promise<Response>}
 */
export async function grantFromForm(request, { user, pass, salt, cookieName = 'qt_access', maxAge = YEAR, page = {} } = {}) {
  if (!user || !pass || !salt) {
    return new Response('This site has no password configured, so nobody can sign in.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  let form;
  try {
    form = new URLSearchParams(await request.text());
  } catch {
    form = new URLSearchParams();
  }
  const offered = form.get('password') || '';
  const next = safeNext(form.get('next'));

  const match = sameDigest(await sha256(offered), await sha256(pass));
  if (!match) {
    return new Response(signInPage({ ...page, next, wrong: true }), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
    });
  }

  const token = hex(await sha256(`${user}:${pass}:${salt}`));
  return new Response(null, {
    status: 303,
    headers: {
      Location: next,
      'Set-Cookie': `${cookieName}=${token}; Max-Age=${maxAge}; Path=/; Secure; HttpOnly; SameSite=Lax`,
      'Cache-Control': 'no-store',
    },
  });
}
