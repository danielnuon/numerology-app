"use client";

/**
 * YearTimeline
 *
 * Horizontal "thread of fate" timeline that displays years from birth year
 * through currentYear + 30. Synchronized with CycleChart for bidirectional
 * selection.
 */

import { useRef, useEffect, useCallback, ViewTransition } from "react";
import { useReducedMotion } from "motion/react";
import { interpretYear } from "@/lib/numerology/interpretation";
import { getCycleIndex } from "@/lib/numerology/year-lookup";
import {
  getTierSymbol,
  getTierColorClass,
  getTierTextClass,
} from "@/lib/numerology/chart-helpers";

/** How many years past the current year the timeline extends. */
export const TIMELINE_YEARS_AHEAD = 30;

export interface YearTimelineProps {
  /** 12-element array of cycle numbers (each 0–11). */
  cycle: number[];
  /** Birth year of the person (cycle anchor). */
  birthYear: number;
  /** The year considered "now". */
  currentYear: number;
  /** The selected year; there is always one. */
  selectedYear: number;
  /** Callback when a year is selected. */
  onSelectYear: (year: number) => void;
}

export function YearTimeline({
  cycle,
  birthYear,
  currentYear,
  selectedYear,
  onSelectYear,
}: YearTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const hasCentered = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const endYear = currentYear + TIMELINE_YEARS_AHEAD;
  const years = Array.from(
    { length: endYear - birthYear + 1 },
    (_, i) => birthYear + i
  );

  // Keep the selected year centred. The first centring is instant so the
  // page doesn't scroll on load; later ones glide unless motion is reduced.
  useEffect(() => {
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
      const first = years[0];
      const last = years[years.length - 1];
      const targets: Record<string, number> = {
        ArrowRight: Math.min(year + 1, last),
        ArrowDown: Math.min(year + 1, last),
        ArrowLeft: Math.max(year - 1, first),
        ArrowUp: Math.max(year - 1, first),
        Home: first,
        End: last,
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
    [years, onSelectYear, selectAndFocus]
  );

  return (
    <section
      aria-label="Year timeline"
      className="relative w-full overflow-hidden"
    >
      {/* Timeline container */}
      <div
        ref={containerRef}
        className="timeline-fade relative flex gap-1 overflow-x-auto scrollbar-hide py-4 px-6 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        role="listbox"
        aria-label="Select a year"
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
          const symbol = getTierSymbol(interp.tier);
          const bgClass = getTierColorClass(interp.tier);
          const isCurrent = year === currentYear;
          const isSelected = selectedYear === year;
          const isPast = year < currentYear;

          // 12-year cycle boundary
          const isCycleBoundary = year > birthYear && (year - birthYear) % 12 === 0;

          return (
            <div key={year} className="relative flex flex-col items-center snap-center">
              {/* Cycle boundary tick mark */}
              {isCycleBoundary && (
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
                className="group relative flex flex-col items-center rounded-lg"
              >
                <span
                  className={[
                    "relative flex items-center justify-center",
                    "w-10 h-10 rounded-full pressable lamp-orb",
                    "group-hover:scale-110 group-active:scale-95",
                    // Background
                    bgClass,
                    // Text
                    "text-ink",
                    // Current year: gold ring (an outline, since the glow owns box-shadow)
                    isCurrent
                      ? "outline-2 outline-offset-2 outline-gold-deep"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {/* Tier symbol */}
                  <span
                    aria-hidden="true"
                    className={[
                      "text-xs leading-none",
                      getTierTextClass(interp.tier),
                    ].join(" ")}
                  >
                    {symbol}
                  </span>

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

                {/* Year label */}
                <span
                  className={[
                    "mt-1 text-[10px] text-center whitespace-nowrap pressable",
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
