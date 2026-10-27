"use client";

/**
 * CurrentYearWidget
 *
 * Displays the current year's cycle number, luck tier, life area, and
 * one-sentence guidance for returning visitors whose birth date is stored
 * in localStorage. Includes "See all 12 years" (smooth-scroll) and
 * "Not you?" (clear localStorage, reset to form) actions.
 */

import { interpretYear } from "@/lib/numerology/interpretation";
import { getTierSymbol } from "@/lib/numerology/chart-helpers";
import {
  getActiveYear,
  getCycleIndex,
  getLifeArea,
  getYearNumber,
} from "@/lib/numerology/year-lookup";

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
  const tierSymbol = getTierSymbol(interpretation.tier);

  function handleViewFullCycle(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const el = document.getElementById(chartSectionId);
    if (el) {
      // "auto" defers to CSS scroll-behavior: smooth unless motion is reduced
      el.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }

  return (
    <div
      className="rise glass max-w-[480px] w-full rounded-2xl p-8 sm:p-10"
      style={{ "--rise-delay": "760ms" } as React.CSSProperties}
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
          className="title-glow font-display text-6xl text-ink"
          aria-hidden="true"
        >
          {cycleNumber}
        </span>
        <span className="text-2xl text-gold-deep" aria-hidden="true">
          {tierSymbol}
        </span>
      </div>

      {/* Tier label */}
      <p className="mt-2 text-center text-lg font-display text-ink tracking-[0.04em]">
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
          className="pressable inline-flex items-center min-h-[44px] px-2 -mx-2 rounded-sm text-ink-light hover:text-ink active:opacity-70 underline underline-offset-4"
        >
          See all 12 years
        </a>
        <button
          type="button"
          onClick={onReset}
          className="pressable inline-flex items-center min-h-[44px] px-2 -mx-2 rounded-sm text-ink-light hover:text-ink active:opacity-70 underline underline-offset-4"
        >
          Not you?
        </button>
      </div>
    </div>
  );
}
