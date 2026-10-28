/**
 * Calendar Helpers
 *
 * Supported date range and calendar-validity checks shared by form
 * validation, share-URL decoding and localStorage restore.
 */

/**
 * Earliest and latest supported years (inclusive).
 *
 * The range is set by the New Year tables (Chinese New Year in zodiac.ts,
 * Khmer New Year in khmer-new-year.ts): outside them we cannot tell which
 * zodiac animal a birth before New Year belongs to.
 * Widen both together.
 */
export const SUPPORTED_YEAR_MIN = 1900;
export const SUPPORTED_YEAR_MAX = 2100;

/** True when `year` is an integer inside the supported range. */
export function isSupportedYear(year: number): boolean {
  return (
    Number.isInteger(year) &&
    year >= SUPPORTED_YEAR_MIN &&
    year <= SUPPORTED_YEAR_MAX
  );
}

/**
 * True when year/month/day name a real calendar date (e.g. rejects Feb 30).
 *
 * The Date constructor silently rolls overflowing days into the next month
 * (`new Date(2001, 1, 29)` is March 1), so we build the date and check that
 * every part survived unchanged. Uses the local-time constructor to avoid the
 * UTC shift that ISO-string parsing introduces.
 */
export function isRealCalendarDate(
  year: number,
  month: number,
  day: number
): boolean {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
