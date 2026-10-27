"use client";

/**
 * HomeClient — Client-side home page content
 *
 * Renders the birth date form and cycle result. Supports:
 * - Pre-fill via URL search params (?day=24&month=7&year=1997) for share URL redirects
 * - Returning visitors: reads localStorage on mount, shows CurrentYearWidget + chart
 * - Share URL precedence: a shared link shows that person's chart, not the
 *   visitor's own saved one
 * - "Not you?" forgets the saved date and returns to the first-visit form
 */

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useSyncExternalStore,
  startTransition,
} from "react";
import { useSearchParams } from "next/navigation";
import { MotionConfig } from "motion/react";
import { SectionDivider } from "@/components/ui/section-divider";
import { BirthDataForm } from "@/components/birth-data-form";
import { CycleChart } from "@/components/cycle-chart";
import { YearTimeline } from "@/components/year-timeline";
import { CurrentYearWidget } from "@/components/current-year-widget";
import { ErrorBoundary } from "@/components/error-boundary";
import type { CycleResultWithYear } from "@/lib/numerology/derive";
import {
  computeCycleFromBirthDate,
  validateBirthDate,
} from "@/lib/numerology/derive";
import {
  readStoredBirthDate,
  clearStoredBirthDate,
} from "@/lib/storage";
import { getActiveYear, getCycleIndex } from "@/lib/numerology/year-lookup";
import { TIMELINE_YEARS_AHEAD } from "@/components/year-timeline";

/** ID for the chart section — used by the widget's "View full cycle" scroll target. */
const CHART_SECTION_ID = "cycle-chart-section";

/** Computes a cycle from raw date parts, or null if they don't form a valid birth date. */
function cycleFromDateParts(
  year: number,
  month: number,
  day: number
): CycleResultWithYear | null {
  if (validateBirthDate(year, month, day).length > 0) return null;
  return computeCycleFromBirthDate(year, month, day);
}

/**
 * Cycle for a returning visitor's saved birth date, or null. The stored date
 * is re-validated because a date saved by an older version may no longer pass.
 */
function cycleFromStorage(): CycleResultWithYear | null {
  const stored = readStoredBirthDate();
  return stored ? cycleFromDateParts(stored.year, stored.month, stored.day) : null;
}

const subscribeToNothing = () => () => {};

/**
 * False during server render and hydration, true afterwards. localStorage
 * must only be read once this is true: reading it during hydration would
 * render different markup from the server and trigger a hydration error.
 */
function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );
}

