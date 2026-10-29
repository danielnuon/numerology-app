/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CompatibilitySummary, type SummaryPerson } from "../compatibility-summary";

const people: [SummaryPerson, SummaryPerson] = [
  { term: "You", date: { year: 1997, month: 7, day: 24 }, animal: "Ox", total: 64 },
  { term: "Partner", date: { year: 2000, month: 3, day: 15 }, animal: "Rabbit", total: 70 },
];

const NOW = { year: 2026, interaction: "amplified" as const };

describe("CompatibilitySummary", () => {
  it("shows both people with their totals and the assessment", () => {
    render(<CompatibilitySummary people={people} assessment="moderate" current={NOW} />);
    expect(screen.getByText("July 24, 1997")).toBeInTheDocument();
    expect(screen.getByText(/^Rabbit · Total/)).toBeInTheDocument();
    expect(screen.getByText("70")).toBeInTheDocument();
    expect(screen.getByText("Moderate stability.")).toBeInTheDocument();
  });

  it("highlights the current year's interaction in words", () => {
    render(<CompatibilitySummary people={people} assessment="moderate" current={NOW} />);
    const line = screen.getByText("Now, 2026").parentElement as HTMLElement;
    expect(line).toHaveTextContent(/Amplified$/);
  });

  it("leaves out the current-year line when the current year isn't compared", () => {
    render(<CompatibilitySummary people={people} assessment="mixed" current={null} />);
    expect(screen.queryByText(/^Now,/)).not.toBeInTheDocument();
  });

  it("keeps explanations and counts out of the summary", () => {
    render(<CompatibilitySummary people={people} assessment="moderate" current={NOW} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
