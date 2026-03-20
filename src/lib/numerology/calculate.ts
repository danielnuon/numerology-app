/**
 * Numerology Calculation Core
 *
 * Pure function module that computes the 12-number life cycle from
 * birth month, zodiac number, and weekday number. Zero UI dependencies.
 */

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
 * Builds the day row (7 values only, columns 8-12 are empty).
 * Starts at the weekday number and cycles through 1-7.
 *
 * Example: Thursday (5) → [5, 6, 7, 1, 2, 3, 4]
 */
export function buildDayRow(weekday: Weekday): number[] {
  const row: number[] = [];
  for (let i = 0; i < 7; i++) {
    row.push(((weekday - 1 + i) % 7) + 1);
  }
  return row;
}

/**
 * Computes the 12-number life cycle.
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

  const cycle: number[] = [];

  for (let col = 0; col < 12; col++) {
    let sum = monthRow[col] + zodiacRow[col];

    // Day row only fills columns 0-6 (1-7 in 1-indexed)
    if (col < 7) {
      sum += dayRow[col];
    }

    // mod 12, where 12 mod 12 = 0 (zero is valid)
    cycle.push(sum % 12);
  }

  const totalScore = cycle.reduce((acc, val) => acc + val, 0);

  return {
    cycle,
    totalScore,
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
