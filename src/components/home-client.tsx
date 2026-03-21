"use client";

/**
 * HomeClient — Client-side home page content
 *
 * Renders the birth date form and cycle result. Supports pre-fill via
 * URL search params (?day=24&month=7&year=1997) for share URL redirects
 * from /r/[date].
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SectionDivider } from "@/components/ui/section-divider";
import { BirthDataForm } from "@/components/birth-data-form";
import { CycleChart } from "@/components/cycle-chart";
import { ErrorBoundary } from "@/components/error-boundary";
import type { CycleResultWithYear } from "@/lib/numerology/derive";
import {
  computeCycleFromBirthDate,
  validateBirthDate,
} from "@/lib/numerology/derive";

export function HomeClient() {
  const [result, setResult] = useState<CycleResultWithYear | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Pre-fill initial values from URL search params (set by /r/[date] redirect)
  const prefillDay = searchParams.get("day");
  const prefillMonth = searchParams.get("month");
  const prefillYear = searchParams.get("year");

  const initialValues =
    prefillDay && prefillMonth && prefillYear
      ? {
          day: prefillDay,
          month: prefillMonth,
          year: prefillYear,
        }
      : undefined;

  // Auto-compute on pre-fill
  useEffect(() => {
    if (!prefillDay || !prefillMonth || !prefillYear) return;

    const day = parseInt(prefillDay, 10);
    const month = parseInt(prefillMonth, 10);
    const year = parseInt(prefillYear, 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return;

    const errors = validateBirthDate(year, month, day);
    if (errors.length > 0) return;

    const cycleResult = computeCycleFromBirthDate(year, month, day);
    setResult(cycleResult);
  }, [prefillDay, prefillMonth, prefillYear]);

  const handleResult = useCallback((r: CycleResultWithYear) => {
    setResult(r);
    // Scroll to result card after React renders
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:px-8">
      <h1 className="text-4xl font-light tracking-[0.08em] text-ink text-center">
        Khmer Numerology
      </h1>
      <p className="mt-4 text-lg text-ink-light italic text-center">
        Uncover the rhythm of your years
      </p>

      <SectionDivider />

      <ErrorBoundary>
        {/* Form card */}
        <div className="max-w-[480px] w-full rounded-sm border border-border bg-manuscript p-8 sm:p-12 shadow-[0_1px_3px_rgba(44,36,23,0.08)]">
          <h2 className="text-center text-[22px] font-medium tracking-[0.02em]">
            Discover Your Life Cycle
          </h2>
          <p className="mt-3 text-center text-ink-light text-sm tracking-[0.04em]">
            Enter your birth date to reveal your 12-year cycle
          </p>

          <BirthDataForm onResult={handleResult} initialValues={initialValues} />
        </div>

        {/* Result card — appears below form after submission */}
        {result && (
          <>
            <SectionDivider />
            <div
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
