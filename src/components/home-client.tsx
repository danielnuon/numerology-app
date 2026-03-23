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

import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SectionDivider } from "@/components/ui/section-divider";
import { BirthDataForm } from "@/components/birth-data-form";
import { CycleChart } from "@/components/cycle-chart";
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

/** ID for the chart section — used by the widget's "View full cycle" scroll target. */
const CHART_SECTION_ID = "cycle-chart-section";

export function HomeClient() {
  const [result, setResult] = useState<CycleResultWithYear | null>(null);
  const [showWidget, setShowWidget] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

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

    // Scroll to result card after React renders
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  // "Not you?" handler — clears localStorage, hides widget+chart, shows form (AC #6)
  const handleReset = useCallback(() => {
    clearStoredBirthDate();
    setResult(null);
    setShowWidget(false);
  }, []);

  // SSR default: show form. After hydration, widget may replace it if localStorage data exists.
  const showForm = !showWidget;

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:px-8">
      <h1 className="text-4xl font-light tracking-[0.08em] text-ink text-center">
        Solini
      </h1>
      <p className="mt-2 text-lg text-ink-light italic text-center">
        Khmer Numerology
      </p>
      <p className="mt-2 text-sm text-ink-light text-center tracking-[0.04em]">
        Discover Your Life Cycle
      </p>

      <SectionDivider />

      <ErrorBoundary>
        {/* Widget for returning visitors — shows after hydration if localStorage has data */}
        {showWidget && result && (
          <CurrentYearWidget
            cycle={result.cycle}
            birthYear={result.birthYear}
            onReset={handleReset}
            chartSectionId={CHART_SECTION_ID}
          />
        )}

        {/* Form card — shown for first-visit, after "Not you?", or when share URL params present */}
        {showForm && (
          <div className="max-w-[480px] w-full rounded-sm border border-border bg-manuscript p-8 sm:p-12 shadow-[0_1px_3px_rgba(44,36,23,0.08)]">
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
              className="w-full max-w-[900px] paper-texture rounded-sm border border-border bg-manuscript p-6 sm:p-10 shadow-[0_1px_3px_rgba(44,36,23,0.08)]"
            >
              <CycleChart
                cycle={result.cycle}
                totalScore={result.totalScore}
                birthYear={result.birthYear}
              />
            </div>
          </>
        )}
      </ErrorBoundary>
    </main>
  );
}
