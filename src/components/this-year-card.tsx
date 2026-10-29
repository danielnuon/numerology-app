"use client";

/**
 * ThisYearCard
 *
 * The first thing the reading card shows: this year's cycle number, luck
 * tier, life area, what that number means for the life area, and the day
 * planet that stands over the year, in plain sentences. The full
 * 12-year wheel sits beside or below it. Used for every reading: a fresh submission, a returning
 * visitor's saved date, and a shared link.
 */

import type { Weekday } from "@/lib/numerology/calculate";
import { describeYearPlanet, interpretAreaYear } from "@/lib/numerology/interpretation";
import { TierIcon } from "@/components/ui/tier-icon";
import {
  getActiveYear,
  getCycleIndex,
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
  /** Birth weekday (1–7, Sunday=1) — sets which day planet stands over the year. */
  weekday: Weekday;
}

export function ThisYearCard({ cycle, birthYear, birthMonth, birthDay, weekday }: Props) {
  const currentYear = new Date().getFullYear();
  const activeYear = getActiveYear(currentYear, birthMonth, birthDay);
  const cycleNumber = getYearNumber(cycle, birthYear, activeYear);
  const cycleIndex = getCycleIndex(birthYear, activeYear);
  const interpretation = interpretAreaYear(cycleIndex + 1, cycleNumber); // columns are 1-indexed
  const lifeArea = interpretation.area;

  return (
    // A lit panel inside the reading card, not a card of its own
    <section
      className="w-full rounded-2xl border border-border bg-gold-deep/[0.04] px-5 py-6 sm:px-8 text-center"
      aria-labelledby="this-year-heading"
    >
      <p className="text-sm uppercase tracking-[0.12em] text-ink-light">
        Your {activeYear} reading
      </p>

      <div className="mt-3 flex items-center justify-center gap-3" aria-hidden="true">
        <span className="title-glow font-display text-7xl leading-none text-ink tabular-nums">
          {cycleNumber}
        </span>
        <TierIcon tier={interpretation.tier} className="size-6" />
      </div>

      <h2 id="this-year-heading" className="mt-3 font-display text-2xl text-ink tracking-[0.03em]">
        <span className="sr-only">{`${activeYear}: cycle number ${cycleNumber}, `}</span>
        {interpretation.label}
      </h2>
      <p className="mt-1 text-base text-gold-deep">Life area: {lifeArea}</p>

      <div className="mx-auto mt-5 max-w-[42ch] space-y-3 text-left text-base leading-relaxed text-ink-light">
        <p>{interpretation.reading}</p>
        <p>{describeYearPlanet(weekday, cycleIndex + 1)}</p>
        <p className="italic border-l-2 pl-3 border-gold/40">{interpretation.guidance}</p>
      </div>
    </section>
  );
}
