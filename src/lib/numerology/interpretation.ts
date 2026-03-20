/**
 * Interpretation Engine
 *
 * Pure functions that map cycle numbers and total scores to human-readable
 * interpretations. All text is sourced from the data module (interpretation-data.ts)
 * so that labels and guidance can be swapped for i18n without touching logic.
 */

import { YEAR_TIERS, TOTAL_TIERS } from "./interpretation-data";

/** Interpretation result for a single year's cycle number. */
export interface YearInterpretation {
  /** CSS-friendly tier identifier: "very-strong" | "strong" | "moderate" | "weak" | "zero" */
  tier: string;
  /** Human-readable tier label, e.g. "Very strong luck" */
  label: string;
  /** Longer description of the tier */
  description: string;
  /** Actionable guidance text */
  guidance: string;
}

/** Interpretation result for the total score across all years. */
export interface TotalInterpretation {
  /** CSS-friendly tier identifier: "strong" | "moderate" | "weak" */
  tier: string;
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
