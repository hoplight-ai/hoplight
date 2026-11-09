import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/metadata';
import { DIAL_COLOURS, SHARE_ORIGIN, SHARE_QUESTION, decodeShare, dialSvg, revengeWords, sideOf, verdictWord } from '@/lib/rj-share';
import './share.css';

// /revenge-or-justice/r/<token>: where a shared reading lands (Whit, 2026-11-09: "we need social sharing ...
// the graphic showing the eval of the quotes, a link to the article included, and a very quick summary of whay
// this tool does and what the grade was for this situaiton"). The token is the reading itself, signed by this
// site (src/lib/rj-share.ts); one that was not signed here is a 404. Its preview card is /api/og/rj/<token>.

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params;
  const p = decodeShare(token);
  if (!p) return { title: 'Revenge or Justice', robots: { index: false } };
  const about = p.t ? (p.o ? `${p.o}: ` : '') + p.t : 'A pasted statement';
  const ogTitle = `${verdictWord(p.v)}, ${p.s} of 100. ${about}`.slice(0, 160);
  return {
    ...pageMetadata({
      title: `${verdictWord(p.v)}: ${p.t || 'a pasted statement'}`.slice(0, 120),
      description: `${SHARE_QUESTION} ${revengeWords(p.l)}`.slice(0, 300),
      path: `/revenge-or-justice/r/${token}`,
      ogTitle,
      ogDescription: `${SHARE_QUESTION} ${revengeWords(p.l)}`.slice(0, 300),
      image: { url: `${SHARE_ORIGIN}/api/og/rj/${token}`, width: 1200, height: 630, alt: `${verdictWord(p.v)}, ${p.s} of 100 toward justice` },
    }),
    // Shared readings are for people, not search engines.
    robots: { index: false, follow: true },
  };
}

export default async function SharedReading({ params }: Params) {
  const { token } = await params;
  const p = decodeShare(token);
  if (!p) notFound();
  const side = sideOf(p.s);
  const colour = side === 'revenge' ? DIAL_COLOURS.revenge : side === 'justice' ? DIAL_COLOURS.gold : DIAL_COLOURS.stone;
  const dial = dialSvg(p.s, 320);
  const readHref = p.u ? `/revenge-or-justice?u=${encodeURIComponent(p.u)}` : '/revenge-or-justice';
  const when = p.d ? new Date(p.d + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  return (
    <main className="rjs">
      <div className="rjs-wrap">
        <p className="rjs-q">{SHARE_QUESTION}</p>
        <div className="rjs-card">
          <div className="rjs-dial">
            <span dangerouslySetInnerHTML={{ __html: dial.svg }} />
            <div className="rjs-ends"><span className="r">Revenge</span><span className="j">Justice</span></div>
            <div className="rjs-score" style={{ color: colour }}>{p.s}</div>
          </div>
          <div className="rjs-words">
            {p.o || p.h ? (
              <div className="rjs-outlet">
                {p.h ? <img src={`/api/revenge-or-justice/logo?host=${encodeURIComponent(p.h)}`} alt="" width={28} height={28} /> : null}
                <span>{p.o || p.h}</span>
              </div>
            ) : null}
            {p.u ? (
              <a className="rjs-hl" href={p.u} target="_blank" rel="noopener noreferrer">{p.t || p.u}</a>
            ) : (
              <p className="rjs-hl">A pasted statement</p>
            )}
            <p className="rjs-claim">
              <b className={`rjs-v ${side}`}>{verdictWord(p.v)}.</b> {revengeWords(p.l)}
            </p>
            <p className="rjs-meta">{[p.w, when ? 'read ' + when : ''].filter(Boolean).join(', ')}</p>
          </div>
        </div>
        <div className="rjs-act">
          {p.u ? <a className="rjs-btn" href={p.u} target="_blank" rel="noopener noreferrer">Read the article</a> : null}
          <a className="rjs-quiet" href={readHref}>See the full reading on Revenge or Justice</a>
        </div>
        <section className="rjs-about">
          <h2>What this is</h2>
          <p>
            Revenge or Justice reads political words, a press release, a quote or an article, and says whether they sound like
            revenge or justice to a voter who could go either way. It scores five things the record says decide it: a practice
            and not a person, the cost to the listener, a remedy that stops it, a speaker with nothing to gain, and a tie back to
            the listener&rsquo;s own life. Then it rewrites the passage so it lands. <a href="/revenge-or-justice/about">Why it exists.</a>
          </p>
        </section>
      </div>
    </main>
  );
}
