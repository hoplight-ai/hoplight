// Revenge or Justice share links (Whit, 2026-11-09: "we need social sharing ... the graphic showing the eval
// of the quotes, a link to the article included, and a very quick summary of whay this tool does and what the
// grade was for this situaiton ... combo say the article headline, the outleyts logo, the dial rating, and then
// just the tools summary ... and the quesitont o be called by this tool is 'Does this sound like revenge or
// justice?'").
//
// Readings are not stored anywhere, so a share link carries its own reading: the article's address, title,
// outlet and host, the score, the verdict, the one-line summary and whose words were read, packed and signed.
// Only the grader route mints a link (from a reading the grader itself returned), and the share page and its
// card refuse any link whose signature does not match, so nobody can put words in Hoplight's mouth by editing
// a URL. The key is derived from the site's own sign-in password, so no new secret is needed; with no
// password set (a preview build) no link is minted and the share button stays hidden.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { deflateRawSync, inflateRawSync } from 'node:zlib';

export const SHARE_QUESTION = 'Does this sound like revenge or justice?';
export const SHARE_ORIGIN = 'https://hoplight.ai';

export type Verdict = 'justice' | 'mixed' | 'retribution';

export interface SharePayload {
  /** The article's address, when a link was read. */
  u?: string;
  /** The article's headline. */
  t?: string;
  /** The outlet's name. */
  o?: string;
  /** The outlet's host, for its icon. */
  h?: string;
  /** The score, 0 revenge to 100 justice. */
  s: number;
  v: Verdict;
  /** The reading's one-line summary. */
  l: string;
  /** Whose words were read: "The whole text", "Jamie Raskin's own words". */
  w?: string;
  /** The day it was read, YYYY-MM-DD. */
  d: string;
}

function key(): Buffer | null {
  const p = process.env.PRIVATE_SITE_PASSWORD;
  if (!p) return null;
  return createHmac('sha256', 'revenge-or-justice-share-v1').update(p).digest();
}

const b64u = (b: Buffer) => b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s: string) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

export function shareEnabled(): boolean {
  return key() !== null;
}

function clip(s: unknown, n: number): string {
  return String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
}

/** Pack and sign a reading. Null when the site has no key. */
export function encodeShare(p: SharePayload): string | null {
  const k = key();
  if (!k) return null;
  const body: SharePayload = {
    ...(p.u ? { u: clip(p.u, 600) } : {}),
    ...(p.t ? { t: clip(p.t, 240) } : {}),
    ...(p.o ? { o: clip(p.o, 80) } : {}),
    ...(p.h ? { h: clip(p.h, 100) } : {}),
    s: Math.max(0, Math.min(100, Math.round(Number(p.s) || 0))),
    v: p.v,
    l: clip(p.l, 400),
    ...(p.w ? { w: clip(p.w, 120) } : {}),
    d: clip(p.d, 10),
  };
  const packed = deflateRawSync(Buffer.from(JSON.stringify(body), 'utf8'));
  const mac = createHmac('sha256', k).update(packed).digest().subarray(0, 16);
  return b64u(packed) + '.' + b64u(mac);
}

