'use client';
import { useEffect, useRef } from 'react';
import { createMasthead } from '@/lib/brand/masthead';

// The home masthead's magnifier, drawn as one still frame behind a closing band. Nothing moves, so it
// needs no Pause control; it redraws when the band changes size.
export default function StillMagnifier() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const engine = createMasthead(host, canvas, {
      frame: (w, h) => ({ home: w < 640 ? [w * 0.62, h * 0.3] : [w * 0.74, h * 0.5], amp: [0, 0] }),
      still: true,
      paused: true,
    });
    return () => engine?.destroy();
  }, []);
  return <canvas ref={canvasRef} className="pf-canvas" aria-hidden="true" />;
}
