"use client";

/**
 * DetailPanel
 *
 * Slide-down panel that appears below the cycle chart when a pillar is
 * selected. Shows years, life area domain, tier interpretation, and guidance.
 */

import { AnimatePresence, motion } from "framer-motion";
import { interpretYear } from "@/lib/numerology/interpretation";
import { getLifeArea } from "@/lib/numerology/year-lookup";
import {
  getTierSymbol,
  getYearsForColumn,
} from "@/lib/numerology/chart-helpers";

export interface DetailPanelProps {
  /** The cycle number for the selected pillar (0–11). */
  cycleNumber: number;
  /** 0-indexed column position. */
  columnIndex: number;
  /** Birth year of the person (cycle anchor). */
  birthYear: number;
  /** The year considered "now". */
  currentYear: number;
}

export function DetailPanel({
  cycleNumber,
  columnIndex,
  birthYear,
  currentYear,
}: DetailPanelProps) {
  const interp = interpretYear(cycleNumber);
  const domain = getLifeArea(columnIndex + 1);
  const years = getYearsForColumn(birthYear, columnIndex, currentYear);
  const symbol = getTierSymbol(interp.tier);
  const isZero = interp.tier === "zero";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${columnIndex}-${cycleNumber}`}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        role="region"
        aria-label={`Details for ${domain} domain`}
        className={[
          "mt-4 rounded-sm border border-border p-5 paper-texture",
          isZero
            ? "bg-tier-zero text-parchment"
            : "bg-manuscript text-ink",
        ].join(" ")}
      >
        {/* Header row: domain + years */}
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
          <span
            className={[
              "text-xs font-semibold uppercase tracking-widest",
              isZero ? "text-parchment/70" : "text-ink-light",
            ].join(" ")}
            style={{ fontVariant: "small-caps" }}
          >
            {domain}
          </span>
          <span
            className={[
              "text-sm",
              isZero ? "text-parchment/60" : "text-ink-faint",
            ].join(" ")}
          >
            {years.join(" · ")}
          </span>
        </div>

        {/* Tier symbol + label + cycle number */}
        <div className="flex items-center gap-3 mb-3">
          <span
            aria-hidden="true"
            className={[
              "text-2xl leading-none",
              isZero ? "text-parchment/80" : "text-gold",
            ].join(" ")}
          >
            {symbol}
          </span>
          <div>
            <p
              className={[
                "text-base font-semibold leading-tight",
                isZero ? "text-parchment" : "text-ink",
              ].join(" ")}
            >
              {interp.label}
            </p>
            <p
              className={[
                "text-sm",
                isZero ? "text-parchment/70" : "text-ink-light",
              ].join(" ")}
            >
              Cycle number {cycleNumber}
            </p>
          </div>
        </div>

        {/* Description */}
        <p
          className={[
            "text-sm mb-3",
            isZero ? "text-parchment/80" : "text-ink-light",
          ].join(" ")}
        >
          {interp.description}
        </p>

        {/* Guidance (italic) */}
        <p
          className={[
            "text-sm italic border-l-2 pl-3",
            isZero
              ? "border-parchment/30 text-parchment/70"
              : "border-gold/40 text-ink-light",
          ].join(" ")}
        >
          {interp.guidance}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
