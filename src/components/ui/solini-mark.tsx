"use client";

/**
 * SoliniMark
 *
 * Solini's logo, the woven flame: twelve weft threads, one for each year of
 * the cycle, laid one above the next so that together they make a flame,
 * with one year's thread lit. The threads follow chong kiet, Khmer ikat, in
 * which the pattern is dyed into the weft before the cloth is woven.
 *
 * The cycle counts up the flame, as the weave is laid: the bottom thread is
 * the first year, the year of birth, and the tip the twelfth. On its own the
 * mark lights the first year, the one made from the birth date itself.
 * "year" lights another, as the home page does with the visitor's year now.
 *
 * The flame is a living surface and never quite still. The whole flame
 * drifts slowly from side to side, its threads sway in a ripple that climbs
 * from the base to the tip, and the lit thread's glow breathes.
 * "woven" plays the entrance: the threads are laid from the bottom up, as
 * weft is on a loom, then the lit thread kindles. "reactive" lets the flame
 * answer movement: it leans toward the pointer or, on a phone, stays upright
 * as the phone tilts, and stretches or squats as the page scrolls, through a
 * slow spring (FLAME_MOTION). iPhones only share their tilt after a tap, so
 * there the flame is a button that asks once. Like the sky's
 * scroll weight, the movement is written by seeking paused animations, and
 * only while something moves. With Reduce Motion the mark is simply there,
 * lit and still.
 *
 * src/app/icon.svg draws the same threads; a test keeps the two in step.
 */

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import {
  FLAME_MOTION,
  flameLean,
  flameStretch,
  flameTilt,
  stepFlameSpring,
  stepScrollSpring,
} from "@/lib/motion";

/** One thread on a 64×64 viewBox: its left edge, top edge and length. */
export type MarkThread = { x: number; y: number; width: number };

/** Thread thickness; the ends are fully rounded. */
export const MARK_THREAD_HEIGHT = 2.8;

/** The twelve threads, top (the flame's tip) to bottom (its base). */
export const MARK_THREADS: readonly MarkThread[] = [
  { x: 39.69, y: 7.68, width: 4.0 },
  { x: 36.49, y: 11.85, width: 5.61 },
  { x: 32.14, y: 16.02, width: 10.09 },
  { x: 27.91, y: 20.18, width: 14.86 },
  { x: 23.83, y: 24.35, width: 19.84 },
  { x: 19.93, y: 28.52, width: 24.98 },
  { x: 16.19, y: 32.68, width: 30.28 },
  { x: 12.62, y: 36.85, width: 35.69 },
  { x: 10.99, y: 41.02, width: 37.67 },
  { x: 11.62, y: 45.18, width: 35.51 },
  { x: 13.65, y: 49.35, width: 30.93 },
  { x: 17.77, y: 53.52, width: 22.48 },
];

/** The thread for a year of the cycle (0 is the first year), counted up from the base. */
export function markThread(year: number) {
  return MARK_THREADS.length - 1 - (((year % 12) + 12) % 12);
}

/** The thread the mark lights on its own: the bottom one, the first year. */
export const MARK_LIT_THREAD = markThread(0);

/** When the weave's light has kindled; a later change of year kindles at once. */
const KINDLED_MS = 1950;

/** How far apart the threads start weaving, bottom thread first. */
const WEAVE_STAGGER_MS = 70;

/**
 * The sway of thread `i`: the tip moves most and the base least, and each
 * thread starts a little later than the one below, so the ripple climbs.
 */
export function threadSway(i: number) {
  const height = 1 - i / (MARK_THREADS.length - 1);
  return {
    "--sway": `${(0.25 + 1.65 * height ** 1.5).toFixed(2)}px`,
    "--sway-duration": `${(2.6 + (i % 3) * 0.35).toFixed(2)}s`,
    "--sway-delay": `${(-i * 0.32).toFixed(2)}s`,
  };
}

/** The two threads that become the menu's close mark: the lit one and the one above it. */
export const MENU_CLOSE_THREADS = [MARK_LIT_THREAD - 1, MARK_LIT_THREAD] as const;

/** How long each stroke of the close mark is, across the 64-unit icon. */
const CLOSE_STROKE = 44;

/**
 * Where thread `i` goes when the flame in the Menu button turns into a close
 * mark (`.menu-thread` in globals.css). The lit thread and the one above it
 * swing to the center and cross; the rest fade away up the flame, nearest
 * the lit thread first, and come back in the reverse order on close.
 */
