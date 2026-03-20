/**
 * Chart Helpers
 *
 * Pure utility functions for the interactive cycle chart. All functions are
 * stateless and have no side effects, enabling exhaustive unit testing.
 */

import { getCycleIndex } from "./year-lookup";

/** Maps a CSS-friendly tier name to its Unicode tier symbol. */
export function getTierSymbol(tier: string): string {
  switch (tier) {
    case "very-strong":
      return "●";
    case "strong":
      return "◕";
    case "moderate":
      return "◑";
    case "weak":
      return "◔";
    case "zero":
      return "⊙";
    default:
      return "⊙";
  }
}

/**
 * Returns the Tailwind background class with opacity modifier for a tier.
 * Zero-tier uses full opacity (charcoal) per design spec; all others use /15.
 */
export function getTierColorClass(tier: string): string {
  switch (tier) {
    case "very-strong":
      return "bg-tier-very-strong/15";
    case "strong":
      return "bg-tier-strong/15";
    case "moderate":
      return "bg-tier-moderate/15";
    case "weak":
      return "bg-tier-weak/15";
    case "zero":
      return "bg-tier-zero";
    default:
      return "bg-tier-zero";
  }
}

/**
 * Returns the 2–3 nearest calendar years for a given column index.
 *
 * The 12-year cycle repeats at a period of 12 years. This function finds the
 * most recent past occurrence of the column (≤ currentYear) and up to 2
 * upcoming occurrences.
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
  // Find the most recent year ≤ currentYear whose cycle index equals columnIndex.
  // offset = columnIndex means: targetYear = birthYear + columnIndex + k*12 for some integer k.
  // We want the largest such year that is ≤ currentYear.
  const diff = currentYear - birthYear;
  const remainder = ((diff % 12) + 12) % 12;
  // How many steps back from currentYear to reach this column?
  let stepsBack = ((remainder - columnIndex) % 12 + 12) % 12;
  const mostRecentPast = currentYear - stepsBack;

  const years: number[] = [mostRecentPast, mostRecentPast + 12, mostRecentPast + 24];

  // Return at most 3 years, filtering to a reasonable window (no earlier than birth year)
  return years.filter((y) => y >= birthYear).slice(0, 3);
}

/**
 * Returns the 0-indexed column for the current year in the cycle.
 *
 * @param birthYear   - Birth year of the person.
 * @param currentYear - The year considered "now".
 * @returns Column index in range [0, 11].
 */
export function getCurrentYearColumn(
  birthYear: number,
  currentYear: number
): number {
  return getCycleIndex(birthYear, currentYear);
}
