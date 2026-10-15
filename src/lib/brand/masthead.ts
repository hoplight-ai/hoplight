// The animated masthead behind the home hero: the seed's lattice on navy with a soft magnifier rising
// out of it. Ported from the "magnified" mode of the Engine in
// visualizations/private/hoplight/hoplight-design-system-round-four-2026-10-15.html, the masthead Whit
// approved on 2026-10-15 ("this hoplight landing page is a big fuck YES"), with the edge softened at his
// ask ("could we soften the edge of the circle a little"): the bulge is g = (1 + d²/S²)^-2 with B = 1.3,
// lifted toward the upper left, a soft shadow beneath, no rim. It follows the pointer and drifts when idle.
//
// Changes from the mock, each for the live page: only the magnified mode; the clock advances only while
// frames are drawn, so pausing or scrolling away never makes the lens jump on return; while paused or
// under reduced motion it is a still frame that ignores the pointer; it redraws on any size change.

const SQ3 = Math.sqrt(3);
const NAVY = '#0F1B2D';
const gold = (a: number) => `rgba(232,168,32,${a.toFixed(3)})`;

export interface MastheadFrame {
  /** Where the lens rests and drifts around, in canvas pixels. */
  home: [number, number];
  /** How far the idle drift wanders from home, in pixels. */
  amp: [number, number];
}

export interface MastheadOptions {
  frame: (w: number, h: number) => MastheadFrame;
  still: boolean;
  paused: boolean;
}

export interface Masthead {
  setPaused(p: boolean): void;
  setStill(s: boolean): void;
  resize(): void;
  destroy(): void;
}

// The time a still frame is drawn at: the same idle pose every visitor with reduced motion sees.
const STILL_T = 6;

