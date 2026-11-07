// Which links the Revenge or Justice forwarder will pass upstream. The grader on quick-tools fetches
// whatever address it is handed (api/justice-or-retribution.js, fetchUrlText: a protocol check and
// nothing else, redirects followed), so this site refuses, before forwarding, any link that points
// at a private network, a loopback or link-local address, a cloud metadata host, or a bare machine
// name. Security check SITESEC1, 2026-11-07 (docs/security/revenge-or-justice-2026-11-07.md).
//
// This is a first wall, not the whole fix: a public name that resolves to a private address, or a
// public page that redirects to one, passes here and must be stopped where the fetch happens. The
// upstream fix is written in the same report.

const BLOCKED_HOSTS = new Set(['localhost', 'localhost.localdomain', 'metadata.google.internal', 'metadata']);
const BLOCKED_SUFFIXES = ['.localhost', '.local', '.internal', '.arpa', '.home', '.lan', '.corp', '.intranet'];

function ipv4Private(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if (m.slice(1).some((n) => Number(n) > 255)) return true;
  return (
    a === 0 || // this network
    a === 10 || // private
    a === 127 || // loopback
    (a === 169 && b === 254) || // link-local, cloud metadata
    (a === 172 && b >= 16 && b <= 31) || // private
    (a === 192 && b === 168) || // private
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    a >= 224 // multicast and reserved
  );
}

function ipv6Private(host: string): boolean {
  const x = host.replace(/^\[|\]$/g, '').toLowerCase();
  if (x === '::' || x === '::1') return true;
  if (/^fe[89ab]/.test(x)) return true; // link-local fe80::/10
  if (/^f[cd]/.test(x)) return true; // unique local fc00::/7
  if (x.startsWith('ff')) return true; // multicast
  const dotted = x.match(/^(?:::ffff:|::)(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) return ipv4Private(dotted[1]);
  const hex = x.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const n = (parseInt(hex[1], 16) << 16) | parseInt(hex[2], 16);
    return ipv4Private([n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.'));
  }
  return false;
}

export type SafeUrl = { ok: true; url: string } | { ok: false; reason: string };

/** The link as the forwarder may send it, or the reason it is refused. Pure. */
export function publicHttpUrl(raw: string): SafeUrl {
  let u: URL;
  try {
    u = new URL(String(raw).trim());
  } catch {
    return { ok: false, reason: 'that is not a link' };
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return { ok: false, reason: 'only http and https links' };
  if (u.username || u.password) return { ok: false, reason: 'a link with a sign-in in it is not read' };
  const host = u.hostname.toLowerCase();
  if (!host) return { ok: false, reason: 'that is not a link' };
  const refused = { ok: false as const, reason: 'that link points somewhere this reader does not go' };
  if (BLOCKED_HOSTS.has(host)) return refused;
  if (BLOCKED_SUFFIXES.some((s) => host.endsWith(s))) return refused;
  if (host.startsWith('[') || host.includes(':')) return ipv6Private(host) ? refused : { ok: true, url: u.toString() };
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return ipv4Private(host) ? refused : { ok: true, url: u.toString() };
  if (!host.includes('.')) return refused; // a bare machine name on some network, never a public site
  return { ok: true, url: u.toString() };
}

/** What the upstream grader treats as a link when it arrives in the text field. */
export const LOOKS_LIKE_LINK = /^https?:\/\/\S+$/;
