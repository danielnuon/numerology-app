"use client";

/**
 * HomeClient — Client-side home page content
 *
 * Renders the birth date form and cycle result. Supports:
 * - Pre-fill via URL search params (?day=24&month=7&year=1997) for share URL
 *   redirects. The server page reads them and passes them in, so the page
 *   renders in full on the server and search engines see its content.
 * - Returning visitors: reads localStorage on mount and shows their reading
 * - Share URL precedence: a shared link shows that person's chart, not the
 *   visitor's own saved one
 * - "Change date" forgets the saved date and returns to the first-visit form
 *
 * The first visit asks one question, with the intro and the New Year choice
 * folded away. A reading opens on this year's card; on phones the 12-year
 * wheel and timeline wait behind "See all 12 years", and on tablet and
 * desktop they show at once.
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
import Link from "next/link";
import { MotionConfig } from "motion/react";
import { SectionDivider } from "@/components/ui/section-divider";
import { BirthDataForm } from "@/components/birth-data-form";
import { CycleChart } from "@/components/cycle-chart";
import { YearTimeline } from "@/components/year-timeline";
import { ThisYearCard } from "@/components/this-year-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { ShareReading } from "@/components/share-reading";
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

/** ID for the 12-year section that "See all 12 years" opens. */
const CYCLE_SECTION_ID = "cycle-chart-section";

