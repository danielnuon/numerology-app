/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TotalScoreCard } from "../total-score-card";

describe("TotalScoreCard", () => {
  it("opens in place onto the three totals, with this cycle's marked", () => {
    render(<TotalScoreCard totalScore={64} />);
    const toggle = screen.getByRole("button", { name: /Total score 64/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const stops = within(screen.getByRole("list", { name: "Every cycle totals 52, 64 or 76" })).getAllByRole("listitem");
    expect(stops.map((s) => s.textContent)).toEqual([
      "52WeakAbout 1 in 7",
      "Yours64BalancedAbout 1 in 2",
      "76StrongAbout 1 in 3",
    ]);
    expect(screen.getByText(/Why only three\?/)).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
