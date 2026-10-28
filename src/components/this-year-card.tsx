"use client";

/**
 * ThisYearCard
 *
 * The first thing a reading shows: this year's cycle number, luck tier, life
 * area, and what the tier means, in plain sentences. The full 12-year wheel
 * sits below it. Used for every reading: a fresh submission, a returning
 * visitor's saved date, and a shared link.
 */

import { interpretYear } from "@/lib/numerology/interpretation";
import { getTierSymbol, getTierTextClass } from "@/lib/numerology/chart-helpers";
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
}

export function ThisYearCard({ cycle, birthYear, birthMonth, birthDay }: Props) {
  const currentYear = new Date().getFullYear();
  const activeYear = getActiveYear(currentYear, birthMonth, birthDay);
  const cycleNumber = getYearNumber(cycle, birthYear, activeYear);
  const cycleIndex = getCycleIndex(birthYear, activeYear);
  const lifeArea = getLifeArea(cycleIndex + 1); // getLifeArea is 1-indexed
  const interpretation = interpretYear(cycleNumber);
  const tierSymbol = getTierSymbol(interpretation.tier);

  return (
    <section
      className="rise glass w-full rounded-2xl p-6 sm:p-8 text-center"
      style={{ "--rise-delay": "120ms" } as React.CSSProperties}
      aria-labelledby="this-year-heading"
    >
      <p className="text-sm uppercase tracking-[0.12em] text-ink-light">
        Your {activeYear} reading
      </p>

      <div className="mt-3 flex items-center justify-center gap-3" aria-hidden="true">
        <span className="title-glow font-display text-7xl leading-none text-ink tabular-nums">
          {cycleNumber}
        </span>
        <span className={`text-2xl ${getTierTextClass(interpretation.tier)}`}>{tierSymbol}</span>
      </div>

      <h2 id="this-year-heading" className="mt-3 font-display text-2xl text-ink tracking-[0.03em]">
        <span className="sr-only">{`${activeYear}: cycle number ${cycleNumber}, `}</span>
        {interpretation.label}
      </h2>
      <p className="mt-1 text-base text-gold-deep">Life area: {lifeArea}</p>

      <div className="mx-auto mt-5 max-w-[42ch] space-y-3 text-left text-base leading-relaxed text-ink-light">
        <p>{interpretation.description}</p>
        <p className="italic border-l-2 pl-3 border-gold/40">{interpretation.guidance}</p>
      </div>
    </section>
  );
}
