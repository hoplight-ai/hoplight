'use client';

import { useRef, useState } from 'react';

// The 45-second cut. Before the first play a cover shows the whole split poster with one play button,
// because a paused video's own control bar sits over the bottom of the poster, where the two scores and
// the Hoplight mark are. Once it plays, the cover is gone and the browser's own controls take over.
export default function SpotFilm({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function play() {
    setStarted(true);
    const v = ref.current;
    if (!v) return;
    v.focus();
    void v.play().catch(() => {
      /* the browser refused autoplay after the tap; its own controls are showing now */
    });
  }

  return (
    <div className="spot-film">
      <video
        ref={ref}
        controls
        playsInline
        preload="metadata"
        poster={poster}
        width={1920}
        height={1080}
        aria-label="The 45-second spot. The captions are part of the picture."
        onPlay={() => setStarted(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
      {started ? null : (
        <button type="button" className="spot-cover" onClick={play} aria-label="Play the 45-second spot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" width={1920} height={1080} />
          {/* The play mark sits in the empty foot of the Justice half, clear of both lines and both scores. */}
          <span className="spot-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor" /></svg>
            Play <span className="spot-len">0:45</span>
          </span>
        </button>
      )}
    </div>
  );
}
