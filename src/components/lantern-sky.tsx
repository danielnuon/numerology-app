"use client";

/**
 * LanternSky
 *
 * The page's backdrop: a dusk gradient with a few dozen specks of dust
 * drifting slowly upward through lantern light. Purely decorative, so it is
 * hidden from assistive tech and never takes pointer events. With Reduce
 * Motion the dust is drawn once and stays still. Drawing pauses while the
 * tab is hidden.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const MOTE_COUNT = 38;

interface Mote {
  x: number;
  y: number;
  radius: number;
  driftX: number;
  driftY: number;
  alpha: number;
  phase: number;
}

function seedMotes(): Mote[] {
  return Array.from({ length: MOTE_COUNT }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: 0.6 + Math.random() * 1.6,
    // Fractions of the viewport per millisecond: rising across the screen
    // takes 20 to 60 seconds.
    driftX: (Math.random() - 0.5) * 0.00003,
    driftY: -0.000017 - Math.random() * 0.000033,
    alpha: 0.15 + Math.random() * 0.35,
    phase: Math.random() * Math.PI * 2,
  }));
}

export function LanternSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const motes = seedMotes();
    let frame = 0;
    let last = performance.now();

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
    }

    function draw(now: number) {
      const elapsed = Math.min(now - last, 100);
      last = now;
      const dpr = window.devicePixelRatio || 1;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const mote of motes) {
        if (!prefersReducedMotion) {
          mote.x += mote.driftX * elapsed;
          mote.y += mote.driftY * elapsed;
          if (mote.y < -0.02) {
            mote.y = 1.02;
            mote.x = Math.random();
          }
        }
        // A slow flicker, as if passing in and out of the light
        const flicker = prefersReducedMotion
          ? 1
          : 0.75 + 0.25 * Math.sin(now / 2400 + mote.phase);
        ctx!.beginPath();
        ctx!.arc(mote.x * canvas!.width, mote.y * canvas!.height, mote.radius * dpr, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(240, 205, 140, ${mote.alpha * flicker})`;
        ctx!.fill();
      }
      if (!prefersReducedMotion && !document.hidden) {
        frame = requestAnimationFrame(draw);
      }
    }

    function start() {
      cancelAnimationFrame(frame);
      last = performance.now();
      draw(last);
    }

    function handleResize() {
      resize();
      start();
    }

    resize();
    start();
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", start);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", start);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="dusk-sky" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
