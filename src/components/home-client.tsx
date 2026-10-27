"use client";

/**
 * HomeClient — Client-side home page content
 *
 * Renders the birth date form and cycle result. Supports:
 * - Pre-fill via URL search params (?day=24&month=7&year=1997) for share URL redirects
 * - Returning visitors: reads localStorage on mount, shows CurrentYearWidget + chart
 * - Share URL precedence: query params override localStorage (AC #9)
 * - "Not you?" resets to first-visit state (AC #6)
 */

import { useState, useRef, useCallback, useEffect, startTransition } from "react";
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

export function HomeClient() {
  const [result, setResult] = useState<CycleResultWithYear | null>(null);
  const [showWidget, setShowWidget] = useState(false);
  
  // One selected year shared by the chart and the timeline, so they always
  // agree. null means "the active year" until the user picks something.
  const [pickedYear, setPickedYear] = useState<number | null>(null);
  const [selectionSource, setSelectionSource] = useState<"chart" | "timeline">("timeline");
  
  const resultRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  
  const currentYear = new Date().getFullYear();
  const activeYear = result
    ? getActiveYear(currentYear, result.birthData.gregorianMonth, result.birthDay)
    : currentYear;
  const selectedYear = pickedYear ?? activeYear;

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

  // On mount: check localStorage (unless share URL params are present — AC #9)
  useEffect(() => {
    // Share URL takes precedence over localStorage
    if (hasShareParams) return;

    const stored = readStoredBirthDate();
    if (!stored) return;

    // Validate the stored date is still valid (not future, valid calendar date)
    const errors = validateBirthDate(stored.year, stored.month, stored.day);
    if (errors.length > 0) return;

    // Compute cycle from stored data and show widget + chart (AC #1)
    const cycleResult = computeCycleFromBirthDate(stored.year, stored.month, stored.day);
    setResult(cycleResult);
    setShowWidget(true);
  }, [hasShareParams]);

  // Auto-compute on pre-fill from share URL
  useEffect(() => {
    if (!hasShareParams) return;

    const day = parseInt(prefillDay!, 10);
    const month = parseInt(prefillMonth!, 10);
    const year = parseInt(prefillYear!, 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return;

    const errors = validateBirthDate(year, month, day);
    if (errors.length > 0) return;

    const cycleResult = computeCycleFromBirthDate(year, month, day);
    setResult(cycleResult);
  }, [hasShareParams, prefillDay, prefillMonth, prefillYear]);

  // Form submission: localStorage save happens inside BirthDataForm.handleSubmit
  const handleResult = useCallback((r: CycleResultWithYear) => {
    setResult(r);
    setShowWidget(false);
    setPickedYear(null);
    setSelectionSource("timeline");

    // Scroll to result card after React renders. "auto" defers to the CSS
    // scroll-behavior, which is smooth unless the user prefers reduced motion.
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }, []);

  // "Not you?" handler — clears localStorage, hides widget+chart, shows form (AC #6)
  const handleReset = useCallback(() => {
    clearStoredBirthDate();
    setResult(null);
    setShowWidget(false);
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

  // SSR default: show form. After hydration, widget may replace it if localStorage data exists.
  const showForm = !showWidget;

  return (
    <MotionConfig reducedMotion="user">
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:px-8">
      <h1 className="text-5xl sm:text-6xl font-light tracking-[0.08em] text-ink text-center">
        Solini
      </h1>
      <p className="mt-3 text-lg text-ink-light italic text-center">
        Khmer Numerology
      </p>
      <p className="mt-1 text-sm text-ink-light font-light text-center tracking-[0.08em]">
        Discover Your Life Cycle
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
          <div className="max-w-[480px] w-full rounded-sm border border-border bg-manuscript p-6 sm:p-12 shadow-[var(--shadow-card)]">
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
              className="w-full max-w-[900px] xl:max-w-[1200px] paper-texture rounded-sm border border-border bg-manuscript p-3 min-[360px]:p-4 sm:p-8 lg:p-10 shadow-[var(--shadow-card)] scroll-mt-8"
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
