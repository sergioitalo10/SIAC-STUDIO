"use client";

import { useEffect, useRef } from "react";

const CONFIG = {
  speed: 0.55,
  startDate: new Date("2024-01-01"),
  colors1: [
    [80, 55, 120],
    [50, 65, 145],
    [40, 50, 100],
    [90, 60, 130],
    [60, 70, 115],
  ],
  colors2: [
    [220, 80, 95],
    [210, 90, 110],
    [230, 70, 85],
    [200, 85, 100],
    [240, 75, 90],
  ],
  colors3: [
    [50, 90, 120],
    [40, 100, 135],
    [60, 85, 110],
    [35, 95, 125],
    [55, 80, 115],
  ],
  swirlAmp: 1.35,
  swirlFreq: 0.38,
  radialDistort: 0.12,
  gridRes: 36,
  noiseAmp: 0.6,
  timeSpeed: 0.08,
};

export default function AnimatedGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: false });
    if (!ctx) return;

    let raf: number;
    const frame = () => {
      tRef.current += CONFIG.timeSpeed;
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
      className="animated-gradient"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const dpr = window.devicePixelRatio || 1;
  const cw = w / dpr;
  const ch = h / dpr;

  ctx.clearRect(0, 0, cw, ch);

  const baseTime = t * 0.03;
  const sec = (new Date().getTime() / 1000) % 60;

  for (let y = 0; y < ch; y += 2) {
    for (let x = 0; x < cw; x += 2) {
      const nx = x / cw;
      const ny = y / ch;
      const dist = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 2;

      const swirlAngle = dist * CONFIG.swirlFreq * 6 + baseTime;
      const swirlX =
        (nx - 0.5) * Math.cos(swirlAngle * CONFIG.swirlAmp) -
        (ny - 0.5) * Math.sin(swirlAngle * CONFIG.swirlAmp) +
        0.5;
      const swirlY =
        (nx - 0.5) * Math.sin(swirlAngle * CONFIG.swirlAmp) +
        (ny - 0.5) * Math.cos(swirlAngle * CONFIG.swirlAmp) +
        0.5;

      const radial = (swirlX - 0.5) ** 2 + (swirlY - 0.5) ** 2;
      const warp = 1 + radial * CONFIG.radialDistort;

      const warpX = (swirlX - 0.5) * warp + 0.5;
      const warpY = (swirlY - 0.5) * warp + 0.5;

      const tf = (warpX + warpY + baseTime * 0.8) % 1;
      const noise =
        Math.sin(warpX * 12 + warpY * 9 + t * 0.4) * 0.15 * CONFIG.noiseAmp +
        Math.sin(warpX * 7 - warpY * 11 + t * 0.3) * 0.1 * CONFIG.noiseAmp +
        Math.sin((warpX + warpY) * 5 + t * 0.25) * 0.05 * CONFIG.noiseAmp;

      const s1 = Math.sin(tf * Math.PI * 2 * 0.7 + noise);
      const s2 = Math.sin(tf * Math.PI * 2 * 1.1 + noise * 0.7 + 1.2);

      const swatch1 = CONFIG.colors1[Math.floor((s1 * 0.5 + 0.5) * CONFIG.colors1.length) % CONFIG.colors1.length];
      const swatch2 = CONFIG.colors2[Math.floor((s2 * 0.5 + 0.5) * CONFIG.colors2.length) % CONFIG.colors2.length];
      const swatch3 = CONFIG.colors3[Math.floor((s1 * 0.3 + s2 * 0.3 + 0.5) * CONFIG.colors3.length) % CONFIG.colors3.length];

      const mix1 = 0.5 + s1 * 0.15;
      const mix2 = 0.4 + s2 * 0.12;

      const r = Math.round(swatch1[0] * (1 - mix1) + swatch2[0] * mix1);
      const g = Math.round(swatch1[1] * (1 - mix1) + swatch2[1] * mix1);
      const b = Math.round(swatch1[2] * (1 - mix1) + swatch2[2] * mix1);

      const r2 = Math.round(r * (1 - mix2) + swatch3[0] * mix2);
      const g2 = Math.round(g * (1 - mix2) + swatch3[1] * mix2);
      const b2 = Math.round(b * (1 - mix2) + swatch3[2] * mix2);

      const finalR = Math.max(0, Math.min(255, r2));
      const finalG = Math.max(0, Math.min(255, g2));
      const finalB = Math.max(0, Math.min(255, b2));

      ctx.fillStyle = `rgb(${finalR},${finalG},${finalB})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
}
