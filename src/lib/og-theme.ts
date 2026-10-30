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
  inkFaint: "#85796B",
  gold: "#C99A3E",
  goldDeep: "#E2B65A",
  goldLight: "#F0CD8C",
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
 * A year's number drawn as a threaded orb, the way the cycle wheel draws it
 * (`.wheel-orb` and `.wheel-thread` in globals.css): a plain dark orb with a
 * hairline edge and, under the number, one thread in its tier's color.
 * `threadWidth` is the thread's share of the orb's width. Zero is an unlit
 * niche with a short, faint thread. A lit year (`lit`) has a gold thread,
 * as the woven flame's lit thread.
 */
export function threadedOrb(
  tier: YearTier,
  lit = false
): { background: string; border: string; thread: string; threadWidth: number } {
  if (lit) {
    return { background: OG_COLORS.orb, border: OG_COLORS.goldDeep, thread: OG_COLORS.goldLight, threadWidth: 0.44 };
  }
  if (tier === "zero") {
    return { background: OG_COLORS.zero, border: OG_COLORS.border, thread: `${OG_COLORS.inkFaint}80`, threadWidth: 0.22 };
  }
  // 8-digit hex: the thread at ~85%, the edge as the wheel's ink hairline at ~11%.
  return { background: OG_COLORS.orb, border: `${OG_COLORS.ink}1C`, thread: `${TIER_COLORS[tier]}D9`, threadWidth: 0.36 };
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
