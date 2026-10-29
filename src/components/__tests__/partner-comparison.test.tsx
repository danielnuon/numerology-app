/**
 * @jest-environment jsdom
 */
import { forwardRef, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { render, screen, fireEvent, act, within, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PartnerComparison } from "../partner-comparison";
import { computeCycleFromBirthDate } from "@/lib/numerology/derive";
import type { DecodedShare } from "@/lib/numerology/url-encoding";
import { BIRTH_DATE_STORAGE_KEY } from "@/lib/storage";

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

const reading = computeCycleFromBirthDate(1997, 7, 24, "khmer");
const PARTNER: DecodedShare = { year: 2000, month: 3, day: 15, rule: "khmer" };

/** Holds the partner the way HomeClient does. */
function Harness({ initialPartner = null, isShared = false }: { initialPartner?: DecodedShare | null; isShared?: boolean }) {
  const [partner, setPartner] = useState<DecodedShare | null>(initialPartner);
  return (
    <PartnerComparison
      reading={reading}
      readingRule="khmer"
      activeYear={2026}
      partner={partner}
      onPartnerChange={setPartner}
      isShared={isShared}
    />
  );
}

function setNavigator(values: { share?: unknown; clipboard?: unknown }) {
  Object.defineProperty(navigator, "share", { value: values.share, configurable: true });
  Object.defineProperty(navigator, "clipboard", { value: values.clipboard, configurable: true });
}

describe("PartnerComparison", () => {
  beforeAll(() => {
    window.matchMedia = ((query: string) => ({ matches: false, media: query })) as unknown as typeof window.matchMedia;
  });

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers({ now: new Date(2026, 9, 28) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("rests as one button, which opens the partner form", () => {
    render(<Harness />);
    expect(screen.queryByRole("form")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Compare with someone close" }));
    expect(screen.getByRole("form", { name: "Comparison birth date form" })).toBeInTheDocument();
    expect(screen.getByText("This birth date isn't saved anywhere.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });

  it("compares the current 12-year cycle once a date is entered, and saves nothing", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Compare with someone close" }));
    fireEvent.change(screen.getByLabelText("Day"), { target: { value: "15" } });
    fireEvent.change(screen.getByLabelText("Month"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Year"), { target: { value: "2000" } });
    act(() => {
      fireEvent.submit(screen.getByRole("form", { name: "Comparison birth date form" }));
    });

    expect(screen.getByRole("heading", { name: "Your cycles together" })).toBeInTheDocument();
    expect(screen.getByText("March 15, 2000")).toBeInTheDocument();
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    // Header plus the 12 years of the 1997 birth's current cycle, with 2026 marked as now
    expect(rows).toHaveLength(13);
    expect(within(rows[1]).getByRole("rowheader")).toHaveTextContent("2021");
    expect(within(rows[6]).getByRole("rowheader")).toHaveTextContent("2026Now");
    expect(within(rows[12]).getByRole("rowheader")).toHaveTextContent("2032");
    expect(localStorage.getItem(BIRTH_DATE_STORAGE_KEY)).toBeNull();
  });

  it("names each year's interaction in words, not only by color", () => {
    render(<Harness initialPartner={PARTNER} />);
    const table = screen.getByRole("table");
    const labels = ["Amplified", "Stabilized", "Neutral", "Low together", "Unstable"];
    for (const row of within(table).getAllByRole("row").slice(1)) {
      const together = within(row).getAllByRole("cell")[2];
      expect(labels.some((label) => together.textContent?.endsWith(label))).toBe(true);
    }
  });

  it("shares the comparison link with both dates", async () => {
    // Fake timers would keep waitFor from flushing the async share outside act
    jest.useRealTimers();
    const writeText = jest.fn().mockResolvedValue(undefined);
    setNavigator({ share: undefined, clipboard: { writeText } });
    render(<Harness initialPartner={PARTNER} />);

    fireEvent.click(screen.getByRole("button", { name: "Share this comparison" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("http://localhost/r/1997-07-24+2000-03-15")
    );
    expect(await screen.findByText(/Link copied/)).toBeInTheDocument();
  });

  it("leads with the summary and offers its card as an image", () => {
    render(<Harness initialPartner={PARTNER} />);
    expect(screen.getByText(/^Now, 2026:/)).toBeInTheDocument();
    expect(screen.getByText("Cycle 2021–2032")).toBeInTheDocument();
    const download = screen.getByRole("link", { name: "Download image" });
    expect(download).toHaveAttribute("href", "/r/1997-07-24+2000-03-15/opengraph-image");
    expect(download).toHaveAttribute("download", "solini-comparison-1997-07-24-2000-03-15.png");
  });

  it("switches between the current cycle and the two before it", () => {
    render(<Harness initialPartner={PARTNER} />);
    const current = screen.getByRole("tab", { name: "Current cycle, 2021 to 2032" });
    expect(current).toHaveAttribute("aria-selected", "true");

    act(() => {
      fireEvent.click(screen.getByRole("tab", { name: "Previous cycle, 2009 to 2020" }));
    });
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(within(rows[1]).getByRole("rowheader")).toHaveTextContent("2009");
    expect(screen.queryByText(/^Now,/)).not.toBeInTheDocument();
    expect(screen.getByText("Cycle 2009–2020")).toBeInTheDocument();
  });

  it("marks years before the partner's birth as not born yet", () => {
    render(<Harness initialPartner={PARTNER} />);
    act(() => {
      fireEvent.click(screen.getByRole("tab", { name: "Cycle before that, 1997 to 2008" }));
    });
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    // 1997 to 1999 come before a 2000 birth
    for (const row of rows.slice(1, 4)) expect(row).toHaveTextContent("Not born yet");
    expect(rows[4]).not.toHaveTextContent("Not born yet");
    expect(screen.getByText("Cycle 1997–2008 · 9 years together")).toBeInTheDocument();
  });

  it("moves between cycles with the arrow keys", () => {
    render(<Harness initialPartner={PARTNER} />);
    act(() => {
      fireEvent.keyDown(screen.getByRole("tab", { name: /^Current cycle/ }), { key: "ArrowRight" });
    });
    const previous = screen.getByRole("tab", { name: /^Previous cycle/ });
    expect(previous).toHaveAttribute("aria-selected", "true");
    expect(previous).toHaveFocus();
  });

  it("returns to the resting button when the comparison is removed", () => {
    render(<Harness initialPartner={PARTNER} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove comparison" }));
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Compare with someone close" })).toBeInTheDocument();
  });

  it("names the two people You and Them on the visitor's own reading", () => {
    render(<Harness initialPartner={PARTNER} />);
    const headers = within(screen.getByRole("table")).getAllByRole("columnheader").map((h) => h.textContent);
    expect(headers).toEqual(["Year", "You", "Them", "Together"]);
  });

  it("asks for the visitor's own date on a shared reading, and puts them second", () => {
    render(<Harness isShared />);
    fireEvent.click(screen.getByRole("button", { name: "Compare it with yours" }));
    expect(screen.getByText("Enter your birth date to see how the two cycles meet.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Day"), { target: { value: "15" } });
    fireEvent.change(screen.getByLabelText("Month"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Year"), { target: { value: "2000" } });
    act(() => {
      fireEvent.submit(screen.getByRole("form", { name: "Comparison birth date form" }));
    });
    const headers = within(screen.getByRole("table")).getAllByRole("columnheader").map((h) => h.textContent);
    expect(headers).toEqual(["Year", "Them", "You", "Together"]);
  });

  it("numbers the two people on a shared comparison link, which holds neither visitor", () => {
    render(<Harness initialPartner={PARTNER} isShared />);
    expect(screen.getByRole("heading", { name: "Two cycles together" })).toBeInTheDocument();
    const headers = within(screen.getByRole("table")).getAllByRole("columnheader").map((h) => h.textContent);
    expect(headers).toEqual(["Year", "First", "Second", "Together"]);
  });
});
