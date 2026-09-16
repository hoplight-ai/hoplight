import { ImageResponse } from 'next/og';

// Per-route social preview cards. Site review, 2026-09-16 (expert-social-meta.md #5): every
// route inherited the same generic /og.png, so a LinkedIn/X share of /rayli or /research showed
// no mention of either. Usage: /api/og?title=Rayli&sub=A+communications+intelligence+platform
//
// Font: Inter, loaded at request time from Google Fonts (the same family next/font/google
// self-hosts for the rest of the site, but ImageResponse/Satori needs a raw font buffer, not a
// <link> tag). Text-subsetted to only the characters this request actually renders. If the fetch
// fails for any reason (offline build, Google Fonts unreachable), the card still renders with the
// system sans-serif fallback rather than 500ing — a card with the wrong font beats no card.

const NAVY = '#0F1B2D';
const GOLD = '#E8A820';
const PAPER = '#F7F5F0';

async function loadInter(text: string, weight: 400 | 700): Promise<ArrayBuffer | null> {
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') || 'Hoplight').slice(0, 80);
  const sub = (searchParams.get('sub') || 'AI strategy for labor, advocacy, and mission-driven organizations').slice(0, 160);

  const [bold, regular] = await Promise.all([
    loadInter(title, 700),
    loadInter(sub, 400),
  ]);

  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }[] = [];
  if (bold) fonts.push({ name: 'Inter', data: bold, weight: 700, style: 'normal' });
  if (regular) fonts.push({ name: 'Inter', data: regular, weight: 400, style: 'normal' });

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: NAVY,
          backgroundImage: `linear-gradient(135deg, ${NAVY} 0%, #16253d 100%)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '64px',
            height: '6px',
            backgroundColor: GOLD,
            marginBottom: '40px',
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: '72px',
            fontWeight: 700,
            color: PAPER,
            lineHeight: 1.1,
            fontFamily: fonts.length ? 'Inter' : 'sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: '32px',
            fontWeight: 400,
            color: GOLD,
            marginTop: '28px',
            lineHeight: 1.4,
            fontFamily: fonts.length ? 'Inter' : 'sans-serif',
            maxWidth: '980px',
          }}
        >
          {sub}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: '28px',
            fontWeight: 700,
            color: PAPER,
            marginTop: 'auto',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: 0.85,
          }}
        >
          Hoplight
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    },
  );
}
