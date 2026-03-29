"use client";

/**
 * YearTimeline
 *
 * Horizontal "thread of fate" timeline that displays years from birth year
 * through currentYear + 30. Synchronized with CycleChart for bidirectional
 * selection.
 */

import { useRef, useEffect, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { interpretYear } from "@/lib/numerology/interpretation";
import { getCycleIndex } from "@/lib/numerology/year-lookup";
import {
  getTierSymbol,
  getTierColorClass,
} from "@/lib/numerology/chart-helpers";

export interface YearTimelineProps {
  /** 12-element array of cycle numbers (each 0–11). */
  cycle: number[];
  /** Birth year of the person (cycle anchor). */
  birthYear: number;
  /** The year considered "now". */
  currentYear: number;
  /** Currently selected year (null = no selection). */
  selectedYear: number | null;
  /** Callback when a year is selected. */
  onSelectYear: (year: number | null) => void;
}

export function YearTimeline({
  cycle,
  birthYear,
  currentYear,
  selectedYear,
  onSelectYear,
}: YearTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const endYear = currentYear + 30;
  const years = Array.from(
    { length: endYear - birthYear + 1 },
    (_, i) => birthYear + i
  );

  const currentYearIndex = currentYear - birthYear;

  // Auto-center on current year on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const clientWidth = container.clientWidth;

    const targetScroll =
      (currentYearIndex * 80) - clientWidth / 2 + 40;

    container.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [birthYear, currentYearIndex, prefersReducedMotion]);

  const handleYearClick = useCallback(
    (year: number) => {
      onSelectYear(selectedYear === year ? null : year);
    },
    [onSelectYear, selectedYear]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, year: number) => {
      const currentIndex = years.indexOf(year);

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleYearClick(year);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        const nextYear = years[Math.min(currentIndex + 1, years.length - 1)];
        onSelectYear(nextYear);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        const prevYear = years[Math.max(currentIndex - 1, 0)];
        onSelectYear(prevYear);
      }
    },
    [years, handleYearClick, onSelectYear]
  );

  return (
    <section
      aria-label="Year timeline"
      className="relative w-full overflow-hidden"
    >
      {/* Gradient fade left */}
      <div
        className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to right, var(--color-manuscript), transparent)",
        }}
        aria-hidden="true"
      />

      {/* Timeline container */}
      <div
        ref={containerRef}
        className="relative flex gap-1 overflow-x-auto scrollbar-hide py-4 px-6 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        role="listbox"
        aria-label="Select a year"
      >
        {/* Thread of fate connecting line */}
        <div
          className="absolute top-1/2 left-6 right-6 h-px bg-border/60 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />

        {years.map((year) => {
          const cycleIndex = getCycleIndex(birthYear, year);
          const cycleNumber = cycle[cycleIndex];
          const interp = interpretYear(cycleNumber);
          const symbol = getTierSymbol(interp.tier);
          const bgClass = getTierColorClass(interp.tier);
          const isZero = interp.tier === "zero";
          const isCurrent = year === currentYear;
          const isSelected = selectedYear === year;
          const isPast = year < currentYear;

          // 12-year cycle boundary
          const isCycleBoundary = year > birthYear && (year - birthYear) % 12 === 0;

          return (
            <div key={year} className="relative flex flex-col items-center snap-align-center">
              {/* Cycle boundary tick mark */}
              {isCycleBoundary && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-border/50"
                  aria-hidden="true"
                />
              )}

              {/* Year dot */}
              <button
                role="option"
                aria-selected={isSelected}
                aria-label={`Year ${year}, cycle number ${cycleNumber}, ${interp.label}`}
                onClick={() => handleYearClick(year)}
                onKeyDown={(e) => handleKeyDown(e, year)}
                className={[
                  "relative flex flex-col items-center justify-center",
                  "w-10 h-10 rounded-full transition-all duration-150",
                  // Background
                  bgClass,
                  // Text
                  isZero ? "text-parchment" : "text-ink",
                  // Current year highlight
                  isCurrent
                    ? "ring-2 ring-gold ring-offset-2 ring-offset-manuscript"
                    : "",
                  // Selected state
                  isSelected && !isCurrent
                    ? "ring-2 ring-gold/60 ring-offset-1"
                    : "",
                  // Hover/focus
                  "hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-light",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* Tier symbol */}
                <span
                  aria-hidden="true"
                  className={[
                    "text-xs leading-none",
                    isZero ? "text-parchment/80" : "text-gold",
                  ].join(" ")}
                >
                  {symbol}
                </span>
              </button>

              {/* Year label */}
              <span
                className={[
                  "mt-1 text-[10px] text-center whitespace-nowrap",
                  isCurrent ? "font-bold text-gold" : "text-ink-light",
                  isPast ? "text-ink-faint" : "",
                ].join(" ")}
              >
                {year}
              </span>
            </div>
          );
        })}
      </div>

      {/* Gradient fade right */}
      <div
        className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to left, var(--color-manuscript), transparent)",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
