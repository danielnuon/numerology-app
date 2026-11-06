"use client";

/**
 * LanternSky
 *
 * The page's backdrop: soft lantern glows that rise more slowly than the
 * page as it scrolls, with a few dozen specks of dust drifting slowly upward
 * through the light. Purely decorative, so it is
 * hidden from assistive tech and never takes pointer events.
 *
 * The dust is drawn in a worker on an OffscreenCanvas (`dust.worker.ts`), so
 * the main thread does nothing while the page is at rest. Where a browser
 * can't hand a canvas to a worker, it is drawn here, every frame, as before.
 *
 * It also gives the page its scroll weight: one spring trails the scroll
 * position (stepScrollSpring), and the glows and every glass card lag
 * behind a fast scroll by a few pixels, then settle. The dust drifts a
 * little with the scroll too. Only `translate` moves, through paused
 * animations that each frame seeks, on the cards on screen. The loop runs
 * only while the spring is moving: a scroll wakes it, and it stops once
 * everything has settled.
 *
 * With Reduce Motion the dust is drawn once, nothing trails and nothing
 * loops. Drawing pauses while the tab is hidden.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { SCROLL_WEIGHT, stepScrollSpring } from "@/lib/motion";
import { type DustMessage, drawMotes, driftMotes, seedMotes, slideMotes } from "@/lib/dust";

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

/** Whether this browser can draw the dust off the main thread. */
function canDrawInWorker(canvas: HTMLCanvasElement): boolean {
  return typeof Worker === "function" && typeof canvas.transferControlToOffscreen === "function";
}

/**
 * The dust, drawn in a worker where the browser allows it and here
 * otherwise. Both take the same messages.
 */
function startDust(canvas: HTMLCanvasElement, still: boolean): { send: (message: DustMessage) => void; stop: () => void } {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const dpr = canvasScale();

  if (canDrawInWorker(canvas)) {
    let worker: Worker | null = null;
    try {
      // The worker is made before the canvas is handed over, so if it can't
      // start (a strict content policy, say), the dust is drawn here instead.
      worker = new Worker(new URL("./dust.worker.ts", import.meta.url), { type: "module" });
      const offscreen = canvas.transferControlToOffscreen();
      const start: DustMessage = { type: "start", canvas: offscreen, width, height, dpr, still };
      worker.postMessage(start, [offscreen]);
      const running = worker;
      return { send: (message) => running.postMessage(message), stop: () => running.terminate() };
    } catch {
      worker?.terminate();
    }
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return { send: () => {}, stop: () => {} };
  const motes = seedMotes();
  let scale = dpr;
  let cssHeight = height;
  let frame = 0;
  let last = 0;
  let visible = true;
  const size = (w: number, h: number, s: number) => {
    scale = s;
    cssHeight = h;
    canvas.width = Math.round(w * s);
    canvas.height = Math.round(h * s);
  };
  const draw = (now: number) => {
    frame = 0;
    const elapsed = Math.min(now - (last || now), 100);
    last = now;
    if (!still) driftMotes(motes, elapsed);
    drawMotes(ctx, motes, scale, now, still);
    if (!still && visible) frame = requestAnimationFrame(draw);
  };
  const restart = () => {
    cancelAnimationFrame(frame);
    last = 0;
    draw(performance.now());
  };
  size(width, height, dpr);
  restart();
  return {
    send(message) {
      if (message.type === "resize") {
        size(message.width, message.height, message.dpr);
        restart();
      } else if (message.type === "scroll") {
        slideMotes(motes, message.scrolled, cssHeight);
      } else if (message.type === "visible") {
        visible = message.visible;
        if (visible) restart();
        else cancelAnimationFrame(frame);
      }
    },
    stop: () => cancelAnimationFrame(frame),
  };
}

export function LanternSky() {
  const skyRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const sky = skyRef.current;
    if (!sky) return;

    // A canvas handed to a worker can't be handed over again, so each run of
    // this effect draws on a canvas of its own.
    const canvas = document.createElement("canvas");
    sky.append(canvas);
    const dust = startDust(canvas, Boolean(prefersReducedMotion));

    let frame = 0;
    let last = 0;
    const spring = { position: window.scrollY, velocity: 0 };
    let lastScroll = window.scrollY;
    let cardTrail = 0;
    // Each moving element gets one paused animation across the whole range
    // of offsets; a frame only seeks it. Seeking an animation is cheaper for
    // the browser than rewriting an inline style, which would also throw
    // away the cached style of the glows' own CSS animations.
    const RANGE = SCROLL_WEIGHT.maxLag;
    const offsets = new WeakMap<HTMLElement, { animation: Animation; px: number }>();
    const glows = Array.from(sky.querySelectorAll<HTMLElement>(".sky-glow"));
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
    // Returns whether anything is still moving.
    function applyWeight(dt: number, now: number): boolean {
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
        dust.send({ type: "scroll", scrolled });
      }

      return (
        scrolled !== 0 ||
        Math.abs(trail) > REST ||
        Math.abs(spring.velocity) > REST ||
        Math.abs(cardTrail) > REST
      );
    }

    function tick(now: number) {
      const dt = last ? Math.min(now - last, 100) / 1000 : 1 / 60;
      last = now;
      const moving = applyWeight(dt, now);
      frame = moving && !document.hidden ? requestAnimationFrame(tick) : 0;
      if (!frame) last = 0;
    }

    // A scroll wakes the weight; it runs until the page has settled
    function wake() {
      if (!frame && !prefersReducedMotion) frame = requestAnimationFrame(tick);
    }

    // Match the canvas to its box, which is the large viewport (taller than
    // innerHeight while mobile toolbars are showing).
    function handleResize() {
      dust.send({ type: "resize", width: canvas.clientWidth, height: canvas.clientHeight, dpr: canvasScale() });
    }

    function handleVisibility() {
      // Coming back to the tab, the page is where it is: nothing to catch up on
      spring.position = lastScroll = window.scrollY;
      spring.velocity = 0;
      dust.send({ type: "visible", visible: !document.hidden });
    }

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelAnimationFrame(frame);
      dust.stop();
      canvas.remove();
      [...glows, ...cards].forEach((el) => offsets.get(el)?.animation.cancel());
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={skyRef} className="dusk-sky" aria-hidden="true">
      <div className="sky-glow sky-glow-dusk" />
      <div className="sky-glow sky-glow-lantern" />
      <div className="sky-glow sky-glow-ember" />
    </div>
  );
}
