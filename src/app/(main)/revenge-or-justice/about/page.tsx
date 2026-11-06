import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import '../revenge-or-justice.css';

// The about page for Revenge or Justice. The first-person text is Whit's, stitched from what he said
// on 2026-11-06 ("I need some artful non-AI slop way to explain the Providence of this tool the
// research that backs its findings and how it actually works") and from his Substack draft of
// 2026-11-05, "Don't Let Retribution Get in the Way of Justice". Nothing in his voice was written
// for him. "How it works" is the tool's own description, in plain words. The record is read from the
// grader itself, so the page can never list a precedent the grader cannot cite.

// Rendered on request, not at build: the record is read from the grader with the site's credential
// pair, which a build machine may not carry. The fetch itself is cached an hour.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Why Revenge or Justice exists',
  description:
    'Why this tool was built, the record of American accountability efforts it reads against, and how it reads a statement.',
  path: '/revenge-or-justice/about',
  ogDescription: 'History has a lot to say about exacting justice without blowing your political capital.',
  image: {
    url: 'https://hoplight.ai/api/og?title=Why+Revenge+or+Justice+exists&sub=The+record+behind+the+reading',
    width: 1200,
    height: 630,
    alt: 'Why Revenge or Justice exists - Hoplight',
  },
});

type Precedent = { key: string; name: string; year: string; side: 'better' | 'worse'; source: string; url?: string };

async function record(): Promise<Precedent[]> {
  const u = process.env.PRIVATE_SITE_USER;
  const p = process.env.PRIVATE_SITE_PASSWORD;
  if (!u || !p) return [];
  try {
    const res = await fetch('https://quick-tools-pi.vercel.app/api/justice-or-retribution', {
      headers: { Authorization: 'Basic ' + Buffer.from(u + ':' + p).toString('base64') },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const j = (await res.json()) as { precedents?: Precedent[] };
    return Array.isArray(j.precedents) ? j.precedents : [];
  } catch {
    return [];
  }
}

export default async function AboutPage() {
  const precedents = await record();
  const kept = precedents.filter((x) => x.side === 'better');
  const lost = precedents.filter((x) => x.side === 'worse');

  return (
    <div className="rj rj-about">
      <div className="rj-wrap">
        <div className="rj-head">
          <h1>Why this exists</h1>
          <p className="rj-lede">Retribution and revenge have a strong draw in this moment. But history has valuable insights on how to exact justice without blowing all of your political capital.</p>
        </div>

        <div className="prose">
          <p>Democrats run a very real risk of overplaying their hands in light of the 2026 midterm election results. They risk interpreting the calls for accountability and rooting out corruption as a license for retribution, the stuff that their base is rapidly calling for.</p>
          <p>We need to be thinking about how we&rsquo;re turning the page while also preventing this sort of corruption from happening again and holding people accountable for what they have done. And we need to do it in a way that doesn&rsquo;t just sound like someone has an ax to grind.</p>
          <p>The key thing Democrats are going to miss in this calculus is connecting the corruption back to the impact for everyday people. If they aren&rsquo;t prosecuting that case by always anchoring it back to how this impacted the listener, they lose it. Where&rsquo;s your tariff check? That type of messaging. That is the whole question, every time.</p>

          <h2>What it is built on</h2>
          <p>This tool is built on research into the accountability efforts and anti-corruption efforts of previous administrations and Congresses throughout American history. It pattern matches to surface what makes for a successful accountability effort versus the ones that become polarized, squander political capital, don&rsquo;t yield positive results and don&rsquo;t deter further bad actors.</p>
          <p>Three things every one of the winners did. The target was a practice, priced in the listener&rsquo;s money, not a person. The hearing ended in a law that changed the listener&rsquo;s bill, savings or safety. And the investigator was visibly not running against the target. Nye broke the first rule and lost in a week.</p>
          <p>That is the difference between justice and revenge. Justice is when the people can see what it bought them. Revenge is when only you can.</p>

          <h2>How it reads a statement</h2>
          <ol className="how">
            <li><b>Five questions, one scale.</b> Is the target a practice or a person? Is the harm priced in what it cost people? Does it end in a remedy, a law, a rule, a vote? Is the speaker an umpire or a candidate? Is it anchored back to the listener? Each is a reading from 0 to 100 between revenge and justice. The verdict word is the average of the five.</li>
            <li><b>One issue at a time.</b> A text about several things, say the price of groceries and an impeachment, is split first, and each issue is read on its own. The whole text is read last.</li>
            <li><b>The words it judged.</b> Every reading quotes the passage it weighed, says how it reads, and names who faced the same choice before.</li>
            <li><b>The precedent.</b> Each reading is paired with one who did this and kept the public, and one who did this and lost them, from the record below and nowhere else.</li>
            <li><b>Say it so it lands.</b> Three rewrites of the same facts, none added, each borrowing one move from the record. A rewrite that invents a number the text does not carry is thrown away, and the page says so.</li>
            <li><b>Nothing is kept.</b> What you paste is read once and not stored. The reading is made by a Claude model from Anthropic, and the page names the model that answered.</li>
          </ol>

          <h2>The record</h2>
          {precedents.length ? (
            <div className="record">
              <h3>Kept the public</h3>
              <ul>
                {kept.map((x) => (
                  <li key={x.key}><b>{x.name}</b>, {x.year}. {x.url ? <a href={x.url} target="_blank" rel="noopener">{x.source}</a> : x.source}</li>
                ))}
              </ul>
              <h3>Lost them</h3>
              <ul>
                {lost.map((x) => (
                  <li key={x.key}><b>{x.name}</b>, {x.year}. {x.url ? <a href={x.url} target="_blank" rel="noopener">{x.source}</a> : x.source}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="h2sub">The record could not be read just now. The tool itself lists every precedent it can cite under What the rubric asks.</p>
          )}

          <p className="byline">Whit Pendergast, Portland, Oregon. <a href="/about">Hoplight</a>. <a href="/revenge-or-justice">Back to the tool.</a></p>
        </div>
      </div>
    </div>
  );
}
