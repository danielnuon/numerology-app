/**
 * @jest-environment jsdom
 */
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HomeClient } from "../home-client";
import {
  BIRTH_DATE_STORAGE_KEY,
  NEW_YEAR_RULE_STORAGE_KEY,
  UPDATE_NOTICE_STORAGE_KEY,
} from "@/lib/storage";

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
  return {
    motion: { div: MotionDiv, button: MotionButton },
    MotionConfig: ({ children }: { children: ReactNode }) => <>{children}</>,
    useReducedMotion: () => false,
  };
});

function submitBirthDate(day: string, month: string, year: string) {
  fireEvent.change(screen.getByLabelText("Day"), { target: { value: day } });
  fireEvent.change(screen.getByLabelText("Month"), { target: { value: month } });
  fireEvent.change(screen.getByLabelText("Year"), { target: { value: year } });
  act(() => {
    fireEvent.submit(screen.getByRole("form", { name: "Birth date form" }));
  });
}

describe("HomeClient: the form blooms into the reading", () => {
  beforeAll(() => {
    // jsdom has no matchMedia, scrollIntoView or scrollTo
    window.matchMedia = ((query: string) => ({ matches: false, media: query })) as unknown as typeof window.matchMedia;
    Element.prototype.scrollIntoView = jest.fn();
    Element.prototype.scrollTo = jest.fn() as never;
    window.scrollTo = jest.fn() as never;
  });

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers({ now: new Date(2026, 9, 28) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("replaces the form with the reading in the same place", () => {
    render(<HomeClient searchParams={{}} />);
    submitBirthDate("24", "7", "1997");

    expect(screen.queryByRole("form", { name: "Birth date form" })).not.toBeInTheDocument();
    expect(screen.getByText("July 24, 1997")).toBeInTheDocument();
    expect(screen.getByText(/Year of the Ox · Born on a Thursday/)).toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: "12-year life cycle" })).toBeInTheDocument();
  });

  it("folds back to an empty form for someone else, and can return to the reading", () => {
    render(<HomeClient searchParams={{}} />);
    submitBirthDate("24", "7", "1997");

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Read for someone else" }));
    });
    expect(screen.getByLabelText("Day")).toHaveValue("");
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Back to the reading" }));
    });
    expect(screen.getByText("July 24, 1997")).toBeInTheDocument();
  });

  it("opens a shared link on the reading, with a way to read your own", () => {
    render(<HomeClient searchParams={{ day: "24", month: "7", year: "1997" }} />);

    expect(screen.getByText("A reading shared with you")).toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "Birth date form" })).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Read your own" }));
    });
    expect(screen.getByText("Enter your birth date to see your own 12-year cycle.")).toBeInTheDocument();
  });
});

