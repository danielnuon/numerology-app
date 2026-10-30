"use client";

/**
 * The woven flame as the ornament of the long copy pages (About, Our
 * heritage, How your cycle is made, What the numbers mean).
 *
 * WovenDivider: a divider drawn from the flame's twelve threads. It waits as
 * a small flame and, as the page scrolls it up toward the middle of the
 * screen, unweaves: the threads slide apart from the base up and lie end to
 * end as one line, the base thread at the center. Scrolling back weaves the
 * flame again. A divider already on screen when the page opens unweaves
 * once on arrival instead, since the scroll can't carry it.
 *
 * FollowFlame: the flame beside "Solini" at the top of the page lifts off as
 * the page scrolls and settles in the bottom right corner, on a small disc
 * of glass. Its threads light one at a time from the base up as the visitor
 * reads down the page, so it also shows how far they've read.
 *
 * Both are CSS scroll-driven animations (`.weave-*` and `.follow-*` in
 * globals.css): no scroll listener. Without scroll-timeline support, or with
 * Reduce Motion, the divider is the finished line and the follow flame is
 * not shown.
 */

import { useEffect, useRef } from "react";
import { MARK_THREAD_HEIGHT, MARK_THREADS } from "@/components/ui/solini-mark";

/** The divider's drawing: 560 by 48 units, scaled to the width it's given. */
const WEAVE = { width: 560, height: 48, flameScale: 1.1, lineScale: 1.8, gap: 3, lineHeight: 1.6 } as const;

/** Index of the base thread, the first year of the cycle. */
const BASE = MARK_THREADS.length - 1;

/**
 * Where each thread lies once unwoven, and the transform that folds it back
 * into the flame. In the line the base thread sits at the center and the
 * others alternate outward, left then right, climbing the flame.
 */
export const WEAVE_THREADS = (() => {
  const cx = WEAVE.width / 2;
  const cy = WEAVE.height / 2;
  const s = WEAVE.flameScale;
  const lineX: number[] = [];
  let left = cx;
  let right = cx;
  for (let n = 0, i = BASE; i >= 0; n++, i--) {
    const w = MARK_THREADS[i].width * WEAVE.lineScale;
    if (n === 0) {
      lineX[i] = cx - w / 2;
      left = cx - w / 2;
      right = cx + w / 2;
    } else if (n % 2 === 1) {
      left -= WEAVE.gap + w;
      lineX[i] = left;
    } else {
      lineX[i] = right + WEAVE.gap;
      right += WEAVE.gap + w;
    }
  }
  return MARK_THREADS.map((thread, i) => {
    const x = lineX[i];
    const y = cy - WEAVE.lineHeight / 2;
    const width = thread.width * WEAVE.lineScale;
    const flameX = cx - 32 * s + thread.x * s;
    const flameY = cy - 32 * s + thread.y * s;
    // The ends of the line fade out, as the old hairline did
    const fromCenter = Math.abs(x + width / 2 - cx) / cx;
    // The flame holds until the divider is a little above the middle of the
    // screen, so it reads as the logo first. Then the base thread leaves
    // first and each one above follows a little later
    const start = 40 + ((BASE - i) / BASE) * 12;
    return {
      x,
      y,
      width,
      opacity: i === BASE ? 1 : 0.85 - 0.6 * fromCenter,
      flame: `translate(${(flameX - x).toFixed(2)}px, ${(flameY - y).toFixed(2)}px) scale(${((thread.width * s) / width).toFixed(4)}, ${((MARK_THREAD_HEIGHT * s) / WEAVE.lineHeight).toFixed(4)})`,
      range: `cover ${start.toFixed(1)}% cover ${(start + 14).toFixed(1)}%`,
    };
  });
})();

/** How far apart the threads leave when a divider unweaves on arrival, base first. */
const ARRIVE_STAGGER_MS = 60;

export function WovenDivider() {
  const ref = useRef<HTMLDivElement>(null);

  // A divider already on screen when the page opens can't be scrolled
  // through, so the scroll would leave it half woven. It unweaves once, on a
  // clock, instead (`.weave[data-arrive]`).
  useEffect(() => {
    const el = ref.current;
    if (el && el.getBoundingClientRect().top < window.innerHeight) el.dataset.arrive = "true";
  }, []);

  return (
    <div ref={ref} className="weave my-20 mx-auto w-full max-w-[560px]" aria-hidden="true">
      <svg viewBox={`0 0 ${WEAVE.width} ${WEAVE.height}`} className="block w-full overflow-visible">
        {WEAVE_THREADS.map((thread, i) => (
          <rect
            key={i}
            className={`weave-thread ${i === BASE ? "fill-gold-deep" : "fill-gold"}`}
            x={thread.x}
            y={thread.y}
            width={thread.width}
            height={WEAVE.lineHeight}
            rx={WEAVE.lineHeight / 2}
            fillOpacity={thread.opacity}
            style={
              {
                "--flame": thread.flame,
                "--arrive-delay": `${(BASE - i) * ARRIVE_STAGGER_MS}ms`,
                animationRange: thread.range,
              } as React.CSSProperties
            }
          />
        ))}
      </svg>
    </div>
  );
}

/** Marks the flame beside "Solini" that the follow flame lifts off from (InfoPage). */
const FOLLOW_FROM_ATTR = "data-follow-from";

/**
 * Which slice of the page's scroll lights thread `i`. The base thread is lit
 * from the start, as on the mark itself; the eleven above it share the page.
 */
export function followThreadRange(i: number) {
  const step = 100 / BASE;
  const year = BASE - i;
  return `${((year - 1) * step).toFixed(2)}% ${(year * step).toFixed(2)}%`;
}

export function FollowFlame() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const mark = document.querySelector<HTMLElement>(`[${FOLLOW_FROM_ATTR}]`);
    if (!root || !mark) return;
    const svg = root.querySelector("svg");
    if (!svg) return;

    // The flame's starting place: where the mark beside "Solini" sits when
    // the page is at the top, relative to the flame's place in the corner.
    // Measured, not scroll-tracked: the glide itself is a scroll timeline.
    const measure = () => {
      const from = mark.getBoundingClientRect();
      const to = root.getBoundingClientRect();
      const inset = (to.width - svg.getBoundingClientRect().width) / 2;
      root.style.setProperty("--from-x", `${(from.left - to.left - inset).toFixed(1)}px`);
      root.style.setProperty("--from-y", `${(from.top + window.scrollY - to.top - inset).toFixed(1)}px`);
      root.dataset.ready = "true";
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div ref={rootRef} className="follow-flame" aria-hidden="true">
      <span className="follow-disc" />
      <svg viewBox="0 0 64 64" className="follow-mark">
        {MARK_THREADS.map((thread, i) => (
          <rect
            key={i}
            className={i === BASE ? "fill-gold-deep" : "follow-thread fill-gold-deep"}
            x={thread.x}
            y={thread.y}
            width={thread.width}
            height={MARK_THREAD_HEIGHT}
            rx={MARK_THREAD_HEIGHT / 2}
            style={i === BASE ? undefined : { animationRange: followThreadRange(i) }}
          />
        ))}
      </svg>
    </div>
  );
}
