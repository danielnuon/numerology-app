/**
 * Compatibility
 *
 * How two people's cycles interact, following the family's rules in
 * docs/system-overview.md ("Compatibility"). Each person's number for a
 * calendar year maps to a compatibility tier, the pair of tiers gives that
 * year's interaction, and the two total scores give an overall assessment.
 * Pure functions, so the comparison view and its tests share one source.
 */

import { getYearNumber } from "./year-lookup";

/**
 * A year number's tier for compatibility. Zero is its own tier because it
 * overrides every pairing; "high" merges the strong (7–9) and very strong
 * (10–11) luck tiers.
 */
export type CompatibilityTier = "zero" | "low" | "moderate" | "high";

/** The outcome of two people's numbers meeting in one year. */
export type YearInteraction = "stabilized" | "amplified" | "risk" | "unstable" | "neutral";

/** Overall assessment from both people's total scores. */
export type StabilityAssessment = "strong" | "moderate" | "mixed" | "challenging";

/** Each overall assessment's heading and one calm sentence, for the page and link previews. */
export const STABILITY_TEXT: Record<StabilityAssessment, { label: string; description: string }> = {
  strong: {
    label: "Strong stability",
    description: "Both cycles are strong overall, so each of you has ground to lean on.",
  },
  moderate: {
    label: "Moderate stability",
    description: "Both cycles are balanced overall: steady ground to share.",
  },
  mixed: {
    label: "Mixed stability",
    description: "One cycle runs steadier than the other, so the steadier one often carries more.",
  },
  challenging: {
    label: "Challenging",
    description: "Both cycles run low overall, so be patient with each other in the harder years.",
  },
};

/** One calendar year of a comparison. */
export interface ComparedYear {
  year: number;
  /** The first person's cycle number for the year (0–11). */
  firstNumber: number;
  /** The second person's cycle number for the year (0–11). */
  secondNumber: number;
  interaction: YearInteraction;
}

/** Maps a cycle number (0–11) to its compatibility tier. */
export function compatibilityTier(cycleNumber: number): CompatibilityTier {
  if (cycleNumber === 0) return "zero";
  if (cycleNumber <= 3) return "low";
  if (cycleNumber <= 6) return "moderate";
  return "high";
}

/**
 * Non-zero pairings, keyed by the two tiers in a fixed order so the lookup
 * is symmetric. All six unique pairs are defined.
 */
const PAIR_INTERACTIONS: Record<string, YearInteraction> = {
  "low+low": "risk",
  "low+moderate": "neutral",
  "high+low": "stabilized",
  "moderate+moderate": "neutral",
  "high+moderate": "stabilized",
  "high+high": "amplified",
};

/**
 * The interaction of two people's numbers in the same year. A zero on
 * either side makes the year unstable, whatever the other number is; that
 * override comes before every tier pairing.
 */
export function yearInteraction(first: number, second: number): YearInteraction {
  const tiers = [compatibilityTier(first), compatibilityTier(second)];
  if (tiers.includes("zero")) return "unstable";
  return PAIR_INTERACTIONS[tiers.sort().join("+")];
}

/**
 * Overall assessment from two total scores.
 *
 * The family's table covers both at 68 or more (strong), both at 60 or more
 * (moderate), one at 68 or more with the other under 60 (mixed), and both
 * under 60 (challenging). It leaves out one score from 60 to 67 with the
 * other under 60; Solini reads that as mixed too, since one person is on
 * steady ground and the other isn't (see docs/system-overview.md).
 */
export function assessStability(firstTotal: number, secondTotal: number): StabilityAssessment {
  const low = Math.min(firstTotal, secondTotal);
  const high = Math.max(firstTotal, secondTotal);
  if (low >= 68) return "strong";
  if (low >= 60) return "moderate";
  if (high >= 60) return "mixed";
  return "challenging";
}

/**
 * Each person's number and the interaction for consecutive calendar years.
 * A person's number for a calendar year is the one their cycle gives that
 * year, which starts on their birthday in it.
 *
 * @param firstCycle - The first person's 12-number cycle
 * @param firstBirthYear - The first person's birth year (their cycle anchor)
 * @param secondCycle - The second person's 12-number cycle
 * @param secondBirthYear - The second person's birth year
 * @param fromYear - The first calendar year to compare
 * @param count - How many years to compare (12 covers a full cycle)
 */
export function compareCycles(
  firstCycle: number[],
  firstBirthYear: number,
  secondCycle: number[],
  secondBirthYear: number,
  fromYear: number,
  count = 12
): ComparedYear[] {
  return Array.from({ length: count }, (_, i) => {
    const year = fromYear + i;
    const firstNumber = getYearNumber(firstCycle, firstBirthYear, year);
    const secondNumber = getYearNumber(secondCycle, secondBirthYear, year);
    return { year, firstNumber, secondNumber, interaction: yearInteraction(firstNumber, secondNumber) };
  });
}
