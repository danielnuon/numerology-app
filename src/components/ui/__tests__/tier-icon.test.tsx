/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TierIcon } from "../tier-icon";
import type { YearTier } from "@/lib/numerology/interpretation-data";

const TIERS: YearTier[] = ["very-strong", "strong", "moderate", "weak", "zero"];

describe("TierIcon", () => {
  it("draws every tier in the same box, hidden from assistive tech", () => {
    for (const tier of TIERS) {
      const { container, unmount } = render(<TierIcon tier={tier} />);
      const svg = container.querySelector("svg")!;
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).toHaveAttribute("viewBox", "0 0 16 16");
      expect(svg).toHaveClass("size-3");
      unmount();
    }
  });

  it("marks the reset tier with a dot instead of a filled share", () => {
    const { container } = render(<TierIcon tier="zero" />);
    expect(container.querySelector("path")).toBeNull();
    expect(container.querySelectorAll("circle")).toHaveLength(2);
  });
});
