"use client";

/**
 * CurrentYearWidget
 *
 * Displays the current year's cycle number, luck tier, life area, and
 * one-sentence guidance for returning visitors whose birth date is stored
 * in localStorage. Includes "View full cycle" (smooth-scroll) and
 * "Not you?" (clear localStorage, reset to form) actions.
 */

import { interpretYear } from "@/lib/numerology/interpretation";
import { getCycleIndex, getLifeArea, getYearNumber } from "@/lib/numerology/year-lookup";

/** Tier symbol mapping — matches the cycle chart's pillar symbols. */
const TIER_SYMBOLS: Record<string, string> = {
  "very-strong": "●",
  strong: "◕",
  moderate: "◑",
  weak: "◔",
  zero: "⊙",
};

import { getActiveYear } from "@/lib/numerology/year-lookup";

interface Props {
  /** The computed 12-number cycle array. */
  cycle: number[];
  /** The birth year (cycle anchor). */
  birthYear: number;
  /** Birth month (1–12) — used for timing-corrected year. */
  birthMonth: number;
  /** Birth day (1–31) — used for timing-corrected year. */
  birthDay: number;
  /** Called when the user clicks "Not you?" — parent resets to first-visit state. */
  onReset: () => void;
  /** Ref ID of the chart section to scroll to. */
  chartSectionId: string;
}

export function CurrentYearWidget({ cycle, birthYear, birthMonth, birthDay, onReset, chartSectionId }: Props) {
  const currentYear = new Date().getFullYear();
  const activeYear = getActiveYear(currentYear, birthMonth, birthDay);
  const cycleNumber = getYearNumber(cycle, birthYear, activeYear);
  const cycleIndex = getCycleIndex(birthYear, activeYear);
  const lifeArea = getLifeArea(cycleIndex + 1); // getLifeArea is 1-indexed
  const interpretation = interpretYear(cycleNumber);
  const tierSymbol = TIER_SYMBOLS[interpretation.tier] ?? "◑";

  function handleViewFullCycle(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const el = document.getElementById(chartSectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div
      className="max-w-[480px] w-full rounded-sm border border-border bg-manuscript p-8 sm:p-10 shadow-[0_1px_3px_rgba(44,36,23,0.08)]"
      role="region"
      aria-label="Your current year reading"
    >
      {/* Year heading — shows timing-corrected year */}
      <p className="text-xs uppercase tracking-[0.08em] text-ink-light text-center">
        Your {activeYear} Reading
      </p>

      {/* Cycle number — large display */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <span
          className="text-5xl font-serif font-light text-ink"
          aria-hidden="true"
        >
          {cycleNumber}
        </span>
        <span className="text-2xl" aria-hidden="true">
          {tierSymbol}
        </span>
      </div>

      {/* Tier label */}
      <p className="mt-2 text-center text-lg font-serif text-ink tracking-[0.02em]">
        {interpretation.label}
      </p>

      {/* Life area */}
      <p className="mt-1 text-center text-sm text-ink-light">
        {lifeArea} domain
      </p>

      {/* Guidance — one sentence */}
      <p className="mt-4 text-center text-sm text-ink-light italic leading-relaxed">
        {interpretation.guidance}
      </p>

      {/* Screen reader summary */}
      <span className="sr-only">
        {`Year ${currentYear}: cycle number ${cycleNumber}, ${interpretation.label}, ${lifeArea} domain. ${interpretation.guidance}`}
      </span>

      {/* Actions */}
      <div className="mt-6 flex justify-center gap-6 text-sm">
        <a
          href={`#${chartSectionId}`}
          onClick={handleViewFullCycle}
          className="text-ink-light hover:text-gold underline underline-offset-4 transition-colors"
        >
          View full cycle
        </a>
        <button
          type="button"
          onClick={onReset}
          className="text-ink-light hover:text-ink underline underline-offset-4 transition-colors"
        >
          Not you?
        </button>
      </div>
    </div>
  );
}
