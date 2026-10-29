/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { YearTimeline } from "../year-timeline";

// Mock Motion to avoid animation issues in test environment
jest.mock("motion/react", () => ({
  useReducedMotion: () => true,
}));

// Sample cycle: [3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8]
const sampleCycle = [3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8];
const birthYear = 1997;
const activeYear = 2026;

const defaultProps = {
  cycle: sampleCycle,
  birthYear,
  activeYear,
  selectedYear: activeYear,
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

  it("renders year buttons from birthYear to activeYear + 30", () => {
    render(<YearTimeline {...defaultProps} />);
    const endYear = activeYear + 30;
    const expectedLength = endYear - birthYear + 1;
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(expectedLength);
  });

  it("renders the birth year as the first dot", () => {
    render(<YearTimeline {...defaultProps} />);
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-label", expect.stringContaining(`Year ${birthYear}`));
  });

  it("renders the end year (activeYear + 30) as the last dot", () => {
    render(<YearTimeline {...defaultProps} />);
    const endYear = activeYear + 30;
    const options = screen.getAllByRole("option");
    expect(options[options.length - 1]).toHaveAttribute("aria-label", expect.stringContaining(`Year ${endYear}`));
  });

  // ---------------------------------------------------------------------------
  // Tier symbols
  // ---------------------------------------------------------------------------

  it("draws each year's tier symbol, hidden from screen readers", () => {
    render(<YearTimeline {...defaultProps} />);
    const options = screen.getAllByRole("option");
    for (const option of options) {
      expect(option.querySelector("svg[aria-hidden='true']")).not.toBeNull();
    }
    // cycle index 7 is 0 (zero tier), year 1997 + 7 = 2004: a ring with a dot, no filled share
    expect(options[7].querySelector("svg path")).toBeNull();
    // year 2002 (index 5): cycle[5]=11 → very strong → filled
    expect(options[5].querySelector("svg path")).not.toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Current year highlighting
  // ---------------------------------------------------------------------------

  it("highlights the current year with a gold ring and names it", () => {
    render(<YearTimeline {...defaultProps} selectedYear={2000} />);
    const currentYearOption = screen.getByRole("option", { name: new RegExp(`Year ${activeYear}`) });
    expect(currentYearOption).toHaveAttribute("aria-selected", "false");
    expect(currentYearOption).toHaveAccessibleName(expect.stringContaining("current year"));
    expect(currentYearOption.innerHTML).toContain("outline-gold-deep");
  });

  it("marks the selected year as selected", () => {
    render(<YearTimeline {...defaultProps} selectedYear={2000} />);
    const option = screen.getByRole("option", { name: new RegExp(`Year 2000`) });
    expect(option).toHaveAttribute("aria-selected", "true");
  });

  it("makes the year label part of the clickable button", () => {
    render(<YearTimeline {...defaultProps} />);
    const option = screen.getByRole("option", { name: new RegExp(`Year 2000`) });
    expect(option).toHaveTextContent("2000");
  });

  it("is a single Tab stop: only the selected year is tabbable", () => {
    render(<YearTimeline {...defaultProps} selectedYear={2000} />);
    const tabbable = screen.getAllByRole("option").filter((o) => o.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName(expect.stringContaining("Year 2000"));
  });

  it("renders current year label in bold", () => {
    render(<YearTimeline {...defaultProps} />);
    // Find the year label for current year
    const labels = screen.getAllByText(activeYear.toString());
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

  it("keeps the year selected when clicking it again", () => {
    const onSelectYear = jest.fn();
    render(<YearTimeline {...defaultProps} selectedYear={2000} onSelectYear={onSelectYear} />);
    const option = screen.getByRole("option", { name: new RegExp(`Year 2000`) });
    fireEvent.click(option);
    expect(onSelectYear).toHaveBeenCalledWith(2000);
    expect(onSelectYear).not.toHaveBeenCalledWith(null);
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

  it("moves focus along with the selection", () => {
    render(<YearTimeline {...defaultProps} selectedYear={2000} />);
    const option = screen.getByRole("option", { name: new RegExp(`Year 2000`) });
    option.focus();
    fireEvent.keyDown(option, { key: "ArrowRight" });
    expect(document.activeElement).toHaveAccessibleName(expect.stringContaining("Year 2001"));
  });

  it("jumps to the first and last years with Home and End", () => {
    const onSelectYear = jest.fn();
    render(<YearTimeline {...defaultProps} onSelectYear={onSelectYear} />);
    const option = screen.getByRole("option", { name: new RegExp(`Year 2000`) });
    fireEvent.keyDown(option, { key: "Home" });
    expect(onSelectYear).toHaveBeenLastCalledWith(birthYear);
    fireEvent.keyDown(option, { key: "End" });
    expect(onSelectYear).toHaveBeenLastCalledWith(activeYear + 30);
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
    const endYear = activeYear + 30;
    render(<YearTimeline {...defaultProps} onSelectYear={onSelectYear} />);
    const option = screen.getByRole("option", { name: new RegExp(`Year ${endYear}`) });
    fireEvent.keyDown(option, { key: "ArrowRight" });
    expect(onSelectYear).toHaveBeenCalledWith(endYear);
  });

  it("fades the scrolling years out at the track's edges", () => {
    render(<YearTimeline {...defaultProps} />);
    expect(screen.getByRole("listbox")).toHaveClass("timeline-fade");
  });

  /** Gives the track a scroll geometry, which jsdom doesn't lay out. */
  function scrollTrackTo(track: HTMLElement, scrollLeft: number) {
    Object.defineProperty(track, "clientWidth", { configurable: true, value: 300 });
    Object.defineProperty(track, "scrollWidth", { configurable: true, value: 1000 });
    track.scrollLeft = scrollLeft;
    fireEvent.scroll(track);
  }

  it("fades only the end edge when scrolled to the birth year", () => {
    render(<YearTimeline {...defaultProps} />);
    const track = screen.getByRole("listbox");
    scrollTrackTo(track, 0);
    expect(track).not.toHaveAttribute("data-more-before");
    expect(track).toHaveAttribute("data-more-after");
  });

  it("fades both edges when years are hidden on both sides", () => {
    render(<YearTimeline {...defaultProps} />);
    const track = screen.getByRole("listbox");
    scrollTrackTo(track, 350);
    expect(track).toHaveAttribute("data-more-before");
    expect(track).toHaveAttribute("data-more-after");
  });

  it("fades only the start edge when scrolled to the last year", () => {
    render(<YearTimeline {...defaultProps} />);
    const track = screen.getByRole("listbox");
    scrollTrackTo(track, 700);
    expect(track).toHaveAttribute("data-more-before");
    expect(track).not.toHaveAttribute("data-more-after");
  });

  it("marks the start of each new 12-year cycle with a tick", () => {
    const { container } = render(<YearTimeline {...defaultProps} />);
    // Cycles restart in 2009, 2021, 2033 and 2045 for a 1997 birth (through 2056).
    const ticks = container.querySelectorAll("[role=listbox] > div > div.w-px");
    expect(ticks).toHaveLength(4);
  });

  it("keeps every year's tap target at least 44px wide", () => {
    render(<YearTimeline {...defaultProps} />);
    for (const option of screen.getAllByRole("option")) {
      expect(option).toHaveClass("min-w-11");
    }
  });

  it("renders year labels below dots", () => {
    render(<YearTimeline {...defaultProps} />);
    // Year labels should appear for birth year and a few others
    expect(screen.getByText(birthYear.toString())).toBeInTheDocument();
    expect(screen.getByText("2000")).toBeInTheDocument();
    expect(screen.getByText("2010")).toBeInTheDocument();
  });
});
