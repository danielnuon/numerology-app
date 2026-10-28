/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CycleWalkthrough } from "../cycle-walkthrough";
import { saveBirthDate } from "@/lib/storage";

beforeEach(() => localStorage.clear());

describe("CycleWalkthrough", () => {
  it("works the example through to the spec's cycle when there is no date", () => {
    render(<CycleWalkthrough date={null} />);
    expect(screen.getByText(/walks through an example birth date, 24 July 1997/)).toBeInTheDocument();
    const sums = screen.getByRole("list", { name: "Each year's sum" });
    expect(sums.querySelectorAll("li")).toHaveLength(12);
    // First column: month 8 + Ox 2 + Thursday 5 = 15, remainder 3
    expect(sums.querySelector("li")).toHaveTextContent("1997 · Self8 + 2 + 5 = 15 → 3");
    expect(screen.getByText(/Total score 64/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See your cycle" })).toHaveAttribute("href", "/");
  });

  it("uses the date it is given, with its New Year rule", () => {
    render(<CycleWalkthrough date={{ year: 1997, month: 2, day: 10, rule: "chinese" }} />);
    expect(screen.getByText(/reading for 10 February 1997/)).toBeInTheDocument();
    expect(screen.getByText(/The Year of the Ox/)).toBeInTheDocument();
    expect(screen.getByText(/turns at Chinese New Year/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See the full reading" })).toHaveAttribute(
      "href",
      "/?day=10&month=2&year=1997&ny=chinese"
    );
  });

  it("falls back to the visitor's saved birth date", () => {
    saveBirthDate(10, 2, 1997);
    render(<CycleWalkthrough date={null} />);
    expect(screen.getByText(/reading for 10 February 1997/)).toBeInTheDocument();
    expect(screen.getByText(/The Year of the Rat/)).toBeInTheDocument();
  });
});
