/**
 * Preview Card Theme
 *
 * Colors for the link-preview images (opengraph-image.tsx), matching the
 * Temple Lantern palette in globals.css. Image routes can't read CSS
 * variables, so the values are repeated here; keep the two in step.
 */

import type { YearTier } from "@/lib/numerology/interpretation-data";
import type { YearInteraction } from "@/lib/numerology/compatibility";

export const OG_COLORS = {
  page: "#17131C",
  card: "#221C28",
  ink: "#F1E8D8",
  inkLight: "#B4A894",
  gold: "#C99A3E",
  goldDeep: "#E2B65A",
  border: "#3B3242",
  zero: "#0E0B11",
  /** An orb's unlit shell, as `.wheel-orb` in globals.css. */
  orb: "#1D1823",
} as const;

/** Tier colors, as --color-tier-* in globals.css. */
const TIER_COLORS: Record<YearTier, string> = {
  "very-strong": "#BFE0A5",
  strong: "#A9CC93",
  moderate: "#E2B65A",
  weak: "#D98A62",
  zero: OG_COLORS.zero,
};

/**
 * A year's number drawn as a lantern orb, the way the cycle wheel draws it
 * (`.wheel-orb` in globals.css): lit from within by its tier's light, with a
 * soft glow around it. Zero is an unlit niche with no glow.
 */
export function lanternOrb(tier: YearTier): { background: string; border: string; boxShadow: string } {
  if (tier === "zero") {
    return { background: OG_COLORS.zero, border: OG_COLORS.border, boxShadow: "none" };
  }
  const color = TIER_COLORS[tier];
  // 8-digit hex: the light at ~40% where it burns, ~50% at the edge, ~30% in the glow.
  return {
    background: `radial-gradient(circle at 50% 65%, ${color}66 0%, ${OG_COLORS.orb} 72%)`,
    border: `${color}80`,
    boxShadow: `0 0 22px ${color}4D`,
  };
}

/** Interaction colors, as the comparison view's text colors (compatibility-summary.tsx). */
export const OG_INTERACTION_COLORS: Record<YearInteraction, string> = {
  amplified: OG_COLORS.goldDeep,
  stabilized: TIER_COLORS.strong,
  neutral: OG_COLORS.inkLight,
  risk: TIER_COLORS.weak,
  unstable: OG_COLORS.inkLight,
};

/** Site address printed small on every card, so a saved image still leads back. */
export const OG_SITE_LABEL = "solini.vercel.app";
