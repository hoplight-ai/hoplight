import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import CopyButton from './CopyButton';
import SpotFilm from './SpotFilm';
import '../revenge-or-justice.css';
import './spot.css';

// The spot's public page beside the tool (lane RJPAGE1, 2026-11-17). Whit, 2026-11-17: "i want it live and
// shareable optimized for linked in and blue sky and threads. and how would i share on substack?"
// The 45-second cut plays first, the tool is one tap below, then the cuts for each feed, the draft posts and
// the Substack steps. The share files are the ones Design RJSHARE1 (the spot cut for feeds with sound off)
// rendered, copied unchanged into public/revenge-or-justice/spot/. No tracking on this page.

const ORIGIN = 'https://hoplight.ai';
const DIR = '/revenge-or-justice/spot';
const abs = (name: string) => `${ORIGIN}${DIR}/${name}`;

// Drawn at build: the sizes printed beside each download are read from the files themselves.
export const dynamic = 'force-static';

const TITLE = 'Revenge or Justice, the 45-second spot';
const DESCRIPTION =
  "Revenge gets a hearing. Justice gets a verdict. Same facts, different sentence: watch the dial move, then paste any politician's quote and see where it lands.";

const base = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: DIR,
  ogTitle: 'Revenge or Justice: the 45-second spot',
  image: { url: abs('rj-spot-poster-4x5.png'), width: 1080, height: 1350, alt: 'They will pay for what they have done scores 29, toward revenge. Eight families lost their homes, the money went to three men scores 74, toward justice.' },
});

export const metadata: Metadata = {
  ...base,
  openGraph: {
    ...base.openGraph,
    videos: [{ url: abs('rj-spot-45s-16x9.mp4'), secureUrl: abs('rj-spot-45s-16x9.mp4'), type: 'video/mp4', width: 1920, height: 1080 }],
  },
};

function sizeOf(name: string): string | null {
  try {
    const bytes = fs.statSync(path.join(process.cwd(), 'public', DIR, name)).size;
    return `${(bytes / 1_000_000).toFixed(1)} MB`;
  } catch {
    return null;
  }
}

type Cut = { platform: string; file: string; shape: string; length: string; note?: string };

const CUTS: Cut[] = [
  { platform: 'LinkedIn', file: 'rj-spot-30s-4x5.mp4', shape: 'portrait 4:5', length: '30 seconds' },
  { platform: 'Bluesky and Threads', file: 'rj-spot-15s-4x5.mp4', shape: 'portrait 4:5', length: '15 seconds' },
  { platform: 'Substack', file: 'rj-spot-45s-16x9.mp4', shape: 'wide 16:9', length: '45 seconds' },
];

const EXTRAS: Cut[] = [
  { platform: 'Press office cut', file: 'rj-spot-45s-16x9-staffer.mp4', shape: 'wide 16:9', length: '45 seconds', note: 'ends on “Paste it before you send it.”' },
  { platform: 'Poster, portrait', file: 'rj-spot-poster-4x5.png', shape: 'portrait 4:5', length: 'still image' },
  { platform: 'Poster, wide', file: 'rj-spot-poster-16x9.png', shape: 'wide 16:9', length: 'still image' },
];

// The consultant's drafts of 2026-11-17, word for word except the length each names: the drafts said 45 for
// every platform, and the page pairs LinkedIn with the 30-second cut and Bluesky with the 15 (review round 2).
type Post = { platform: string; limit: number; text: string };

const POSTS: Post[] = [
  {
    platform: 'LinkedIn',
    limit: 3000,
    text: "I want the people who did this held to account. Most of us do. But 'they will pay' gets you a hearing. 'Eight families lost their homes. The money went to three men. Here's the law that gets it back' gets you a verdict. 30 seconds on the difference, plus a free tool that scores any quote from revenge to justice: hoplight.ai #Accountability",
  },
  {
    platform: 'Bluesky',
    limit: 300,
    text: "I want them to pay too. But 'they will pay' is the line their lawyers love. 'Eight families lost their homes. The money went to three men' is the line that convicts. 15 sec. Paste any quote, see where it lands: hoplight.ai",
  },
  {
    platform: 'Threads',
    limit: 500,
    text: "Angry? Good. Me too. Here's the thing nobody tells us: revenge gets a hearing, justice gets a verdict. Same facts, different sentence. Watch the dial move. Then paste your rep's last statement in and see where it lands. hoplight.ai",
  },
];

function DownloadRow({ c }: { c: Cut }) {
  const size = sizeOf(c.file);
  return (
    <li className="dl">
      <span className="dl-for">{c.platform}</span>
      <span className="dl-what">
        {c.length}, {c.shape}
        {size ? <>, {size}</> : null}
        {c.note ? <span className="dl-note">{c.note}</span> : null}
      </span>
      <a className="dl-get" href={`${DIR}/${c.file}`} download={c.file}>
        Download<span className="vh"> the {c.platform} file</span>
      </a>
    </li>
  );
}

export default function SpotPage() {
  return (
    <div className="rj rj-spot">
      <div className="rj-wrap">
        <SpotFilm src={`${DIR}/rj-spot-45s-16x9.mp4`} poster={`${DIR}/rj-spot-poster-16x9.png`} />

        <div className="spot-head">
          <h1>
            Revenge gets a hearing. <span className="rj-j">Justice gets a verdict.</span>
          </h1>
          <a className="rj-btn spot-go" href="/revenge-or-justice">
            Paste any politician&rsquo;s quote. See where it lands.
          </a>
        </div>

        <section aria-labelledby="cuts">
          <h2 id="cuts">A cut for each feed, captioned for sound off</h2>
          <ul className="dls">{CUTS.map((c) => <DownloadRow key={c.file} c={c} />)}</ul>
          <h3 className="dls-h">More files</h3>
          <ul className="dls dls-more">{EXTRAS.map((c) => <DownloadRow key={c.file} c={c} />)}</ul>
        </section>

        <section aria-labelledby="posts">
          <h2 id="posts">Words to post with it</h2>
          <div className="posts">
            {POSTS.map((p) => (
              <div className="post" key={p.platform}>
                <h3>
                  {p.platform} <span className="draft">draft</span>
                </h3>
                <p className="post-t">{p.text}</p>
                <p className="post-n">
                  {p.text.length} characters; {p.platform} allows {p.limit.toLocaleString('en-US')}.
                </p>
                <CopyButton text={p.text} label={p.platform} />
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="substack">
          <h2 id="substack">On Substack</h2>
          <ol className="steps">
            <li>
              In a new post, add a video block and upload the <b>45-second wide cut</b>.
            </li>
            <li>
              Set the <b>wide poster</b> as the post&rsquo;s image, so the link preview shows the two scores.
            </li>
            <li>
              Under the video, add a screenshot of the tool&rsquo;s dial and a button to <b>hoplight.ai/revenge-or-justice</b>.
            </li>
            <li>
              Once it is published, post the <b>15-second cut</b> as a Note that links to the post.
            </li>
          </ol>
        </section>

        <div className="rj-foot">
          <a href="/revenge-or-justice">Revenge or Justice, the tool</a> &middot; <a href="/revenge-or-justice/about">Why it exists</a>
        </div>
      </div>
    </div>
  );
}
