/**
 * SoliniMark
 *
 * Solini's logo, the woven flame: twelve weft threads, one for each year of
 * the cycle, laid one above the next so that together they make a flame,
 * with one year's thread lit. The threads follow chong kiet, Khmer ikat, in
 * which the pattern is dyed into the weft before the cloth is woven.
 *
 * "woven" plays the entrance: the threads are laid from the bottom up, as
 * weft is on a loom, then the lit thread kindles and its glow breathes. With
 * Reduce Motion the mark is simply there, lit. src/app/icon.svg draws the
 * same threads; a test keeps the two in step.
 */

import { useId } from "react";

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

/** The lit thread, the eighth from the top, where the flame is widest. */
export const MARK_LIT_THREAD = 7;

/** How far apart the threads start weaving, bottom thread first. */
const WEAVE_STAGGER_MS = 70;

export function SoliniMark({
  woven = false,
  className = "",
}: {
  woven?: boolean;
  className?: string;
}) {
  const glowId = useId();
  const lit = MARK_THREADS[MARK_LIT_THREAD];
  const last = MARK_THREADS.length - 1;
  const rx = MARK_THREAD_HEIGHT / 2;
  return (
    <svg
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
      {MARK_THREADS.map((thread, i) => (
        <rect
          key={i}
          className="mark-thread fill-gold"
          fillOpacity={0.72}
          x={thread.x}
          y={thread.y}
          width={thread.width}
          height={MARK_THREAD_HEIGHT}
          rx={rx}
          style={{ "--weave-delay": `${(last - i) * WEAVE_STAGGER_MS}ms` } as React.CSSProperties}
        />
      ))}
      <g className="mark-light">
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
    </svg>
  );
}
