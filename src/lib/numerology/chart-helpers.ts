/**
 * Chart Helpers
 *
 * The Tailwind classes that color a luck tier on the wheel, the timeline
 * and the tier icon. Kept beside the tiers so every surface colors a tier
 * the same way.
 */

import type { YearTier } from "./interpretation-data";

/**
 * Tailwind background classes per tier. Zero uses the full-strength charcoal
 * token per the design spec; the others use a light /15 tint of their color.
 * Written out in full so Tailwind's class scanner can find them.
 */
const TIER_BACKGROUNDS: Record<YearTier, string> = {
  "very-strong": "bg-tier-very-strong/15",
  strong: "bg-tier-strong/15",
  moderate: "bg-tier-moderate/15",
  weak: "bg-tier-weak/15",
  zero: "bg-tier-zero",
};

/**
 * Tailwind text classes for tier symbols: each takes the color of its
 * tier's lantern light. Zero is unlit, so its symbol stays faint.
 */
const TIER_TEXT_COLORS: Record<YearTier, string> = {
  "very-strong": "text-tier-very-strong",
  strong: "text-tier-strong",
  moderate: "text-tier-moderate",
  weak: "text-tier-weak",
  zero: "text-ink-faint",
};

/** Returns the Tailwind background class for a tier. */
export function getTierColorClass(tier: YearTier): string {
  return TIER_BACKGROUNDS[tier];
}

/** Returns the Tailwind text color class for a tier's symbol. */
export function getTierTextClass(tier: YearTier): string {
  return TIER_TEXT_COLORS[tier];
}
