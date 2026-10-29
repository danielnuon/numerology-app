/**
 * @jest-environment jsdom
 */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CycleChart, RETURN_TO_CURRENT_MS } from "../cycle-chart";

// Render Motion components as plain elements, dropping animation props
jest.mock("motion/react", () => {
  const strip = <T extends object>(props: T) => {
    const rest = { ...props } as Record<string, unknown>;
    for (const key of ["variants", "initial", "animate", "whileTap", "transition"]) delete rest[key];
    return rest;
  };
  const MotionDiv = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>((props, ref) => (
    <div ref={ref} {...strip(props)} />
  ));
  MotionDiv.displayName = "MotionDiv";
  const MotionButton = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<"button">>(
    (props, ref) => <button ref={ref} {...strip(props)} />
  );
  MotionButton.displayName = "MotionButton";
  return { motion: { div: MotionDiv, button: MotionButton } };
});

// Sample cycle for 24 July 1997: [3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8]
const sampleCycle = [3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8];

const defaultProps = {
  cycle: sampleCycle,
  totalScore: 64,
  birthYear: 1997,
  birthMonth: 7,
  birthDay: 24,
  weekday: 5 as const, // Thursday
  // 2026 is position 5 of the cycle (1997 + 5 + 24)
  selectedYear: 2026,
  onSelectPillar: jest.fn(),
};

