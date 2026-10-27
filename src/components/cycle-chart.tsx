"use client";

/**
 * CycleChart
 *
 * Interactive 12-column pillar grid that visualises a person's life cycle.
 * Pillars settle in from below with a 40 ms stagger. The pillars behave like
 * tabs: one is always selected, arrow keys move focus and selection together,
 * and the detail panel below is the tab panel. The selection outline glides
 * between pillars with a native view transition. Responsive: 3 columns on
 * the narrowest phones, 4 on phones, 6 on tablets, 12 on desktop.
 */

import { useRef, ViewTransition } from "react";
import { motion } from "motion/react";
import { interpretYear, interpretTotal } from "@/lib/numerology/interpretation";
import { getLifeArea, getCycleIndex } from "@/lib/numerology/year-lookup";
import {
  getTierSymbol,
  getTierColorClass,
  getCurrentYearColumn,
} from "@/lib/numerology/chart-helpers";
import { DetailPanel } from "./detail-panel";
import { EASE, MOTION, PRESS } from "@/lib/motion";

export interface CycleChartProps {
  /** 12-element array of cycle numbers (each 0–11). */
  cycle: number[];
  /** Sum of all 12 cycle values. */
  totalScore: number;
  /** Birth year of the person (cycle anchor). */
  birthYear: number;
  /** Birth month (1–12) — used for timing-corrected "current year" highlight. */
  birthMonth: number;
  /** Birth day (1–31) — used for timing-corrected "current year" highlight. */
  birthDay: number;
  /** The selected calendar year; its pillar is the selected tab. */
  selectedYear: number;
  /** Show only the selected year in the detail panel instead of every year sharing its pillar. */
  showSingleYear?: boolean;
  /** Called with the 0-indexed column when a pillar is chosen. */
  onSelectPillar?: (columnIndex: number) => void;
}

/**
 * Life area labels with soft hyphens at natural syllable breaks, so long
 * labels wrap cleanly inside narrow pillars instead of being cut off.
 * The hyphen only renders when the browser actually breaks the word.
 */
const PILLAR_LABEL_BREAKS: Record<string, string> = {
  Movement: "Move\u00ADment",
  Relationships: "Relation\u00ADships",
  Opportunity: "Oppor\u00ADtunity",
  Protection: "Protec\u00ADtion",
};

/** Staggers pillar entrances by 40 ms. */
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

/** Each pillar fades in and settles 8px upward. */
const itemVariants = {
  hidden: { y: 8, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: MOTION.gentle, ease: EASE.enter },
  },
};

export function CycleChart({ 
  cycle, 
  totalScore, 
  birthYear,
  birthMonth,
  birthDay,
  selectedYear,
  showSingleYear = false,
  onSelectPillar,
}: CycleChartProps) {
  const currentYear = new Date().getFullYear();
  const currentColumn = getCurrentYearColumn(birthYear, currentYear, birthMonth, birthDay);
  const selectedIndex = getCycleIndex(birthYear, selectedYear);
  const pillarRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const totalInterp = interpretTotal(totalScore);

  // Tabs pattern (WAI-ARIA, automatic activation): arrows move focus and
  // selection together, Home/End jump to the ends, focus wraps around.
  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    const targets: Record<string, number> = {
      ArrowRight: (index + 1) % 12,
      ArrowDown: (index + 1) % 12,
      ArrowLeft: (index + 11) % 12,
      ArrowUp: (index + 11) % 12,
      Home: 0,
      End: 11,
    };
    const next = targets[event.key];
    if (next === undefined) return;
    event.preventDefault();
    pillarRefs.current[next]?.focus();
    onSelectPillar?.(next);
  }

  return (
    <section aria-label="Life cycle chart" className="paper-texture w-full">
      {/* Pillar grid */}
      <motion.div
        role="tablist"
        aria-label="12-year life cycle pillars"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 min-[360px]:grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2"
      >
        {cycle.map((cycleNumber, index) => {
          const interp = interpretYear(cycleNumber);
          const domain = getLifeArea(index + 1);
          const symbol = getTierSymbol(interp.tier);
          const bgClass = getTierColorClass(interp.tier);
          const isZero = interp.tier === "zero";
          const isCurrent = index === currentColumn;
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
              ref={(el) => {
                pillarRefs.current[index] = el;
              }}
              id={`pillar-${index}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="cycle-detail-panel"
              tabIndex={isSelected ? 0 : -1}
              aria-label={ariaLabel}
              variants={itemVariants}
              whileTap={{ scale: PRESS.scale, transition: PRESS.spring }}
              onClick={() => onSelectPillar?.(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={[
                // Layout
                "relative flex flex-col items-center justify-between gap-1",
                "rounded-sm px-1 py-3 min-h-[96px] min-w-0 overflow-hidden",
                // Motion: lift on hover (mouse only), settle back when pressed
                "pressable hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)] active:translate-y-0",
                // Background
                bgClass,
                // Text colour
                isZero ? "text-parchment" : "text-ink",
                // Current year: gold ring + corner dot. Selection is a separate ink outline.
                isCurrent
                  ? "border-2 border-gold-deep"
                  : "border border-border",
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
                  "text-[9px] font-semibold uppercase tracking-wider text-center leading-tight w-full [overflow-wrap:anywhere]",
                  isZero ? "text-parchment/80" : "text-ink-light",
                ].join(" ")}
                style={{ fontVariant: "small-caps" }}
              >
                {PILLAR_LABEL_BREAKS[domain] ?? domain}
              </span>

              {/* Current year indicator dot */}
              {isCurrent && (
                <span
                  aria-hidden="true"
                  className={[
                    "absolute top-1 right-1 w-1.5 h-1.5 rounded-full",
                    isZero ? "bg-gold-light" : "bg-gold-deep",
                  ].join(" ")}
                />
              )}

              {/* Selection outline — one shared element that glides between pillars */}
              {isSelected && (
                <ViewTransition name="pillar-selection" share="auto" default="none">
                  <span
                    aria-hidden="true"
                    className={[
                      "pointer-events-none absolute inset-0 rounded-sm ring-2 ring-inset",
                      isZero ? "ring-parchment" : "ring-ink",
                    ].join(" ")}
                  />
                </ViewTransition>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Detail panel (the tab panel for the selected pillar) */}
      <DetailPanel
        id="cycle-detail-panel"
        labelledBy={`pillar-${selectedIndex}`}
        cycleNumber={cycle[selectedIndex]}
        columnIndex={selectedIndex}
        birthYear={birthYear}
        currentYear={currentYear}
        selectedYear={showSingleYear ? selectedYear : null}
      />

      {/* Total score summary */}
      <div
        className={[
          "mt-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4",
          "rounded-sm border border-border bg-manuscript px-5 py-4 paper-texture",
        ].join(" ")}
      >
        <div className="flex shrink-0 items-baseline gap-2">
          <span className="text-ink-light text-sm uppercase tracking-widest whitespace-nowrap">
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
