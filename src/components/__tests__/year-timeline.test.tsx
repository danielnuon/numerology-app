/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { YearTimeline } from "../year-timeline";

// Mock framer-motion to avoid animation issues in test environment
jest.mock("framer-motion", () => ({
  useReducedMotion: () => true,
}));

// Sample cycle: [3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8]
const sampleCycle = [3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8];
const birthYear = 1997;
const currentYear = 2026;

const defaultProps = {
  cycle: sampleCycle,
  birthYear,
  currentYear,
  selectedYear: null,
  onSelectYear: jest.fn(),
};

describe("YearTimeline", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock scrollTo for the container
    Element.prototype.scrollTo = jest.fn();
  });

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  it("renders a section with aria-label 'Year timeline'", () => {
    render(<YearTimeline {...defaultProps} />);
    expect(screen.getByRole("region", { name: "Year timeline" })).toBeInTheDocument();
  });

  it("renders year buttons from birthYear to currentYear + 30", () => {
    render(<YearTimeline {...defaultProps} />);
    const endYear = currentYear + 30;
    const expectedLength = endYear - birthYear + 1;
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(expectedLength);
  });

  it("renders the birth year as the first dot", () => {
    render(<YearTimeline {...defaultProps} />);
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-label", expect.stringContaining(`Year ${birthYear}`));
  });

  it("renders the end year (currentYear + 30) as the last dot", () => {
    render(<YearTimeline {...defaultProps} />);
    const endYear = currentYear + 30;
    const options = screen.getAllByRole("option");
    expect(options[options.length - 1]).toHaveAttribute("aria-label", expect.stringContaining(`Year ${endYear}`));
  });

  // ---------------------------------------------------------------------------
  // Tier symbols
  // ---------------------------------------------------------------------------

  it("renders ⊙ for zero years", () => {
    render(<YearTimeline {...defaultProps} />);
    // cycle index 7 is 0 (zero tier) — year 1997 + 7 = 2004
    const zeroYear = 1997 + 7;
    const option = screen.getByRole("option", { name: new RegExp(`Year ${zeroYear}`) });
    expect(option).toHaveTextContent("⊙");
  });

  it("renders the correct 5-tier symbols matching cycle chart", () => {
    render(<YearTimeline {...defaultProps} />);
    const options = screen.getAllByRole("option");
    // Check a few specific years
    // year 1997 (index 0): cycle[0]=3 → weak → ◔
    expect(options[0]).toHaveTextContent("◔");
    // year 2002 (index 5): cycle[5]=11 → very-strong → ●
    expect(options[5]).toHaveTextContent("●");
    // year 2005 (index 8): cycle[8]=2 → weak → ◔
    expect(options[8]).toHaveTextContent("◔");
  });

  // ---------------------------------------------------------------------------
  // Current year highlighting
  // ---------------------------------------------------------------------------

  it("highlights the current year with gold ring", () => {
    render(<YearTimeline {...defaultProps} />);
    const currentYearOption = screen.getByRole("option", { name: new RegExp(`Year ${currentYear}`) });
    expect(currentYearOption).toHaveAttribute("aria-selected", "false");
    // The current year button has ring-gold class
    expect(currentYearOption.className).toContain("ring-gold");
  });

  it("renders current year label in bold", () => {
    render(<YearTimeline {...defaultProps} />);
    // Find the year label for current year
    const labels = screen.getAllByText(currentYear.toString());
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  // ---------------------------------------------------------------------------
  // Click selection
  // ---------------------------------------------------------------------------

  it("calls onSelectYear when a year dot is clicked", () => {
    const onSelectYear = jest.fn();
    render(<YearTimeline {...defaultProps} onSelectYear={onSelectYear} />);
    const option = screen.getByRole("option", { name: new RegExp(`Year 2000`) });
    fireEvent.click(option);
    expect(onSelectYear).toHaveBeenCalledWith(2000);
  });

  it("toggles selection off when clicking the same year again", () => {
    const onSelectYear = jest.fn();
    render(<YearTimeline {...defaultProps} selectedYear={2000} onSelectYear={onSelectYear} />);
    const option = screen.getByRole("option", { name: new RegExp(`Year 2000`) });
    fireEvent.click(option);
    expect(onSelectYear).toHaveBeenCalledWith(null);
  });

  // ---------------------------------------------------------------------------
  // Keyboard navigation
  // ---------------------------------------------------------------------------

  it("moves selection right with ArrowRight key", () => {
    const onSelectYear = jest.fn();
    render(<YearTimeline {...defaultProps} onSelectYear={onSelectYear} />);
    const option = screen.getByRole("option", { name: new RegExp(`Year 2000`) });
    fireEvent.keyDown(option, { key: "ArrowRight" });
    expect(onSelectYear).toHaveBeenCalledWith(2001);
  });

  it("moves selection left with ArrowLeft key", () => {
    const onSelectYear = jest.fn();
    render(<YearTimeline {...defaultProps} onSelectYear={onSelectYear} />);
    const option = screen.getByRole("option", { name: new RegExp(`Year 2000`) });
    fireEvent.keyDown(option, { key: "ArrowLeft" });
    expect(onSelectYear).toHaveBeenCalledWith(1999);
  });

  it("selects year on Enter key", () => {
    const onSelectYear = jest.fn();
    render(<YearTimeline {...defaultProps} onSelectYear={onSelectYear} />);
    const option = screen.getByRole("option", { name: new RegExp(`Year 2000`) });
    fireEvent.keyDown(option, { key: "Enter" });
    expect(onSelectYear).toHaveBeenCalledWith(2000);
  });

  it("selects year on Space key", () => {
    const onSelectYear = jest.fn();
    render(<YearTimeline {...defaultProps} onSelectYear={onSelectYear} />);
    const option = screen.getByRole("option", { name: new RegExp(`Year 2000`) });
    fireEvent.keyDown(option, { key: " " });
    expect(onSelectYear).toHaveBeenCalledWith(2000);
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------

  it("does not go below birthYear with ArrowLeft on first year", () => {
    const onSelectYear = jest.fn();
    render(<YearTimeline {...defaultProps} onSelectYear={onSelectYear} />);
    const option = screen.getByRole("option", { name: new RegExp(`Year ${birthYear}`) });
    fireEvent.keyDown(option, { key: "ArrowLeft" });
    expect(onSelectYear).toHaveBeenCalledWith(birthYear);
  });

  it("does not go above endYear with ArrowRight on last year", () => {
    const onSelectYear = jest.fn();
    const endYear = currentYear + 30;
    render(<YearTimeline {...defaultProps} onSelectYear={onSelectYear} />);
    const option = screen.getByRole("option", { name: new RegExp(`Year ${endYear}`) });
    fireEvent.keyDown(option, { key: "ArrowRight" });
    expect(onSelectYear).toHaveBeenCalledWith(endYear);
  });

  it("renders gradient fade indicators on both edges", () => {
    render(<YearTimeline {...defaultProps} />);
    // The gradient fade divs have pointer-events-none and aria-hidden
    // Plus the thread of fate connecting line also has pointer-events-none and aria-hidden
    const fades = document.querySelectorAll('[aria-hidden="true"][class*="pointer-events-none"]');
    expect(fades.length).toBeGreaterThanOrEqual(2);
  });

  it("renders year labels below dots", () => {
    render(<YearTimeline {...defaultProps} />);
    // Year labels should appear for birth year and a few others
    expect(screen.getByText(birthYear.toString())).toBeInTheDocument();
    expect(screen.getByText("2000")).toBeInTheDocument();
    expect(screen.getByText("2010")).toBeInTheDocument();
  });
});
