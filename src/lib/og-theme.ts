/**
 * Preview Card Theme
 *
 * Colours for the link-preview images (opengraph-image.tsx), matching the
 * Temple Lantern palette in globals.css. Image routes can't read CSS
 * variables, so the values are repeated here; keep the two in step.
 */

import type { YearTier } from "@/lib/numerology/interpretation-data";

export const OG_COLORS = {
  page: "#17131C",
  card: "#221C28",
  ink: "#F1E8D8",
  inkLight: "#B4A894",
  gold: "#C99A3E",
  goldDeep: "#E2B65A",
  border: "#3B3242",
  zero: "#0E0B11",
} as const;

/** Tier colours, as --color-tier-* in globals.css. */
const TIER_COLORS: Record<YearTier, string> = {
  "very-strong": "#BFE0A5",
  strong: "#A9CC93",
  moderate: "#E2B65A",
  weak: "#D98A62",
  zero: OG_COLORS.zero,
};

/** Background and border for a pillar: lit by its tier, an unlit niche for zero. */
export function pillarColors(tier: YearTier): { background: string; border: string } {
  if (tier === "zero") {
    return { background: OG_COLORS.zero, border: OG_COLORS.border };
  }
  const color = TIER_COLORS[tier];
  // 8-digit hex: tier colour at ~16% for the fill, ~50% for the edge.
  return { background: `${color}29`, border: `${color}80` };
}

/** Site address printed small on every card, so a saved image still leads back. */
export const OG_SITE_LABEL = "solini.vercel.app";
