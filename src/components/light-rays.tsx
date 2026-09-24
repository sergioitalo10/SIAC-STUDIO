"use client";

import { useEffect, useRef } from "react";

/* ---------- configurações das luzes ---------- */

const CONFIG = {
  rayCount: 55,
  speed: 0.12,
  curl: 0.75,
  twinkle: 0.18,
  warp: 0.6,
  baseHue: 200,
  hueRange: 60,
  palette: [
    [40, 65, 100],
    [20, 75, 140],
    [30, 55, 120],
    [50, 70, 110],
    [25, 60, 130],
  ],
  rayWidth: 1.8,
  raySoftness: 7,
  height: 140,
  opacity: 0.62,
};

export default function LightRays() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: false });
    if (!ctx) return;

    let raf: number;
    const frame = () => {
      tRef.current += 0.005;
      draw(ctx, canvas.width, canvas.height, tRef.current);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    animRef.current = raf;
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
      }
    });
    const canvas = canvasRef.current;
    if (canvas) ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="light-rays"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: CONFIG.height,
        pointerEvents: "none",
        opacity: CONFIG.opacity,
        zIndex: 1,
        overflow: "hidden",
      }}
    />
  );
}

/* ---------- render ---------- */

function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const dpr = window.devicePixelRatio || 1;
  const cw = w / dpr;
  const ch = h / dpr;

  ctx.clearRect(0, 0, cw, ch);

  const bg = averagePalette();
  const grad = ctx.createLinearGradient(0, ch, 0, 0);
  grad.addColorStop(0, `rgba(${bg[0]}, ${bg[1]}, ${bg[2]}, 1)`);
  grad.addColorStop(CONFIG.height / ch, `rgba(${bg[0]}, ${bg[1]}, ${bg[2]}, 0.55)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cw, ch);

  const baseHue = CONFIG.baseHue + Math.sin(t * 0.12) * CONFIG.hueRange * 0.5;
  const palette = CONFIG.palette;

  for (let i = 0; i < CONFIG.rayCount; i++) {
    const frac = i / CONFIG.rayCount;
    const seed = hash(frac * 1000 + i * 7);
    const twist = Math.sin(t * 0.07 + frac * 12) * CONFIG.warp;

    const originX = cw * (0.5 + Math.sin(frac * 12 + t * 0.1) * 0.18 + twist * 0.04);
    const originY = ch * (0.25 + Math.sin(frac * 8 + t * 0.15) * 0.12);

    const angle = (frac * Math.PI * 2) + Math.sin(t * 0.05 + i * 0.3) * 0.5 + twist * 0.2;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    const rayLen = cw * (0.9 + Math.sin(t * 0.1 + frac * 7) * 0.15);

    const palIdx = Math.floor(frac * palette.length) % palette.length;
    const palNext = (palIdx + 1) % palette.length;
    const mix = (frac * palette.length) % 1;
    const r = lerp(palette[palIdx][0], palette[palNext][0], mix);
    const g = lerp(palette[palIdx][1], palette[palNext][1], mix);
    const b = lerp(palette[palIdx][2], palette[palNext][2], mix);

    const alphaBase = 0.04 + seed * 0.06;
    const alphaTwinkle = Math.sin(t * 2.1 + i * 1.7 + frac * 30) * CONFIG.twinkle;
    const alpha = Math.max(0.01, alphaBase + alphaTwinkle);

    const spread = CONFIG.rayWidth + Math.sin(t * 0.08 + i * 0.5) * CONFIG.raySoftness;

    const endX = originX + dx * rayLen;
    const endY = originY + dy * rayLen;

    const steps = Math.max(40, Math.floor(rayLen / 6));
    const pts: [number, number][] = [];
    for (let s = 0; s <= steps; s++) {
      const k = s / steps;
      const px = originX + dx * rayLen * k;
      const py = originY + dy * rayLen * k;
      pts.push([px, py]);
    }

    const hue = (baseHue + frac * 40 + Math.sin(t * 0.13 + i * 0.4) * 25) % 360;

    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let s = 1; s < pts.length; s++) {
      const px = pts[s][0];
      const py = pts[s][1];
      const cpx = px + (Math.sin(t * 0.1 + s * 0.3 + i) * CONFIG.curl * 6);
      const cpy = py + (Math.cos(t * 0.08 + s * 0.2 + i * 0.5) * CONFIG.curl * 4);
      ctx.quadraticCurveTo(cpx, cpy, px, py);
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = `hsla(${hue}, 88%, 72%, ${alpha})`;
    ctx.lineWidth = spread;
    ctx.globalCompositeOperation = "lighter";
    ctx.stroke();

    const glow = ctx.createRadialGradient(originX, originY, 0, originX, originY, spread * 4);
    glow.addColorStop(0, `hsla(${hue}, 88%, 80%, ${alpha * 0.7})`);
    glow.addColorStop(0.4, `hsla(${hue}, 88%, 70%, ${alpha * 0.25})`);
    glow.addColorStop(1, `hsla(${hue}, 88%, 60%, 0)`);
    ctx.beginPath();
    ctx.arc(originX, originY, spread * 4, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.globalCompositeOperation = "lighter";
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";

    const tipGlow = ctx.createRadialGradient(endX, endY, 0, endX, endY, spread * 1.5);
    tipGlow.addColorStop(0, `hsla(${hue}, 90%, 85%, ${alpha * 0.5})`);
    tipGlow.addColorStop(1, `hsla(${hue}, 90%, 70%, 0)`);
    ctx.beginPath();
    ctx.arc(endX, endY, spread * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = tipGlow;
    ctx.globalCompositeOperation = "lighter";
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  const soft = ctx.createLinearGradient(0, 0, 0, ch);
  soft.addColorStop(0, "rgba(15, 20, 35, 0.55)");
  soft.addColorStop(0.45, "rgba(15, 20, 35, 0.12)");
  soft.addColorStop(1, "rgba(15, 20, 35, 0)");
  ctx.fillStyle = soft;
  ctx.fillRect(0, 0, cw, ch);

  const cutoff = ctx.createLinearGradient(0, ch * 0.72, 0, ch);
  cutoff.addColorStop(0, "rgba(8, 12, 22, 0)");
  cutoff.addColorStop(1, "rgba(8, 12, 22, 0.7)");
  ctx.fillStyle = cutoff;
  ctx.fillRect(0, 0, cw, ch);
}

/* ---------- helpers ---------- */

function hash(n: number): number {
  const x = Math.sin(n * 12.9898 + n * 78.233) * 43758.5453;
  return Math.abs(x - Math.floor(x));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function averagePalette(): [number, number, number] {
  let r = 0, g = 0, b = 0;
  for (const p of CONFIG.palette) {
    r += p[0];
    g += p[1];
    b += p[2];
  }
  return [Math.round(r / CONFIG.palette.length), Math.round(g / CONFIG.palette.length), Math.round(b / CONFIG.palette.length)];
}
