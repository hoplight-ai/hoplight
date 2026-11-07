// THE GATE: which paths on hoplight.ai sit behind the one-password sign-in, and how a request proves
// it holds the password. Whit, 2026-10-19: "5 yes", hidden pages go behind the existing one-password
// sign-in, not merely unlinked. The mechanism is quick-tools' (middleware.js, Ops LOGIN1 and ACCESS2):
//
//   1. Basic Auth with the pair, for scripts and proofs, OR
//   2. the year-long `qt_access` cookie, whose value is sha256(user:pass:salt) with the salt below.
//
// Env vars, names only (never a value in a file): PRIVATE_SITE_USER and PRIVATE_SITE_PASSWORD, the
// same two quick-tools reads. The same pair and the same salt make the same cookie value, so the one
// password opens every site that uses them. FAILS CLOSED: when either variable is missing no
// credential can match, so every gated path stays shut and the build is unaffected.

export const QT_ACCESS_SALT = 'qt-access-grant-v1' // byte for byte the salt quick-tools uses
export const COOKIE_NAME = 'qt_access'

// The seven tools that live on vercel.app addresses and answer under hoplight.ai paths (Whit,
// 2026-10-19: "4 yes"). Each one is a 307 to its address, issued by src/proxy.ts AFTER the gate:
// a redirect in next.config.ts would run before the proxy and skip the sign-in. A trial rewrite on a
// local build returned 200 for every page and 404 for the asset each page names (all seven name
// their files from the root), so a rewrite was not an option.
export const MOVED_TOOLS: { name: string; target: string }[] = [
  { name: 'tools-hub', target: 'https://quick-tools-pi.vercel.app' }, // quick-tools
  { name: 'visualizations', target: 'https://visualizations-eta.vercel.app' },
  { name: 'whatshuman', target: 'https://whatshuman.vercel.app' },
  { name: 'pme', target: 'https://pme-mvp-clean.vercel.app' }, // pme-mvp
  { name: 'research-books', target: 'https://research-books-strategist.vercel.app' },
  { name: 'board', target: 'https://the-board-red-seven.vercel.app' }, // the-board
  { name: 'daily', target: 'https://podcast-knowledge-engine.vercel.app' }, // podcast-knowledge-engine
]

// A path is gated when it equals one of these.
const GATED_EXACT = [
  '/hoplight-rct-research-brief.pdf',
  '/pme-lever.html',
  '/pme-lever-manifest.json', // the manifest of the gated pme-lever page
  '/hoplight-brand-tokens-2026-09-20.html',
  '/hoplight-brand-tokens-2026-09-20-manifest.json', // the manifest of the gated tokens page
]

// A path is gated when it equals one of these or sits under it. /tools/which-ai is a public product
// and /tools is not here on purpose.
const GATED_PREFIXES = [
  '/persuasion',
  '/research',
  '/portfolio',
  '/rayli',
  '/shelf-options',
  '/mockups',
  ...MOVED_TOOLS.map((t) => `/${t.name}`),
]

// Collapse repeated slashes, drop a trailing slash, decode percent escapes and lowercase, so one
// address written four ways is one address. Gating a spelling that does not exist is harmless;
// leaving a spelling open is the failure.
export function normalizePath(pathname: string): string {
  let p = pathname
  try {
    p = decodeURIComponent(p)
  } catch {
    // keep the raw path; an undecodable path is compared as written
  }
  p = p.replace(/\/{2,}/g, '/').toLowerCase()
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p || '/'
}

export function isGated(pathname: string): boolean {
  const p = normalizePath(pathname)
  if (GATED_EXACT.includes(p)) return true
  return GATED_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))
}

/** The vercel.app address a moved-tool path forwards to, or null when the path is not one of them. */
export function movedToolTarget(pathname: string, search = ''): string | null {
  const p = normalizePath(pathname)
  for (const { name, target } of MOVED_TOOLS) {
    const base = `/${name}`
    if (p === base) return `${target}/${search}`
    if (p.startsWith(`${base}/`)) return `${target}${p.slice(base.length)}${search}`
  }
  return null
}

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

export async function accessToken(user: string, pass: string): Promise<string> {
  const bytes = await sha256(`${user}:${pass}:${QT_ACCESS_SALT}`)
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

type Env = Record<string, string | undefined> // reads PRIVATE_SITE_USER and PRIVATE_SITE_PASSWORD

/** Does this request carry the Basic pair or the qt_access cookie? Missing env means no, always. */
export async function hasAccess(request: Request, env: Env): Promise<boolean> {
  const user = env.PRIVATE_SITE_USER
  const pass = env.PRIVATE_SITE_PASSWORD
  if (!user || !pass) return false

  const header = request.headers.get('authorization') || ''
  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6))
      const sep = decoded.indexOf(':')
      if (sep >= 0) {
        const okUser = await sameText(decoded.slice(0, sep), user)
        const okPass = await sameText(decoded.slice(sep + 1), pass)
        if (okUser && okPass) return true
      }
    } catch {
      // malformed header: fall through to the cookie, then to refusal
    }
  }

  const match = (request.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([a-f0-9]{64})`))
  if (match && (await sameText(match[1], await accessToken(user, pass)))) return true

  return false
}
