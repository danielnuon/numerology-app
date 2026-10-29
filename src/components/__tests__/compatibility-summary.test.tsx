/**
 * @jest-environment jsdom
 */
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CompatibilitySummary, type SummaryPerson } from "../compatibility-summary";
import type { ComparisonSummary } from "@/lib/numerology/compatibility";

const people: [SummaryPerson, SummaryPerson] = [
  { term: "You", date: { year: 1997, month: 7, day: 24 }, animal: "Ox", total: 64 },
  { term: "Partner", date: { year: 2000, month: 3, day: 15 }, animal: "Rabbit", total: 70 },
];

const CYCLE = { start: 2021, end: 2032 };

const summary: ComparisonSummary = {
  counts: { amplified: 2, stabilized: 5, neutral: 2, risk: 1, unstable: 2 },
  sharedYears: 12,
  current: { year: 2026, firstNumber: 11, secondNumber: 7, interaction: "amplified" },
};

describe("CompatibilitySummary", () => {
  it("shows both people with their totals and the assessment", () => {
    render(<CompatibilitySummary people={people} assessment="moderate" summary={summary} cycle={CYCLE} />);
    expect(screen.getByText("July 24, 1997")).toBeInTheDocument();
    expect(screen.getByText("Year of the Rabbit")).toBeInTheDocument();
    expect(screen.getByText("70")).toBeInTheDocument();
    expect(screen.getByText("Moderate stability")).toBeInTheDocument();
  });

  it("highlights the current year's interaction in words", () => {
    render(<CompatibilitySummary people={people} assessment="moderate" summary={summary} cycle={CYCLE} />);
    const line = screen.getByText("Now, 2026:").parentElement as HTMLElement;
    expect(line).toHaveTextContent(/Amplified$/);
  });

  it("counts every interaction, zeros included", () => {
    render(
      <CompatibilitySummary
        people={people}
        assessment="moderate"
        summary={{ ...summary, counts: { ...summary.counts, amplified: 0 } }}
        cycle={CYCLE}
      />
    );
    expect(screen.getByText("Cycle 2021–2032")).toBeInTheDocument();
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "0★Amplified",
      "5▲Stabilized",
      "2—Neutral",
      "1▼Low together",
      "2⊙Unstable",
    ]);
  });

  it("says how many years the two share when one was born partway through the cycle", () => {
    render(
      <CompatibilitySummary
        people={people}
        assessment="moderate"
        summary={{ ...summary, sharedYears: 9 }}
        cycle={{ start: 1997, end: 2008 }}
      />
    );
    expect(screen.getByText("Cycle 1997–2008 · 9 years together")).toBeInTheDocument();
  });

  it("leaves out the current-year line when the current year isn't compared", () => {
    render(
      <CompatibilitySummary people={people} assessment="mixed" summary={{ ...summary, current: null }} cycle={CYCLE} />
    );
    expect(screen.queryByText(/^Now,/)).not.toBeInTheDocument();
  });

  it("links the assessment to how the totals are read", () => {
    render(<CompatibilitySummary people={people} assessment="moderate" summary={summary} cycle={CYCLE} />);
    expect(screen.getByRole("link", { name: "How the totals are read" })).toHaveAttribute(
      "href",
      "/how-it-works#total-score"
    );
  });

  it("hides the symbols from screen readers", () => {
    const { container } = render(
      <CompatibilitySummary people={people} assessment="moderate" summary={summary} cycle={CYCLE} />
    );
    for (const symbol of container.querySelectorAll("li [aria-hidden='true']")) {
      expect(symbol.textContent).toMatch(/^[★▲—▼⊙]$/);
    }
  });
});
