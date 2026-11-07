import { ImageResponse } from 'next/og';
import { TOOL_BY_SLUG } from '@/data/tools';
import { CARD_H, CARD_W, PORTFOLIO_CARD, cardText, toolCard } from '@/lib/brand/tool-card';

// A tool's own link-preview card, 1200 by 630: its name and look as the main field, the Hoplight band
// below. /api/og/tool/<slug> for any slug in src/data/tools.ts, plus /api/og/tool/portfolio for the
// portfolio page. ?band=0 drops the band (the portfolio page uses it as a thumbnail, where the page
// itself is already Hoplight's). Tools on their own Vercel projects (Gut Check, Rumi Español, Letters)
// point their og:image here by absolute URL.
//
// Fonts are fetched when the card is drawn, from Google Fonts, cut to the characters this card
// prints, the same way /api/og loads Inter. A failed fetch draws the card in the renderer's default
// sans rather than failing: a card in the wrong face beats no card.

async function loadGoogleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
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

type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = slug === 'portfolio' ? PORTFOLIO_CARD : TOOL_BY_SLUG[slug];
  if (!tool) return new Response('No such tool', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  const band = new URL(req.url).searchParams.get('band') !== '0';

  const text = cardText(tool.brand);
  const d = tool.brand.display;
  const [display, body] = await Promise.all([
    loadGoogleFont(d.family, d.weight, text.display),
    band ? loadGoogleFont('Inter', 400, text.body) : Promise.resolve(null),
  ]);
  const fonts: { name: string; data: ArrayBuffer; weight: FontWeight; style: 'normal' }[] = [];
  if (display) fonts.push({ name: d.family, data: display, weight: d.weight as FontWeight, style: 'normal' });
  if (body) fonts.push({ name: 'Inter', data: body, weight: 400, style: 'normal' });

  return new ImageResponse(
    toolCard(tool, { display: display ? d.family : null, body: body ? 'Inter' : null }, { band }),
    {
      width: CARD_W,
      height: CARD_H,
      fonts,
      // A day in caches, a week stale: a card changes only when a tool's look does.
      headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
    },
  );
}
