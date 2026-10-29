/**
 * URL State Encoding
 *
 * Encodes and decodes birth dates for shareable URLs.
 * Uses YYYY-MM-DD format in the URL path (e.g., /r/1997-07-24). A reading
 * counted from Chinese New Year adds a suffix (/r/1997-07-24-cny), so the
 * recipient sees the same cycle; no suffix means the default Khmer New Year.
 * A comparison joins two readings with "+" (/r/1997-07-24+2000-03-15-cny),
 * each with its own suffix. ISO dates never contain "+", so one "+" always
 * means two people.
 * The computed cycle is never stored — it is always recomputed server-side.
 */

import { isRealCalendarDate, isSupportedYear } from "./calendar";
import { DEFAULT_NEW_YEAR_RULE, type NewYearRule } from "./zodiac";

/** Path suffix marking a reading counted from Chinese New Year. */
const CHINESE_NEW_YEAR_SUFFIX = "-cny";

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

  if (!isSupportedYear(year) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  if (!isRealCalendarDate(year, month, day)) {
    return null;
  }

  return { year, month, day };
}

/** A shared reading: the birth date plus the New Year rule it was counted with. */
export interface DecodedShare extends DecodedBirthDate {
  rule: NewYearRule;
}

/**
 * Encodes a birth date and New Year rule as a share path segment.
 *
 * @returns e.g. "1997-07-24" (Khmer New Year) or "1997-07-24-cny"
 */
export function encodeShareSegment(
  year: number,
  month: number,
  day: number,
  rule: NewYearRule
): string {
  const suffix = rule === "chinese" ? CHINESE_NEW_YEAR_SUFFIX : "";
  return `${encodeBirthDate(year, month, day)}${suffix}`;
}

/**
 * Decodes a share path segment into a birth date and New Year rule.
 * Returns null if the date part is invalid or the suffix is unknown.
 */
export function decodeShareSegment(segment: string): DecodedShare | null {
  const isChinese = segment.endsWith(CHINESE_NEW_YEAR_SUFFIX);
  const dateStr = isChinese
    ? segment.slice(0, -CHINESE_NEW_YEAR_SUFFIX.length)
    : segment;
  const decoded = decodeBirthDate(dateStr);
  if (!decoded) return null;
  return { ...decoded, rule: isChinese ? "chinese" : "khmer" };
}

/**
 * Builds the share URL path for a birth date.
 *
 * @param year - Four-digit Gregorian year
 * @param month - Gregorian month (1-12)
 * @param day - Day of month
 * @param rule - The New Year rule the reading was counted with
 * @returns URL path, e.g. "/r/1997-07-24"
 */
export function buildSharePath(
  year: number,
  month: number,
  day: number,
  rule: NewYearRule = DEFAULT_NEW_YEAR_RULE
): string {
  return `/r/${encodeShareSegment(year, month, day, rule)}`;
}

/** Joins the two readings in a comparison share segment. */
const COMPARISON_SEPARATOR = "+";

/** A shared comparison: two readings, the visitor's first. */
export interface DecodedComparison {
  first: DecodedShare;
  second: DecodedShare;
}

/**
 * Decodes a comparison share segment ("1997-07-24+2000-03-15").
 * Returns null unless there is exactly one "+" and both halves decode.
 * Next.js may hand the route the "+" percent-encoded, so that is accepted too.
 */
export function decodeComparisonSegment(segment: string): DecodedComparison | null {
  const parts = segment.replace(/%2B/gi, COMPARISON_SEPARATOR).split(COMPARISON_SEPARATOR);
  if (parts.length !== 2) return null;
  const first = decodeShareSegment(parts[0]);
  const second = decodeShareSegment(parts[1]);
  return first && second ? { first, second } : null;
}

/**
 * Builds the share URL path for a comparison of two readings.
 *
 * @returns URL path, e.g. "/r/1997-07-24+2000-03-15-cny"
 */
export function buildComparisonSharePath(first: DecodedShare, second: DecodedShare): string {
  const encode = (share: DecodedShare) =>
    encodeShareSegment(share.year, share.month, share.day, share.rule);
  return `/r/${encode(first)}${COMPARISON_SEPARATOR}${encode(second)}`;
}
