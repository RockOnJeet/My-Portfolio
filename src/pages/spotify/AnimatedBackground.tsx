import { useEffect, useRef } from "react";
import bgSettings from "./bgSettings.json";

const OVERSCAN = 1.4;
const OVERSCAN_PCT = `${OVERSCAN * 100}%`;

interface AnimatedBackgroundProps {
  albumArtSrc: string;
  rotationSpeedDeg?: number;
  saturation?: number;
  blur?: number;
  brightness?: number;
}

export function AnimatedBackground({
  albumArtSrc,
  rotationSpeedDeg = bgSettings.animationSpeedDeg,
  saturation = bgSettings.saturation,
  blur = bgSettings.blur,
  brightness = bgSettings.brightness,
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = albumArtSrc;

    let animationFrameId: number | undefined;
    let angle = 0;
    let lastTime = 0;
    let running = false;

    const dpr = window.devicePixelRatio || 1;

    const syncCanvasSize = () => {
      const containerW = container.offsetWidth;
      const containerH = container.offsetHeight;
      const bufW = Math.round(containerW * OVERSCAN * dpr);
      const bufH = Math.round(containerH * OVERSCAN * dpr);

      if (canvas.width !== bufW || canvas.height !== bufH) {
        canvas.width = bufW;
        canvas.height = bufH;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    const render = (timeMs: number) => {
      if (!running) return;
      const dt = Math.min((timeMs - lastTime) / 1000, 0.1);
      lastTime = timeMs;
      angle = (angle + rotationSpeedDeg * dt) % 360;

      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;

      ctx.clearRect(0, 0, cw, ch);
      ctx.save();
      ctx.translate(cw / 2, ch / 2);
      ctx.rotate((angle * Math.PI) / 180);

      const diagonal = Math.sqrt(cw ** 2 + ch ** 2);
      const imgW = img.naturalWidth || img.width || 1;
      const imgH = img.naturalHeight || img.height || 1;
      const shortSide = Math.min(imgW, imgH);
      const scale = (diagonal / shortSide) * 1.15;
      const drawW = imgW * scale;
      const drawH = imgH * scale;

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(render);
    };

    const ro = new ResizeObserver(syncCanvasSize);
    ro.observe(container);
    syncCanvasSize();

    img.onload = startLoop;
    if (img.complete && img.naturalWidth > 0) startLoop();

    return () => {
      running = false;
      ro.disconnect();
      if (animationFrameId !== undefined) cancelAnimationFrame(animationFrameId);
    };
  }, [albumArtSrc, rotationSpeedDeg]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: OVERSCAN_PCT,
          height: OVERSCAN_PCT,
          filter: `blur(${blur}px) brightness(${brightness}) saturate(${saturation})`,
        }}
      />
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
