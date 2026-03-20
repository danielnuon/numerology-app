/**
 * Margasir Month Mapping
 *
 * Maps Gregorian months (1-12) to their Margasir-relative positions (1-12).
 * The Khmer lunar calendar uses Margasir (November-December) as the starting month,
 * so December = position 1 and months cycle from there.
 */

/** Gregorian month (1-12) → Margasir-relative position (1-12) */
export const MARGASIR_MONTH_MAP: Record<number, number> = {
  1: 2, // January
  2: 3, // February
  3: 4, // March
  4: 5, // April
  5: 6, // May
  6: 7, // June
  7: 8, // July
  8: 9, // August
  9: 10, // September
  10: 11, // October
  11: 12, // November
  12: 1, // December (Margasir start)
};

/**
 * Generates the 12-element month row for the numerology calculation.
 * Starts at the Margasir position for the given Gregorian month and cycles through 1-12.
 *
 * Example: July (7) → position 8 → [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7]
 */
export function getMonthRow(gregorianMonth: number): number[] {
  const startPosition = MARGASIR_MONTH_MAP[gregorianMonth];
  if (startPosition === undefined) {
    throw new Error(
      `Invalid Gregorian month: ${gregorianMonth}. Must be 1-12.`
    );
  }

  const row: number[] = [];
  for (let i = 0; i < 12; i++) {
    row.push(((startPosition - 1 + i) % 12) + 1);
  }
  return row;
}