describe("HomeClient: a calm first visit, this year first", () => {
  beforeAll(() => {
    window.matchMedia = ((query: string) => ({ matches: false, media: query })) as unknown as typeof window.matchMedia;
    Element.prototype.scrollIntoView = jest.fn();
    Element.prototype.scrollTo = jest.fn() as never;
    window.scrollTo = jest.fn() as never;
  });

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers({ now: new Date(2026, 9, 28) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("asks one question, with the intro folded behind \"What will I see?\"", () => {
    render(<HomeClient searchParams={{}} />);
    expect(screen.getByRole("heading", { name: "When were you born?" })).toBeInTheDocument();
    expect(screen.getByText("What will I see?").closest("details")).not.toHaveAttribute("open");
    expect(screen.getByText(/a luck number for every year of your 12-year cycle/)).toBeInTheDocument();
  });

  it("opens the reading on this year", () => {
    render(<HomeClient searchParams={{}} />);
    submitBirthDate("24", "7", "1997");
    expect(screen.getByText("Your 2026 reading")).toBeInTheDocument();
    expect(screen.getByText(/Life area:/)).toBeInTheDocument();
  });

  it("opens the 12 years on phones with \"See all 12 years\"", () => {
    render(<HomeClient searchParams={{}} />);
    submitBirthDate("24", "7", "1997");
    const toggle = screen.getByRole("button", { name: "See all 12 years" });
    const wheel = document.getElementById(toggle.getAttribute("aria-controls")!)!;
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(wheel.className).toMatch(/max-md:hidden/);

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Hide the 12 years" })).toHaveAttribute("aria-expanded", "true");
    expect(wheel.className).not.toMatch(/max-md:hidden/);
  });

  it("lets a returning visitor forget their saved date with \"Not you?\"", () => {
    localStorage.setItem(BIRTH_DATE_STORAGE_KEY, JSON.stringify({ day: 24, month: 7, year: 1997 }));
    render(<HomeClient searchParams={{}} />);
    expect(screen.getByRole("button", { name: "Read for someone else" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Not you?" }));
    expect(screen.getByRole("heading", { name: "When were you born?" })).toBeInTheDocument();
    expect(localStorage.getItem(BIRTH_DATE_STORAGE_KEY)).toBeNull();
  });
});

describe("HomeClient: the one-time note about the 2026 changes", () => {
  beforeAll(() => {
    window.matchMedia = ((query: string) => ({ matches: false, media: query })) as unknown as typeof window.matchMedia;
    Element.prototype.scrollIntoView = jest.fn();
    Element.prototype.scrollTo = jest.fn() as never;
    window.scrollTo = jest.fn() as never;
  });

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers({ now: new Date(2026, 9, 28) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const NOTICE = { name: "Your reading has changed a little" };

  function saveDate(day: number, month: number, year: number) {
    localStorage.setItem(BIRTH_DATE_STORAGE_KEY, JSON.stringify({ day, month, year }));
  }

  it("shows above a returning visitor's restored reading, in a live region", () => {
    saveDate(24, 7, 1997);
    render(<HomeClient searchParams={{}} />);
    const heading = screen.getByRole("heading", NOTICE);
    expect(heading.closest("[aria-live=polite]")).toBeInTheDocument();
    expect(screen.getByText(/Each year of your cycle now begins on your birthday/)).toBeInTheDocument();
  });

  it("names both animals when Khmer New Year changes this birth date's animal", () => {
    // February 10, 1997 is after Chinese New Year (Ox) but before Khmer New Year (Rat).
    saveDate(10, 2, 1997);
    render(<HomeClient searchParams={{}} />);
    expect(screen.getByText(/your animal is the Rat rather than the Ox/)).toBeInTheDocument();
  });

  it("leaves out the animal line when the visitor had already chosen a New Year rule", () => {
    saveDate(10, 2, 1997);
    localStorage.setItem(NEW_YEAR_RULE_STORAGE_KEY, "chinese");
    render(<HomeClient searchParams={{}} />);
    expect(screen.getByRole("heading", NOTICE)).toBeInTheDocument();
    expect(screen.queryByText(/your animal is the/)).not.toBeInTheDocument();
  });

  it("leaves out the animal line when both New Years give the same animal", () => {
    saveDate(24, 7, 1997);
    render(<HomeClient searchParams={{}} />);
    expect(screen.queryByText(/your animal is the/)).not.toBeInTheDocument();
  });

  it("goes away for good with \"Got it\", and focus moves to the reading", () => {
    saveDate(24, 7, 1997);
    const { unmount } = render(<HomeClient searchParams={{}} />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    });
    expect(screen.queryByRole("heading", NOTICE)).not.toBeInTheDocument();
    expect(document.activeElement).toBe(document.getElementById("cycle-chart-section"));
    expect(localStorage.getItem(UPDATE_NOTICE_STORAGE_KEY)).not.toBeNull();

    unmount();
    render(<HomeClient searchParams={{}} />);
    expect(screen.queryByRole("heading", NOTICE)).not.toBeInTheDocument();
  });

  it("never shows on a first visit", () => {
    render(<HomeClient searchParams={{}} />);
    expect(screen.queryByRole("heading", NOTICE)).not.toBeInTheDocument();
  });

  it("never shows on a shared link, even with a saved date", () => {
    saveDate(24, 7, 1997);
    render(<HomeClient searchParams={{ day: "10", month: "2", year: "1997" }} />);
    expect(screen.queryByRole("heading", NOTICE)).not.toBeInTheDocument();
  });

  it("never shows after a fresh submission, now or on a later visit", () => {
    const { unmount } = render(<HomeClient searchParams={{}} />);
    submitBirthDate("24", "7", "1997");
    expect(screen.queryByRole("heading", NOTICE)).not.toBeInTheDocument();

    unmount();
    render(<HomeClient searchParams={{}} />);
    expect(screen.getByText("July 24, 1997")).toBeInTheDocument();
    expect(screen.queryByRole("heading", NOTICE)).not.toBeInTheDocument();
  });

  it("never shows when storage can't be read", () => {
    saveDate(24, 7, 1997);
    const getItem = jest.spyOn(Storage.prototype, "getItem").mockImplementation((key: string) => {
      if (key === UPDATE_NOTICE_STORAGE_KEY) throw new Error("blocked");
      return key === BIRTH_DATE_STORAGE_KEY ? JSON.stringify({ day: 24, month: 7, year: 1997 }) : null;
    });
    render(<HomeClient searchParams={{}} />);
    expect(screen.getByText("July 24, 1997")).toBeInTheDocument();
    expect(screen.queryByRole("heading", NOTICE)).not.toBeInTheDocument();
    getItem.mockRestore();
  });
});
