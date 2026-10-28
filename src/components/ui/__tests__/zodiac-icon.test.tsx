/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ZodiacIcon, ZODIAC_ICON_PATHS } from "../zodiac-icon";
import { ZODIAC_ANIMALS } from "@/lib/numerology/zodiac";

describe("ZodiacIcon", () => {
  it("has artwork for every zodiac animal", () => {
    for (const animal of ZODIAC_ANIMALS) {
      expect(ZODIAC_ICON_PATHS[animal].length).toBeGreaterThan(0);
    }
  });

  it("draws the animal's paths and is hidden from assistive tech by default", () => {
    const { container } = render(<ZodiacIcon animal="Ox" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg!.querySelectorAll("path")).toHaveLength(ZODIAC_ICON_PATHS.Ox.length);
  });

  it("becomes a named image when given a title", () => {
    render(<ZodiacIcon animal="Horse" title="Year of the Horse" />);
    expect(screen.getByRole("img", { name: "Year of the Horse" })).toBeInTheDocument();
  });
});
