/**
 * URL State Encoding
 *
 * Encodes and decodes birth dates for shareable URLs.
 * Uses YYYY-MM-DD format in the URL path (e.g., /r/1997-07-24). A reading
 * counted from Chinese New Year adds a suffix (/r/1997-07-24-cny), so the
 * recipient sees the same cycle; no suffix means the default Khmer New Year.
 * A comparison joins two to six readings with "+"
 * (/r/1997-07-24+2000-03-15-cny), each with its own suffix. ISO dates never
 * contain "+", so each "+" adds one person. Names, when given, travel in the
 * query string as one ?n= per person, in the same order (see
 * comparisonNamesQuery).
 * The computed cycle is never stored — it is always recomputed server-side.
 */

import { isRealCalendarDate, isSupportedYear } from "./calendar";
import { MAX_COMPARED_PEOPLE } from "./compatibility";
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
 * Returns null if the date is invalid, malformed, out of range, or in the
 * future. "Future" allows a day's grace, since the server's date can run a
 * day behind the sharer's (UTC against UTC+14).
 *
 * @param dateStr - Date string from URL path, e.g. "1997-07-24"
 * @param today - The current date, for tests
 * @returns Decoded birth date or null if invalid
 */
export function decodeBirthDate(dateStr: string, today: Date = new Date()): DecodedBirthDate | null {
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
  const latest = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1);
  if (Date.UTC(year, month - 1, day) > latest) {
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

/** Joins the readings in a comparison share segment. */
const COMPARISON_SEPARATOR = "+";

/** The longest name a comparison keeps for a person. */
export const MAX_PERSON_NAME_LENGTH = 16;

/** A shared comparison: two to six readings, the sharer's first. */
export interface DecodedComparison {
  people: DecodedShare[];
}

/**
 * Decodes a comparison share segment ("1997-07-24+2000-03-15").
 * Returns null unless it holds two to six readings and every one decodes.
 * Next.js may hand the route the "+" percent-encoded, so that is accepted too.
 */
export function decodeComparisonSegment(segment: string): DecodedComparison | null {
  const parts = segment.replace(/%2B/gi, COMPARISON_SEPARATOR).split(COMPARISON_SEPARATOR);
  if (parts.length < 2 || parts.length > MAX_COMPARED_PEOPLE) return null;
  const people = parts.map(decodeShareSegment);
  return people.every((person) => person !== null) ? { people: people as DecodedShare[] } : null;
}

/** The share segment for a comparison: every reading, joined with "+". */
export function encodeComparisonSegment(people: readonly DecodedShare[]): string {
  return people
    .map((share) => encodeShareSegment(share.year, share.month, share.day, share.rule))
    .join(COMPARISON_SEPARATOR);
}

/**
 * A person's name as a comparison keeps it: spaces collapsed, control
 * characters dropped, at most MAX_PERSON_NAME_LENGTH characters. Returns
 * null for a missing or empty name.
 */
export function cleanPersonName(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
  return cleaned ? Array.from(cleaned).slice(0, MAX_PERSON_NAME_LENGTH).join("") : null;
}

/**
 * The names in a comparison link's ?n= values, one per person in order,
 * cleaned; null where a person has none. Extra values are ignored.
 */
export function decodeComparisonNames(values: readonly string[] | undefined, count: number): (string | null)[] {
  return Array.from({ length: count }, (_, i) => cleanPersonName(values?.[i]));
}

/**
 * The query string that carries a comparison's names ("?n=&n=Sam"), or ""
 * when nobody has one, so a link without names stays as short as before.
 */
export function comparisonNamesQuery(names: readonly (string | null)[]): string {
  if (!names.some((name) => cleanPersonName(name) !== null)) return "";
  const params = new URLSearchParams();
  for (const name of names) params.append("n", cleanPersonName(name) ?? "");
  return `?${params.toString()}`;
}

/**
 * Builds the share URL for a comparison, with names if anyone has one.
 *
 * @param people - Every reading, the sharer's first
 * @param names - Each person's name or null, in the same order
 * @returns e.g. "/r/1997-07-24+2000-03-15-cny" or "/r/1997-07-24+2000-03-15?n=&n=Sam"
 */
export function buildComparisonSharePath(
  people: readonly DecodedShare[],
  names: readonly (string | null)[] = []
): string {
  return `/r/${encodeComparisonSegment(people)}${comparisonNamesQuery(names)}`;
}
