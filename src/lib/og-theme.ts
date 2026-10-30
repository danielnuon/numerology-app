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
 * (`.wheel-orb` and `.wheel-thread` in globals.css): a dark orb holding its
 * tier's light low inside it and backlit by the same light, which shows
 * close around its edge, with a warm hairline edge and, under the
 * number, one hand-dyed thread in its tier's color. `thread` is the thread's
 * color (draw it with `threadFill()`, which fades its ends) and `threadWidth`
 * its share of the orb's width. Zero is an unlit niche with a short, faint
 * thread. A lit year (`lit`) has a gold thread, as the woven flame's.
 */
export function threadedOrb(
  tier: YearTier,
  lit = false
): { background: string; border: string; boxShadow: string; thread: string; threadWidth: number } {
  if (tier === "zero") {
    return {
      background: OG_COLORS.zero,
      border: lit ? OG_COLORS.goldDeep : OG_COLORS.border,
      boxShadow: "none",
      thread: lit ? OG_COLORS.goldLight : `${OG_COLORS.inkFaint}80`,
      threadWidth: lit ? 0.52 : 0.24,
    };
  }
  const color = TIER_COLORS[tier];
  // 8-digit hex: the light at ~40% where it burns, ~45% behind the orb,
  // the edge at ~13% gold, the thread at ~80%.
  return {
    background: `radial-gradient(circle at 50% 80%, ${color}66 0%, ${OG_COLORS.orb} 62%)`,
    border: lit ? OG_COLORS.goldDeep : `${OG_COLORS.goldDeep}21`,
    boxShadow: `0 0 16px 2px ${color}73`,
    thread: lit ? OG_COLORS.goldLight : `${color}CC`,
    threadWidth: lit ? 0.52 : 0.36,
  };
}

/** A thread's fill: its color, fading out at both ends like a dyed strand. */
export function threadFill(color: string): string {
  return `linear-gradient(90deg, transparent, ${color} 22%, ${color} 78%, transparent)`;
}

/**
 * How far thread `i` sits off center, as a share of the orb's width, so no
 * two neighboring threads line up (the nth-child offsets in globals.css).
 */
export function threadOffset(i: number): number {
  return [-0.03, 0.02, 0][i % 3];
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
