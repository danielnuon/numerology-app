/**
 * Birth Data Derivation
 *
 * Pure functions that derive weekday, zodiac animal, and compute the
 * numerology cycle from raw birth date inputs. Keeps all domain logic
 * out of UI components.
 */

import { computeCycle, type CycleResult, type Weekday } from "./calculate";
import {
  isAfterDay,
  isRealCalendarDate,
  isSupportedYear,
  SUPPORTED_YEAR_MAX,
  SUPPORTED_YEAR_MIN,
} from "./calendar";
import {
  DEFAULT_NEW_YEAR_RULE,
  getZodiacAnimal,
  getZodiacNumber,
  type NewYearRule,
  type ZodiacAnimal,
} from "./zodiac";

/** All data derived from a birth date. */
export interface BirthData {
  /** Gregorian birth month (1-12), passed through unchanged. */
  gregorianMonth: number;
  /** Weekday number (1-7, Sunday=1 ... Saturday=7). */
  weekday: Weekday;
  /** Zodiac number (1-12, Rat=1 ... Pig=12), adjusted for the New Year boundary. */
  zodiacNumber: number;
  /** Human-readable zodiac animal name. */
  zodiacAnimal: ZodiacAnimal;
  /** The New Year boundary the animal was counted from. */
  newYearRule: NewYearRule;
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

  if (!isSupportedYear(year)) {
    errors.push({
      field: "year",
      message: `Enter a year from ${SUPPORTED_YEAR_MIN} to ${SUPPORTED_YEAR_MAX}.`,
    });
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    errors.push({ field: "month", message: "Enter a month from 1 to 12." });
  }

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    errors.push({ field: "day", message: "Enter a day from 1 to 31." });
  }

  // Calendar and future-date checks only make sense once each part is in range.
  if (errors.length === 0) {
    if (!isRealCalendarDate(year, month, day)) {
      errors.push({ field: "date", message: "That date doesn't exist. Check the day and month." });
    } else {
      const today = todayOverride ?? new Date();
      // Compared by calendar day, so a birth date of today is accepted
      // whatever the time of day.
      const todayParts = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
      if (isAfterDay({ year, month, day }, todayParts)) {
        errors.push({ field: "date", message: "A birth date can't be in the future." });
      }
    }
  }

  return errors;
}

/**
 * Derives all birth data (weekday, zodiac, month position) from raw date parts.
 * Does not validate — call validateBirthDate first.
 *
 * The weekday is read in UTC so it never depends on the visitor's time zone.
 * The animal is looked up from a local date, which a time zone can only move
 * on a day its calendar skipped; none of those is near a New Year.
 *
 * @param year - Four-digit Gregorian year
 * @param month - Gregorian month (1-12)
 * @param day - Day of month
 * @param rule - Which New Year turns the animal year (Khmer by default)
 * @returns BirthData with derived weekday, zodiac number, zodiac animal, and month
 */
export function deriveBirthData(
  year: number,
  month: number,
  day: number,
  rule: NewYearRule = DEFAULT_NEW_YEAR_RULE
): BirthData {
  const date = new Date(year, month - 1, day);

  // JS getUTCDay() is 0-based (0=Sun); the Khmer weekday numbering is 1-based
  // (1=Sun). Read in UTC, where every calendar day exists (see isRealCalendarDate).
  const weekday = (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 1) as Weekday;

  const zodiacNumber = getZodiacNumber(date, rule);
  const zodiacAnimal = getZodiacAnimal(date, rule);

  return {
    gregorianMonth: month,
    weekday,
    zodiacNumber,
    zodiacAnimal,
    newYearRule: rule,
  };
}

/**
 * Cycle result plus the birth date it came from. Year lookups need the birth
 * year as the cycle's anchor, and birthday timing needs the month and day.
 */
export interface CycleResultWithYear extends CycleResult {
  birthYear: number;
  birthDay: number;
  birthData: BirthData;
}

/**
 * Derives birth data and computes the numerology cycle in one step.
 *
 * @param year - Four-digit Gregorian year
 * @param month - Gregorian month (1-12)
 * @param day - Day of month
 * @param rule - Which New Year turns the animal year (Khmer by default)
 * @returns CycleResultWithYear combining CycleResult, birthYear, and BirthData
 */
export function computeCycleFromBirthDate(
  year: number,
  month: number,
  day: number,
  rule: NewYearRule = DEFAULT_NEW_YEAR_RULE
): CycleResultWithYear {
  const birthData = deriveBirthData(year, month, day, rule);
  const cycleResult = computeCycle(
    birthData.gregorianMonth,
    birthData.zodiacNumber,
    birthData.weekday
  );

  return {
    ...cycleResult,
    birthYear: year,
    birthDay: day,
    birthData,
  };
}

/**
 * The animal a birth date gets under each New Year rule. They differ only for
 * births between Chinese New Year and Khmer New Year (roughly February to
 * mid-April), which is when the choice of rule changes the reading.
 */
export function zodiacAnimalByRule(
  year: number,
  month: number,
  day: number
): Record<NewYearRule, ZodiacAnimal> {
  const date = new Date(year, month - 1, day);
  return {
    khmer: getZodiacAnimal(date, "khmer"),
    chinese: getZodiacAnimal(date, "chinese"),
  };
}