/** Verify and unpack a share link's token. Null for anything that was not minted here, or was changed since. */
export function decodeShare(token: string): SharePayload | null {
  const k = key();
  if (!k || typeof token !== 'string' || token.length > 3000) return null;
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  try {
    const packed = unb64u(data);
    const want = createHmac('sha256', k).update(packed).digest().subarray(0, 16);
    const got = unb64u(sig);
    if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
    const p = JSON.parse(inflateRawSync(packed).toString('utf8')) as SharePayload;
    if (!['justice', 'mixed', 'retribution'].includes(p.v) || typeof p.l !== 'string' || typeof p.s !== 'number') return null;
    if (p.u && !/^https?:\/\//i.test(p.u)) return null;
    return p;
  } catch {
    return null;
  }
}

export function shareUrl(token: string): string {
  return `${SHARE_ORIGIN}/revenge-or-justice/r/${token}`;
}

/** The verdict as the page says it: revenge, never the API's "retribution". */
export function verdictWord(v: Verdict): string {
  return v === 'mixed' ? 'Mixed' : v === 'retribution' ? 'Leans revenge' : 'Leans justice';
}

/** The summary in the page's words: the model's "retribution" is shown as "revenge". */
export function revengeWords(s: string): string {
  return String(s || '').replace(/\bRetribution\b/g, 'Revenge').replace(/\bretribution\b/g, 'revenge');
}

export function sideOf(s: number): 'revenge' | 'mixed' | 'justice' {
  return s >= 62 ? 'justice' : s <= 38 ? 'revenge' : 'mixed';
}

export const DIAL_COLOURS = { revenge: '#9c3327', mixed: '#CFCAC0', justice: '#D4950A', ink: '#0F1B2D', stone: '#575752', gold: '#996D00' };

/**
 * The dial's arc and needle as an SVG string with no text in it (the card draws the number and the end words
 * as its own type, since the card renderer draws an SVG image without fonts). The same drawing as the page's
 * dial in tool.js: three bands at 38 and 62, the band the score falls in drawn full, the needle at the score.
 */
export function dialSvg(score: number, width = 360): { svg: string; width: number; height: number; cx: number; cy: number; r: number } {
  const W = width;
  const r = Math.round(W * 0.393);
  const sw = Math.round(W * 0.087);
  const cx = W / 2;
  const cy = r + sw / 2 + 4;
  const H = Math.round(cy + 16);
  const pt = (rad: number, v: number) => { const a = Math.PI - (v / 100) * Math.PI; return [cx + rad * Math.cos(a), cy - rad * Math.sin(a)]; };
  const arc = (a: number, b: number) => { const p = pt(r, a), q = pt(r, b); return `M${p[0].toFixed(2)} ${p[1].toFixed(2)} A${r} ${r} 0 0 1 ${q[0].toFixed(2)} ${q[1].toFixed(2)}`; };
  const side = sideOf(score);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  ([[0, 38, 'revenge'], [38, 62, 'mixed'], [62, 100, 'justice']] as const).forEach(([a, b, k]) => {
    s += `<path d="${arc(a + (a ? 1.2 : 0), b - (b < 100 ? 1.2 : 0))}" fill="none" stroke="${DIAL_COLOURS[k]}" stroke-width="${sw}" stroke-opacity="${side === k ? 1 : 0.6}"/>`;
  });
  [0, 25, 50, 75, 100].forEach((t) => { const a = pt(r + sw / 2 + 4, t), b = pt(r + sw / 2 + 11, t); s += `<line x1="${a[0].toFixed(2)}" y1="${a[1].toFixed(2)}" x2="${b[0].toFixed(2)}" y2="${b[1].toFixed(2)}" stroke="${DIAL_COLOURS.stone}" stroke-width="2"/>`; });
  const tip = pt(r - sw / 2 - 8, score);
  const ang = Math.PI - (score / 100) * Math.PI;
  const hw = Math.max(6, Math.round(W * 0.025));
  const l = [cx + hw * Math.cos(ang + Math.PI / 2), cy - hw * Math.sin(ang + Math.PI / 2)];
  const rr = [cx + hw * Math.cos(ang - Math.PI / 2), cy - hw * Math.sin(ang - Math.PI / 2)];
  s += `<path d="M${l[0].toFixed(2)} ${l[1].toFixed(2)} L${tip[0].toFixed(2)} ${tip[1].toFixed(2)} L${rr[0].toFixed(2)} ${rr[1].toFixed(2)} Z" fill="${DIAL_COLOURS.ink}"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${Math.round(W * 0.04)}" fill="${DIAL_COLOURS.ink}"/><circle cx="${cx}" cy="${cy}" r="${Math.round(W * 0.014)}" fill="#fff"/>`;
  return { svg: s + '</svg>', width: W, height: H, cx, cy, r };
}
