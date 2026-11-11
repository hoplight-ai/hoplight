'use client';

import { useEffect, useRef } from 'react';
import { feedCardsHtml, initRevengeOrJustice } from './tool.js';
import type { FeedItem, FeedSource } from '@/lib/rj-cache';
import { track } from '@/lib/track';
import { USAGE_NOTE } from '@/components/ToolFeedback';
import { TOOL_BY_SLUG } from '@/data/tools';
import { pictureSvg } from '@/data/tool-pictures';
import './revenge-or-justice.css';

// Static markup the script in tool.js draws into by id. React renders this once and never updates it,
// so the ids are the contract: the exhibit (#out and everything under it), the ask (#f), the strip
// (#strip) and the headline list (#feed). Same markup as the quick-tools original, build v6.
// The title is set the way the tool's link-preview card sets it (visual review, 2026-11-07): "Justice"
// on its own line in the card's gold, the bars picture beside it. The picture is the card's own
// drawing (src/data/tool-pictures.ts), so the page and a pasted link show the same face.
const BARS = pictureSvg(TOOL_BY_SLUG['revenge-or-justice'].brand) ?? '';

// The headline list arrives with the page (lane RJFAST1, 2026-11-10): the server hands over the list from its
// shared copy, its cards are drawn into the HTML by the same function the script uses, and the script wires them
// up without asking for the list again. `source` says where the list came from, on the list's own section, so a
// build with no site pair (no list to fetch) is told apart from a page that should carry one.
export default function RevengeOrJustice({ items = [], source = 'unconfigured' }: { items?: FeedItem[]; source?: FeedSource }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    initRevengeOrJustice(root.current, {
      items,
      track: (action: string, props?: Record<string, string | number | boolean>) => track('revenge-or-justice', action, props),
    });
    // The markup is drawn once and never re-rendered (see the note above), so the first items are the only ones.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rj" ref={root}>
      <div className="rj-wrap">
        <div className="rj-top">
          <div className="rj-head">
            <div className="rj-title">
              <h1>
                <span>Revenge or</span> <span className="rj-j">Justice</span>
              </h1>
              <span className="rj-bars" aria-hidden="true" dangerouslySetInnerHTML={{ __html: BARS }} />
            </div>
            <p className="rj-lede">
              Paste a statement or a link. It says whether the words sound like revenge or justice, and how to say it so it lands.{' '}
              <a href="/revenge-or-justice/about">Why this exists.</a>
            </p>
          </div>

          <form id="f">
            <label htmlFor="t" className="quiet" style={{ display: 'none' }}>The text to read</label>
            <textarea id="t" placeholder="The release, the quote or the article. A link on its own line works too." />
            <div className="rj-row">
              <button className="rj-btn" id="go" type="submit">Read it</button>
              <span className="quiet"><button type="button" id="showr" aria-expanded="false" aria-controls="rubricbox">What the rubric asks</button></span>
            </div>
            <div id="rubricbox">
              <p className="rubric-sum">The rubric: the subject is a practice, priced in what it cost people, ending in the remedy, from a speaker with nothing to gain, anchored back to the listener.</p>
              <dl id="rubric" />
            </div>
            <div id="status" aria-live="polite" />
          </form>

          {/* Hidden only when there is no headline to show; an empty or failed list keeps the whole column out
              of sight rather than showing an error to a stranger. */}
          <section className="feed" id="feed" aria-labelledby="feedh" hidden={items.length === 0} data-feed-source={source}>
            <h2 id="feedh">Or pick a recent article</h2>
            <p className="h2sub">Democrats in leadership on investigations, hearings and corruption, the last two weeks. One click reads it.</p>
            <ol id="feedlist" dangerouslySetInnerHTML={{ __html: feedCardsHtml(items) }} />
          </section>
        </div>

        <div className="strip" id="strip">
          <span className="what" id="what" />
          {/* Whit, 2026-11-09: "can we make this produce a pdf 1 pager w the assessment and recs for better,
              justics framing?" One page laid out for Letter from the reading on screen; the browser saves it. */}
          {/* Whit, 2026-11-09: "we need social sharing". Shown only when the reading carries a signed share link. */}
          <button className="rj-btn rj-share" id="share" type="button" aria-expanded="false" aria-controls="sharebox" hidden>Share</button>
          <button className="rj-pdfbtn" id="pdf" type="button">Save as PDF</button>
          <button className="quietbtn" id="again" type="button">Read another</button>
          <div className="sharebox" id="sharebox" hidden />
        </div>

        <section id="out" aria-live="polite">
          <div className="voices" id="voices" role="tablist" aria-label="Whose words to read" />
          <div className="issues" id="issues" role="tablist" aria-label="Which issue to read" />
          {/* The verdict as a dial beside the article and the claim (Whit, 2026-11-09, on the dial mockup: "that
              topline is stornger as a dial ... the 5 measures i think should be the bars still"). */}
          <div className="rj-hero">
            <div className="rj-top-line">
              <div className="rj-dial" id="dial" />
              <div className="rj-top-words">
                <div className="art" id="art" />
                <p className="claim"><span className="v" id="verdict" /> <span id="headline" /></p>
                <p className="meta" id="meta" />
                {/* A first reading's stages, while it is being made (RJFAST1); empty once the reading lands. */}
                <div className="stages" id="stages" aria-live="polite" />
              </div>
            </div>
            <div className="quoted" id="quoted" />
            <div className="instrument">
              <div className="ends"><div className="l"><span>Revenge</span><span>Justice</span></div></div>
              <div className="rows" id="rows" />
            </div>
          </div>

          <h2>The precedent</h2>
          <p className="h2sub">One who did this and kept the public, one who did this and lost them. The reading stands on the record.</p>
          <div className="pair" id="prec" />

          <h2>The words behind each reading</h2>
          <p className="h2sub">What the text said, how it reads, and who faced the same choice before.</p>
          <div id="detail" />

          <h2>Say it so it lands</h2>
          <p className="h2sub">Same facts, none added. Each rewrite borrows one move from the record.</p>
          <div id="reframes" />
        </section>

        <div className="rj-foot">
          {USAGE_NOTE}{' '}
          <a href="/revenge-or-justice/about">How this was built.</a>
        </div>
      </div>
    </div>
  );
}
