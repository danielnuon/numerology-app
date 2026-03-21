/**
 * URL State Encoding
 *
 * Encodes and decodes birth dates for shareable URLs.
 * Uses YYYY-MM-DD format in the URL path (e.g., /r/1997-07-24).
 * The computed cycle is never stored — it is always recomputed server-side.
 */

import { BIRTH_YEAR_MIN, BIRTH_YEAR_MAX } from "./derive";

/** Parsed birth date from a share URL. */
export interface DecodedBirthDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Encodes a birth date as a URL-safe string (YYYY-MM-DD).
 *
 * @param year - Four-digit Gregorian year
 * @param month - Gregorian month (1-12)
 * @param day - Day of month
 * @returns Formatted date string, e.g. "1997-07-24"
 */
export function encodeBirthDate(
  year: number,
  month: number,
  day: number
): string {
  const y = String(year).padStart(4, "0");
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Decodes a birth date from a URL path segment.
 * Returns null if the date is invalid, malformed, or out of range.
 *
 * @param dateStr - Date string from URL path, e.g. "1997-07-24"
 * @returns Decoded birth date or null if invalid
 */
export function decodeBirthDate(dateStr: string): DecodedBirthDate | null {
  // Must match YYYY-MM-DD exactly
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return null;
  }

  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Range validation
  if (year < BIRTH_YEAR_MIN || year > BIRTH_YEAR_MAX) {
    return null;
  }
  if (month < 1 || month > 12) {
    return null;
  }
  if (day < 1 || day > 31) {
    return null;
  }

  // Calendar validity: check for date overflow (e.g., Feb 30)
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

/**
 * Builds the share URL path for a birth date.
 *
 * @param year - Four-digit Gregorian year
 * @param month - Gregorian month (1-12)
 * @param day - Day of month
 * @returns URL path, e.g. "/r/1997-07-24"
 */
export function buildSharePath(
  year: number,
  month: number,
  day: number
): string {
  return `/r/${encodeBirthDate(year, month, day)}`;
}