export function HomeClient() {
  const searchParams = useSearchParams();
  const isHydrated = useIsHydrated();

  // Pre-fill initial values from URL search params (set by /r/[date] redirect)
  const prefillDay = searchParams.get("day");
  const prefillMonth = searchParams.get("month");
  const prefillYear = searchParams.get("year");

  const hasShareParams = !!(prefillDay && prefillMonth && prefillYear);

  const initialValues = hasShareParams
    ? {
        day: prefillDay!,
        month: prefillMonth!,
        year: prefillYear!,
      }
    : undefined;

  // The result chosen in this visit: from a share link, a form submission, or
  // null after "Not you?". undefined means nothing has been chosen yet, so a
  // returning visitor's saved date is shown instead.
  const [sessionResult, setSessionResult] = useState<
    CycleResultWithYear | null | undefined
  >(() =>
    hasShareParams
      ? cycleFromDateParts(
          parseInt(prefillYear!, 10),
          parseInt(prefillMonth!, 10),
          parseInt(prefillDay!, 10)
        ) ?? undefined
      : undefined
  );

  // A share link takes precedence over the visitor's own saved date.
  const storedResult = useMemo(
    () => (isHydrated && !hasShareParams ? cycleFromStorage() : null),
    [isHydrated, hasShareParams]
  );

  const result = sessionResult === undefined ? storedResult : sessionResult;
  // The "welcome back" widget replaces the form only for a restored saved date.
  const showWidget = sessionResult === undefined && storedResult !== null;

  // One selected year shared by the chart and the timeline, so they always
  // agree. null means "the active year" until the user picks something.
  const [pickedYear, setPickedYear] = useState<number | null>(null);
  const [selectionSource, setSelectionSource] = useState<"chart" | "timeline">("timeline");

  const resultRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const activeYear = result
    ? getActiveYear(currentYear, result.birthData.gregorianMonth, result.birthDay)
    : currentYear;
  const selectedYear = pickedYear ?? activeYear;

  // Form submission: localStorage save happens inside BirthDataForm.handleSubmit
  const handleResult = useCallback((r: CycleResultWithYear) => {
    setSessionResult(r);
    setPickedYear(null);
    setSelectionSource("timeline");

    // Scroll to result card after React renders. "auto" defers to the CSS
    // scroll-behavior, which is smooth unless the user prefers reduced motion.
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }, []);

  // "Not you?" forgets the saved date and returns to the first-visit form.
  const handleReset = useCallback(() => {
    clearStoredBirthDate();
    setSessionResult(null);
    setPickedYear(null);
    setSelectionSource("timeline");
  }, []);

  // Selection changes run as transitions so <ViewTransition> can animate
  // the selection outline and detail panel between states.
  const handleTimelineSelectYear = useCallback((year: number) => {
    startTransition(() => {
      setPickedYear(year);
      setSelectionSource("timeline");
    });
  }, []);

  // Picking a pillar stays within the 12-year cycle that is already selected,
  // so moving between pillars never jumps the timeline to another decade.
  const handleChartSelectPillar = useCallback((columnIndex: number) => {
    if (!result) return;
    const cycleStart = selectedYear - getCycleIndex(result.birthYear, selectedYear);
    let year = cycleStart + columnIndex;
    if (year > currentYear + TIMELINE_YEARS_AHEAD) year -= 12;
    startTransition(() => {
      setPickedYear(year);
      setSelectionSource("chart");
    });
  }, [currentYear, result, selectedYear]);

  // Server render and first paint show the form; after hydration the widget
  // replaces it if a saved date was restored.
  const showForm = !showWidget;

  return (
    <MotionConfig reducedMotion="user">
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:px-8">
      {/* Entrance: the title surfaces out of the dark, then each block follows. */}
      <h1 className="kindle title-glow font-display text-5xl sm:text-7xl tracking-[0.14em] text-ink text-center">
        Solini
      </h1>
      <p
        className="rise mt-4 font-display text-lg text-gold-deep text-center tracking-[0.12em]"
        style={{ "--rise-delay": "500ms" } as React.CSSProperties}
      >
        Khmer Numerology
      </p>
      <p
        className="rise mt-1 text-xs uppercase text-ink-light text-center tracking-[0.18em]"
        style={{ "--rise-delay": "620ms" } as React.CSSProperties}
      >
        Discover your life cycle
      </p>

      <SectionDivider />

      <ErrorBoundary>
        {/* Widget for returning visitors — shows after hydration if localStorage has data */}
        {showWidget && result && (
          <CurrentYearWidget
            cycle={result.cycle}
            birthYear={result.birthYear}
            birthMonth={result.birthData.gregorianMonth}
            birthDay={result.birthDay}
            onReset={handleReset}
            chartSectionId={CHART_SECTION_ID}
          />
        )}

        {/* Form card — shown for first-visit, after "Not you?", or when share URL params present */}
        {showForm && (
          <div
            className="rise glass max-w-[480px] w-full rounded-2xl p-6 sm:p-12"
            style={{ "--rise-delay": "760ms" } as React.CSSProperties}
          >
            <p className="text-center text-ink-light text-sm tracking-[0.04em]">
              Enter your birth date to reveal your 12-year cycle
            </p>

            <BirthDataForm onResult={handleResult} initialValues={initialValues} />
          </div>
        )}

        {/* Result card — cycle chart (rendered from localStorage data OR fresh submission) */}
        {result && (
          <>
            <SectionDivider />
            <div
              id={CHART_SECTION_ID}
              ref={resultRef}
              className="rise glass w-full max-w-[900px] xl:max-w-[1200px] rounded-2xl p-3 min-[360px]:p-4 sm:p-8 lg:p-10 scroll-mt-8"
            >
              <CycleChart
                cycle={result.cycle}
                totalScore={result.totalScore}
                birthYear={result.birthYear}
                birthMonth={result.birthData.gregorianMonth}
                birthDay={result.birthDay}
                selectedYear={selectedYear}
                showSingleYear={selectionSource === "timeline"}
                onSelectPillar={handleChartSelectPillar}
              />
            </div>

            {/* Year Timeline Explorer */}
            <div className="w-full max-w-[900px] xl:max-w-[1200px] mt-6 scroll-settle">
              <YearTimeline
                cycle={result.cycle}
                birthYear={result.birthYear}
                currentYear={activeYear}
                selectedYear={selectedYear}
                onSelectYear={handleTimelineSelectYear}
              />
            </div>
          </>
        )}
      </ErrorBoundary>
    </main>
    </MotionConfig>
  );
}
