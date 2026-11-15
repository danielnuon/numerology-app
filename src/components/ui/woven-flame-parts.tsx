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
 * FollowFlame: once the flame beside "Solini" has scrolled off the top of
 * the screen, the same flame rises into the bottom right corner on a small
 * disc of glass, as a Back to top button. Its threads light one at a time
 * from the base up as the visitor reads down the page, so it also shows how
 * far they've read.
 *
 * The divider and the flame's lighting are CSS scroll-driven animations
 * (`.weave-*` and `.follow-*` in globals.css): no scroll listener. Without
 * scroll-timeline support, or with Reduce Motion, the divider is the
 * finished line and the follow flame is fully lit.
 */

import { useEffect, useRef, useState } from "react";
import { MARK_THREAD_HEIGHT, MARK_THREADS, threadBox } from "@/components/ui/solini-mark";

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
  // clock, instead (`.weave[data-arrive]`). The first intersection report
  // comes after the page has its scroll position, so a page restored by
  // Back or Forward is judged where it lands, not where the last page was.
  // Dividers above the screen stay on the scroll, already unwoven.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      observer.disconnect();
      if (entry.isIntersecting) el.dataset.arrive = "true";
    });
    observer.observe(el);
    return () => observer.disconnect();
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

/**
 * The follow flame waits for the mark beside "Solini" to leave the top of the
 * screen, then arrives in the corner, and leaves again as the mark comes
 * back. It doesn't fly between the two: a flight tied to the scroll has to
 * cross the whole screen in a short stretch of scroll, so it outran the page
 * many times over and leapt on every flick. The handoff is a state, and the
 * arrival and leaving are timed transitions (`.follow-flame` in globals.css)
 * that ease the same way however fast the page moves, and turn back smoothly
 * if the visitor changes direction midway. Watching the mark with an
 * IntersectionObserver also judges a page restored by Back or Forward where
 * it lands.
 */
export function FollowFlame() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const mark = document.querySelector<HTMLElement>(`[${FOLLOW_FROM_ATTR}]`);
    if (!mark || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      // Above the screen, not merely out of view, so it never shows while
      // the page is still arriving below its header
      setShown(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
    });
    observer.observe(mark);
    return () => observer.disconnect();
  }, []);

  // Back to the top: focus moves to the Solini link there, so a keyboard
  // visitor carries on from the top of the page as the button leaves.
  const backToTop = () => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document
      .querySelector<HTMLElement>(`[${FOLLOW_FROM_ATTR}]`)
      ?.closest("a")
      ?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      className="follow-flame group"
      data-shown={shown ? "true" : undefined}
      inert={!shown}
      onClick={backToTop}
    >
      <span className="follow-press pressable group-active:scale-[0.97]">
        <span className="follow-disc" />
        <span className="follow-mark" aria-hidden="true">
          {MARK_THREADS.map((thread, i) => (
            <span
              key={i}
              className={i === BASE ? "follow-thread-base" : "follow-thread"}
              style={{ ...threadBox(thread), ...(i === BASE ? undefined : { animationRange: followThreadRange(i) }) }}
            />
          ))}
        </span>
      </span>
    </button>
  );
}
