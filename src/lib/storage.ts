/**
 * LocalStorage persistence for birth date data.
 *
 * Stores `{ day, month, year }` under a namespaced key. The computed cycle
 * is never persisted — always recomputed on load from the stored date.
 */

import { isRealCalendarDate, isSupportedYear } from "./numerology/calendar";
import { isNewYearRule, type NewYearRule } from "./numerology/zodiac";

// Changing this key would silently drop every returning visitor's saved
// birth date, so keep it as-is even if the app is renamed.
const STORAGE_KEY = "khmer-numerology:birth";

/** The shape stored in localStorage. */
export interface StoredBirthDate {
  day: number;
  month: number;
  year: number;
}

/**
 * Reads and validates birth date from localStorage.
 *
 * Returns null if:
 * - localStorage is unavailable (SSR, private browsing)
 * - The key is missing
 * - The JSON is malformed or corrupted
 * - Any field is missing, non-numeric, or out of range
 * - The date is not a valid calendar date
 *
 * @returns Validated StoredBirthDate or null
 */
export function readStoredBirthDate(): StoredBirthDate | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);

    // Must be a non-null object
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }

    const obj = parsed as Record<string, unknown>;

    // All three fields must be present and numeric
    if (
      typeof obj.day !== "number" ||
      typeof obj.month !== "number" ||
      typeof obj.year !== "number"
    ) {
      return null;
    }

    const { day, month, year } = obj as unknown as StoredBirthDate;

    if (!Number.isInteger(day) || !Number.isInteger(month)) return null;
    if (!isSupportedYear(year)) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    if (!isRealCalendarDate(year, month, day)) return null;

    return { day, month, year };
  } catch {
    // JSON.parse failure, localStorage access error, etc.
    return null;
  }
}

/**
 * Saves birth date to localStorage.
 *
 * @param day - Day of month (1-31)
 * @param month - Month (1-12)
 * @param year - Four-digit year (1900-2100)
 */
export function saveBirthDate(day: number, month: number, year: number): void {
  try {
    const data: StoredBirthDate = { day, month, year };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail — quota exceeded, private browsing, etc.
  }
}

/**
 * Clears the stored birth date from localStorage.
 */
export function clearStoredBirthDate(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

/** Exported for testing — the raw localStorage key. */
export const BIRTH_DATE_STORAGE_KEY = STORAGE_KEY;

/** Where the visitor's New Year choice (Khmer or Chinese) is remembered. */
export const NEW_YEAR_RULE_STORAGE_KEY = "khmer-numerology:new-year";

/** Reads the remembered New Year rule, or null if none (or unreadable). */
export function readStoredNewYearRule(): NewYearRule | null {
  try {
    const value = localStorage.getItem(NEW_YEAR_RULE_STORAGE_KEY);
    return isNewYearRule(value) ? value : null;
  } catch {
    return null;
  }
}

/** Remembers the visitor's New Year rule for later visits. */
export function saveNewYearRule(rule: NewYearRule): void {
  try {
    localStorage.setItem(NEW_YEAR_RULE_STORAGE_KEY, rule);
  } catch {
    // Silently fail — quota exceeded, private browsing, etc.
  }
}
