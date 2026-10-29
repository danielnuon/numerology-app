/**
 * TierIcon
 *
 * A luck tier's symbol (● ◕ ◑ ◔ ⊙) drawn as SVG, so all five are exactly
 * the same size. The Unicode glyphs come from whichever font has them, and
 * fonts draw them at different sizes: ● can be half the size of ◑ beside
 * it. Use it wherever a tier symbol shows on the page (the Satori preview
 * images draw their own). It's decoration, so it's hidden from screen readers; the number or label
 * beside it carries the meaning.
 */

import type { YearTier } from "@/lib/numerology/interpretation-data";
import { getTierTextClass } from "@/lib/numerology/chart-helpers";

/** The filled part of each tier's circle on a 16-unit grid, centered at (8, 8) with radius 6. */
const FILLS: Record<YearTier, string | null> = {
  "very-strong": "M8 2a6 6 0 1 1 0 12A6 6 0 1 1 8 2z",
  strong: "M8 8V2a6 6 0 1 1-6 6z",
  moderate: "M8 2a6 6 0 0 1 0 12z",
  weak: "M8 8V2a6 6 0 0 1 6 6z",
  zero: null,
};

/**
 * One tier's symbol in its tier color. `className` sets the size (12px by
 * default) and any spacing.
 */
export function TierIcon({ tier, className = "size-3" }: { tier: YearTier; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={`shrink-0 ${getTierTextClass(tier)} ${className}`}
      fill="currentColor"
    >
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {FILLS[tier] ? <path d={FILLS[tier]} /> : <circle cx="8" cy="8" r="2" />}
    </svg>
  );
}
