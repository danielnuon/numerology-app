/**
 * Interpretation Data
 *
 * Data-driven tier definitions for year cycle numbers and total scores.
 * All labels, descriptions, and guidance text are defined here as exported
 * constants, enabling future i18n by swapping this module.
 */

/** A single year-cycle interpretation tier. */
export interface YearTierEntry {
  /** CSS-friendly tier identifier */
  tier: string;
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
  tier: string;
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
      "A year of reset and instability. Old cycles close and new ones have yet to begin.",
    guidance:
      "Avoid major commitments. Focus on reflection, rest, and clearing unfinished business before the next cycle begins.",
    min: 0,
    max: 0,
  },
  {
    tier: "weak",
    label: "Weak luck",
    description:
      "A year where fortune is subdued. Progress may feel slow and obstacles more frequent.",
    guidance:
      "Practise patience and conserve resources. Small, steady efforts will serve you better than bold moves.",
    min: 1,
    max: 3,
  },
  {
    tier: "moderate",
    label: "Moderate / neutral",
    description:
      "A balanced year with neither strong fortune nor serious hardship.",
    guidance:
      "Maintain your current course. Modest investments and careful planning will yield steady results.",
    min: 4,
    max: 6,
  },
  {
    tier: "strong",
    label: "Strong luck",
    description:
      "A favourable year. Opportunities are plentiful and efforts tend to bear fruit.",
    guidance:
      "Take confident action on goals you have been preparing for. Fortune supports decisive movement.",
    min: 7,
    max: 9,
  },
  {
    tier: "very-strong",
    label: "Very strong luck",
    description:
      "An exceptional year of powerful fortune. The highest energies align in your favour.",
    guidance:
      "Seize major opportunities — start ventures, make significant commitments, and invest boldly. This peak energy is rare.",
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
      "The overall cycle carries heavy challenges. Resilience and caution are essential throughout.",
    min: 0,
    max: 59,
  },
  {
    tier: "moderate",
    label: "Balanced / moderate cycle",
    description:
      "The overall cycle is balanced. Some years will be harder, others easier — steadiness is key.",
    min: 60,
    max: 67,
  },
  {
    tier: "strong",
    label: "Strong / favourable cycle",
    description:
      "The overall cycle is auspicious. Conditions broadly favour growth and accomplishment.",
    min: 68,
    max: Infinity,
  },
] as const;
