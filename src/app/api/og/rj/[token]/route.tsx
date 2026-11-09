import { ImageResponse } from 'next/og';
import { createElement as h } from 'react';
import { bloomLockup } from '@/lib/brand/marks';
import { DIAL_COLOURS, SHARE_QUESTION, decodeShare, dialSvg, revengeWords, sideOf, verdictWord } from '@/lib/rj-share';

// /api/og/rj/<token>: the picture a Revenge or Justice share link shows when it is pasted anywhere (Whit,
// 2026-11-09: "combo say the article headline, the outleyts logo, the dial rating, and then just the tools
// summary ... and the quesitont o be called by this tool is 'Does this sound like revenge or justice?'").
// 1200 by 630 in the Hoplight frame the tool cards use (navy mat, white window, the bloom and the word in the
// foot): the question over the window, the dial with its score on the left, the outlet's icon and name, the
// article's headline, and the verdict with the reading's one line on the right. A token that was not signed
// by this site gets a 404, so nobody can draw a verdict Hoplight never gave.

export const runtime = 'nodejs';

const W = 1200, H = 630, EDGE = 28, FOOT = 108;
const WIN_W = W - EDGE * 2, WIN_H = H - EDGE - FOOT;
const MAT = '#0F1B2D';
const LOCKUP = bloomLockup({ height: FOOT, word: '#FFFFFF' });

type FontWeight = 400 | 600;

async function loadInter(weight: FontWeight, text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
    const m = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);
    if (!m) return null;
    const res = await fetch(m[1]);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

async function iconUri(host: string): Promise<string | null> {
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) return null;
  try {
    const res = await fetch('https://www.google.com/s2/favicons?sz=64&domain=' + encodeURIComponent(host), { signal: AbortSignal.timeout(4000) });
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !type.startsWith('image/')) return null;
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch {
    return null;
  }
}

function clip(s: string, n: number): string {
  s = s.replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s;
}

const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const p = decodeShare(token);
  if (!p) return new Response('No such reading', { status: 404, headers: { 'Content-Type': 'text/plain' } });

  const side = sideOf(p.s);
  const colour = side === 'revenge' ? DIAL_COLOURS.revenge : side === 'justice' ? DIAL_COLOURS.gold : DIAL_COLOURS.stone;
  const verdict = verdictWord(p.v);
  const headline = p.t ? clip(p.t, 96) : 'A pasted statement';
  const outlet = (p.o || p.h || '').toUpperCase();
  const summary = clip(revengeWords(p.l), 170);
  const dial = dialSvg(p.s, 340);

  const allText = SHARE_QUESTION + headline + outlet + verdict + summary + String(p.s) + 'RevengeJustice.hoplight.ai/revenge-or-justice';
  const [w400, w600, icon] = await Promise.all([loadInter(400, allText), loadInter(600, allText), p.h ? iconUri(p.h) : Promise.resolve(null)]);
  const fonts: { name: string; data: ArrayBuffer; weight: FontWeight; style: 'normal' }[] = [];
  if (w400) fonts.push({ name: 'Inter', data: w400, weight: 400, style: 'normal' });
  if (w600) fonts.push({ name: 'Inter', data: w600, weight: 600, style: 'normal' });

  const PAD = 52;
  const dialCol = h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: `${dial.width}px`, flexShrink: 0 } },
    h('img', { src: svgUri(dial.svg), width: dial.width, height: dial.height }),
    h(
      'div',
      { style: { display: 'flex', width: `${dial.width}px`, justifyContent: 'space-between', marginTop: '-8px', fontSize: '18px', fontWeight: 600 } },
      h('span', { style: { color: DIAL_COLOURS.revenge } }, 'Revenge'),
      h('span', { style: { color: DIAL_COLOURS.gold } }, 'Justice'),
    ),
    h('div', { style: { display: 'flex', marginTop: '-30px', fontSize: '76px', fontWeight: 600, color: colour, lineHeight: 1 } }, String(p.s)),
  );

  // The words column has a fixed width (the window's inner width less the dial and the gap), because the card
  // renderer wraps text only inside a box of known width.
  const WORDS_W = WIN_W - PAD * 2 - dial.width - 44;
  const words = h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', width: `${WORDS_W}px`, marginLeft: '44px' } },
    outlet
      ? h(
          'div',
          { style: { display: 'flex', alignItems: 'center', fontSize: '20px', fontWeight: 600, letterSpacing: '0.08em', color: MAT } },
          icon ? h('img', { src: icon, width: 34, height: 34, style: { borderRadius: '6px', marginRight: '12px' } }) : null,
          outlet,
        )
      : null,
    h('div', { style: { display: 'flex', width: `${WORDS_W}px`, marginTop: '12px', fontSize: '38px', fontWeight: 600, lineHeight: 1.14, letterSpacing: '-0.015em', color: MAT } }, headline),
    h('div', { style: { display: 'flex', marginTop: '20px' } },
      h('span', { style: { display: 'flex', fontSize: '24px', fontWeight: 600, lineHeight: 1.4, color: '#FFFFFF', backgroundColor: side === 'mixed' ? MAT : colour, padding: '0 10px', borderRadius: '5px' } }, verdict + '.'),
    ),
    h('div', { style: { display: 'flex', width: `${WORDS_W}px`, marginTop: '8px', fontSize: '24px', lineHeight: 1.36, color: '#2A3F5F' } }, summary),
  );

  const windowBox = h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', position: 'absolute', left: `${EDGE}px`, top: `${EDGE}px`, width: `${WIN_W}px`, height: `${WIN_H}px`, borderRadius: '8px', backgroundColor: '#FFFFFF', padding: `40px ${PAD}px 0 ${PAD}px` } },
    h('div', { style: { display: 'flex', fontSize: '30px', fontWeight: 600, letterSpacing: '-0.01em', color: DIAL_COLOURS.gold } }, SHARE_QUESTION),
    h('div', { style: { display: 'flex', alignItems: 'center', marginTop: '26px' } }, dialCol, words),
  );

  return new ImageResponse(
    h(
      'div',
      { style: { display: 'flex', position: 'relative', width: `${W}px`, height: `${H}px`, backgroundColor: MAT, fontFamily: 'Inter' } },
      windowBox,
      h('img', { src: svgUri(LOCKUP.svg), width: LOCKUP.width, height: LOCKUP.height, style: { position: 'absolute', left: `${EDGE + 68}px`, top: `${H - FOOT}px` } }),
      h('div', { style: { display: 'flex', position: 'absolute', right: `${EDGE + 68}px`, top: `${H - FOOT}px`, height: `${FOOT}px`, alignItems: 'center', fontSize: '24px', fontWeight: 600, color: '#C9D3E0' } }, 'hoplight.ai/revenge-or-justice'),
    ),
    {
      width: W,
      height: H,
      fonts,
      // A signed reading never changes, so its card can be kept a long time.
      headers: { 'Cache-Control': 'public, max-age=604800, s-maxage=31536000, immutable' },
    },
  );
}
