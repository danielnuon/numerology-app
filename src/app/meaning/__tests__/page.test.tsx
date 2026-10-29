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

  it("lists the seven day planets from strongest to weakest", () => {
    const { container } = render(<MeaningPage />);
    const days = [...container.querySelectorAll("#birth-day dd")].map((dd) => dd.textContent?.split(" · ")[0]);
    expect(days).toEqual([
      "Friday, Venus", "Thursday, Jupiter", "Wednesday, Mercury", "Monday, the Moon",
      "Saturday, Saturn", "Tuesday, Mars", "Sunday, the Sun",
    ]);
  });

  it("gives each birth day its Khmer name, character and color", () => {
    const { container } = render(<MeaningPage />);
    const thursday = [...container.querySelectorAll("#birth-day dd")].find((dd) => dd.textContent?.startsWith("Thursday"));
    expect(thursday).toHaveTextContent("ថ្ងៃព្រហស្បតិ៍");
    expect(thursday).toHaveTextContent(/royal teacher/);
    expect(thursday).toHaveTextContent("Worn on this day: dark green, for hope.");
    expect(container.querySelector("#birth-day")).toHaveTextContent(/is Solini.s choice/);
  });

  it("lists all twelve animals with Khmer names, labeling the traits as the popular reading", () => {
    const { container } = render(<MeaningPage />);
    const section = container.querySelector("#zodiac-animal");
    expect(section?.querySelectorAll("dt")).toHaveLength(12);
    expect(section).toHaveTextContent("Ox" + "ឆ្លូវ · Chhlov");
    expect(section).toHaveTextContent(/We found no Khmer text behind them/);
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