export function createMasthead(host: HTMLElement, canvas: HTMLCanvasElement, opts: MastheadOptions): Masthead | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  let w = 0;
  let h = 0;
  let raf = 0;
  let running = false;
  let visible = true;
  let paused = opts.paused;
  let still = opts.still;
  let t = 0;
  let prev = 0;
  const ptr = { x: 0, y: 0, on: false };
  let F: [number, number] | null = null;
  let pts: number[] = [];
  let ptsKey = '';
  let r = 34;

  function lat(rr: number, cx: number, cy: number): number[] {
    const out: number[] = [];
    const dy = (rr * SQ3) / 2;
    const D = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 2 * rr;
    const cols = Math.ceil(D / rr) + 1;
    const rows = Math.ceil(D / dy) + 1;
    for (let j = -rows; j <= rows; j++) {
      for (let i = -cols; i <= cols; i++) {
        const x = cx + i * rr + (j & 1 ? rr / 2 : 0);
        const y = cy + j * dy;
        if (x > -rr && x < w + rr && y > -rr && y < h + rr) out.push(x, y);
      }
    }
    return out;
  }

  function softGlow(x: number, y: number, rad: number, a: number) {
    const g = ctx!.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, gold(a));
    g.addColorStop(1, gold(0));
    ctx!.fillStyle = g;
    ctx!.fillRect(0, 0, w, h);
  }

  function draw(time: number) {
    const c = ctx!;
    c.fillStyle = NAVY;
    c.fillRect(0, 0, w, h);
    if (!w || !h) return;

    r = Math.max(24, Math.min(40, w / 38));
    const key = `${w}x${h}@${r}`;
    if (key !== ptsKey) {
      pts = lat(r, w * 0.5, h * 0.5);
      ptsKey = key;
    }
    const { home, amp } = opts.frame(w, h);
    const idle: [number, number] = [home[0] + amp[0] * Math.sin(time * 0.19), home[1] + amp[1] * Math.sin(time * 0.27 + 1.3)];
    const target = ptr.on ? [ptr.x, ptr.y] : idle;
    // Stopped (paused, still, off screen), the lens holds where it is; a fresh size starts it at home.
    if (!F) F = [idle[0], idle[1]];
    else if (running) {
      F[0] += (target[0] - F[0]) * 0.07;
      F[1] += (target[1] - F[1]) * 0.07;
    }

    // A smooth bulge: the lattice rises out of itself and settles back into the flat with no edge, lifted
    // a little toward the light, with a soft shadow beneath. Monotonic for B below 2.2, so lines never fold.
    const D = Math.max(120, Math.min(250, Math.min(w, h) * 0.32));
    const S = D * 0.66;
    const B = 1.3;
    const L = S * 0.12;
    const RR = S * 2.0;
    const S2 = S * S;
    const sx = F[0] + S * 0.18;
    const sy = F[1] + S * 0.36;
    const sg = c.createRadialGradient(sx, sy, 0, sx, sy, S * 2.4);
    sg.addColorStop(0, 'rgba(3,7,14,.5)');
    sg.addColorStop(0.5, 'rgba(3,7,14,.2)');
    sg.addColorStop(1, 'rgba(3,7,14,0)');
    c.fillStyle = sg;
    c.fillRect(0, 0, w, h);
    softGlow(F[0] - S * 0.25, F[1] - S * 0.32, S * 1.7, 0.14);

    // g has a long, gentle tail, so the squeeze where the dome meets the flat is spread wide: no rim.
    const gg = (dx: number, dy: number) => Math.pow(1 + (dx * dx + dy * dy) / S2, -2);
    for (let i = 0; i < pts.length; i += 2) {
      const ex = pts[i] - F[0];
      const ey = pts[i + 1] - F[1];
      const d = Math.hypot(ex, ey);
      const v = Math.exp(-(d * d) / (RR * RR));
      const gc = gg(ex, ey);
      const lit = 1 + 0.4 * gc * (d ? -(ex * 0.55 + ey * 0.83) / d : 0);
      c.beginPath();
      c.lineWidth = 1.05 + 0.5 * gc;
      c.strokeStyle = gold(Math.min(0.95, (0.09 + 0.78 * v) * lit));
      if (d > S * 2.6) {
        // Far out the warp is a small shift and stretch: draw the circle where it lands, at its stretched size.
        c.arc(F[0] + ex * (1 + B * gc) - L * 0.4 * gc, F[1] + ey * (1 + B * gc) - L * gc, r * (1 + B * gc), 0, 6.2832);
      } else {
        const n = d < S * 1.6 ? 44 : 30;
        for (let j = 0; j <= n; j++) {
          const a = (j / n) * 6.2832;
          const dx = ex + r * Math.cos(a);
          const dy = ey + r * Math.sin(a);
          const g = gg(dx, dy);
          const px = F[0] + dx * (1 + B * g) - L * 0.4 * g;
          const py = F[1] + dy * (1 + B * g) - L * g;
          if (j) c.lineTo(px, py);
          else c.moveTo(px, py);
        }
      }
      c.stroke();
    }
  }

  function loop(now: number) {
    if (!running) return;
    // The clock moves only while frames are drawn, and never by more than a twentieth of a second at once.
    t += Math.min(0.05, prev ? (now - prev) / 1000 : 0);
    prev = now;
    draw(t);
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running || still || paused || !visible || document.hidden) return;
    running = true;
    prev = 0;
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }
  function redrawIfStopped() {
    if (!running) draw(still ? STILL_T : t);
  }

  function resize() {
    const b = host.getBoundingClientRect();
    w = Math.round(b.width);
    h = Math.round(b.height);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ptsKey = '';
    F = null;
    redrawIfStopped();
  }

  function onMove(e: PointerEvent) {
    const b = host.getBoundingClientRect();
    ptr.x = e.clientX - b.left;
    ptr.y = e.clientY - b.top;
    ptr.on = true;
  }
  function onLeave() {
    ptr.on = false;
  }
  function onUp(e: PointerEvent) {
    if (e.pointerType !== 'mouse') ptr.on = false;
  }
  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }

  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerleave', onLeave);
  host.addEventListener('pointercancel', onLeave);
  host.addEventListener('pointerup', onUp);
  document.addEventListener('visibilitychange', onVisibility);
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((es) => {
        visible = es[es.length - 1].isIntersecting;
        if (visible) start();
        else stop();
      })
    : null;
  io?.observe(host);
  let sizeRaf = 0;
  const ro = 'ResizeObserver' in window
    ? new ResizeObserver(() => {
        cancelAnimationFrame(sizeRaf);
        sizeRaf = requestAnimationFrame(resize);
      })
    : null;
  ro?.observe(host);
  const onWindowResize = () => {
    cancelAnimationFrame(sizeRaf);
    sizeRaf = requestAnimationFrame(resize);
  };
  if (!ro) window.addEventListener('resize', onWindowResize);

  resize();
  start();

  return {
    setPaused(p) {
      paused = p;
      if (p) {
        stop();
        redrawIfStopped();
      } else start();
    },
    setStill(s) {
      still = s;
      if (s) {
        stop();
        F = null;
        redrawIfStopped();
      } else start();
    },
    resize,
    destroy() {
      stop();
      cancelAnimationFrame(sizeRaf);
      io?.disconnect();
      ro?.disconnect();
      window.removeEventListener('resize', onWindowResize);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointercancel', onLeave);
      host.removeEventListener('pointerup', onUp);
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
