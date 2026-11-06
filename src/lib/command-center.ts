// THE COMMAND CENTER'S OWN DOOR. Whit, 2026-10-23: "give it a password". The chief-of-staff
// Command Center prototype (src/private/command-center.html, built July 2026 in the SEIU AI
// project) answers at /command-center behind a password of its own, separate from the site-wide
// sign-in, so a link to it can go to one person without opening anything else.
//
// How a request proves it holds the password:
//   1. Basic Auth with any user name and the password, for scripts and proofs, OR
//   2. the thirty-day `cc_access` cookie, whose value is sha256(user:pass:salt) with the salt below.
//
// Env var, name only (never a value in a file): COMMAND_CENTER_PASSWORD. FAILS CLOSED: when it is
// missing no credential can match, so the page stays shut and the build is unaffected. Changing
// the password revokes every cookie at once, because the cookie is a digest of it.

export const COOKIE_NAME = 'cc_access'
export const SALT = 'command-center-v1'
export const USER = 'command-center' // nobody types it; it only salts the cookie
export const PATH = '/command-center'
export const MAX_AGE = 60 * 60 * 24 * 30

async function sha256(text: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return new Uint8Array(digest)
}

// Constant time over two digests, so the answer's timing says nothing about how much matched.
async function sameText(a: string, b: string): Promise<boolean> {
  const [da, db] = await Promise.all([sha256(a), sha256(b)])
  let diff = 0
  for (let i = 0; i < da.length; i += 1) diff |= da[i] ^ db[i]
  return diff === 0
}

export async function accessToken(pass: string): Promise<string> {
  const bytes = await sha256(`${USER}:${pass}:${SALT}`)
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

type Env = Record<string, string | undefined> // reads COMMAND_CENTER_PASSWORD

/** Does this request carry the password (Basic) or the cc_access cookie? Missing env means no, always. */
export async function hasAccess(request: Request, env: Env): Promise<boolean> {
  const pass = env.COMMAND_CENTER_PASSWORD
  if (!pass) return false

  const header = request.headers.get('authorization') || ''
  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6))
      const sep = decoded.indexOf(':')
      if (sep >= 0 && (await sameText(decoded.slice(sep + 1), pass))) return true
    } catch {
      // malformed header: fall through to the cookie, then to refusal
    }
  }

  const match = (request.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([a-f0-9]{64})`))
  if (match && (await sameText(match[1], await accessToken(pass)))) return true

  return false
}
