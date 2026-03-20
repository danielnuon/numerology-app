/**
 * Birth Data Derivation
 *
 * Pure functions that derive weekday, Chinese zodiac, and compute the
 * numerology cycle from raw birth date inputs. Keeps all domain logic
 * out of UI components.
 */

import { computeCycle, type CycleResult, type Weekday } from "./calculate";
import { getZodiacAnimal, getZodiacNumber, type ZodiacAnimal } from "./zodiac";

/** The year range supported by the CNY lookup table. */
export const BIRTH_YEAR_MIN = 1900;
export const BIRTH_YEAR_MAX = 2100;

/** All data derived from a birth date. */
export interface BirthData {
  /** Gregorian birth month (1-12), passed through unchanged. */
  gregorianMonth: number;
  /** Weekday number (1-7, Sunday=1 ... Saturday=7). */
  weekday: Weekday;
  /** Chinese zodiac number (1-12, Rat=1 ... Pig=12), CNY-boundary adjusted. */
  zodiacNumber: number;
  /** Human-readable zodiac animal name. */
  zodiacAnimal: ZodiacAnimal;
}

/** Validation error structure returned by validateBirthDate. */
export interface BirthDateValidationError {
  field: "day" | "month" | "year" | "date";
  message: string;
}

/**
 * Validates raw birth date inputs.
 *
 * @param year - Four-digit Gregorian year
 * @param month - Gregorian month (1-12)
 * @param day - Day of month (1-31, calendar-aware)
 * @param todayOverride - Optional today date for deterministic testing
 * @returns Array of validation errors, empty if inputs are valid
 */
export function validateBirthDate(
  year: number,
  month: number,
  day: number,
  todayOverride?: Date
): BirthDateValidationError[] {
  const errors: BirthDateValidationError[] = [];

  if (!Number.isInteger(year) || year < BIRTH_YEAR_MIN || year > BIRTH_YEAR_MAX) {
    errors.push({
      field: "year",
      message: `Year must be between ${BIRTH_YEAR_MIN} and ${BIRTH_YEAR_MAX}.`,
    });
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    errors.push({ field: "month", message: "Month must be between 1 and 12." });
  }

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    errors.push({ field: "day", message: "Day must be between 1 and 31." });
  }

  // Only check calendar validity and future date if year/month/day passed basic range checks
  if (errors.length === 0) {
    const date = new Date(year, month - 1, day);
    // Detect overflow: new Date(2000, 1, 30) overflows to March, so getMonth() !== month-1
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      errors.push({ field: "date", message: "Invalid date for the given month." });
    } else {
      const today = todayOverride ?? new Date();
      const todayNoon = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      if (date > todayNoon) {
        errors.push({ field: "date", message: "Birth date cannot be in the future." });
      }
    }
  }

  return errors;
}

/**
 * Derives all birth data (weekday, zodiac, month position) from raw date parts.
 * Does not validate — call validateBirthDate first.
 *
 * Uses the local-date constructor `new Date(year, month - 1, day)` to avoid
 * UTC-offset issues that arise from ISO string parsing.
 *
 * @param year - Four-digit Gregorian year
 * @param month - Gregorian month (1-12)
 * @param day - Day of month
 * @returns BirthData with derived weekday, zodiac number, zodiac animal, and month
 */
export function deriveBirthData(year: number, month: number, day: number): BirthData {
  const date = new Date(year, month - 1, day);

  // JS getDay(): 0=Sun, 1=Mon...6=Sat → Weekday type: 1=Sun, 2=Mon...7=Sat
  const weekday = (date.getDay() + 1) as Weekday;

  const zodiacNumber = getZodiacNumber(date);
  const zodiacAnimal = getZodiacAnimal(date);

  return {
    gregorianMonth: month,
    weekday,
    zodiacNumber,
    zodiacAnimal,
  };
}

/** Extended cycle result that also carries the birth year for year-lookup queries. */
export interface CycleResultWithYear extends CycleResult {
  birthYear: number;
  birthData: BirthData;
}

/**
 * Derives birth data and computes the numerology cycle in one step.
 *
 * @param year - Four-digit Gregorian year
 * @param month - Gregorian month (1-12)
 * @param day - Day of month
 * @returns CycleResultWithYear combining CycleResult, birthYear, and BirthData
 */
export function computeCycleFromBirthDate(
  year: number,
  month: number,
  day: number
): CycleResultWithYear {
  const birthData = deriveBirthData(year, month, day);
  const cycleResult = computeCycle(
    birthData.gregorianMonth,
    birthData.zodiacNumber,
    birthData.weekday
  );

  return {
    ...cycleResult,
    birthYear: year,
    birthData,
  };
}
