/**
 * @jest-environment jsdom
 */
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HomeClient } from "../home-client";

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
