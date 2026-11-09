'use client';

import { useEffect, useRef } from 'react';
import { initRevengeOrJustice } from './tool.js';
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

export default function RevengeOrJustice() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    initRevengeOrJustice(root.current, {
      track: (action: string, props?: Record<string, string | number | boolean>) => track('revenge-or-justice', action, props),
    });
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

          {/* Hidden until the list arrives with at least one headline; an empty or failed list keeps the
              whole column out of sight rather than showing an error to a stranger. */}
          <section className="feed" id="feed" aria-labelledby="feedh" hidden>
            <h2 id="feedh">Or pick a recent article</h2>
            <p className="h2sub">Democrats in leadership on investigations, hearings and corruption, the last two weeks. One click reads it.</p>
            <ol id="feedlist" />
          </section>
        </div>

        <div className="strip" id="strip">
          <span className="what" id="what" />
          <button className="quietbtn" id="again" type="button">Read another</button>
        </div>

        <section id="out" aria-live="polite">
          <div className="voices" id="voices" role="tablist" aria-label="Whose words to read" />
          <div className="issues" id="issues" role="tablist" aria-label="Which issue to read" />
          <div className="rj-hero">
            <div className="srcline" id="srcline" />
            <p className="claim"><span className="v" id="verdict" /> <span id="headline" /></p>
            <div className="quoted" id="quoted" />
            <p className="meta" id="meta" />
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
