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
 * - "Forget my date", under the form that "Someone else?" opens, forgets a
 *   restored saved date and returns to the first-visit form
 * - The New Year rule (Khmer or Chinese) that turns the animal year: from a
 *   share link (?ny=), else the visitor's remembered choice, else Khmer.
 *   Changing it recomputes the reading in place.
 * - A partner comparison under the reading. A shared comparison link
 *   (/r/A+B) arrives with the partner's date as ?pday=&pmonth=&pyear=&pny=.
 *
 * The first visit asks one question, with one line above it saying what
 * the reading gives and the New Year choice folded away. The reading opens
 * on this year's reading. A reading from someone else's share link reads
 * "Their", and its main button is "See your own cycle". Below lg a
 * "Year / Cycle" switch swaps it for the 12-year wheel and
 * timeline in the same place; from lg the two sit side by side.
 */

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  startTransition,
  addTransitionType,
  ViewTransition,
} from "react";
import Link from "next/link";
import { MotionConfig } from "motion/react";
import { MorePages } from "@/components/ui/page-parts";
import { Reveal, useLastPresent } from "@/components/ui/reveal";
import { BirthDataForm } from "@/components/birth-data-form";
import { CycleChart } from "@/components/cycle-chart";
import { YearTimeline } from "@/components/year-timeline";
import { ThisYearCard } from "@/components/this-year-card";
import { BirthReading } from "@/components/birth-reading";
import {
  ReadingViewTabs,
  READING_VIEW_PANEL_IDS,
  type ReadingView,
} from "@/components/reading-view-tabs";
import { ErrorBoundary } from "@/components/error-boundary";
import { ShareReading } from "@/components/share-reading";
import { UpdateNotice } from "@/components/update-notice";
import { PartnerComparison } from "@/components/partner-comparison";
import type { DecodedShare } from "@/lib/numerology/url-encoding";
import { SITE_TAGLINE } from "@/lib/site-copy";
import { trackEvent } from "@/lib/track";
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
  readUpdateNoticeSeen,
  markUpdateNoticeSeen,
  type StoredBirthDate,
} from "@/lib/storage";
import { getActiveYear, getCycleIndex, getYearNumber } from "@/lib/numerology/year-lookup";
import { interpretAreaYear } from "@/lib/numerology/interpretation";
import { TIMELINE_YEARS_AHEAD } from "@/components/year-timeline";
import { SoliniMark } from "@/components/ui/solini-mark";
import type { PagePoint } from "@/lib/motion";

/** ID for the reading card, the place the form blooms into. */
const CHART_SECTION_ID = "cycle-chart-section";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// The quiet underlined text link used for the card's way back and forth
const QUIET_LINK =
  "pressable flex min-h-[44px] items-center px-1 text-ink-light underline underline-offset-4 decoration-border hover:text-ink active:opacity-70";

/**
 * A block below the reading card. When something above it changes size it
 * glides to its new place instead of jumping, and as the reading blooms in
 * or folds away it rises in or fades out with it (React assigns the
 * transition name).
 */
function Follows({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="rise-in" exit="fade-out">
      {children}
    </ViewTransition>
  );
}

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
  /** Partner's birth date and rule, from a shared comparison link. */
  pday?: string;
  pmonth?: string;
  pyear?: string;
  pny?: string;
}

/** The partner from a shared comparison link, or null if absent or invalid. */
function partnerFromSearchParams(params: HomeSearchParams): DecodedShare | null {
  if (!params.pday || !params.pmonth || !params.pyear) return null;
  const date = validDateParts(
    parseInt(params.pyear, 10),
    parseInt(params.pmonth, 10),
    parseInt(params.pday, 10)
  );
  if (!date) return null;
  return { ...date, rule: isNewYearRule(params.pny) ? params.pny : DEFAULT_NEW_YEAR_RULE };
}

interface Props {
  searchParams: HomeSearchParams;
}

