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

import {
  isSupportedYear,
  SUPPORTED_YEAR_MAX,
  SUPPORTED_YEAR_MIN,
} from "./calendar";
import { positiveMod } from "./cycle-math";

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
export const MIN_YEAR = SUPPORTED_YEAR_MIN;

/** Maximum supported year (inclusive). */
export const MAX_YEAR = SUPPORTED_YEAR_MAX;

/**
 * Returns the 0-based cycle index for a target year relative to a birth year.
 * The result is always in the range [0, 11].
 *
 * @param birthYear - The reference (birth) year.
 * @param targetYear - The year to look up.
 * @returns Cycle index (0-11).
 * @throws If either year is outside the supported range.
 */
export function getCycleIndex(birthYear: number, targetYear: number): number {
  validateYear(birthYear, "birthYear");
  validateYear(targetYear, "targetYear");

  return positiveMod(targetYear - birthYear, 12);
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
 * Returns the "active" year for displaying the user's current-year reading.
 *
 * The cycle advances on the user's birthday, not on January 1. Until the
 * birthday comes around in the current calendar year, the user is still in
 * the previous year's position; on or after it, the new position applies.
 *
 * @param currentYear   - The current calendar year (from `new Date().getFullYear()`).
 * @param birthMonth   - Birth month (1–12).
 * @param birthDay     - Birth day (1–31).
 * @param todayOverride - Optional date to use as "today" for deterministic testing.
 * @returns `currentYear - 1` if before birthday, otherwise `currentYear`.
 *
 * @example
 * // Born July 24, today is March 29 → returns 2025
 * getActiveYear(2026, 7, 24) === 2025
 *
 * @example
 * // Born July 24, today is July 24 → returns 2026
 * getActiveYear(2026, 7, 24) === 2026
 */
export function getActiveYear(
  currentYear: number,
  birthMonth: number,
  birthDay: number,
  todayOverride?: Date
): number {
  const today = todayOverride ?? new Date();
  const todayMonth = today.getMonth() + 1; // convert 0-indexed to 1-indexed
  const todayDay = today.getDate();

  if (todayMonth < birthMonth || (todayMonth === birthMonth && todayDay < birthDay)) {
    return currentYear - 1;
  }
  return currentYear;
}

/**
 * Returns which month of the active year today falls in, from 1 to 12.
 *
 * The year counts from the birthday, like `getActiveYear`, so month 1 runs
 * from the birthday to the same day of the next month. A birth day that the
 * month doesn't have (the 31st, or February 29) turns on the month's last day.
 *
 * @param birthMonth    - Birth month (1–12).
 * @param birthDay      - Birth day (1–31).
 * @param todayOverride - Optional date to use as "today" for deterministic testing.
 *
 * @example
 * // Born July 24, today is October 29 → month 4
 * getMonthOfActiveYear(7, 24) === 4
 */
export function getMonthOfActiveYear(birthMonth: number, birthDay: number, todayOverride?: Date): number {
  const today = todayOverride ?? new Date();
  const todayMonth = today.getMonth() + 1;
  const daysInThisMonth = new Date(today.getFullYear(), todayMonth, 0).getDate();
  const turnDay = todayMonth === birthMonth ? birthDay : Math.min(birthDay, daysInThisMonth);
  let monthsSince = (todayMonth - birthMonth + 12) % 12;
  if (today.getDate() < turnDay) monthsSince = (monthsSince + 11) % 12;
  return monthsSince + 1;
}

/**
 * Validates that a year falls within the supported range.
 *
 * @param year - The year to validate.
 * @param label - Parameter name for the error message.
 * @throws If the year is outside the supported range.
 */
function validateYear(year: number, label: string): void {
  if (!isSupportedYear(year)) {
    throw new Error(
      `Invalid ${label}: ${year}. Must be an integer between ${MIN_YEAR} and ${MAX_YEAR}.`
    );
  }
}

/**
 * The day the reading after `activeYear` begins: the birthday in the
 * following year. A February 29 birthday falls on March 1 in common years,
 * the first day getActiveYear counts as past it.
 *
 * @param activeYear - The year whose reading is showing now (from getActiveYear).
 * @param birthMonth - Birth month (1–12).
 * @param birthDay - Birth day (1–31).
 * @returns The next reading's year and the month and day it begins.
 */
export function getNextReadingStart(
  activeYear: number,
  birthMonth: number,
  birthDay: number
): { year: number; month: number; day: number } {
  const year = activeYear + 1;
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (birthMonth === 2 && birthDay === 29 && !isLeapYear) {
    return { year, month: 3, day: 1 };
  }
  return { year, month: birthMonth, day: birthDay };
}
