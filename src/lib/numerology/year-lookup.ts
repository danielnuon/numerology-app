/**
 * Year Lookup
 *
 * Maps a target year to its position in a 12-year numerology cycle relative
 * to a birth year, and resolves the corresponding life area domain.
 *
 * The cycle is 0-indexed internally: birth year sits at index 0, and
 * subsequent years advance through the 12-element cycle, wrapping every
 * 12 years.
 */

/** Life area domains keyed by 1-indexed column position (1-12). */
export const LIFE_AREA_MAP: Record<number, string> = {
  1: "Self",
  2: "Family",
  3: "Movement",
  4: "Home",
  5: "Money",
  6: "Allies",
  7: "Relationships",
  8: "Health",
  9: "Status",
  10: "Opportunity",
  11: "Karma",
  12: "Protection",
};

/** Minimum supported year (inclusive). */
export const MIN_YEAR = 1900;

/** Maximum supported year (inclusive). */
export const MAX_YEAR = 2100;

/**
 * Returns the 0-based cycle index for a target year relative to a birth year.
 * The result is always in the range [0, 11].
 *
 * @param birthYear - The reference (birth) year.
 * @param targetYear - The year to look up.
 * @returns Cycle index (0-11).
 * @throws If either year is outside the 1900-2100 range.
 */
export function getCycleIndex(birthYear: number, targetYear: number): number {
  validateYear(birthYear, "birthYear");
  validateYear(targetYear, "targetYear");

  return ((targetYear - birthYear) % 12 + 12) % 12;
}

/**
 * Returns the cycle number (1-12) for a target year within a given cycle array.
 *
 * @param cycle - A 12-element array representing the numerology cycle.
 * @param birthYear - The reference (birth) year.
 * @param targetYear - The year to look up.
 * @returns The cycle value at the computed index.
 * @throws If the cycle array length is not 12, or years are out of range.
 */
export function getYearNumber(
  cycle: number[],
  birthYear: number,
  targetYear: number
): number {
  if (cycle.length !== 12) {
    throw new Error(
      `Invalid cycle array length: ${cycle.length}. Must be 12.`
    );
  }

  const index = getCycleIndex(birthYear, targetYear);
  return cycle[index];
}

/**
 * Returns the life area domain string for a 1-indexed column position.
 *
 * @param column - Column position (1-12).
 * @returns The domain string (e.g. "Self", "Family").
 * @throws If column is outside 1-12.
 */
export function getLifeArea(column: number): string {
  const domain = LIFE_AREA_MAP[column];
  if (domain === undefined) {
    throw new Error(
      `Invalid column position: ${column}. Must be 1-12.`
    );
  }
  return domain;
}

/**
 * Validates that a year falls within the supported range.
 *
 * @param year - The year to validate.
 * @param label - Parameter name for the error message.
 * @throws If the year is outside 1900-2100.
 */
function validateYear(year: number, label: string): void {
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    throw new Error(
      `Invalid ${label}: ${year}. Must be an integer between ${MIN_YEAR} and ${MAX_YEAR}.`
    );
  }
}