/** The active year's reading in a line, which leads the share message. */
function thisYearHeadline(result: CycleResultWithYear, activeYear: number) {
  const interpretation = interpretAreaYear(
    getCycleIndex(result.birthYear, activeYear) + 1,
    getYearNumber(result.cycle, result.birthYear, activeYear)
  );
  return { year: activeYear, label: interpretation.label, area: interpretation.area };
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
  // submission, or null after "Forget my date". undefined means nothing has been
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
  // A returning visitor's restored date, which "Forget my date" can forget.
  const isRestoredDate = sessionDate === undefined && storedDate !== null;

  // The one-time note about the 2026 changes, for readings restored from a
  // date saved before them. Read only after hydration, like all storage.
  const noticeSeenBefore = useMemo(
    () => (isHydrated ? readUpdateNoticeSeen() : true),
    [isHydrated]
  );
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  // The partner being compared with, if any. Never saved to the browser.
  const [partner, setPartner] = useState<DecodedShare | null>(() =>
    hasShareParams ? partnerFromSearchParams(searchParams) : null
  );

  // Below lg the card shows one view at a time: this year, or all 12 years.
  const [readingView, setReadingView] = useState<ReadingView>("year");

  // One selected year shared by the chart and the timeline, so they always
  // agree. null means "the active year" until the user picks something.
  const [pickedYear, setPickedYear] = useState<number | null>(null);


  const currentYear = new Date().getFullYear();
  const activeYear = result
    ? getActiveYear(currentYear, result.birthData.gregorianMonth, result.birthDay)
    : currentYear;
  const selectedYear = pickedYear ?? activeYear;

  // The form card and the reading card share one place on the page: a
  // submission blooms the form into the reading, and "Read for someone
  // else" folds it back. formOpen is true while the form is showing over an
  // existing reading.
  const [formOpen, setFormOpen] = useState(false);
  // True once the reading has arrived by a bloom, so its own page-load
  // entrance doesn't play a second time.
  const [bloomed, setBloomed] = useState(false);
  const readingCardRef = useRef<HTMLDivElement>(null);
  // Where the button that asked for a reading was, so the woven flame's
  // spark rises from it (SoliniMark's manifestFrom)
  const submitterRef = useRef<PagePoint | null>(null);
  const [manifestFrom, setManifestFrom] = useState<PagePoint | null>(null);
  const handleSubmitCapture = useCallback((event: React.FormEvent) => {
    const button = (event.nativeEvent as SubmitEvent).submitter;
    const box = button?.getBoundingClientRect();
    submitterRef.current = box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : null;
  }, []);

  // Form submission: localStorage save happens inside BirthDataForm.handleSubmit
  const handleResult = useCallback((r: CycleResultWithYear) => {
    trackEvent("Reading revealed", hasShareParams);
    startTransition(() => {
      addTransitionType("bloom-open");
      setSessionDate({ year: r.birthYear, month: r.birthData.gregorianMonth, day: r.birthDay });
      setManifestFrom(submitterRef.current);
      setPickedYear(null);
      setFormOpen(false);
      setReadingView("year");
      setBloomed(true);
    });
  }, [hasShareParams]);

  // Switching views crossfades in place. If the visitor had scrolled down
  // the wheel, the new view starts from the card's top instead.
  const handleReadingViewChange = useCallback((view: ReadingView) => {
    startTransition(() => {
      addTransitionType("reading-view");
      setReadingView(view);
    });
    const card = readingCardRef.current;
    if (card && card.getBoundingClientRect().top < 0) card.scrollIntoView({ block: "start" });
  }, []);

  const handleReadAgain = useCallback(() => {
    startTransition(() => {
      addTransitionType("bloom-close");
      setFormOpen(true);
    });
  }, []);

  const handleBackToReading = useCallback(() => {
    startTransition(() => {
      addTransitionType("bloom-open");
      setFormOpen(false);
    });
  }, []);

  // "Forget my date" forgets the saved date and returns to the first-visit
  // form, which crossfades in the same card.
  const handleReset = useCallback(() => {
    clearStoredBirthDate();
    startTransition(() => {
      addTransitionType("form-reset");
      setSessionDate(null);
      setManifestFrom(null);
      setPickedYear(null);
      setFormOpen(false);
    });
  }, []);

  // Focus moves to the reading so it isn't lost with the removed button.
  const handleDismissNotice = useCallback(() => {
    markUpdateNoticeSeen();
    setNoticeDismissed(true);
    readingCardRef.current?.focus({ preventScroll: true });
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

  // The reading takes the form's place whenever there is one, unless the
  // visitor asked for the form again.
  const showReading = !!result && !formOpen;
  const showForm = !showReading;
  const showNotice = showReading && isRestoredDate && !noticeSeenBefore && !noticeDismissed;
  // Kept while the note folds away after "Got it"
  const noticeDate = useLastPresent(showNotice ? storedDate : null);
  // A reading opened from someone else's share link, until the visitor reads their own
  const isShared = hasShareParams && !bloomed;

  // The reading opens where the form was, so the page doesn't jump. If the
  // visitor had scrolled past the top of the form, bring the card's top back
  // into view; focus moves to the card for keyboard and screen reader users.
  useEffect(() => {
    if (!bloomed) return;
    const card = readingCardRef.current;
    if (showReading && card) {
      if (card.getBoundingClientRect().top < 0) card.scrollIntoView({ block: "start" });
      card.focus({ preventScroll: true });
    } else if (!showReading) {
      document.getElementById("birth-day")?.focus({ preventScroll: true });
    }
  }, [bloomed, showReading]);

  return (
    <MotionConfig reducedMotion="user">
    <main className="safe-gutter flex flex-1 flex-col items-center pt-9 [@media(max-height:700px)]:pt-5 sm:pt-16 pb-[max(4rem,calc(env(safe-area-inset-bottom)+2rem))]">
      {/* Entrance: the woven flame weaves itself in as the title surfaces out
          of the dark, then each block follows. With a reading, the flame
          lights the visitor's year now. */}
      {/* The signature: the woven flame and the name side by side, a gold
          hairline between them, and the brand line below between hairlines
          (which phones have no room for). Entrance: the flame weaves itself
          in as the name kindles, then the rest rises in turn. */}
      <div className="mt-7 sm:mt-0 [@media(max-height:700px)]:mt-6 flex items-center gap-3 sm:gap-5">
        <SoliniMark
          woven
          reactive
          year={result ? getCycleIndex(result.birthYear, activeYear) : 0}
          manifestFrom={manifestFrom}
          className="h-14 w-14 sm:h-24 sm:w-24 [@media(max-height:700px)]:h-11 [@media(max-height:700px)]:w-11" />
        <span
          aria-hidden="true"
          className="rise h-14 w-px bg-gradient-to-b from-transparent via-gold/60 to-transparent sm:h-20"
          style={{ "--rise-delay": "400ms" } as React.CSSProperties}
        />
        <div className="flex flex-col items-start">
          <h1 data-glow="Solini" className="kindle title-glow font-display text-[2.5rem] leading-none sm:text-7xl tracking-[0.12em] text-ink">
            Solini
          </h1>
          <p
            className="rise mt-1.5 sm:mt-2 pl-[0.12em] text-sm uppercase text-gold-deep tracking-[0.18em]"
            style={{ "--rise-delay": "500ms" } as React.CSSProperties}
          >
            Khmer Numerology
          </p>
        </div>
      </div>
      <div
        className="rise mt-5 mb-8 sm:mt-8 sm:mb-14 [@media(max-height:700px)]:mt-3 [@media(max-height:700px)]:mb-5 flex w-full max-w-[560px] items-center sm:gap-4"
        style={{ "--rise-delay": "650ms" } as React.CSSProperties}
      >
        <span aria-hidden="true" className="hidden h-px flex-1 bg-gradient-to-r from-transparent to-border sm:block" />
        <p className="flex-1 sm:flex-none font-script italic text-[1.25rem] sm:text-[1.5rem] leading-snug text-ink-light text-center text-balance">
          {SITE_TAGLINE}
        </p>
        <span aria-hidden="true" className="hidden h-px flex-1 bg-gradient-to-l from-transparent to-border sm:block" />
      </div>

      <ErrorBoundary>
        {/* Form card: first visit, after "Forget my date", or "Read for someone else" */}
        {showForm && (
          <ViewTransition
            name="reading-card"
            share="reading-bloom"
            update={{ "form-reset": "reading-bloom", default: "none" }}
            default="none"
          >
            <div
              className={`${bloomed ? "" : "rise "}glass relative max-w-[480px] w-full rounded-2xl p-6 sm:p-12`}
              style={{ "--rise-delay": "760ms" } as React.CSSProperties}
            >
              {formOpen ? (
                <p className="text-center text-ink-light text-base leading-relaxed">
                  {isShared
                    ? "Enter your birth date to see your own "
                    : "Enter another birth date to read that person's "}
                  <span className="whitespace-nowrap">12-year</span> cycle.
                </p>
              ) : (
                <>
                  <h2 className="text-center font-display text-[1.75rem] leading-tight text-ink tracking-[0.03em] text-balance">
                    When were you born?
                  </h2>
                  {/* What the visitor gets, said before the form asks for anything */}
                  <p className="mt-2 text-center text-base leading-relaxed text-ink-light text-balance">
                    {/* Kept whole so the line never breaks after "12-" */}
                    See a luck number for every year of your{" "}
                    <span className="whitespace-nowrap">12-year</span> cycle,
                    from Khmer numerology.
                  </p>
                </>
              )}

              <div className="contents" onSubmitCapture={handleSubmitCapture}>
                <BirthDataForm
                  key={formOpen ? "another" : "first"}
                  onResult={handleResult}
                  initialValues={formOpen ? undefined : initialValues}
                  newYearRule={newYearRule}
                  onNewYearRuleChange={handleNewYearRuleChange}
                />
              </div>

              {formOpen && result && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4">
                  <button type="button" onClick={handleBackToReading} className={`${QUIET_LINK} text-base`}>
                    Back to the reading
                  </button>
                  {/* A restored date can be forgotten here, without entering a new one */}
                  {isRestoredDate && (
                    <button type="button" onClick={handleReset} className={`${QUIET_LINK} text-base`}>
                      Forget my date
                    </button>
                  )}
                </div>
              )}
            </div>
          </ViewTransition>
        )}

        {/* Present from the server render, so the note is announced when it appears */}
        <div aria-live="polite" className="w-full">
          {/* Rises in with the reading card on load, then folds away on "Got it" */}
          <Reveal open={showNotice}>
            {noticeDate && (
              <div className="rise flex justify-center" style={{ "--rise-delay": "760ms" } as React.CSSProperties}>
                <UpdateNotice
                  birthYear={noticeDate.year}
                  birthMonth={noticeDate.month}
                  birthDay={noticeDate.day}
                  hasChosenRule={storedRule !== null}
                  onDismiss={handleDismissNotice}
                />
              </div>
            )}
          </Reveal>
        </div>

        {/* Result card — cycle chart (rendered from localStorage data OR fresh submission) */}
        {showReading && result && (
          <>
            <ViewTransition name="reading-card" share="reading-bloom" default="none">
            <div
              id={CHART_SECTION_ID}
              ref={readingCardRef}
              tabIndex={-1}
              aria-labelledby="reading-summary"
              className={`${bloomed ? "" : "rise "}glass relative w-full max-w-[900px] xl:max-w-[1200px] rounded-2xl p-3 min-[360px]:p-4 sm:p-8 lg:p-10 scroll-mt-8 focus:outline-none`}
              style={{ "--rise-delay": "760ms" } as React.CSSProperties}
            >
              {/* A soft light passes once as the reading blooms in */}
              {bloomed && <div aria-hidden="true" className="reading-bloom-glow" />}

              {/* Whose reading this is, and the way back to the form */}
              <div className="mx-auto mb-2 flex max-w-[440px] lg:max-w-none items-start justify-between gap-x-3 px-1">
                <div id="reading-summary" className="min-w-0">
                  {isShared && (
                    <p className="text-sm uppercase tracking-[0.12em] text-gold-deep">
                      A reading shared with you
                    </p>
                  )}
                  <p className="font-display text-lg tracking-[0.03em] text-ink">
                    {MONTH_NAMES[result.birthData.gregorianMonth - 1]} {result.birthDay}, {result.birthYear}
                  </p>
                  <p className="text-sm text-ink-light">
                    Year of the {result.birthData.zodiacAnimal} · Born on a{" "}
                    {WEEKDAY_NAMES[result.birthData.weekday - 1]}
                  </p>
                </div>
                {/* One quiet text link on the date's line, styled like "Back to the reading" */}
                <button
                  type="button"
                  onClick={handleReadAgain}
                  aria-label={isShared ? "Read your own" : "Read for someone else"}
                  className={`-mt-2 shrink-0 ${QUIET_LINK} text-sm`}
                >
                  {isShared ? "Read your own" : "Someone else?"}
                </button>
              </div>

              <ReadingViewTabs view={readingView} onChange={handleReadingViewChange} />

              {/* One view at a time below lg, crossfading in place; side by side from lg */}
              <ViewTransition name="reading-view" update={{ "reading-view": "panel-swap", default: "none" }} default="none">
              <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
                <div
                  id={READING_VIEW_PANEL_IDS.year}
                  role="tabpanel"
                  aria-labelledby="reading-view-tab-year"
                  className={`${readingView === "year" ? "" : "max-lg:hidden "}mx-auto w-full max-w-[440px]`}
                >
                  <ThisYearCard
                    cycle={result.cycle}
                    birthYear={result.birthYear}
                    birthMonth={result.birthData.gregorianMonth}
                    birthDay={result.birthDay}
                    weekday={result.birthData.weekday}
                    isShared={isShared}
                  />
                  <BirthReading weekday={result.birthData.weekday} animal={result.birthData.zodiacAnimal} />
                </div>

                <div
                  id={READING_VIEW_PANEL_IDS.cycle}
                  role="tabpanel"
                  aria-labelledby="reading-view-tab-cycle"
                  className={`${readingView === "cycle" ? "" : "max-lg:hidden "}min-w-0`}
                >
                  <CycleChart
                    cycle={result.cycle}
                    totalScore={result.totalScore}
                    birthYear={result.birthYear}
                    birthMonth={result.birthData.gregorianMonth}
                    birthDay={result.birthDay}
                    weekday={result.birthData.weekday}
                    selectedYear={selectedYear}
                    onSelectPillar={handleChartSelectPillar}
                    onReturnToCurrent={handleReturnToCurrent}
                  />
                </div>
              </div>
              </ViewTransition>
            </div>
            </ViewTransition>

            {/* Year Timeline Explorer, part of the 12-year view below lg */}
            <Follows>
            <div
              className={`${readingView === "cycle" ? "" : "max-lg:hidden "}w-full max-w-[900px] xl:max-w-[1200px] mt-6 scroll-settle`}
            >
              {/* Remounts on each switch, so it centers this year once it
                  has a width (it measures nothing while hidden) */}
              <YearTimeline
                key={readingView}
                cycle={result.cycle}
                birthYear={result.birthYear}
                activeYear={activeYear}
                selectedYear={selectedYear}
                onSelectYear={handleTimelineSelectYear}
              />
            </div>
            </Follows>


            {/* On a shared reading, the next step is the visitor's own */}
            {isShared && (
              <Follows>
              <div className="mt-8 flex w-full max-w-[480px] flex-col items-center text-center">
                <button
                  type="button"
                  onClick={handleReadAgain}
                  className={[
                    // The one filled shape on a shared reading, like the form's submit button
                    "w-full max-w-[360px] rounded-full bg-gold-deep text-parchment",
                    "py-3 px-6 min-h-[56px]",
                    "text-lg font-semibold tracking-[0.02em]",
                    "breathe-glow hover:bg-gold-light",
                    "pressable active:scale-[0.97]",
                  ].join(" ")}
                >
                  See your own cycle
                </button>
                <p className="mt-3 text-sm text-ink-light">
                  Free, no sign-up. It takes a few seconds.
                </p>
              </div>
              </Follows>
            )}

            <PartnerComparison
              isShared={isShared}
              reading={result}
              readingRule={newYearRule}
              activeYear={activeYear}
              partner={partner}
              onPartnerChange={setPartner}
            />

            <Follows>
            <ShareReading
              isShared={isShared}
              headline={thisYearHeadline(result, activeYear)}
              year={result.birthYear}
              month={result.birthData.gregorianMonth}
              day={result.birthDay}
              rule={newYearRule}
            />
            </Follows>

            {/* Companion pages: this reading worked out, and what it means */}
            <Follows>
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
            </Follows>
          </>
        )}
      </ErrorBoundary>

      <Follows>
        <p className="mt-16 max-w-[480px] text-center text-sm leading-relaxed text-ink-light">
          Solini follows a Khmer numerology tradition. A reading is a lantern
          for reflection, not a prediction or advice.
        </p>
      </Follows>
      <Follows>
        <MorePages current="/" />
      </Follows>
    </main>
    </MotionConfig>
  );
}
