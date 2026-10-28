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
 * - The New Year rule (Khmer or Chinese) that turns the animal year: from a
 *   share link (?ny=), else the visitor's remembered choice, else Khmer.
 *   Changing it recomputes the reading in place.
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
import { ShareReading } from "@/components/share-reading";
import { NewYearSetting } from "@/components/new-year-setting";
import type { CycleResultWithYear } from "@/lib/numerology/derive";
import {
  computeCycleFromBirthDate,
  validateBirthDate,
} from "@/lib/numerology/derive";
import {
  DEFAULT_NEW_YEAR_RULE,
  isNewYearRule,
  type NewYearRule,
} from "@/lib/numerology/zodiac";
import {
  readStoredBirthDate,
  clearStoredBirthDate,
  readStoredNewYearRule,
  saveNewYearRule,
  type StoredBirthDate,
} from "@/lib/storage";
import { getActiveYear, getCycleIndex } from "@/lib/numerology/year-lookup";
import { TIMELINE_YEARS_AHEAD } from "@/components/year-timeline";

/** ID for the chart section — used by the widget's "See all 12 years" scroll target. */
const CHART_SECTION_ID = "cycle-chart-section";

/** A birth date as day, month and year numbers. */
type BirthDateParts = StoredBirthDate;

/** The date parts if they form a valid birth date, else null. */
function validDateParts(year: number, month: number, day: number): BirthDateParts | null {
  return validateBirthDate(year, month, day).length > 0 ? null : { year, month, day };
}

/**
 * A returning visitor's saved birth date, or null. The stored date is
 * re-validated because a date saved by an older version may no longer pass.
 */
function dateFromStorage(): BirthDateParts | null {
  const stored = readStoredBirthDate();
  return stored ? validDateParts(stored.year, stored.month, stored.day) : null;
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
  // A shared reading keeps the sharer's New Year rule; links without one are Khmer.
  const prefillRule = searchParams.get("ny");
  const shareRule: NewYearRule | null = hasShareParams
    ? isNewYearRule(prefillRule) ? prefillRule : DEFAULT_NEW_YEAR_RULE
    : null;

  const initialValues = hasShareParams
    ? {
        day: prefillDay!,
        month: prefillMonth!,
        year: prefillYear!,
      }
    : undefined;

  // The birth date chosen in this visit: from a share link, a form
  // submission, or null after "Not you?". undefined means nothing has been
  // chosen yet, so a returning visitor's saved date is shown instead.
  const [sessionDate, setSessionDate] = useState<
    BirthDateParts | null | undefined
  >(() =>
    hasShareParams
      ? validDateParts(
          parseInt(prefillYear!, 10),
          parseInt(prefillMonth!, 10),
          parseInt(prefillDay!, 10)
        ) ?? undefined
      : undefined
  );

  // A share link takes precedence over the visitor's own saved date.
  const storedDate = useMemo(
    () => (isHydrated && !hasShareParams ? dateFromStorage() : null),
    [isHydrated, hasShareParams]
  );

  // New Year rule: picked in this visit (or set by a share link), else the
  // visitor's remembered choice, else the default.
  const [chosenRule, setChosenRule] = useState<NewYearRule | null>(shareRule);
  const storedRule = useMemo(
    () => (isHydrated ? readStoredNewYearRule() : null),
    [isHydrated]
  );
  const newYearRule = chosenRule ?? storedRule ?? DEFAULT_NEW_YEAR_RULE;

  const birthDate = sessionDate === undefined ? storedDate : sessionDate;
  const result = useMemo(
    () =>
      birthDate
        ? computeCycleFromBirthDate(birthDate.year, birthDate.month, birthDate.day, newYearRule)
        : null,
    [birthDate, newYearRule]
  );
  // The "welcome back" widget replaces the form only for a restored saved date.
  const showWidget = sessionDate === undefined && storedDate !== null;

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
    setSessionDate({ year: r.birthYear, month: r.birthData.gregorianMonth, day: r.birthDay });
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
    setSessionDate(null);
    setPickedYear(null);
    setSelectionSource("timeline");
  }, []);

  // Switching the New Year rule recomputes the reading and is remembered.
  const handleNewYearRuleChange = useCallback((rule: NewYearRule) => {
    setChosenRule(rule);
    saveNewYearRule(rule);
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
    <main className="safe-gutter flex flex-1 flex-col items-center pt-9 [@media(max-height:700px)]:pt-5 sm:pt-16 pb-[max(4rem,calc(env(safe-area-inset-bottom)+2rem))]">
      {/* Entrance: the title surfaces out of the dark, then each block follows. */}
      <h1 className="kindle title-glow font-display text-[2.75rem] leading-tight sm:text-7xl tracking-[0.14em] text-ink text-center">
        Solini
      </h1>
      <p
        className="rise mt-2 sm:mt-4 font-display text-lg text-gold-deep text-center tracking-[0.12em]"
        style={{ "--rise-delay": "500ms" } as React.CSSProperties}
      >
        Khmer Numerology
      </p>
      <p
        className="rise mt-1 text-xs uppercase text-ink-light text-center tracking-[0.18em]"
        style={{ "--rise-delay": "620ms" } as React.CSSProperties}
      >
        Your cycle, lit year by year
      </p>

      <SectionDivider compact />

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
            {hasShareParams ? (
              <>
                <p className="mb-2 text-center font-display text-lg text-gold-deep tracking-[0.04em]">
                  Someone shared their reading with you
                </p>
                <p className="text-center text-ink-light text-sm tracking-[0.04em] leading-relaxed">
                  Their cycle is below. To see your own, enter your birth
                  date here.
                </p>
              </>
            ) : (
              <p className="text-center text-ink-light text-sm tracking-[0.04em] leading-relaxed">
                Enter your birth date to see a luck number for every year of
                your 12-year cycle, read from your birth month, zodiac animal
                and weekday.
              </p>
            )}

            <BirthDataForm
              onResult={handleResult}
              initialValues={initialValues}
              newYearRule={newYearRule}
            />
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
                activeYear={activeYear}
                selectedYear={selectedYear}
                onSelectYear={handleTimelineSelectYear}
              />
            </div>

            <NewYearSetting
              rule={newYearRule}
              year={result.birthYear}
              month={result.birthData.gregorianMonth}
              day={result.birthDay}
              onChange={handleNewYearRuleChange}
            />

            <ShareReading
              year={result.birthYear}
              month={result.birthData.gregorianMonth}
              day={result.birthDay}
              rule={newYearRule}
            />
          </>
        )}
      </ErrorBoundary>

      <p className="mt-16 max-w-[480px] text-center text-xs leading-relaxed text-ink-light">
        Solini follows a Khmer numerology tradition. A reading is a lantern
        for reflection, not a prediction or advice.
      </p>
    </main>
    </MotionConfig>
  );
}
