/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HomeClient } from "../home-client";

beforeAll(() => {
  // jsdom has no scrolling: the reading scrolls into view and the timeline centers its year.
  Element.prototype.scrollIntoView = jest.fn();
  Element.prototype.scrollTo = jest.fn();
});

beforeEach(() => localStorage.clear());

function submitDate(day: string, month: string, year: string) {
  fireEvent.change(screen.getByLabelText("Day"), { target: { value: day } });
  fireEvent.change(screen.getByLabelText("Month"), { target: { value: month } });
  fireEvent.change(screen.getByLabelText("Year"), { target: { value: year } });
  fireEvent.click(screen.getByRole("button", { name: "Reveal my cycle" }));
}

describe("HomeClient first visit", () => {
  it("asks one question, with the intro folded behind \"What will I see?\"", () => {
    render(<HomeClient searchParams={{}} />);
    expect(screen.getByRole("heading", { name: "When were you born?" })).toBeInTheDocument();
    expect(screen.getByText("What will I see?").closest("details")).not.toHaveAttribute("open");
    expect(screen.getByText(/a luck number for every year of your 12-year cycle/)).toBeInTheDocument();
  });

  it("folds the form into a summary line and opens on this year's card", () => {
    render(<HomeClient searchParams={{}} />);
    submitDate("24", "07", "1960");
    expect(screen.queryByRole("heading", { name: "When were you born?" })).not.toBeInTheDocument();
    expect(screen.getByText(/Year of the Rat · Born on a Sunday/)).toBeInTheDocument();
    expect(screen.getByText(/Your \d{4} reading/)).toBeInTheDocument();
  });

  it("opens the 12 years with \"See all 12 years\"", () => {
    render(<HomeClient searchParams={{}} />);
    submitDate("24", "07", "1960");
    const toggle = screen.getByRole("button", { name: "See all 12 years" });
    const section = document.getElementById(toggle.getAttribute("aria-controls")!)!;
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(section.className).toMatch(/max-md:hidden/);
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Hide the 12 years" })).toHaveAttribute("aria-expanded", "true");
    expect(section.className).not.toMatch(/max-md:hidden/);
  });

  it("returns to an empty form with \"Change date\" and forgets the saved date", () => {
    render(<HomeClient searchParams={{}} />);
    submitDate("24", "07", "1960");
    fireEvent.click(screen.getByRole("button", { name: "Change date" }));
    expect(screen.getByRole("heading", { name: "When were you born?" })).toBeInTheDocument();
    expect(localStorage.length).toBe(0);
  });
});

describe("HomeClient shared reading", () => {
  it("keeps the form above the sharer's reading", () => {
    render(<HomeClient searchParams={{ day: "24", month: "7", year: "1960" }} />);
    expect(screen.getByText("Someone shared their reading with you")).toBeInTheDocument();
    expect(screen.getByText(/Your \d{4} reading/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Change date" })).not.toBeInTheDocument();
  });
});
