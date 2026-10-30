/**
 * Compatibility
 *
 * How the cycles of two or more people interact, following Khmer
 * numerology's rules in docs/system-overview.md ("Compatibility"). Each
 * person's number for a calendar year maps to a compatibility tier, the
 * tiers give that year's interaction, and the total scores give an overall
 * assessment. Khmer numerology defines these for a pair only; for three or
 * more people Solini extends the pair rule (householdInteraction,
 * assessStability), and with two people the extension gives exactly the
 * pair rule. Pure functions, so the comparison view and its tests share one
 * source.
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

/** Overall assessment from everyone's total scores. */
export type StabilityAssessment = "strong" | "moderate" | "mixed" | "challenging";

/** The most people one comparison holds, the reading's owner included. */
export const MAX_COMPARED_PEOPLE = 6;

/**
 * Each overall assessment's heading and one calm sentence for a pair, for
 * the page and link previews. Khmer numerology calls the "challenging"
 * assessment Challenging; Solini shows it as "Low stability", in line with
 * the other three, so a comparison of two people never reads as a warning.
 * How your cycle is made names the original word. stabilityText() gives the
 * wording for three or more.
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

/** The same assessments worded for three or more people. */
const GROUP_STABILITY_DESCRIPTION: Record<StabilityAssessment, string> = {
  strong: "Every cycle is strong overall, so each of you has ground to lean on.",
  moderate: "All the cycles are balanced overall: steady ground to share.",
  mixed: "Some cycles run steadier than others, so the steadier ones often carry more.",
  challenging: "All the cycles run low overall, so be patient with each other in the harder years.",
};

/** An assessment's heading and sentence, worded for a pair or for `count` people. */
export function stabilityText(
  assessment: StabilityAssessment,
  count: number
): { label: string; description: string } {
  const pair = STABILITY_TEXT[assessment];
  return count > 2 ? { label: pair.label, description: GROUP_STABILITY_DESCRIPTION[assessment] } : pair;
}

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

/** One person's cycle, as a comparison needs it. */
export interface ComparedCycle {
  /** The 12-number cycle. */
  cycle: number[];
  /** The birth year, which anchors the cycle. */
  birthYear: number;
}

/** One calendar year of a comparison. */
export interface ComparedYear {
  year: number;
  /** Each person's cycle number for the year (0–11), in comparison order, or null before their birth year. */
  numbers: (number | null)[];
  /** How the numbers meet, or null when fewer than two people were born yet. */
  interaction: YearInteraction | null;
  /** The people (by index) in a reset year, which is what makes a year unstable. */
  resetting: number[];
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
 * The interaction of everyone's numbers in the same year: Solini's extension
 * of the pair rule to a household, since Khmer numerology compares two
 * people at a time (see docs/system-overview.md, "Households"). A zero
 * anywhere overrides, as it overrides every pairing. Otherwise everyone
 * strong amplifies; at least one strong year, and at least as many strong
 * years as low ones, stabilizes; more low years than all the others
 * compounds into "risk"; anything else is neutral. For two numbers this
 * gives exactly yearInteraction(), which a test checks for every pair.
 *
 * @param numbers - Each person's cycle number for the year (0–11); at least two
 */
export function householdInteraction(numbers: readonly number[]): YearInteraction {
  const tiers = numbers.map(compatibilityTier);
  if (tiers.includes("zero")) return "unstable";
  const high = tiers.filter((tier) => tier === "high").length;
  const low = tiers.filter((tier) => tier === "low").length;
  if (high === tiers.length) return "amplified";
  if (high > 0 && high >= low) return "stabilized";
  if (low > tiers.length - low) return "risk";
  return "neutral";
}

/** One pair's interaction in a year, by the people's indexes in the comparison. */
export interface PairInteraction {
  first: number;
  second: number;
  interaction: YearInteraction;
}

/**
 * Every pair's interaction for one year, by Khmer numerology's pair rule
 * alone, so a household's year can be checked against it. People not born
 * yet (null) are left out.
 *
 * @param numbers - Each person's number for the year, as in ComparedYear
 */
export function pairInteractions(numbers: readonly (number | null)[]): PairInteraction[] {
  const pairs: PairInteraction[] = [];
  numbers.forEach((a, first) => {
    numbers.forEach((b, second) => {
      if (second <= first || a === null || b === null) return;
      pairs.push({ first, second, interaction: yearInteraction(a, b) });
    });
  });
  return pairs;
}

/**
 * Overall assessment from everyone's total scores.
 *
 * The compatibility table covers two people: both at 68 or more (strong), both
 * at 60 or more (moderate), one at 68 or more with the other under 60
 * (mixed), and both under 60 (challenging). It leaves out one score from 60
 * to 67 with the other under 60; Solini reads that as mixed too, since one
 * person is on steady ground and the other isn't. For three or more people
 * Solini reads "both" as "all" (see docs/system-overview.md).
 *
 * @param totals - Each person's total score; at least two
 */
export function assessStability(totals: readonly number[]): StabilityAssessment {
  const low = Math.min(...totals);
  const high = Math.max(...totals);
  if (low >= 68) return "strong";
  if (low >= 60) return "moderate";
  if (high >= 60) return "mixed";
  return "challenging";
}

/**
 * Each person's number and the interaction for consecutive calendar years.
 * A person's number for a calendar year is the one their cycle gives that
 * year, which starts on their birthday in it. A year before someone's birth
 * year has no number for them, and the interaction is read among the
 * people born by then; with fewer than two there is none. So an earlier
 * cycle can be compared even when someone arrived partway through it.
 *
 * @param people - Everyone's cycle, the reading's owner first
 * @param fromYear - The first calendar year to compare
 * @param count - How many years to compare (12 covers a full cycle)
 */
export function compareCycles(people: readonly ComparedCycle[], fromYear: number, count = 12): ComparedYear[] {
  return Array.from({ length: count }, (_, i) => {
    const year = fromYear + i;
    const numbers = people.map(({ cycle, birthYear }) =>
      year >= birthYear ? getYearNumber(cycle, birthYear, year) : null
    );
    const born = numbers.filter((n): n is number => n !== null);
    const interaction = born.length >= 2 ? householdInteraction(born) : null;
    const resetting = interaction === "unstable" ? numbers.flatMap((n, index) => (n === 0 ? [index] : [])) : [];
    return { year, numbers, interaction, resetting };
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
 * was born or ends before anyone else was born, because it would have no
 * year in common.
 *
 * @param firstBirthYear - The first person's birth year (the cycles' anchor)
 * @param otherBirthYears - Everyone else's birth years
 * @param activeYear - The first person's current cycle year (see getActiveYear)
 * @param count - At most how many cycles to offer (3: this one and two before)
 * @returns Each cycle's first calendar year
 */
export function comparisonCycleStarts(
  firstBirthYear: number,
  otherBirthYears: readonly number[],
  activeYear: number,
  count = 3
): number[] {
  const current = cycleStartYear(firstBirthYear, activeYear);
  const earliestOther = Math.min(...otherBirthYears);
  return Array.from({ length: count }, (_, i) => current - 12 * i).filter(
    (start) => start >= firstBirthYear && start + 11 >= earliestOther
  );
}

/** A comparison at a glance: how many years of each interaction, and the current year's. */
export interface ComparisonSummary {
  /** How many of the compared years have each interaction. Years with fewer than two people born aren't counted. */
  counts: Record<YearInteraction, number>;
  /** How many years in the compared span have at least two people born. */
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
