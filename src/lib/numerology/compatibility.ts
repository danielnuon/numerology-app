/**
 * Compatibility
 *
 * How two people's cycles interact, following Khmer numerology's rules in
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

/**
 * Each overall assessment's heading and one calm sentence, for the page and
 * link previews. Khmer numerology calls the "challenging" assessment Challenging;
 * Solini shows it as "Low stability", in line with the other three, so a
 * comparison of two people never reads as a warning. How your cycle is made
 * names the original word.
 */
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
    label: "Low stability",
    description: "Both cycles run low overall, so be patient with each other in the harder years.",
  },
};

/** Every interaction, from most to least supportive: the order of legends and counts. */
export const INTERACTION_ORDER: readonly YearInteraction[] = [
  "amplified",
  "stabilized",
  "neutral",
  "risk",
  "unstable",
];

/**
 * Each interaction's symbol, word and one-line meaning. The symbol is
 * decoration beside the word, so color is never the only cue. Khmer
 * numerology calls the "risk" interaction Risk; Solini shows it as "Low together" for
 * the same reason as "Low stability" above.
 */
export const INTERACTION_TEXT: Record<YearInteraction, { symbol: string; label: string; meaning: string }> = {
  amplified: { symbol: "★", label: "Amplified", meaning: "Both years are strong, so the luck builds." },
  stabilized: { symbol: "▲", label: "Stabilized", meaning: "The stronger year steadies the weaker one." },
  neutral: { symbol: "—", label: "Neutral", meaning: "No strong pull either way." },
  risk: { symbol: "▼", label: "Low together", meaning: "Both years are low, so weakness compounds. Go gently." },
  unstable: { symbol: "⊙", label: "Unstable", meaning: "A reset year on either side unsettles the pair." },
};

/** One calendar year of a comparison. */
export interface ComparedYear {
  year: number;
  /** The first person's cycle number for the year (0–11), or null before their birth year. */
  firstNumber: number | null;
  /** The second person's cycle number for the year (0–11), or null before their birth year. */
  secondNumber: number | null;
  /** How the two numbers meet, or null when either person wasn't born yet. */
  interaction: YearInteraction | null;
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
 * The compatibility table covers both at 68 or more (strong), both at 60 or more
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
 * year, which starts on their birthday in it. A year before someone's birth
 * year has no number for them and no interaction, so an earlier cycle can
 * be compared even when one person arrived partway through it.
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
    const firstNumber = year >= firstBirthYear ? getYearNumber(firstCycle, firstBirthYear, year) : null;
    const secondNumber = year >= secondBirthYear ? getYearNumber(secondCycle, secondBirthYear, year) : null;
    const interaction =
      firstNumber === null || secondNumber === null ? null : yearInteraction(firstNumber, secondNumber);
    return { year, firstNumber, secondNumber, interaction };
  });
}

/** The first calendar year of the 12-year cycle that holds `year`, counted from the birth year. */
export function cycleStartYear(birthYear: number, year: number): number {
  return birthYear + 12 * Math.floor((year - birthYear) / 12);
}

/**
 * The cycles a comparison can show, newest first: the first person's
 * current cycle and up to `count - 1` complete cycles before it. Cycles
 * follow the first person's birth year, since the comparison sits under
 * their reading. A cycle is left out if it starts before the first person
 * was born or ends before the second person was born, because it would
 * have no year in common.
 *
 * @param firstBirthYear - The first person's birth year (the cycles' anchor)
 * @param secondBirthYear - The second person's birth year
 * @param activeYear - The first person's current cycle year (see getActiveYear)
 * @param count - At most how many cycles to offer (3: this one and two before)
 * @returns Each cycle's first calendar year
 */
export function comparisonCycleStarts(
  firstBirthYear: number,
  secondBirthYear: number,
  activeYear: number,
  count = 3
): number[] {
  const current = cycleStartYear(firstBirthYear, activeYear);
  return Array.from({ length: count }, (_, i) => current - 12 * i).filter(
    (start) => start >= firstBirthYear && start + 11 >= secondBirthYear
  );
}

/** A comparison at a glance: how many years of each interaction, and the current year's. */
export interface ComparisonSummary {
  /** How many of the compared years have each interaction. Years before either birth aren't counted. */
  counts: Record<YearInteraction, number>;
  /** How many years both people share in the compared span. */
  sharedYears: number;
  /** The compared year that is the current one, if it is among them. */
  current: ComparedYear | null;
}

/**
 * Counts each interaction across the compared years and picks out the
 * current year.
 *
 * @param years - Output of compareCycles()
 * @param currentYear - The calendar year to highlight (the visitor's active year)
 */
export function summarizeComparison(years: ComparedYear[], currentYear: number): ComparisonSummary {
  const counts: Record<YearInteraction, number> = { amplified: 0, stabilized: 0, neutral: 0, risk: 0, unstable: 0 };
  let sharedYears = 0;
  for (const year of years) {
    if (year.interaction === null) continue;
    counts[year.interaction] += 1;
    sharedYears += 1;
  }
  return { counts, sharedYears, current: years.find((year) => year.year === currentYear) ?? null };
}
