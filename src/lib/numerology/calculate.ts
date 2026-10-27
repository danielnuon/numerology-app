/**
 * Numerology Calculation Core
 *
 * Pure function module that computes the 12-number life cycle from
 * birth month, zodiac number, and weekday number. Zero UI dependencies.
 */

import { rotatedCycle } from "./cycle-math";
import { getMonthRow } from "./months";
import { getZodiacRow } from "./zodiac";

/** Weekday number: Sunday=1, Monday=2, ..., Saturday=7 */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** A complete cycle result */
export interface CycleResult {
  /** The 12-number life cycle (each value 0-11) */
  cycle: number[];
  /** Sum of all 12 cycle values */
  totalScore: number;
  /** The three rows used in calculation (for debugging/display) */
  rows: {
    month: number[];
    zodiac: number[];
    day: number[];
  };
}

/**
 * Number of chart columns the day row fills.
 *
 * Unlike the month and zodiac rows, the day row does not wrap to fill all 12
 * columns: it lists the 7 weekdays once and leaves columns 8-12 empty. Those
 * five years are therefore scored on month + zodiac only. Wrapping the row
 * would look natural but produces the wrong cycle.
 */
const DAY_ROW_COLUMNS = 7;

/**
 * Builds the day row (7 values only, columns 8-12 are empty).
 * Starts at the weekday number and cycles through 1-7.
 *
 * Example: Thursday (5) → [5, 6, 7, 1, 2, 3, 4]
 */
export function buildDayRow(weekday: Weekday): number[] {
  return rotatedCycle(weekday, 7, DAY_ROW_COLUMNS);
}

/**
 * Computes the 12-number life cycle.
 *
 * Each column is the sum of the month, zodiac and (for the first 7 columns)
 * day values, reduced mod 12. A result of 0 is kept as 0 rather than mapped
 * to 12: zero is its own, meaningful outcome in the interpretation tiers.
 *
 * @param gregorianMonth - Gregorian birth month (1-12)
 * @param zodiacNumber - Chinese zodiac number (1-12, Rat=1...Pig=12)
 * @param weekday - Day of week number (1-7, Sunday=1...Saturday=7)
 * @returns CycleResult with the 12-number cycle, total score, and raw rows
 */
export function computeCycle(
  gregorianMonth: number,
  zodiacNumber: number,
  weekday: Weekday
): CycleResult {
  const monthRow = getMonthRow(gregorianMonth);
  const zodiacRow = getZodiacRow(zodiacNumber);
  const dayRow = buildDayRow(weekday);

  const cycle = monthRow.map((monthValue, col) => {
    const dayValue = dayRow[col] ?? 0; // columns past DAY_ROW_COLUMNS have no day value
    return (monthValue + zodiacRow[col] + dayValue) % 12;
  });

  return {
    cycle,
    totalScore: computeTotalScore(cycle),
    rows: {
      month: monthRow,
      zodiac: zodiacRow,
      day: dayRow,
    },
  };
}

/**
 * Computes the total score from a cycle array.
 */
export function computeTotalScore(cycle: number[]): number {
  return cycle.reduce((acc, val) => acc + val, 0);
}