export function menuThreadClose(i: number) {
  const { x, y, width } = MARK_THREADS[i];
  const step = Math.abs(i - MARK_LIT_THREAD);
  if (i === MENU_CLOSE_THREADS[0] || i === MENU_CLOSE_THREADS[1]) {
    const dx = (32 - (x + width / 2)).toFixed(2);
    const dy = (32 - (y + MARK_THREAD_HEIGHT / 2)).toFixed(2);
    const angle = i === MARK_LIT_THREAD ? 45 : -45;
    return {
      "--open": `translate(${dx}px, ${dy}px) rotate(${angle}deg) scaleX(${(CLOSE_STROKE / width).toFixed(3)})`,
      "--open-opacity": "1",
      "--open-delay": "80ms",
      "--close-delay": "0ms",
    };
  }
  return {
    "--open": `translateY(${((32 - y) * 0.35).toFixed(2)}px) scaleX(0.4)`,
    "--open-opacity": "0",
    "--open-delay": `${step * 18}ms`,
    "--close-delay": `${step * 18 + 60}ms`,
  };
}

/**
 * The threads that leave the Menu button's flame to become the menu's link
 * underlines, top link first: the five above the close mark, tip to base, so
 * the top thread lands on the top link.
 */
export const MENU_LINK_THREADS = [2, 3, 4, 5, 6] as const;

/** Settled closer than this, the flame holds still and nothing is written. */
const REST = 0.01;

/** Whether this browser shares the phone's tilt, and if it must ask first. */
type TiltAccess = "none" | "ask" | "on";

type OrientationPermission = { requestPermission?: () => Promise<"granted" | "denied"> };

function orientationEvent(): OrientationPermission | undefined {
  return typeof window !== "undefined" && "DeviceOrientationEvent" in window
    ? (window.DeviceOrientationEvent as unknown as OrientationPermission)
    : undefined;
}

/** What the browser offers; it never changes while the page is open. */
function tiltSupport(): TiltAccess {
  const event = orientationEvent();
  if (!event) return "none";
  return typeof event.requestPermission === "function" ? "ask" : "on";
}

const noSubscription = () => () => {};

