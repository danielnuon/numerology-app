/**
 * Calendar Helpers
 *
 * Supported date range and calendar-validity checks shared by form
 * validation, share-URL decoding and localStorage restore, and the month
 * names every date on the page is written with.
 */

/** English month names, indexed by Gregorian month minus one. */
export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** A date in the American order used across the site, e.g. "July 24, 1997". */
export function formatDate(year: number, month: number, day: number): string {
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

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
 * (February 29, 2001 becomes March 1), so we build the date and check that
 * every part survived unchanged. The check runs in UTC, where every calendar
 * day exists. A local date would depend on the visitor's time zone: Samoa
 * skipped December 30, 2011 when it crossed the date line, so a browser
 * there rolls that day forward too and the date looked invalid.
 */
export function isRealCalendarDate(
  year: number,
  month: number,
  day: number
): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Whether one calendar date falls after another. Compares the parts as
 * numbers, so the answer never depends on a time zone.
 */
export function isAfterDay(
  date: { year: number; month: number; day: number },
  other: { year: number; month: number; day: number }
): boolean {
  const ordinal = (d: { year: number; month: number; day: number }) => d.year * 10000 + d.month * 100 + d.day;
  return ordinal(date) > ordinal(other);
}

/**
 * The latest calendar date it is anywhere on Earth at `now`: the date in
 * UTC+14, which is at most a day ahead of the server's. A link is checked
 * against it, because the person who made the link may be a day ahead of
 * the server that opens it. Returned as a Date whose local parts
 * (getFullYear, getMonth, getDate) hold that day.
 */
export function latestDayAnywhere(now: Date): Date {
  const ahead = new Date(now.getTime() + 14 * 60 * 60 * 1000);
  return new Date(ahead.getUTCFullYear(), ahead.getUTCMonth(), ahead.getUTCDate(), 12);
}
