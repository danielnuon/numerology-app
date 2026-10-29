"use client";

/**
 * LanternSky
 *
 * The page's backdrop: soft lantern glows that rise more slowly than the
 * page as it scrolls, with a few dozen specks of dust drifting slowly upward
 * through the light. Purely decorative, so it is
 * hidden from assistive tech and never takes pointer events.
 *
 * It also gives the page its scroll weight: one spring trails the scroll
 * position (stepScrollSpring), and the glows and every glass card lag
 * behind a fast scroll by a few pixels, then settle. The dust drifts a
 * little with the scroll too. Only `translate` moves, through paused
 * animations that each frame seeks, on the cards on screen, and only while
 * something moves.
 *
 * With Reduce Motion the dust is drawn once, nothing trails and the loop
 * stops. Drawing pauses while the tab is hidden.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { SCROLL_WEIGHT, stepScrollSpring } from "@/lib/motion";

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

/**
 * Pixels per CSS pixel for the dust canvas. Specks this soft look the same
 * at 2x as at 3x, and a 3x phone would otherwise clear and redraw more than
 * twice the pixels every frame.
 */
function canvasScale(): number {
  return Math.min(window.devicePixelRatio || 1, 2);
}

/** Settled closer than this (in pixels), the page holds still and nothing is written. */
const REST = 0.05;

/** How much of the scroll lag each glow takes (dusk, lantern, ember): nearer lights trail more. */
const GLOW_LAG_SHARE = [0.4, 0.55, 0.15];

export function LanternSky() {
  const skyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const sky = skyRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const motes = seedMotes();
    let frame = 0;
    let last = performance.now();
    const spring = { position: window.scrollY, velocity: 0 };
    let lastScroll = window.scrollY;
    let cardTrail = 0;
    // Each moving element gets one paused animation across the whole range
    // of offsets; a frame only seeks it. Seeking an animation is cheaper for
    // the browser than rewriting an inline style, which would also throw
    // away the cached style of the glows' own CSS animations.
    const RANGE = SCROLL_WEIGHT.maxLag;
    const offsets = new WeakMap<HTMLElement, { animation: Animation; px: number }>();
    const glows = Array.from(sky?.querySelectorAll<HTMLElement>(".sky-glow") ?? []);
    let cards: HTMLElement[] = [];
    let cardsFoundAt = -Infinity;

    function write(el: HTMLElement, px: number) {
      const rounded = Math.abs(px) > REST ? Math.round(px * 10) / 10 : 0;
      let offset = offsets.get(el);
      if (!offset) {
        if (rounded === 0) return;
        const animation = el.animate(
          [{ translate: `0 ${-RANGE}px` }, { translate: `0 ${RANGE}px` }],
          { duration: RANGE * 2, fill: "both", easing: "linear" }
        );
        animation.pause();
        offset = { animation, px: NaN };
        offsets.set(el, offset);
      }
      if (offset.px === rounded) return;
      offset.px = rounded;
      offset.animation.currentTime = rounded + RANGE;
    }

    // Only the cards on screen drift; the list is refreshed a few times a
    // second so cards that arrive (the reading, a partner) join in.
    function visibleCards(now: number) {
      if (now - cardsFoundAt > 250) {
        cardsFoundAt = now;
        cards.forEach((card) => write(card, 0));
        cards = Array.from(document.querySelectorAll<HTMLElement>(".glass")).filter((card) => {
          const box = card.getBoundingClientRect();
          return box.bottom > -100 && box.top < window.innerHeight + 100;
        });
      }
      return cards;
    }

    // Weight: each glow trails the spring by its share of the lag, and the
    // cards drift with a softer copy of it, every third card a touch more.
    function applyWeight(dt: number, now: number) {
      const scroll = window.scrollY;
      const trail = stepScrollSpring(spring, scroll, dt);
      cardTrail += (trail - cardTrail) * Math.min(1, dt * 10);

      glows.forEach((glow, i) => write(glow, trail * GLOW_LAG_SHARE[i]));
      if (Math.abs(cardTrail) > REST || cards.length > 0) {
        visibleCards(now).forEach((card, i) => {
          const depth = 1 + (i % 3) * 0.25;
          const offset = Math.max(
            -SCROLL_WEIGHT.cardDrift,
            Math.min(SCROLL_WEIGHT.cardDrift, cardTrail * SCROLL_WEIGHT.cardDriftPerPx * depth)
          );
          write(card, offset);
        });
        if (Math.abs(cardTrail) <= REST) {
          cards.forEach((card) => write(card, 0));
          cards = [];
          cardsFoundAt = -Infinity;
        }
      }

      // The dust is nearer than the glows, so it slides a little with the page
      const scrolled = scroll - lastScroll;
      lastScroll = scroll;
      if (scrolled !== 0 && Math.abs(scrolled) < SCROLL_WEIGHT.snapDistance) {
        const height = canvas!.clientHeight || 1;
        for (const mote of motes) mote.y -= (scrolled / height) * 0.08 * (mote.radius / 2.2);
      }
    }

    // Match the canvas to its box, which is the large viewport (taller than
    // innerHeight while mobile toolbars are showing).
    function resize() {
      const dpr = canvasScale();
      canvas!.width = canvas!.clientWidth * dpr;
      canvas!.height = canvas!.clientHeight * dpr;
    }

    function draw(now: number) {
      const elapsed = Math.min(now - last, 100);
      last = now;
      if (!prefersReducedMotion) applyWeight(elapsed / 1000, now);
      const dpr = canvasScale();
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const mote of motes) {
        if (!prefersReducedMotion) {
          mote.x += mote.driftX * elapsed;
          mote.y += mote.driftY * elapsed;
          if (mote.y < -0.02) {
            mote.y = 1.02;
            mote.x = Math.random();
          } else if (mote.y > 1.02) {
            mote.y = -0.02;
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
      // Coming back to the tab, the page is where it is: nothing to catch up on
      spring.position = lastScroll = window.scrollY;
      spring.velocity = 0;
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
      [...glows, ...cards].forEach((el) => offsets.get(el)?.animation.cancel());
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", start);
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={skyRef} className="dusk-sky" aria-hidden="true">
      <div className="sky-glow sky-glow-dusk" />
      <div className="sky-glow sky-glow-lantern" />
      <div className="sky-glow sky-glow-ember" />
      <canvas ref={canvasRef} />
    </div>
  );
}
