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
function Harness({ initialPartner = null }: { initialPartner?: DecodedShare | null }) {
  const [partner, setPartner] = useState<DecodedShare | null>(initialPartner);
  return (
    <PartnerComparison
      reading={reading}
      readingRule="khmer"
      activeYear={2026}
      partner={partner}
      onPartnerChange={setPartner}
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

    fireEvent.click(screen.getByRole("button", { name: "Compare with a partner" }));
    expect(screen.getByRole("form", { name: "Partner's birth date form" })).toBeInTheDocument();
    expect(screen.getByText("Their birth date isn't saved anywhere.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });

  it("compares 12 years from the current cycle year once a date is entered, and saves nothing", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Compare with a partner" }));
    fireEvent.change(screen.getByLabelText("Day"), { target: { value: "15" } });
    fireEvent.change(screen.getByLabelText("Month"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Year"), { target: { value: "2000" } });
    act(() => {
      fireEvent.submit(screen.getByRole("form", { name: "Partner's birth date form" }));
    });

    expect(screen.getByRole("heading", { name: "Your cycles together" })).toBeInTheDocument();
    expect(screen.getByText("March 15, 2000")).toBeInTheDocument();
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    // Header plus 12 years, starting with 2026 marked as now
    expect(rows).toHaveLength(13);
    expect(within(rows[1]).getByRole("rowheader")).toHaveTextContent("2026Now");
    expect(within(rows[12]).getByRole("rowheader")).toHaveTextContent("2037");
    expect(localStorage.getItem(BIRTH_DATE_STORAGE_KEY)).toBeNull();
  });

  it("names each year's interaction in words, not only by color", () => {
    render(<Harness initialPartner={PARTNER} />);
    const table = screen.getByRole("table");
    const labels = ["Amplified", "Stabilized", "Neutral", "Risk", "Unstable"];
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

  it("returns to the resting button when the comparison is removed", () => {
    render(<Harness initialPartner={PARTNER} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove comparison" }));
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Compare with a partner" })).toBeInTheDocument();
  });
});