export function SoliniMark({
  woven = false,
  reactive = false,
  year = 0,
  className = "",
}: {
  woven?: boolean;
  reactive?: boolean;
  /** The year of the cycle to light, from 0 (the year of birth) to 11. */
  year?: number;
  className?: string;
}) {
  const glowId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const leanRef = useRef<SVGGElement>(null);
  const stretchRef = useRef<SVGGElement>(null);
  const prefersReducedMotion = useReducedMotion();
  // Read on the client only ("none" on the server), so the two agree.
  const support = useSyncExternalStore(noSubscription, tiltSupport, () => "none" as const);
  const [answer, setAnswer] = useState<"unasked" | "granted" | "denied">("unasked");
  // Once the entrance has played, a newly lit year kindles without waiting.
  const [kindled, setKindled] = useState(!woven);
  useEffect(() => {
    if (!woven) return;
    const timer = setTimeout(() => setKindled(true), KINDLED_MS);
    return () => clearTimeout(timer);
  }, [woven]);
  const tilt: TiltAccess =
    !reactive || prefersReducedMotion || support === "none"
      ? "none"
      : support === "on" || answer === "granted"
        ? "on"
        : answer === "denied"
          ? "none"
          : "ask";

  function askForTilt() {
    orientationEvent()
      ?.requestPermission?.()
      .then((result) => setAnswer(result === "granted" ? "granted" : "denied"))
      .catch(() => setAnswer("denied"));
  }

  useEffect(() => {
    const svg = svgRef.current;
    const leanGroup = leanRef.current;
    const stretchGroup = stretchRef.current;
    if (!reactive || prefersReducedMotion || !svg || !leanGroup || !stretchGroup) return;
    // Without Web Animations the flame still sways; it just doesn't respond.
    if (typeof leanGroup.animate !== "function") return;

    // One paused animation per axis, across its whole range; a frame only
    // seeks it, which is cheaper than rewriting an inline style.
    const { maxLean, maxStretch } = FLAME_MOTION;
    const leanAnimation = leanGroup.animate(
      [{ transform: `skewX(${maxLean}deg)` }, { transform: `skewX(${-maxLean}deg)` }],
      { duration: 2000, fill: "both", easing: "linear" }
    );
    const stretchAnimation = stretchGroup.animate(
      [{ transform: `scaleY(${1 - maxStretch})` }, { transform: `scaleY(${1 + maxStretch})` }],
      { duration: 2000, fill: "both", easing: "linear" }
    );
    leanAnimation.pause();
    stretchAnimation.pause();
    leanAnimation.currentTime = 1000;
    stretchAnimation.currentTime = 1000;

    const lean = { value: 0, velocity: 0 };
    const stretch = { value: 0, velocity: 0 };
    const scroll = { position: window.scrollY, velocity: 0 };
    let pointerLean = 0;
    let tiltLean = 0;
    let leanTarget = 0;
    let frame = 0;
    let last = 0;

    function tick(now: number) {
      const dt = last ? (now - last) / 1000 : 1 / 60;
      last = now;
      const trail = stepScrollSpring(scroll, window.scrollY, dt);
      stepFlameSpring(lean, leanTarget, dt);
      stepFlameSpring(stretch, flameStretch(trail), dt);
      // The lean range runs from skewX(+max), top to the left, to skewX(-max).
      leanAnimation.currentTime = 1000 + (lean.value / maxLean) * 1000;
      stretchAnimation.currentTime = 1000 + (stretch.value / maxStretch) * 1000;
      const moving =
        Math.abs(trail) > 0.05 ||
        Math.abs(lean.value - leanTarget) > REST ||
        Math.abs(stretch.value) > REST / 10 ||
        Math.abs(lean.velocity) + Math.abs(stretch.velocity) > REST;
      frame = moving ? requestAnimationFrame(tick) : 0;
      if (!moving) last = 0;
    }

    function wake() {
      leanTarget = Math.max(-maxLean, Math.min(maxLean, pointerLean + tiltLean));
      if (!frame) frame = requestAnimationFrame(tick);
    }

    // The flame leans toward a mouse or pen; a finger on a touch screen is
    // scrolling, so only the scroll moves it there.
    function handlePointer(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const box = svg!.getBoundingClientRect();
      pointerLean = flameLean(event.clientX, box.left + box.width / 2, window.innerWidth);
      wake();
    }

    function handleLeave() {
      pointerLean = 0;
      wake();
    }

    function handleTilt(event: DeviceOrientationEvent) {
      const next = flameTilt(event.beta, event.gamma, window.screen.orientation?.angle ?? 0);
      if (Math.abs(next - tiltLean) < 0.05) return;
      tiltLean = next;
      wake();
    }

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("pointermove", handlePointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);
    if (tilt === "on") window.addEventListener("deviceorientation", handleTilt);
    return () => {
      window.removeEventListener("deviceorientation", handleTilt);
      cancelAnimationFrame(frame);
      leanAnimation.cancel();
      stretchAnimation.cancel();
      window.removeEventListener("scroll", wake);
      window.removeEventListener("pointermove", handlePointer);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    };
  }, [reactive, prefersReducedMotion, tilt]);

  const litThread = markThread(year);
  const lit = MARK_THREADS[litThread];
  const last = MARK_THREADS.length - 1;
  const rx = MARK_THREAD_HEIGHT / 2;
  const mark = (
    <svg
      ref={svgRef}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={`solini-mark ${woven ? "mark-woven" : ""} ${className}`}
    >
      <defs>
        <filter id={glowId} x="-20%" y="-300%" width="140%" height="700%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <g ref={leanRef} className="mark-base">
        <g ref={stretchRef} className="mark-base">
          <g className="mark-base mark-drift">
            {MARK_THREADS.map((thread, i) => (
              <g key={i} className="mark-sway" style={threadSway(i) as React.CSSProperties}>
                <rect
                  className="mark-thread fill-gold"
                  fillOpacity={0.72}
                  x={thread.x}
                  y={thread.y}
                  width={thread.width}
                  height={MARK_THREAD_HEIGHT}
                  rx={rx}
                  style={{ "--weave-delay": `${(last - i) * WEAVE_STAGGER_MS}ms` } as React.CSSProperties}
                />
                {i === litThread && (
                  <g
                    className="mark-light"
                    style={kindled ? ({ "--kindle-delay": "0ms" } as React.CSSProperties) : undefined}
                  >
                    <rect
                      className="mark-glow fill-gold-deep"
                      filter={`url(#${glowId})`}
                      x={lit.x}
                      y={lit.y - 1}
                      width={lit.width}
                      height={MARK_THREAD_HEIGHT + 2}
                      rx={rx + 1}
                    />
                    <rect
                      className="fill-gold-light"
                      x={lit.x}
                      y={lit.y}
                      width={lit.width}
                      height={MARK_THREAD_HEIGHT}
                      rx={rx}
                    />
                  </g>
                )}
              </g>
            ))}
          </g>
        </g>
      </g>
    </svg>
  );
  if (!reactive) return mark;
  // The wrapper never changes, so the flame isn't redrawn (and rewoven) when
  // the tilt button comes or goes.
  return (
    <span className="relative inline-flex">
      {mark}
      {tilt === "ask" && (
        <button
          type="button"
          onClick={askForTilt}
          aria-label="Let the flame follow your phone's tilt"
          className="pressable absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full active:scale-[0.97] active:bg-gold-deep/10"
        />
      )}
    </span>
  );
}
