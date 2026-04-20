import { useEffect, useRef } from 'react';

/* ─── Types ─── */
interface Drop {
  x: number;
  y: number;
  r: number;
  maxR: number;
  speed: number;
  phase: number;
  wobble: number;
  delay: number;
  subs: SubDrop[];
  lastSubR: number;
}

interface SubDrop {
  x: number;
  y: number;
  r: number;
  maxR: number;
  speed: number;
  phase: number;
  wobble: number;
}

/* ─── Organic noise for wobbly edges ─── */
function noise(a: number, p: number, t: number): number {
  return (
    Math.sin(a * 2.0 + p) * 0.22 +
    Math.sin(a * 3.7 + p * 1.3 + t * 0.0008) * 0.14 +
    Math.sin(a * 7.1 + p * 2.1) * 0.09 +
    Math.sin(a * 11.3 + p * 0.7) * 0.05
  );
}

/* ─── Draw one organic blob ─── */
function drawBlob(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  r: number, phase: number,
  wobble: number, t: number,
  alpha: number,
) {
  if (r <= 1) return;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const n = noise(a, phase, t) * wobble;
    const rr = r * (1 + n);
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) { ctx.moveTo(px, py); } else { ctx.lineTo(px, py); }
  }
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

/* ─── Tendril / branch helper ─── */
function spawnTendril(drop: Drop, w: number, h: number) {
  const angle = Math.random() * Math.PI * 2;
  const dist = drop.r * (0.75 + Math.random() * 0.35);
  const tx = drop.x + Math.cos(angle) * dist;
  const ty = drop.y + Math.sin(angle) * dist;
  // Only spawn if inside bounds (with margin)
  if (tx > -20 && tx < w + 20 && ty > -20 && ty < h + 20) {
    drop.subs.push({
      x: tx, y: ty,
      r: 0,
      maxR: 12 + Math.random() * 28,
      speed: 0.4 + Math.random() * 0.8,
      phase: Math.random() * 100,
      wobble: 0.3 + Math.random() * 0.35,
    });
  }
}

/* ─── Props ─── */
interface InkWashCanvasProps {
  /** Solid color to fill initially (the "paper" that gets dissolved) */
  bgColor: string;
  /** Speed multiplier: 1 = ~2.5s reveal, 2 = ~1.2s */
  speed?: number;
  /** Called when the image is fully revealed */
  onComplete?: () => void;
  style?: React.CSSProperties;
}

/* ─── Component ─── */
export default function InkWashCanvas({
  bgColor,
  speed = 1,
  onComplete,
  style,
}: InkWashCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Fill with solid bg color (= mask that hides the image)
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    const diag = Math.sqrt(w * w + h * h);

    // Create main ink drops
    const count = 4 + Math.floor(Math.random() * 3); // 4-6
    const drops: Drop[] = [];
    for (let i = 0; i < count; i++) {
      drops.push({
        x: w * (0.12 + Math.random() * 0.76),
        y: h * (0.12 + Math.random() * 0.76),
        r: 0,
        maxR: diag * (0.45 + Math.random() * 0.4),
        speed: (1.0 + Math.random() * 1.8) * speed,
        phase: Math.random() * 200,
        wobble: 0.2 + Math.random() * 0.25,
        delay: i * 160 + Math.random() * 220,
        subs: [],
        lastSubR: 0,
      });
    }

    let done = false;
    const t0 = performance.now();
    let animId = 0;

    function frame(now: number) {
      if (done) return;
      const elapsed = now - t0;

      // Switch to "erase" mode: drawing removes the mask
      ctx!.globalCompositeOperation = 'destination-out';
      ctx!.fillStyle = 'black';

      let allDone = true;

      for (const d of drops) {
        if (elapsed < d.delay) { allDone = false; continue; }

        // Grow with easing (faster at start, slower near end)
        if (d.r < d.maxR) {
          const progress = d.r / d.maxR;
          const ease = 1 + (1 - progress) * 0.6; // faster when small
          d.r = Math.min(d.r + d.speed * ease, d.maxR);
          allDone = false;
        }

        // Spawn tendrils every ~25-40px of growth
        if (d.r - d.lastSubR > 25 + Math.random() * 15) {
          d.lastSubR = d.r;
          spawnTendril(d, w, h);
          // Sometimes spawn a second
          if (Math.random() > 0.6) spawnTendril(d, w, h);
        }

        // Draw: soft outer halo + sharp inner
        drawBlob(ctx!, d.x, d.y, d.r * 1.12, d.phase, d.wobble, elapsed, 0.25);
        drawBlob(ctx!, d.x, d.y, d.r, d.phase, d.wobble, elapsed, 1);

        // Draw sub-drops (tendrils)
        for (const s of d.subs) {
          if (s.r < s.maxR) {
            s.r = Math.min(s.r + s.speed, s.maxR);
            allDone = false;
          }
          drawBlob(ctx!, s.x, s.y, s.r * 1.15, s.phase, s.wobble, elapsed, 0.35);
          drawBlob(ctx!, s.x, s.y, s.r, s.phase, s.wobble, elapsed, 1);
        }
      }

      if (allDone || elapsed > 4000 / speed) {
        done = true;
        ctx!.globalCompositeOperation = 'source-over';
        ctx!.clearRect(0, 0, w, h);
        onComplete?.();
        return;
      }

      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);

    return () => {
      done = true;
      cancelAnimationFrame(animId);
    };
  }, [bgColor, speed, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        ...style,
      }}
    />
  );
}
