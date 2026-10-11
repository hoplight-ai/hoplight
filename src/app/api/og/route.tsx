import { ImageResponse } from 'next/og';
import { CARD_H, CARD_W, ogCard } from '@/lib/brand/og-card';

// Per-route social preview cards. Site review, 2026-09-16 (expert-social-meta.md #5): every
// route inherited the same generic /og.png, so a LinkedIn/X share of /rayli or /research showed
// no mention of either. Usage: /api/og?title=Rayli&sub=A+communications+intelligence+platform
// The card itself is drawn by src/lib/brand/og-card.ts, on the Hoplight Design System.
//
// Font: Inter 400 and 600, loaded at request time from Google Fonts (the same family next/font/google
// self-hosts for the rest of the site, but ImageResponse/Satori needs a raw font buffer, not a
// <link> tag). Text-subsetted to only the characters this request actually renders. If the fetch
// fails for any reason (offline build, Google Fonts unreachable), the card still renders with the
// system sans-serif fallback rather than failing: a card with the wrong font beats no card.

async function loadInter(text: string, weight: 400 | 600): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
    const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);
    if (!match) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

// OG-CLAMP-START
// Security clamp (GHSA-vcvr-r3jv-pc5j, 2026-10-06). ?title= and ?sub= are attacker-controlled and
// end up in the SVG that ImageResponse renders. Drop <, >, double quotes, control and invisible
// formatting characters and lone surrogates, collapse whitespace, then cap the length. Ordinary
// text passes through unchanged. scripts/og-route.test.mjs evaluates this block as written, so keep
// it plain TypeScript with no imports.
const TITLE_MAX = 120;
const SUB_MAX = 160;

function clampText(value: string | null, fallback: string, max: number): string {
  let out = '';
  let lastWasSpace = false;
  for (const ch of value ?? '') {
    const c = ch.codePointAt(0) ?? 0;
    if (ch === '<' || ch === '>' || ch === '"') continue;
    const isSpace = c === 32 || c === 9 || c === 10 || c === 13;
    if (isSpace) {
      if (!lastWasSpace && out.length > 0) out += ' ';
      lastWasSpace = true;
      continue;
    }
    if (
      c < 32 ||
      (c >= 127 && c <= 159) ||
      (c >= 0xd800 && c <= 0xdfff) ||
      c === 0x2028 ||
      c === 0x2029 ||
      (c >= 0x200b && c <= 0x200f) ||
      (c >= 0x202a && c <= 0x202e) ||
      (c >= 0x2066 && c <= 0x2069) ||
      c === 0xfeff
    ) {
      continue;
    }
    out += ch;
    lastWasSpace = false;
  }
  const clamped = Array.from(out.trim()).slice(0, max).join('').trim();
  return clamped || fallback;
}
// OG-CLAMP-END

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = clampText(searchParams.get('title'), 'Hoplight', TITLE_MAX);
  const sub = clampText(
    searchParams.get('sub'),
    'AI strategy for labor, advocacy, and mission-driven organizations',
    SUB_MAX,
  );

  const [semibold, regular] = await Promise.all([loadInter(title, 600), loadInter(sub, 400)]);
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 600; style: 'normal' }[] = [];
  if (semibold) fonts.push({ name: 'Inter', data: semibold, weight: 600, style: 'normal' });
  if (regular) fonts.push({ name: 'Inter', data: regular, weight: 400, style: 'normal' });

  return new ImageResponse(ogCard(title, sub, fonts.length > 0), { width: CARD_W, height: CARD_H, fonts });
}
