"use client";

/**
 * CycleChart
 *
 * Interactive 12-column pillar grid that visualises a person's life cycle.
 * Pillars animate in from below with an 80 ms stagger. Clicking a pillar
 * reveals a detail panel showing calendar years, tier interpretation, and
 * guidance text. Responsive: 6 columns on mobile, 12 on desktop.
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { interpretYear, interpretTotal } from "@/lib/numerology/interpretation";
import { getLifeArea } from "@/lib/numerology/year-lookup";
import {
  getTierSymbol,
  getTierColorClass,
  getCurrentYearColumn,
} from "@/lib/numerology/chart-helpers";
import { DetailPanel } from "./detail-panel";

export interface CycleChartProps {
  /** 12-element array of cycle numbers (each 0–11). */
  cycle: number[];
  /** Sum of all 12 cycle values. */
  totalScore: number;
  /** Birth year of the person (cycle anchor). */
  birthYear: number;
}

/** Framer Motion container variant — staggers children by 80 ms. */
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

/** Framer Motion item variant — rises from below. */
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export function CycleChart({ cycle, totalScore, birthYear }: CycleChartProps) {
  const currentYear = new Date().getFullYear();
  const currentYearColumn = getCurrentYearColumn(birthYear, currentYear);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const totalInterp = interpretTotal(totalScore);

  function handlePillarClick(index: number) {
    setSelectedIndex((prev) => (prev === index ? null : index));
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePillarClick(index);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = (index + 1) % 12;
      setSelectedIndex(next);
      const el = document.getElementById(`pillar-${next}`);
      el?.focus();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prev = (index - 1 + 12) % 12;
      setSelectedIndex(prev);
      const el = document.getElementById(`pillar-${prev}`);
      el?.focus();
    }
  }

  return (
    <section aria-label="Life cycle chart" className="paper-texture w-full">
      {/* Pillar grid */}
      <motion.div
        role="tablist"
        aria-label="12-year life cycle pillars"
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial={prefersReducedMotion ? false : "hidden"}
        animate={prefersReducedMotion ? undefined : "show"}
        className="grid grid-cols-6 md:grid-cols-12 gap-2"
      >
        {cycle.map((cycleNumber, index) => {
          const interp = interpretYear(cycleNumber);
          const domain = getLifeArea(index + 1);
          const symbol = getTierSymbol(interp.tier);
          const bgClass = getTierColorClass(interp.tier);
          const isZero = interp.tier === "zero";
          const isCurrent = index === currentYearColumn;
          const isSelected = selectedIndex === index;

          const ariaLabel = [
            `Column ${index + 1}`,
            `cycle number ${cycleNumber}`,
            `${interp.label}`,
            `${domain} domain`,
            isCurrent ? "current year" : "",
          ]
            .filter(Boolean)
            .join(", ");

          return (
            <motion.button
              key={index}
              id={`pillar-${index}`}
              role="tab"
              aria-selected={isSelected}
              aria-label={ariaLabel}
              variants={prefersReducedMotion ? undefined : itemVariants}
              onClick={() => handlePillarClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={[
                // Layout
                "relative flex flex-col items-center justify-between gap-1",
                "rounded-sm px-1 py-3 min-h-[96px] min-w-0 overflow-hidden cursor-pointer",
                "transition-transform duration-150",
                // Background
                bgClass,
                // Text colour
                isZero ? "text-parchment" : "text-ink",
                // Current year treatment
                isCurrent
                  ? "border-2 border-gold shadow-[0_0_8px_rgba(184,134,11,0.3)] -translate-y-0.5"
                  : "border border-border",
                // Zero breathing animation
                isZero ? "animate-breathe" : "",
                // Selected outline
                isSelected && !isCurrent
                  ? "ring-2 ring-gold/60 ring-offset-1"
                  : "",
                // Hover / focus
                "hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-light focus-visible:ring-offset-1",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Cycle number */}
              <span
                aria-hidden="true"
                className="font-serif text-[32px] leading-none"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {cycleNumber}
              </span>

              {/* Tier symbol */}
              <span
                aria-hidden="true"
                className={[
                  "text-base leading-none",
                  isZero ? "text-parchment/80" : "text-gold",
                ].join(" ")}
              >
                {symbol}
              </span>

              {/* Life area label */}
              <span
                aria-hidden="true"
                className={[
                  "text-[9px] font-semibold uppercase tracking-wider text-center leading-tight truncate w-full",
                  isZero ? "text-parchment/80" : "text-ink-light",
                ].join(" ")}
                style={{ fontVariant: "small-caps" }}
              >
                {domain}
              </span>

              {/* Current year indicator dot */}
              {isCurrent && (
                <span
                  aria-hidden="true"
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold"
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Detail panel */}
      {selectedIndex !== null && (
        <DetailPanel
          cycleNumber={cycle[selectedIndex]}
          columnIndex={selectedIndex}
          birthYear={birthYear}
          currentYear={currentYear}
        />
      )}

      {/* Total score summary */}
      <div
        className={[
          "mt-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4",
          "rounded-sm border border-border bg-manuscript px-5 py-4 paper-texture",
        ].join(" ")}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-ink-light text-sm uppercase tracking-widest">
            Total score
          </span>
          <span className="font-serif text-2xl text-ink">{totalScore}</span>
        </div>
        <div className="hidden sm:block w-px h-8 bg-border" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-ink leading-tight">
            {totalInterp.label}
          </p>
          <p className="text-sm text-ink-light">{totalInterp.description}</p>
        </div>
      </div>
    </section>
  );
}
