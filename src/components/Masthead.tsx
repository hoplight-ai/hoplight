'use client';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createMasthead, type Masthead as Engine, type MastheadFrame } from '@/lib/brand/masthead';

// The home hero: the seed's lattice with the soft magnifier (src/lib/brand/masthead.ts) on a canvas
// behind the copy, a navy veil under the words, and a Pause control. Under reduced motion it is one
// still frame and the control goes away, since nothing moves. A visitor's pause is remembered.

const REDUCE = '(prefers-reduced-motion: reduce)';
const STORE = 'hoplight-masthead-paused';

function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
const readStill = () => window.matchMedia(REDUCE).matches;

// The pause lives in memory first and in localStorage when the browser allows it, so the control
// works in a private window too.
let pausedMemo: boolean | null = null;
const pauseListeners = new Set<() => void>();
function readPaused(): boolean {
  if (pausedMemo === null) {
    try {
      pausedMemo = window.localStorage.getItem(STORE) === '1';
    } catch {
      pausedMemo = false;
    }
  }
  return pausedMemo;
}
function writePaused(p: boolean) {
  pausedMemo = p;
  try {
    window.localStorage.setItem(STORE, p ? '1' : '0');
  } catch {
    /* storage blocked: the memo carries it for this visit */
  }
  pauseListeners.forEach((l) => l());
}
function subscribePaused(cb: () => void) {
  pauseListeners.add(cb);
  return () => pauseListeners.delete(cb);
}
const no = () => false;

// variant 'home' is the full masthead of the front page. 'page' is the same lattice and lens as a short
// band at the head of the other pages (Whit, 2026-10-20: the field stays on every page); the lens rests
// high and right, beside the title, so it never sits under the tiles that follow it.
export default function Masthead({
  labelledBy,
  children,
  variant = 'home',
}: {
  labelledBy: string;
  children: React.ReactNode;
  variant?: 'home' | 'page';
}) {
  const hostRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const still = useSyncExternalStore(subscribeMotion, readStill, no);
  const paused = useSyncExternalStore(subscribePaused, readPaused, no);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    // Wide: the lens rests right of the words. Phone: it rests in the band above the headline and
    // drifts within it, so it never sits under the copy.
    const frame = (w: number, h: number): MastheadFrame => {
      if (w < 640) {
        const copy = copyRef.current;
        const top = copy ? copy.getBoundingClientRect().top - host.getBoundingClientRect().top : h * 0.3;
        return { home: [w * 0.56, Math.max(72, top * 0.48)], amp: [w * 0.12, Math.min(h * 0.18, top * 0.12)] };
      }
      if (variant === 'page') return { home: [w * 0.74, Math.min(h * 0.5, 120)], amp: [w * 0.1, 32] };
      return { home: [w * 0.7, h * 0.48], amp: [w * 0.14, h * 0.18] };
    };
    engine.current = createMasthead(host, canvas, { frame, still: readStill(), paused: readPaused() });
    return () => {
      engine.current?.destroy();
      engine.current = null;
    };
  }, [variant]);

  useEffect(() => {
    engine.current?.setStill(still);
  }, [still]);
  useEffect(() => {
    engine.current?.setPaused(paused);
  }, [paused]);

  return (
    <section ref={hostRef} className={variant === 'page' ? 'hero masthead masthead-page' : 'hero masthead'} aria-labelledby={labelledBy}>
      <canvas ref={canvasRef} className="mast-canvas" aria-hidden="true" />
      <div className="mast-veil" aria-hidden="true" />
      <div className="wrap mast-wrap">
        <div ref={copyRef} className="mast-copy">{children}</div>
      </div>
      {!still && (
        <div className="wrap mast-controls">
          <button
            type="button"
            className="mast-pause"
            aria-label={paused ? 'Play the background animation' : 'Pause the background animation'}
            onClick={() => writePaused(!paused)}
          >
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
              {paused ? <path d="M3 1.5v9l7.5-4.5z" fill="currentColor" /> : <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" fill="currentColor" />}
            </svg>
            {paused ? 'Play' : 'Pause'}
          </button>
        </div>
      )}
    </section>
  );
}