describe("CycleChart (cycle wheel)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ now: new Date(2026, 9, 28) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the 12 years as tabs around the wheel", () => {
    render(<CycleChart {...defaultProps} />);
    expect(screen.getByRole("tablist", { name: "12-year life cycle" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(12);
  });

  it("selects the chosen year and marks the current year", () => {
    render(<CycleChart {...defaultProps} />);
    const tab = screen.getByRole("tab", { selected: true });
    expect(tab).toHaveAttribute("id", "pillar-5");
    expect(tab).toHaveAccessibleName(
      "2026, Allies, cycle number 11, Very strong luck, Year of the Horse, current year, month 4 of 12"
    );
    expect(tab).toHaveClass("wheel-orb-current");
    expect(tab).toHaveAttribute("tabindex", "0");
  });

  it("shows the month of the current year, counted from the birthday", () => {
    // October 28 is month 4 after a July 24 birthday
    const { container } = render(<CycleChart {...defaultProps} />);
    const dial = screen.getByRole("tab", { selected: true }).querySelectorAll(".wheel-month");
    expect(dial).toHaveLength(12);
    expect(container.querySelectorAll(".wheel-month-past")).toHaveLength(3);
    expect(container.querySelectorAll(".wheel-month-now")).toHaveLength(1);
    expect(screen.getByText("The ring around 2026 shows month 4 of 12, counted from the birthday.")).toBeInTheDocument();
  });

  it("leaves the month dial off when the wheel shows another cycle", () => {
    const { container } = render(<CycleChart {...defaultProps} selectedYear={2040} />);
    expect(container.querySelector(".wheel-month")).toBeNull();
    // The line keeps its place, faded out and hidden, so nothing below jumps
    expect(screen.getByText(/shows month/)).toHaveAttribute("aria-hidden", "true");
  });

  it("names each orb's year and zodiac animal from the shared data layer", () => {
    render(<CycleChart {...defaultProps} />);
    const first = screen.getAllByRole("tab")[0];
    expect(first).toHaveAccessibleName("2021, Self, cycle number 3, Weak luck, Year of the Ox");
  });

  it("previews the selected year in the center without a tap", () => {
    render(<CycleChart {...defaultProps} />);
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("aria-labelledby", "pillar-5");
    expect(panel).toHaveTextContent("2026 · Now");
    expect(panel).toHaveTextContent("Very strong luck");
    expect(panel).toHaveTextContent("Horse");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("chooses another year when an unselected orb is tapped", () => {
    render(<CycleChart {...defaultProps} />);
    fireEvent.click(screen.getAllByRole("tab")[1]);
    expect(defaultProps.onSelectPillar).toHaveBeenCalledWith(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("moves around the wheel with the arrow keys, wrapping at the ends", () => {
    render(<CycleChart {...defaultProps} />);
    const tabs = screen.getAllByRole("tab");
    fireEvent.keyDown(tabs[5], { key: "ArrowRight" });
    expect(defaultProps.onSelectPillar).toHaveBeenLastCalledWith(6);
    fireEvent.keyDown(tabs[0], { key: "ArrowLeft" });
    expect(defaultProps.onSelectPillar).toHaveBeenLastCalledWith(11);
    fireEvent.keyDown(tabs[5], { key: "Home" });
    expect(defaultProps.onSelectPillar).toHaveBeenLastCalledWith(0);
  });

  it("blooms the full reading from the center, and folds it back with Escape", () => {
    render(<CycleChart {...defaultProps} />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Read 2026 in full/ }));
    });

    const dialog = screen.getByRole("dialog", { name: /Very strong luck/ });
    expect(dialog).toHaveTextContent("Year of the Horse");
    expect(dialog).toHaveTextContent("This number also falls in 2014 and 2038.");
    expect(screen.getByRole("button", { name: "Close the reading" })).toHaveFocus();

    act(() => {
      fireEvent.keyDown(dialog, { key: "Escape" });
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Read 2026 in full/ })).toHaveFocus();
  });

  it("folds the reading back on a tap outside it, leaving focus where the tap was", () => {
    render(
      <>
        <CycleChart {...defaultProps} />
        <button type="button">Elsewhere</button>
      </>
    );
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Read 2026 in full/ }));
    });
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
    elsewhere.focus();

    act(() => {
      fireEvent.pointerDown(elsewhere);
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(elsewhere).toHaveFocus();
  });

  it("lets taps on the ring behind the reading reach the page", () => {
    render(<CycleChart {...defaultProps} />);
    const ring = screen.getByRole("tablist").closest(".aspect-square")!;
    expect(ring).not.toHaveClass("pointer-events-none");
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Read 2026 in full/ }));
    });
    expect(ring).toHaveAttribute("inert");
    expect(ring).toHaveClass("pointer-events-none");
  });

  it("stays open when the tap is inside the reading", () => {
    render(<CycleChart {...defaultProps} />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Read 2026 in full/ }));
    });
    act(() => {
      fireEvent.pointerDown(screen.getByRole("heading", { name: /Very strong luck/ }));
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes with the close button and returns focus to the center", () => {
    render(<CycleChart {...defaultProps} />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Read 2026 in full/ }));
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Close the reading" }));
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Read 2026 in full/ })).toHaveFocus();
  });

  it("opens the reading when the selected orb is tapped again", () => {
    render(<CycleChart {...defaultProps} />);
    act(() => {
      fireEvent.click(screen.getByRole("tab", { selected: true }));
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(defaultProps.onSelectPillar).not.toHaveBeenCalled();
  });

  it("shows the total score below the wheel", () => {
    render(<CycleChart {...defaultProps} />);
    // The folded scale also lists 64, so look inside the card's button
    expect(screen.getByRole("button", { name: /Total score/ })).toHaveTextContent("64");
  });

  describe("returning to the current year", () => {
    // 2027 is the year after the current one (2026)
    const awayProps = { ...defaultProps, selectedYear: 2027 };

    // jsdom has no matchMedia; report a touch screen (no hover)
    beforeAll(() => {
      window.matchMedia = ((query: string) => ({ matches: false, media: query })) as unknown as typeof window.matchMedia;
    });

    it("glides back after the wheel has been idle", () => {
      const onReturnToCurrent = jest.fn();
      render(<CycleChart {...awayProps} onReturnToCurrent={onReturnToCurrent} />);
      act(() => jest.advanceTimersByTime(RETURN_TO_CURRENT_MS - 1));
      expect(onReturnToCurrent).not.toHaveBeenCalled();
      act(() => jest.advanceTimersByTime(1));
      expect(onReturnToCurrent).toHaveBeenCalledTimes(1);
    });

    it("counts idle time from the last interaction", () => {
      const onReturnToCurrent = jest.fn();
      render(<CycleChart {...awayProps} onReturnToCurrent={onReturnToCurrent} />);
      act(() => jest.advanceTimersByTime(RETURN_TO_CURRENT_MS - 1000));
      fireEvent.pointerDown(document.body);
      act(() => jest.advanceTimersByTime(RETURN_TO_CURRENT_MS - 1));
      expect(onReturnToCurrent).not.toHaveBeenCalled();
      act(() => jest.advanceTimersByTime(1));
      expect(onReturnToCurrent).toHaveBeenCalledTimes(1);
    });

    it("waits while a reading is open", () => {
      const onReturnToCurrent = jest.fn();
      render(<CycleChart {...awayProps} onReturnToCurrent={onReturnToCurrent} />);
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: /Read 2027 in full/ }));
      });
      act(() => jest.advanceTimersByTime(RETURN_TO_CURRENT_MS * 3));
      expect(onReturnToCurrent).not.toHaveBeenCalled();
    });

    it("stays put when the current year is already selected", () => {
      const onReturnToCurrent = jest.fn();
      render(<CycleChart {...defaultProps} onReturnToCurrent={onReturnToCurrent} />);
      act(() => jest.advanceTimersByTime(RETURN_TO_CURRENT_MS * 3));
      expect(onReturnToCurrent).not.toHaveBeenCalled();
    });
  });
});
