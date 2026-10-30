"use client";

/**
 * ThisYearCard
 *
 * The first thing the reading card shows: this year's cycle number, luck
 * tier, life area, what that number means for the life area, and the day
 * planet that stands over the year, in plain sentences, then the day the
 * next year's reading begins and what it holds. The full
 * 12-year wheel sits beside or below it. Used for every reading: a fresh submission, a returning
 * visitor's saved date, and a shared link.
 */

import type { Weekday } from "@/lib/numerology/calculate";
import { describeYearPlanet, interpretAreaYear } from "@/lib/numerology/interpretation";
import { TierIcon } from "@/components/ui/tier-icon";
import {
  getActiveYear,
  getCycleIndex,
  getNextReadingStart,
  getYearNumber,
} from "@/lib/numerology/year-lookup";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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
  /** True for a reading opened from someone else's share link, which reads "Their", not "Your". */
  isShared?: boolean;
}

export function ThisYearCard({ cycle, birthYear, birthMonth, birthDay, weekday, isShared = false }: Props) {
  const currentYear = new Date().getFullYear();
  const activeYear = getActiveYear(currentYear, birthMonth, birthDay);
  const cycleNumber = getYearNumber(cycle, birthYear, activeYear);
  const cycleIndex = getCycleIndex(birthYear, activeYear);
  const interpretation = interpretAreaYear(cycleIndex + 1, cycleNumber); // columns are 1-indexed
  const lifeArea = interpretation.area;
  const possessive = isShared ? "Their" : "Your";

  // The next reading, so the visitor knows when to come back
  const next = getNextReadingStart(activeYear, birthMonth, birthDay);
  const nextNumber = getYearNumber(cycle, birthYear, next.year);
  const nextInterpretation = interpretAreaYear(getCycleIndex(birthYear, next.year) + 1, nextNumber);

  return (
    // A lit panel inside the reading card, not a card of its own
    <section
      className="w-full rounded-2xl border border-border bg-gold-deep/[0.04] px-5 py-6 sm:px-8 text-center"
      aria-labelledby="this-year-heading"
    >
      <p className="text-sm uppercase tracking-[0.12em] text-ink-light">
        {possessive} {activeYear} reading
      </p>

      <div className="mt-3 flex items-center justify-center gap-3" aria-hidden="true">
        <span data-glow={cycleNumber} className="title-glow [--breathe-delay:-1.9s] font-sans text-7xl font-medium leading-none text-ink tabular-nums">
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

      <div className="mx-auto mt-6 max-w-[42ch] border-t border-border-light pt-4 text-sm">
        <p className="text-ink-light text-balance">
          {possessive} {next.year} reading begins on {MONTH_NAMES[next.month - 1]} {next.day}.
        </p>
        <p className="mt-1 inline-flex flex-wrap items-center justify-center gap-x-1.5 text-ink">
          <span className="tabular-nums">{nextNumber}</span>
          <TierIcon tier={nextInterpretation.tier} className="size-3.5" />
          <span>
            {nextInterpretation.label} · {nextInterpretation.area}
          </span>
        </p>
      </div>
    </section>
  );
}
