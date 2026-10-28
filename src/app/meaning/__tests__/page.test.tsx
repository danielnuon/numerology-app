/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MeaningPage from "../page";
import { computeCycleFromBirthDate } from "@/lib/numerology/derive";

describe("What the numbers mean page", () => {
  it("covers every year number, tier and life area", () => {
    const { container } = render(<MeaningPage />);
    for (let n = 0; n <= 11; n++) expect(container.querySelector(`#number-${n}`)).toHaveTextContent(String(n));
    for (const label of ["Reset / unstable", "Weak luck", "Moderate / neutral", "Strong luck", "Very strong luck"]) {
      expect(screen.getByRole("heading", { name: new RegExp(label.replace("/", "\\/")) })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("listitem").some((li) => li.textContent?.startsWith("12Protection."))).toBe(true);
  });

  it("states the only totals a cycle can have", () => {
    render(<MeaningPage />);
    expect(screen.getByText(/every cycle totals 52, 64 or 76/)).toBeInTheDocument();
  });
});

describe("total score values", () => {
  it("is always 52, 64 or 76, as the page says", () => {
    const totals = new Set<number>();
    for (let year = 1900; year <= 2100; year += 1) {
      for (let month = 1; month <= 12; month++) {
        for (const day of [1, 9, 17, 25]) {
          for (const rule of ["khmer", "chinese"] as const) {
            totals.add(computeCycleFromBirthDate(year, month, day, rule).totalScore);
          }
        }
      }
    }
    expect([...totals].sort((a, b) => a - b)).toEqual([52, 64, 76]);
  });
});
