import { useEffect, useRef } from 'react';

/* ─── Types ─── */
interface Drop {
  x: number; y: number; r: number; maxR: number;
  speed: number; phase: number; wobble: number; delay: number;
  subs: SubDrop[]; lastSubR: number;
}
interface SubDrop {
  x: number; y: number; r: number; maxR: number;
  speed: number; phase: number; wobble: number;
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

/* ─── Trace one organic blob path (no fill) ─── */
function traceBlobPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  phase: number, wobble: number, t: number,
) {
  if (r <= 1) return;
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
}

/* ─── Fill one organic blob ─── */
function drawBlob(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  phase: number, wobble: number, t: number,
  alpha: number,
) {
  if (r <= 1) return;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  traceBlobPath(ctx, x, y, r, phase, wobble, t);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/* ─── Tendril / branch helper ─── */
function spawnTendril(drop: Drop, w: number, h: number) {
  const angle = Math.random() * Math.PI * 2;
  const dist = drop.r * (0.75 + Math.random() * 0.35);
  const tx = drop.x + Math.cos(angle) * dist;
  const ty = drop.y + Math.sin(angle) * dist;
  if (tx > -20 && tx < w + 20 && ty > -20 && ty < h + 20) {
    drop.subs.push({
      x: tx, y: ty, r: 0,
      maxR: 12 + Math.random() * 28,
      speed: 0.4 + Math.random() * 0.8,
      phase: Math.random() * 100,
      wobble: 0.3 + Math.random() * 0.35,
    });
  }
}

/* ─── Create ink drops ─── */
function createDrops(w: number, h: number, speed: number): Drop[] {
  const diag = Math.sqrt(w * w + h * h);
  const count = 4 + Math.floor(Math.random() * 3);
  const drops: Drop[] = [];
  for (let i = 0; i < count; i++) {
    drops.push({
      x: w * (0.12 + Math.random() * 0.76),
      y: h * (0.12 + Math.random() * 0.76),
      r: 0, maxR: diag * (0.45 + Math.random() * 0.4),
      speed: (1.0 + Math.random() * 1.8) * speed,
      phase: Math.random() * 200,
      wobble: 0.2 + Math.random() * 0.25,
      delay: i * 160 + Math.random() * 220,
      subs: [], lastSubR: 0,
    });
  }
  return drops;
}

/* ─── Advance all drops by one frame ─── */
function stepDrops(drops: Drop[], elapsed: number, w: number, h: number): boolean {
  let allDone = true;
  for (const d of drops) {
    if (elapsed < d.delay) { allDone = false; continue; }
    if (d.r < d.maxR) {
      const ease = 1 + (1 - d.r / d.maxR) * 0.6;
      d.r = Math.min(d.r + d.speed * ease, d.maxR);
      allDone = false;
    }
    if (d.r - d.lastSubR > 25 + Math.random() * 15) {
      d.lastSubR = d.r;
      spawnTendril(d, w, h);
      if (Math.random() > 0.6) spawnTendril(d, w, h);
    }
    for (const s of d.subs) {
      if (s.r < s.maxR) {
        s.r = Math.min(s.r + s.speed, s.maxR);
        allDone = false;
      }
    }
  }
  return allDone;
}

/* ─── Props ─── */
interface InkWashCanvasProps {
  /**
   * "erase" (default): starts as solid bgColor, erases to reveal image behind.
   * "paint": starts transparent, paints the image progressively (for see-through).
   */
  mode?: 'erase' | 'paint';
  /** Solid color for erase mode */
  bgColor?: string;
  /** Image URL for paint mode */
  imageSrc?: string;
  /** Speed multiplier */
  speed?: number;
  /** Called when fully revealed */
  onComplete?: () => void;
  style?: React.CSSProperties;
}

/* ─── Component ─── */
export default function InkWashCanvas({
  mode = 'erase',
  bgColor = '#0a1a28',
  imageSrc,
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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    let done = false;
    let animId = 0;

    if (mode === 'paint') {
      // ─── Paint mode: load image, draw through clip paths ───
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const drops = createDrops(w, h, speed);
        const t0 = performance.now();

        function frame(now: number) {
          if (done) return;
          const elapsed = now - t0;

          const allDone = stepDrops(drops, elapsed, w, h);

          // Clear canvas (transparent)
          ctx!.clearRect(0, 0, w, h);

          // Build composite clip from all blob shapes
          ctx!.save();
          ctx!.beginPath();
          for (const d of drops) {
            if (d.r > 1) traceBlobPath(ctx!, d.x, d.y, d.r, d.phase, d.wobble, elapsed);
            for (const s of d.subs) {
              if (s.r > 1) traceBlobPath(ctx!, s.x, s.y, s.r, s.phase, s.wobble, elapsed);
            }
          }
          ctx!.clip();

          // Draw image through the clip (cover mode)
          const imgRatio = img.width / img.height;
          const canvasRatio = w / h;
          let sx = 0, sy = 0, sw = img.width, sh = img.height;
          if (imgRatio > canvasRatio) {
            sw = img.height * canvasRatio;
            sx = (img.width - sw) / 2;
          } else {
            sh = img.width / canvasRatio;
            sy = (img.height - sh) / 2;
          }
          ctx!.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
          ctx!.restore();

          // Soft edge halo outside clip (semi-transparent for feathered look)
          ctx!.globalAlpha = 0.15;
          ctx!.save();
          ctx!.beginPath();
          for (const d of drops) {
            if (d.r > 1) traceBlobPath(ctx!, d.x, d.y, d.r * 1.12, d.phase, d.wobble, elapsed);
            for (const s of d.subs) {
              if (s.r > 1) traceBlobPath(ctx!, s.x, s.y, s.r * 1.15, s.phase, s.wobble, elapsed);
            }
          }
          ctx!.clip();
          ctx!.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
          ctx!.restore();
          ctx!.globalAlpha = 1;

          if (allDone || elapsed > 4000 / speed) {
            done = true;
            // Final full draw
            ctx!.clearRect(0, 0, w, h);
            ctx!.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
            onComplete?.();
            return;
          }
          animId = requestAnimationFrame(frame);
        }
        animId = requestAnimationFrame(frame);
      };
      img.onerror = () => {
        // Fallback: just call complete
        onComplete?.();
      };
      img.src = imageSrc || '';
    } else {
      // ─── Erase mode (original): solid bg, erase to reveal ───
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      const drops = createDrops(w, h, speed);
      const t0 = performance.now();

      function frame(now: number) {
        if (done) return;
        const elapsed = now - t0;

        ctx!.globalCompositeOperation = 'destination-out';
        ctx!.fillStyle = 'black';

        const allDone = stepDrops(drops, elapsed, w, h);

        for (const d of drops) {
          drawBlob(ctx!, d.x, d.y, d.r * 1.12, d.phase, d.wobble, elapsed, 0.25);
          drawBlob(ctx!, d.x, d.y, d.r, d.phase, d.wobble, elapsed, 1);
          for (const s of d.subs) {
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
    }

    return () => { done = true; cancelAnimationFrame(animId); };
  }, [mode, bgColor, imageSrc, speed, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', zIndex: 2,
        ...style,
      }}
    />
  );
}
