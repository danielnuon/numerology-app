/**
 * @jest-environment jsdom
 */
import { forwardRef, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { render, screen, fireEvent, act, within, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CycleComparison, personTerms, type ComparedPerson } from "../cycle-comparison";
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
const PARTNER_SHARE: DecodedShare = { year: 2000, month: 3, day: 15, rule: "khmer" };
const PARTNER: ComparedPerson = { share: PARTNER_SHARE, name: null, isVisitor: false };

/** A person compared with the reading, by birth date and optional name. */
function person(year: number, month: number, day: number, name: string | null = null): ComparedPerson {
  return { share: { year, month, day, rule: "khmer" }, name, isVisitor: false };
}

/** The household from the design proposal, after the 1997 reading: totals 76, 64 and 64. */
const HOUSEHOLD = [person(1996, 2, 10, "Sam"), person(2021, 5, 3, "Mai"), person(1968, 11, 12, "Dad")];

/** Holds the other people the way HomeClient does. */
function Harness({
  initialOthers = [],
  isShared = false,
  readingName = null,
}: {
  initialOthers?: ComparedPerson[];
  isShared?: boolean;
  readingName?: string | null;
}) {
  const [others, setOthers] = useState<ComparedPerson[]>(initialOthers);
  return (
    <CycleComparison
      reading={reading}
      readingRule="khmer"
      readingName={readingName}
      activeYear={2026}
      others={others}
      onOthersChange={setOthers}
      isShared={isShared}
    />
  );
}

/** Fills in and submits the comparison form. */
function submitPerson(day: string, month: string, year: string, name?: string) {
  if (name !== undefined) fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Day"), { target: { value: day } });
  fireEvent.change(screen.getByLabelText("Month"), { target: { value: month } });
  fireEvent.change(screen.getByLabelText("Year"), { target: { value: year } });
  act(() => {
    fireEvent.submit(screen.getByRole("form", { name: "Comparison birth date form" }));
  });
}

/** The table's column headers, in order. */
function headers() {
  return within(screen.getByRole("table")).getAllByRole("columnheader").map((h) => h.textContent);
}

function setNavigator(values: { share?: unknown; clipboard?: unknown }) {
  Object.defineProperty(navigator, "share", { value: values.share, configurable: true });
  Object.defineProperty(navigator, "clipboard", { value: values.clipboard, configurable: true });
}

describe("CycleComparison", () => {
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
    submitPerson("15", "3", "2000");

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
    render(<Harness initialOthers={[PARTNER]} />);
    const table = screen.getByRole("table");
    const labels = ["Amplified", "Stabilized", "Neutral", "Low together", "Unstable"];
    for (const row of within(table).getAllByRole("row").slice(1)) {
      const together = within(row).getAllByRole("cell").at(-1) as HTMLElement;
      expect(labels.some((label) => together.textContent?.endsWith(label))).toBe(true);
    }
  });

  it("shares the comparison link with both dates", async () => {
    // Fake timers would keep waitFor from flushing the async share outside act
    jest.useRealTimers();
    const writeText = jest.fn().mockResolvedValue(undefined);
    setNavigator({ share: undefined, clipboard: { writeText } });
    render(<Harness initialOthers={[PARTNER]} />);

    fireEvent.click(screen.getByRole("button", { name: "Share this comparison" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("http://localhost/r/1997-07-24+2000-03-15")
    );
    expect(await screen.findByText(/Link copied/)).toBeInTheDocument();
  });

  it("leads with the summary and offers its card as an image", () => {
    render(<Harness initialOthers={[PARTNER]} />);
    expect(screen.getByText("Now, 2026")).toBeInTheDocument();
    expect(screen.getByText("Cycle 2021–2032")).toBeInTheDocument();
    const download = screen.getByRole("link", { name: "Download image" });
    expect(download).toHaveAttribute("href", "/r/1997-07-24+2000-03-15/opengraph-image");
    expect(download).toHaveAttribute("download", "solini-comparison-1997-07-24-2000-03-15.png");
  });

  it("steps back through the current cycle and the two before it", () => {
    render(<Harness initialOthers={[PARTNER]} />);
    expect(screen.getByRole("button", { name: "Later cycle" })).toBeDisabled();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Earlier cycle" }));
    });
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(within(rows[1]).getByRole("rowheader")).toHaveTextContent("2009");
    expect(screen.getByText("Cycle 2009–2020")).toBeInTheDocument();
    // This year's interaction stays in the summary whichever cycle the table shows
    expect(screen.getByText("Now, 2026")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Later cycle" }));
    });
    expect(screen.getByText("Cycle 2021–2032")).toBeInTheDocument();
  });

  it("marks years before the partner's birth as not born yet", () => {
    render(<Harness initialOthers={[PARTNER]} />);
    for (let i = 0; i < 2; i++) {
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "Earlier cycle" }));
      });
    }
    expect(screen.getByRole("button", { name: "Earlier cycle" })).toBeDisabled();
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    // 1997 to 1999 come before a 2000 birth
    for (const row of rows.slice(1, 4)) expect(row).toHaveTextContent("Not born yet");
    expect(rows[4]).not.toHaveTextContent("Not born yet");
    expect(screen.getByText("Cycle 1997–2008 · 9 years together")).toBeInTheDocument();
  });

  it("keeps the interaction meanings and the totals link under How to read this", () => {
    render(<Harness initialOthers={[PARTNER]} />);
    const toggle = screen.getByRole("button", { name: "How to read this" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "How the totals are read" })).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("The stronger year steadies the weaker one.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "How the totals are read" })).toHaveAttribute(
      "href",
      "/how-it-works#total-score"
    );
  });

  it("returns to the resting button when the comparison is removed", () => {
    render(<Harness initialOthers={[PARTNER]} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove comparison" }));
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Compare with someone close" })).toBeInTheDocument();
  });

  it("names the two people You and Them on the visitor's own reading", () => {
    render(<Harness initialOthers={[PARTNER]} />);
    const headers = within(screen.getByRole("table")).getAllByRole("columnheader").map((h) => h.textContent);
    expect(headers).toEqual(["Year", "You", "Them", "Together"]);
  });

  it("asks for the visitor's own date on a shared reading, and puts them second", () => {
    render(<Harness isShared />);
    fireEvent.click(screen.getByRole("button", { name: "Compare it with yours" }));
    expect(screen.getByText("Enter your birth date to see how the two cycles meet.")).toBeInTheDocument();
    // The visitor is "You", so the form doesn't ask their name
    expect(screen.queryByLabelText(/^Name/)).not.toBeInTheDocument();
    submitPerson("15", "3", "2000");
    expect(headers()).toEqual(["Year", "Them", "You", "Together"]);
  });

  it("calls people on a shared comparison link, which holds neither visitor, by their zodiac animal", () => {
    render(<Harness initialOthers={[PARTNER]} isShared />);
    expect(screen.getByRole("heading", { name: "Two cycles together" })).toBeInTheDocument();
    // 2000-03-15 is before Khmer New Year, so the Rabbit year of 1999
    expect(headers()).toEqual(["Year", "Ox", "Rabbit", "Together"]);
  });

  it("uses the names a shared link carries", () => {
    render(<Harness initialOthers={HOUSEHOLD} isShared readingName="Dany" />);
    expect(screen.getByRole("heading", { name: "Four cycles together" })).toBeInTheDocument();
    expect(headers()).toEqual(["Year", "Dany", "Sam", "Mai", "Dad", "Together"]);
  });

  describe("with three or more people", () => {
    it("adds someone by name from the comparison", () => {
      render(<Harness initialOthers={[PARTNER]} />);
      fireEvent.click(screen.getByRole("button", { name: "Add someone" }));
      expect(screen.getByRole("heading", { name: "Add someone" })).toBeInTheDocument();
      submitPerson("3", "5", "2021", "  Mai ");

      expect(headers()).toEqual(["Year", "You", "Rabbit", "Mai", "Together"]);
      expect(screen.getByText("May 3, 2021")).toBeInTheDocument();
      expect(localStorage.getItem(BIRTH_DATE_STORAGE_KEY)).toBeNull();
    });

    it("says the group reading is Solini's extension, and links to the rule", () => {
      render(<Harness initialOthers={HOUSEHOLD} />);
      expect(screen.getByText(/Khmer numerology compares two people at a time/)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "See how" })).toHaveAttribute("href", "/how-it-works#household");
      expect(screen.getByText(/All the cycles are balanced overall/)).toBeInTheDocument();
    });

    it("keeps the two-person view free of the group note", () => {
      render(<Harness initialOthers={[PARTNER]} />);
      expect(screen.queryByText(/Khmer numerology compares two people at a time/)).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Pair by pair/ })).not.toBeInTheDocument();
    });

    it("reads each year for the whole group and names whose reset unsettles it", () => {
      render(<Harness initialOthers={HOUSEHOLD} />);
      const rows = within(screen.getByRole("table")).getAllByRole("row");
      // 2023: Sam's cycle is at 0
      expect(within(rows[3]).getByRole("rowheader")).toHaveTextContent("2023");
      expect(rows[3]).toHaveTextContent("UnstableSam resets");
      // 2028: the 1997 and 1968 cycles are both at 0
      expect(rows[8]).toHaveTextContent("UnstableYou, Dad reset");
      expect(rows[6]).toHaveTextContent("Stabilized");
    });

    it("lists this year's pairs by the pair rule", () => {
      render(<Harness initialOthers={HOUSEHOLD} />);
      const toggle = screen.getByRole("button", { name: "Pair by pair, 2026" });
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");
      const items = within(screen.getByRole("list")).getAllByRole("listitem");
      // Four people make six pairs. 2026: You 11, Sam 9, Mai 1, Dad 5
      expect(items).toHaveLength(6);
      expect(items[0]).toHaveTextContent(/^You & Sam.Amplified$/);
      expect(items[5]).toHaveTextContent(/^Mai & Dad.Neutral$/);
    });

    it("removes one person from their tile", () => {
      render(<Harness initialOthers={HOUSEHOLD} />);
      fireEvent.click(screen.getByRole("button", { name: "Remove Mai" }));
      expect(headers()).toEqual(["Year", "You", "Sam", "Dad", "Together"]);
    });

    it("holds six people at most", () => {
      const five = [...HOUSEHOLD, person(2018, 9, 1, "Kai"), person(1970, 4, 20, "Mom")];
      render(<Harness initialOthers={five} />);
      expect(screen.queryByRole("button", { name: "Add someone" })).not.toBeInTheDocument();
      expect(screen.getByText("Six people is the most one comparison holds.")).toBeInTheDocument();
    });

    it("shares everyone and their names in one link", async () => {
      jest.useRealTimers();
      const writeText = jest.fn().mockResolvedValue(undefined);
      setNavigator({ share: undefined, clipboard: { writeText } });
      render(<Harness initialOthers={HOUSEHOLD} />);

      fireEvent.click(screen.getByRole("button", { name: "Share this comparison" }));
      await waitFor(() =>
        expect(writeText).toHaveBeenCalledWith(
          "http://localhost/r/1997-07-24+1996-02-10+2021-05-03+1968-11-12?n=&n=Sam&n=Mai&n=Dad"
        )
      );
      expect(await screen.findByText(/everyone's birth dates and the names you added/)).toBeInTheDocument();
      // The preview image can't read names, so its link leaves them out
      expect(screen.getByRole("link", { name: "Download image" })).toHaveAttribute(
        "href",
        "/r/1997-07-24+1996-02-10+2021-05-03+1968-11-12/opengraph-image"
      );
    });
  });
});

describe("personTerms", () => {
  const ox = { name: null, isVisitor: false, animal: "Ox" as const };

  it("prefers a name, then You for the visitor", () => {
    expect(personTerms([{ ...ox, isVisitor: true }, { ...ox, name: "Sam" }])).toEqual(["You", "Sam"]);
  });

  it("calls the other person in a pair with the visitor Them", () => {
    expect(personTerms([{ ...ox, isVisitor: true }, ox])).toEqual(["You", "Them"]);
  });

  it("numbers people who share an animal in a group", () => {
    expect(personTerms([{ ...ox, isVisitor: true }, ox, ox, { ...ox, animal: "Pig" }])).toEqual([
      "You",
      "Ox",
      "Ox 2",
      "Pig",
    ]);
  });
});
