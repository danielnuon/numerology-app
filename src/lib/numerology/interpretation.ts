/**
 * Interpretation Engine
 *
 * Pure functions that map cycle numbers and total scores to human-readable
 * interpretations. All text is sourced from the data modules
 * (interpretation-data.ts, life-area-data.ts) so that labels and guidance can
 * be swapped for i18n without touching logic.
 */

import {
  YEAR_TIERS,
  TOTAL_TIERS,
  type TotalTier,
  type YearTier,
} from "./interpretation-data";
import { AREA_READINGS } from "./life-area-data";
import { getLifeArea } from "./year-lookup";

/** Interpretation result for a single year's cycle number. */
export interface YearInterpretation {
  /** CSS-friendly tier identifier */
  tier: YearTier;
  /** Human-readable tier label, e.g. "Very strong luck" */
  label: string;
  /** Longer description of the tier */
  description: string;
  /** Actionable guidance text */
  guidance: string;
}

/** A year read as its life area and its number together. */
export interface AreaYearInterpretation extends YearInterpretation {
  /** The life area for the year's position, e.g. "Money" */
  area: string;
  /** What this tier means for this life area */
  reading: string;
}

/** Interpretation result for the total score across all years. */
export interface TotalInterpretation {
  /** CSS-friendly tier identifier */
  tier: TotalTier;
  /** Human-readable tier label */
  label: string;
  /** Longer description of the tier */
  description: string;
}

/**
 * Returns the interpretation for a single year's cycle number.
 *
 * @param cycleNumber - The cycle number for a year (typically 0–11)
 * @returns The matching {@link YearInterpretation}
 * @throws If the cycle number does not fall within any defined tier
 */
export function interpretYear(cycleNumber: number): YearInterpretation {
  const entry = YEAR_TIERS.find(
    (t) => cycleNumber >= t.min && cycleNumber <= t.max
  );

  if (!entry) {
    throw new Error(
      `No year interpretation found for cycle number: ${cycleNumber}`
    );
  }

  return {
    tier: entry.tier,
    label: entry.label,
    description: entry.description,
    guidance: entry.guidance,
  };
}

/**
 * Reads one year of the cycle as its life area and its number together.
 *
 * The number sets the tier (how strong the year is) and the area says what
 * that strength applies to, so a 9 in Money and a 9 in Health give different
 * readings. The tier's general description and guidance are kept as well.
 *
 * @param column - 1-indexed position of the year in the cycle (1-12)
 * @param cycleNumber - The cycle number for that year (0-11)
 * @throws If the column or cycle number is out of range
 */
export function interpretAreaYear(
  column: number,
  cycleNumber: number
): AreaYearInterpretation {
  const area = getLifeArea(column);
  const year = interpretYear(cycleNumber);
  return { ...year, area, reading: AREA_READINGS[column][year.tier] };
}

/**
 * Returns the interpretation for the total score across all years in a cycle.
 *
 * @param totalScore - The sum of all year cycle numbers
 * @returns The matching {@link TotalInterpretation}
 * @throws If the total score does not fall within any defined tier
 */
export function interpretTotal(totalScore: number): TotalInterpretation {
  const entry = TOTAL_TIERS.find(
    (t) => totalScore >= t.min && totalScore <= t.max
  );

  if (!entry) {
    throw new Error(
      `No total interpretation found for score: ${totalScore}`
    );
  }

  return {
    tier: entry.tier,
    label: entry.label,
    description: entry.description,
  };
}
