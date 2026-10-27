/**
 * Chart Helpers
 *
 * Pure utility functions for the interactive cycle chart. All functions are
 * stateless and have no side effects, enabling exhaustive unit testing.
 */

import type { YearTier } from "./interpretation-data";
import { positiveMod } from "./cycle-math";
import { getActiveYear, getCycleIndex } from "./year-lookup";

/**
 * Circle symbols that fill up as luck increases, so the tier reads without
 * relying on colour alone. Zero gets a distinct dotted circle because it is
 * its own outcome, not the bottom of the scale.
 */
const TIER_SYMBOLS: Record<YearTier, string> = {
  "very-strong": "●",
  strong: "◕",
  moderate: "◑",
  weak: "◔",
  zero: "⊙",
};

/**
 * Tailwind background classes per tier. Zero uses the full-strength charcoal
 * token per the design spec; the others use a light /15 tint of their colour.
 * Written out in full so Tailwind's class scanner can find them.
 */
const TIER_BACKGROUNDS: Record<YearTier, string> = {
  "very-strong": "bg-tier-very-strong/15",
  strong: "bg-tier-strong/15",
  moderate: "bg-tier-moderate/15",
  weak: "bg-tier-weak/15",
  zero: "bg-tier-zero",
};

function isYearTier(tier: string): tier is YearTier {
  return tier in TIER_SYMBOLS;
}

/** Maps a CSS-friendly tier name to its Unicode tier symbol. Unknown tiers fall back to zero. */
export function getTierSymbol(tier: string): string {
  return TIER_SYMBOLS[isYearTier(tier) ? tier : "zero"];
}

/** Returns the Tailwind background class for a tier. Unknown tiers fall back to zero. */
export function getTierColorClass(tier: string): string {
  return TIER_BACKGROUNDS[isYearTier(tier) ? tier : "zero"];
}

/**
 * Returns the 2–3 nearest calendar years for a given column index.
 *
 * Column `c` recurs every 12 years: birthYear + c, birthYear + c + 12, ...
 * This finds the most recent occurrence at or before currentYear, then the
 * next two. Years before the birth year are dropped, which is why a young
 * person can get only two.
 *
 * @param birthYear   - Birth year (reference anchor for the cycle).
 * @param columnIndex - 0-indexed column position (0–11).
 * @param currentYear - The year considered "now".
 * @returns Array of 2–3 years: [most recent past (or current), ...next 1–2].
 */
export function getYearsForColumn(
  birthYear: number,
  columnIndex: number,
  currentYear: number
): number[] {
  const currentColumn = positiveMod(currentYear - birthYear, 12);
  const yearsSinceColumn = positiveMod(currentColumn - columnIndex, 12);
  const mostRecent = currentYear - yearsSinceColumn;

  return [mostRecent, mostRecent + 12, mostRecent + 24].filter(
    (year) => year >= birthYear
  );
}

/**
 * Returns the 0-indexed column for the current year in the cycle.
 * Uses timing-corrected active year: before the birthday has passed in the
 * current calendar year, the previous year's cycle position is used.
 *
 * @param birthYear   - Birth year of the person.
 * @param currentYear - The calendar year (from `new Date().getFullYear()`).
 * @param birthMonth  - Birth month (1–12).
 * @param birthDay    - Birth day (1–31).
 * @param todayOverride - Optional date to use as "today" for deterministic testing.
 * @returns Column index in range [0, 11].
 */
export function getCurrentYearColumn(
  birthYear: number,
  currentYear: number,
  birthMonth: number,
  birthDay: number,
  todayOverride?: Date
): number {
  const activeYear = getActiveYear(currentYear, birthMonth, birthDay, todayOverride);
  return getCycleIndex(birthYear, activeYear);
}
