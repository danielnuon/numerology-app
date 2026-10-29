/**
 * Interpretation Data
 *
 * Data-driven tier definitions for year cycle numbers and total scores.
 * All labels, descriptions, and guidance text are defined here as exported
 * constants, enabling future i18n by swapping this module.
 */

/** Luck tier for a single year. Also used as a CSS token suffix (bg-tier-*). */
export type YearTier = "zero" | "weak" | "moderate" | "strong" | "very-strong";

/** Luck tier for the whole 12-year cycle's total score. */
export type TotalTier = "weak" | "moderate" | "strong";

/** A single year-cycle interpretation tier. */
export interface YearTierEntry {
  /** CSS-friendly tier identifier */
  tier: YearTier;
  /** Human-readable tier label */
  label: string;
  /** Longer description of the tier */
  description: string;
  /** Actionable guidance for the visitor */
  guidance: string;
  /** Inclusive lower bound of the cycle number range */
  min: number;
  /** Inclusive upper bound of the cycle number range */
  max: number;
}

/** A single total-score interpretation tier. */
export interface TotalTierEntry {
  /** CSS-friendly tier identifier */
  tier: TotalTier;
  /** Human-readable tier label */
  label: string;
  /** Longer description of the tier */
  description: string;
  /** Inclusive lower bound of the total score range */
  min: number;
  /** Inclusive upper bound of the total score range */
  max: number;
}

/**
 * Year cycle number tiers, ordered from most specific (zero) to broadest.
 * Lookup functions should iterate in order and return the first match.
 */
export const YEAR_TIERS: readonly YearTierEntry[] = [
  {
    tier: "zero",
    label: "Reset / unstable",
    description:
      "A turning point. Tradition reads zero as a year of change, when old patterns close and new ones are still forming.",
    guidance:
      "A year to hold off on big risks. Make room for rest, reflection and finishing what is unfinished.",
    min: 0,
    max: 0,
  },
  {
    tier: "weak",
    label: "Weak luck",
    description:
      "A quieter year for fortune. Progress can feel slower and setbacks more frequent.",
    guidance:
      "Favor patience and small, steady steps over bold moves, and look after your energy and resources.",
    min: 1,
    max: 3,
  },
  {
    tier: "moderate",
    label: "Moderate / neutral",
    description:
      "A balanced year, with neither strong tailwinds nor heavy headwinds.",
    guidance:
      "A year for keeping a steady course: plan carefully and build gradually.",
    min: 4,
    max: 6,
  },
  {
    tier: "strong",
    label: "Strong luck",
    description:
      "A favorable year. Tradition reads it as a time when effort tends to bear fruit.",
    guidance:
      "A good year to act on the plans you have been preparing.",
    min: 7,
    max: 9,
  },
  {
    tier: "very-strong",
    label: "Very strong luck",
    description:
      "One of the two highest numbers in the cycle. Tradition reads it as a peak year for fortune.",
    guidance:
      "A year to pursue what matters most to you. Peaks like this come rarely, so make room for them.",
    min: 10,
    max: 11,
  },
] as const;

/**
 * Total score tiers, ordered from lowest to highest range.
 */
export const TOTAL_TIERS: readonly TotalTierEntry[] = [
  {
    tier: "weak",
    label: "Weak / difficult cycle",
    description:
      "Your cycle as a whole leans toward challenge. Patience serves you, and your stronger years are the ones to build on.",
    min: 0,
    max: 59,
  },
  {
    tier: "moderate",
    label: "Balanced / moderate cycle",
    description:
      "Your cycle as a whole is balanced: some years ask for patience, others open doors.",
    min: 60,
    max: 67,
  },
  {
    tier: "strong",
    label: "Strong / favorable cycle",
    description:
      "Your cycle as a whole leans favorable, with conditions that broadly support growth.",
    min: 68,
    max: Infinity,
  },
] as const;

/** One of the three totals a cycle can have, as a stop on the total score scale. */
export interface TotalScaleStop {
  /** The total itself */
  total: number;
  /** Short name of its band, shown under the stop */
  band: string;
  /** How common the total is, in words */
  share: string;
}

/**
 * The three totals any cycle can have, lowest first.
 *
 * Before the mod-12 step the twelve columns always add up to 184 (78 + 78 +
 * 28), and a whole cycle always sheds 9, 10 or 11 full twelves, so every
 * total is 76, 64 or 52. The shares come from every birth date from 1900 to
 * 2099 under either New Year rule: 52 about 14%, 64 about 55%, 76 about 31%.
 */
export const TOTAL_SCALE: readonly TotalScaleStop[] = [
  { total: 52, band: "Weak", share: "About 1 in 7" },
  { total: 64, band: "Balanced", share: "About 1 in 2" },
  { total: 76, band: "Strong", share: "About 1 in 3" },
] as const;