/** A birth date as the summary line shows it, such as "Jul 24, 1960". */
function formatBirthDate(year: number, month: number, day: number): string {
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

/** The home page's query string values that HomeClient reads. */
export interface HomeSearchParams {
  day?: string;
  month?: string;
  year?: string;
  /** New Year rule of a shared reading: "khmer" or "chinese". */
  ny?: string;
}

interface Props {
  searchParams: HomeSearchParams;
}

export function HomeClient({ searchParams }: Props) {
  const isHydrated = useIsHydrated();

  // Pre-fill initial values from URL search params (set by /r/[date] redirect)
  const prefillDay = searchParams.day;
  const prefillMonth = searchParams.month;
  const prefillYear = searchParams.year;

  const hasShareParams = !!(prefillDay && prefillMonth && prefillYear);
  // A shared reading keeps the sharer's New Year rule; links without one are Khmer.
  const prefillRule = searchParams.ny;
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
  // The form shows until there is a reading, and stays above a shared
  // reading so the visitor can enter their own. Submitting folds it into the
  // one-line summary above the reading.
  const [formOpen, setFormOpen] = useState(hasShareParams);
  const showForm = !result || formOpen;

  // On phones the 12-year wheel and timeline wait behind "See all 12 years".
  const [cycleOpen, setCycleOpen] = useState(false);

  // One selected year shared by the chart and the timeline, so they always
  // agree. null means "the active year" until the user picks something.
  const [pickedYear, setPickedYear] = useState<number | null>(null);

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
    setFormOpen(false);
    setCycleOpen(false);

    // Scroll to result card after React renders. "auto" defers to the CSS
    // scroll-behavior, which is smooth unless the user prefers reduced motion.
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }, []);

  // "Change date" forgets the saved date and returns to the first-visit form.
  const handleReset = useCallback(() => {
    clearStoredBirthDate();
    setSessionDate(null);
    setPickedYear(null);
    setFormOpen(false);
  }, []);

  // Switching the New Year rule recomputes the reading and is remembered.
  const handleNewYearRuleChange = useCallback((rule: NewYearRule) => {
    setChosenRule(rule);
    saveNewYearRule(rule);
  }, []);

  // Selection changes run as transitions so <ViewTransition> can animate
  // the selection ring and the wheel's center between states.
  const handleTimelineSelectYear = useCallback((year: number) => {
    startTransition(() => setPickedYear(year));
  }, []);

  // After a quiet spell the wheel glides back to the current year.
  const handleReturnToCurrent = useCallback(() => {
    startTransition(() => setPickedYear(null));
  }, []);

  // Picking an orb stays within the 12-year cycle that is already selected,
  // so moving around the wheel never jumps the timeline to another decade.
  const handleChartSelectPillar = useCallback((columnIndex: number) => {
    if (!result) return;
    const cycleStart = selectedYear - getCycleIndex(result.birthYear, selectedYear);
    let year = cycleStart + columnIndex;
    if (year > currentYear + TIMELINE_YEARS_AHEAD) year -= 12;
    startTransition(() => setPickedYear(year));
  }, [currentYear, result, selectedYear]);

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
      {result && (
        <p
          className="rise mt-1 text-sm uppercase text-ink-light text-center tracking-[0.16em]"
          style={{ "--rise-delay": "620ms" } as React.CSSProperties}
        >
          Your cycle, lit year by year
        </p>
      )}

      <SectionDivider compact />

      <ErrorBoundary>
        {/* Form card: first visit, after "Change date", or above a shared reading */}
        {showForm && (
          <>
            <div
              className="rise glass max-w-[480px] w-full rounded-2xl p-6 sm:p-12"
              style={{ "--rise-delay": "760ms" } as React.CSSProperties}
            >
              {hasShareParams ? (
                <>
                  <p className="mb-2 text-center font-display text-xl text-gold-deep tracking-[0.04em]">
                    Someone shared their reading with you
                  </p>
                  <p className="text-center text-ink-light text-base leading-relaxed">
                    Their cycle is below. To see your own, enter your birth
                    date here.
                  </p>
                </>
              ) : (
                <h2 className="text-center font-display text-[1.75rem] leading-tight text-ink tracking-[0.03em] text-balance">
                  When were you born?
                </h2>
              )}

              <BirthDataForm
                onResult={handleResult}
                initialValues={initialValues}
                newYearRule={newYearRule}
                onNewYearRuleChange={handleNewYearRuleChange}
              />
            </div>

            {!hasShareParams && (
              <details className="group mt-5 max-w-[480px] w-full text-center">
                <summary className="pressable mx-auto inline-flex min-h-[44px] cursor-pointer list-none items-center px-2 text-base text-gold-deep underline underline-offset-4 decoration-gold/50 hover:decoration-gold-deep [&::-webkit-details-marker]:hidden">
                  What will I see?
                </summary>
                <p className="animate-settle-in mt-2 text-base leading-relaxed text-ink-light">
                  Enter your birth date to see a luck number for every year of
                  your 12-year cycle, read from your birth month, zodiac animal
                  and weekday.
                </p>
              </details>
            )}
          </>
        )}

        {result && (
          <>
            {showForm ? (
              <SectionDivider />
            ) : (
              // The visitor's own date, folded into one line once the form has done its job
              <p className="rise flex max-w-[480px] w-full flex-wrap items-center justify-center gap-x-2 rounded-2xl border border-border px-4 py-1 text-center text-base text-ink-light">
                <span>
                  <span className="text-ink">
                    {formatBirthDate(result.birthYear, result.birthData.gregorianMonth, result.birthDay)}
                  </span>
                  {` · Year of the ${result.birthData.zodiacAnimal} · Born on a ${WEEKDAY_NAMES[result.birthData.weekday - 1]}`}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="pressable inline-flex min-h-[44px] items-center px-1 text-gold-deep underline underline-offset-4 decoration-gold/50 hover:decoration-gold-deep"
                >
                  Change date
                </button>
              </p>
            )}

            <div
              ref={resultRef}
              className="mt-6 w-full max-w-[900px] xl:max-w-[1200px] scroll-mt-8 lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8"
            >
              <div className="mx-auto w-full max-w-[480px] lg:sticky lg:top-8">
                <ThisYearCard
                  cycle={result.cycle}
                  birthYear={result.birthYear}
                  birthMonth={result.birthData.gregorianMonth}
                  birthDay={result.birthDay}
                />

                <button
                  type="button"
                  aria-expanded={cycleOpen}
                  aria-controls={CYCLE_SECTION_ID}
                  onClick={() => setCycleOpen((open) => !open)}
                  className="pressable mt-4 w-full min-h-[52px] rounded-full border border-border text-base text-ink hover:border-gold-deep active:scale-[0.98] md:hidden"
                >
                  {cycleOpen ? "Hide the 12 years" : "See all 12 years"}
                </button>
              </div>

              {/* Hidden only on phones until opened; tablet and desktop show it at once */}
              <div
                id={CYCLE_SECTION_ID}
                className={`${cycleOpen ? "animate-settle-in" : "max-md:hidden"} mt-6 lg:mt-0 min-w-0`}
              >
                <div className="rise glass w-full rounded-2xl p-3 min-[360px]:p-4 sm:p-8 lg:p-10">
                  <CycleChart
                    cycle={result.cycle}
                    totalScore={result.totalScore}
                    birthYear={result.birthYear}
                    birthMonth={result.birthData.gregorianMonth}
                    birthDay={result.birthDay}
                    selectedYear={selectedYear}
                    onSelectPillar={handleChartSelectPillar}
                    onReturnToCurrent={handleReturnToCurrent}
                  />
                </div>

                {/* Year Timeline Explorer */}
                <div className="w-full mt-6 scroll-settle">
                  {/* Remounts when opened on a phone, so it centers this year
                      once it has a width (it measures nothing while hidden) */}
                  <YearTimeline
                    key={cycleOpen ? "open" : "folded"}
                    cycle={result.cycle}
                    birthYear={result.birthYear}
                    activeYear={activeYear}
                    selectedYear={selectedYear}
                    onSelectYear={handleTimelineSelectYear}
                  />
                </div>
              </div>
            </div>

            <ShareReading
              year={result.birthYear}
              month={result.birthData.gregorianMonth}
              day={result.birthDay}
              rule={newYearRule}
            />

            {/* Companion pages: this reading worked out, and what it means */}
            <nav
              aria-label="Understand this reading"
              className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-base"
            >
              <Link
                href={`/how-it-works?day=${result.birthDay}&month=${result.birthData.gregorianMonth}&year=${result.birthYear}&ny=${newYearRule}`}
                className="inline-flex min-h-[44px] items-center text-ink-light underline underline-offset-4 decoration-border hover:text-gold-deep"
              >
                How this cycle is made
              </Link>
              <Link
                href="/meaning"
                className="inline-flex min-h-[44px] items-center text-ink-light underline underline-offset-4 decoration-border hover:text-gold-deep"
              >
                What the numbers mean
              </Link>
            </nav>
          </>
        )}
      </ErrorBoundary>

      <p className="mt-16 max-w-[480px] text-center text-sm leading-relaxed text-ink-light">
        Solini follows a Khmer numerology tradition. A reading is a lantern
        for reflection, not a prediction or advice.{" "}
        <Link href="/about" className="underline underline-offset-4 decoration-border hover:text-gold-deep">
          About the tradition
        </Link>
      </p>
    </main>
    </MotionConfig>
  );
}
