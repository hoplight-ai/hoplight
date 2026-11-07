import type { Metadata } from 'next';
import { toolMetadata } from '@/lib/metadata';
import '../revenge-or-justice.css';

// The about page for Revenge or Justice. The first-person text is Whit's, stitched from his Substack
// draft of 2026-11-05 ("Don't Let Retribution Get in the Way of Justice") and his messages of
// 2026-11-06; nothing in his voice was written for him. Restructured the same day on his ask ("even
// easier and faster to read, using formatting strategically, and without my location, just my name as
// a sign off"). "How it reads a statement" is the tool's own description, in plain words. The record
// is read from the grader itself, so the page can never list a precedent the grader cannot cite.

// Rendered on request, not at build: the record is read from the grader with the site's credential
// pair, which a build machine may not carry. The fetch itself is cached an hour.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = toolMetadata('revenge-or-justice', {
  title: 'Why Revenge or Justice exists',
  name: 'Revenge or Justice',
  description:
    'Why this tool was built, the record of American accountability efforts it reads against, and how it reads a statement.',
  path: '/revenge-or-justice/about',
  ogDescription: 'History has a lot to say about exacting justice without blowing your political capital.',
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

function Entry({ x }: { x: Precedent }) {
  return (
    <li>
      <b>{x.name}</b>, {x.year}. {x.url ? <a href={x.url} target="_blank" rel="noopener">{x.source}</a> : x.source}
    </li>
  );
}

export default async function AboutPage() {
  const precedents = await record();
  const kept = precedents.filter((x) => x.side === 'better');
  const lost = precedents.filter((x) => x.side === 'worse');

  return (
    <div className="rj rj-about">
      <div className="rj-wrap">
        <div className="rj-head rj-abouthead">
          <p className="up"><a href="/revenge-or-justice">Revenge or Justice, the tool</a></p>
          <h1>Why this exists</h1>
          <p className="finding">Retribution and revenge have a strong draw in this moment. But history has valuable insights on how to exact justice without blowing all of your political capital.</p>
        </div>

        <div className="prose">
          <p className="for">This tool is for people on the left: to stop doing revenge as framing and strategy. It will backfire with the people they just won over in the midterms.</p>

          <dl className="points">
            <dt>The risk</dt>
            <dd>Democrats run a very real risk of overplaying their hands in light of the 2026 midterm election results. They risk interpreting the calls for accountability and rooting out corruption as a license for retribution, the stuff that their base is rapidly calling for.</dd>
            <dt>The job</dt>
            <dd>Turn the page, prevent this sort of corruption from happening again, and hold people accountable for what they have done. And do it in a way that doesn&rsquo;t just sound like someone has an ax to grind.</dd>
            <dt>The miss</dt>
            <dd>Connecting the corruption back to the impact for everyday people. If Democrats aren&rsquo;t prosecuting that case by always anchoring it back to how this impacted the listener, they lose it. Where&rsquo;s your tariff check? That is the whole question, every time.</dd>
          </dl>

          <h2>What it is built on</h2>
          <p>Research into the accountability and anti-corruption efforts of previous administrations and Congresses throughout American history, pattern matched for what makes an accountability effort succeed and what makes one polarize, squander political capital, yield nothing and deter nobody.</p>
          <p className="sub">Three things every one of the winners did:</p>
          <ol className="three">
            <li>The target was a <b>practice</b>, priced in the listener&rsquo;s money, not a person.</li>
            <li>The hearing ended in a <b>law</b> that changed the listener&rsquo;s bill, savings or safety.</li>
            <li>The investigator was visibly <b>not running against the target</b>. Nye broke the first rule and lost in a week.</li>
          </ol>
          <p className="pull">Justice is when the people can see what it bought them. Revenge is when only you can.</p>

          <h2>How it reads a statement</h2>
          <dl className="points">
            <dt>Whose words</dt>
            <dd>The politicians and operatives in their own words first. A toggle reads the outlet&rsquo;s own framing on the same scale, and the whole text last.</dd>
            <dt>Five questions</dt>
            <dd>A practice or a person? Priced in what it cost people? Ends in a remedy? An umpire or a candidate? Anchored back to the listener? Each is a reading from 0 to 100 between revenge and justice; the verdict is the average.</dd>
            <dt>One issue at a time</dt>
            <dd>A text about several things is split first, and each issue is read on its own.</dd>
            <dt>The words it judged</dt>
            <dd>Every reading quotes the passage it weighed, says how it reads, and pairs it with one who did this and kept the public and one who lost them, from the record below and nowhere else.</dd>
            <dt>Say it so it lands</dt>
            <dd>Three rewrites, same facts, none added. A rewrite that invents a number is thrown away, and the page says so.</dd>
            <dt>Nothing is kept</dt>
            <dd>What you paste is read once by a Claude model from Anthropic and not stored.</dd>
          </dl>

          <h2>The record</h2>
          {precedents.length ? (
            <div className="record two">
              <div>
                <h3>Kept the public</h3>
                <ul>{kept.map((x) => <Entry key={x.key} x={x} />)}</ul>
              </div>
              <div>
                <h3>Lost them</h3>
                <ul>{lost.map((x) => <Entry key={x.key} x={x} />)}</ul>
              </div>
            </div>
          ) : (
            <p className="h2sub">The record could not be read just now. The tool itself lists every precedent it can cite under What the rubric asks.</p>
          )}

          <div className="signoff">
            <p>Thanks for reading, using this tool, and sharing. If you have feedback, email it here.</p>
            <p className="name">Whit Pendergast</p>
            <a className="rj-btn" href="/contact">Send feedback</a>
          </div>
        </div>
      </div>
    </div>
  );
}
