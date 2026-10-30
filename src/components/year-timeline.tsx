"use client";

/**
 * YearTimeline
 *
 * Horizontal "thread of fate" timeline that displays years from birth year
 * through activeYear + 30. Shares one selected year with CycleChart, so
 * picking a year here selects its pillar and vice versa. The edges fade only
 * on a side where more years are scrolled out of view.
 */

import { useRef, useLayoutEffect, useCallback, ViewTransition } from "react";
import { useReducedMotion } from "motion/react";
import { interpretYear } from "@/lib/numerology/interpretation";
import { getCycleIndex } from "@/lib/numerology/year-lookup";
import { getTierColorClass } from "@/lib/numerology/chart-helpers";
import { TierIcon } from "@/components/ui/tier-icon";

/** How many years past the active year the timeline extends. */
export const TIMELINE_YEARS_AHEAD = 30;

/**
 * Marks which edges of the track have years scrolled out of view, so the CSS
 * fades only those edges (`.timeline-fade` in globals.css). Written straight
 * to the DOM because it changes on every scroll frame and nothing in React
 * reads it.
 */
function markScrollableEdges(track: HTMLElement) {
  // A pixel of slack absorbs subpixel rounding at either end.
  const hasMoreBefore = track.scrollLeft > 1;
  const hasMoreAfter = track.scrollLeft + track.clientWidth < track.scrollWidth - 1;
  track.toggleAttribute("data-more-before", hasMoreBefore);
  track.toggleAttribute("data-more-after", hasMoreAfter);
}

export interface YearTimelineProps {
  /** 12-element array of cycle numbers (each 0–11). */
  cycle: number[];
  /** Birth year of the person (cycle anchor). */
  birthYear: number;
  /**
   * The user's year by birthday timing (see getActiveYear), highlighted as
   * "now". Before this year's birthday it is still last calendar year.
   */
  activeYear: number;
  /** The selected year; there is always one. */
  selectedYear: number;
  /** Callback when a year is selected. */
  onSelectYear: (year: number) => void;
}

export function YearTimeline({
  cycle,
  birthYear,
  activeYear,
  selectedYear,
  onSelectYear,
}: YearTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const hasCentered = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const endYear = activeYear + TIMELINE_YEARS_AHEAD;
  const years = Array.from(
    { length: endYear - birthYear + 1 },
    (_, i) => birthYear + i
  );

  // Keep the selected year centered. The first centering is instant so the
  // page doesn't scroll on load; later ones glide unless motion is reduced.
  // It runs before paint, so a timeline that appears with the Cycle view is
  // centered from its first frame instead of jumping after it.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const option = optionRefs.current.get(selectedYear);
    if (!container || !option) return;
    const containerRect = container.getBoundingClientRect();
    const optionRect = option.getBoundingClientRect();
    const left =
      container.scrollLeft +
      (optionRect.left - containerRect.left) -
      containerRect.width / 2 +
      optionRect.width / 2;
    container.scrollTo({
      left: Math.max(0, left),
      behavior: hasCentered.current && !prefersReducedMotion ? "smooth" : "auto",
    });
    hasCentered.current = true;
    // scrollTo fires no scroll event when the position doesn't change, as
    // when the selected year is near the birth year, so mark the edges here too.
    markScrollableEdges(container);
  }, [selectedYear, birthYear, prefersReducedMotion]);

  const selectAndFocus = useCallback(
    (year: number) => {
      optionRefs.current.get(year)?.focus({ preventScroll: true });
      onSelectYear(year);
    },
    [onSelectYear]
  );

  // Listbox pattern: arrows move focus and selection together, Home/End jump
  // to the ends, Enter/Space select the focused year.
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, year: number) => {
      const targets: Record<string, number> = {
        ArrowRight: Math.min(year + 1, endYear),
        ArrowDown: Math.min(year + 1, endYear),
        ArrowLeft: Math.max(year - 1, birthYear),
        ArrowUp: Math.max(year - 1, birthYear),
        Home: birthYear,
        End: endYear,
      };
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelectYear(year);
        return;
      }
      const next = targets[event.key];
      if (next === undefined) return;
      event.preventDefault();
      selectAndFocus(next);
    },
    [birthYear, endYear, onSelectYear, selectAndFocus]
  );

  return (
    <section
      aria-label="Year timeline"
      className="relative w-full overflow-hidden"
    >
      <div
        ref={containerRef}
        className="timeline-fade relative flex gap-1 overflow-x-auto py-4 px-6 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
        role="listbox"
        aria-label="Select a year"
        onScroll={(event) => markScrollableEdges(event.currentTarget)}
      >
        {/* Thread of fate connecting line */}
        <div
          className="absolute top-1/2 left-6 right-6 h-px bg-gradient-to-r from-border via-gold/50 to-border -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />

        {years.map((year) => {
          const cycleIndex = getCycleIndex(birthYear, year);
          const cycleNumber = cycle[cycleIndex];
          const interp = interpretYear(cycleNumber);
          const bgClass = getTierColorClass(interp.tier);
          const isCurrent = year === activeYear;
          const isSelected = selectedYear === year;
          const isPast = year < activeYear;
          // A tick marks where each new 12-year cycle begins after the birth year.
          const startsNewCycle = year > birthYear && cycleIndex === 0;

          return (
            <div key={year} className="relative flex flex-col items-center snap-center">
              {startsNewCycle && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-border"
                  aria-hidden="true"
                />
              )}

              {/* Year: dot and label are one button */}
              <button
                ref={(el) => {
                  if (el) optionRefs.current.set(year, el);
                  else optionRefs.current.delete(year);
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                aria-label={`Year ${year}, cycle number ${cycleNumber}, ${interp.label}${isCurrent ? ", current year" : ""}`}
                onClick={() => onSelectYear(year)}
                onKeyDown={(e) => handleKeyDown(e, year)}
                data-tier={interp.tier}
                // min-w-11 keeps the tap target 44px wide around the 40px orb
                className="group relative flex min-w-11 flex-col items-center rounded-lg"
              >
                <span
                  // Each dot's light radiates at its own pace, as the wheel's orbs do
                  style={{
                    "--breathe-duration": `${(5 + ((year * 7) % 5) * 0.9).toFixed(1)}s`,
                    "--breathe-delay": `${(-(year % 12) * 1.3).toFixed(1)}s`,
                  } as React.CSSProperties}
                  className={[
                    "relative flex items-center justify-center",
                    "w-10 h-10 rounded-full pressable lamp-orb",
                    "group-hover:brightness-125 group-active:scale-[0.97]",
                    bgClass,
                    "text-ink",
                    // Current year: gold ring (an outline, since the glow owns box-shadow)
                    isCurrent
                      ? "breathe-glow outline-2 outline-offset-2 outline-gold-deep"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <TierIcon tier={interp.tier} className="size-2.5" />

                  {/* Selection outline — glides between years */}
                  {isSelected && (
                    <ViewTransition name="timeline-selection" share="auto" default="none">
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-inset ring-ink"
                      />
                    </ViewTransition>
                  )}
                </span>

                <span
                  className={[
                    "mt-1 text-xs text-center whitespace-nowrap pressable",
                    isCurrent
                      ? "font-semibold text-gold-deep"
                      : isPast
                        ? "text-ink-light group-hover:text-ink"
                        : "text-ink group-hover:text-ink",
                    isSelected ? "font-semibold" : "",
                  ].join(" ")}
                >
                  {year}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
