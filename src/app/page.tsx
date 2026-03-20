"use client";

/**
 * Home page — Birth Data Form + Cycle Result
 *
 * Renders the birth date form. On valid submission, shows the cycle result
 * below the form card without a page reload.
 */

import { useState, useRef, useCallback } from "react";
import { SectionDivider } from "@/components/ui/section-divider";
import { BirthDataForm } from "@/components/birth-data-form";
import { CycleChart } from "@/components/cycle-chart";
import type { CycleResultWithYear } from "@/lib/numerology/derive";

export default function Home() {
  const [result, setResult] = useState<CycleResultWithYear | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

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

      {/* Form card */}
      <div className="max-w-[480px] w-full rounded-sm border border-border bg-manuscript p-8 sm:p-12 shadow-[0_1px_3px_rgba(44,36,23,0.08)]">
        <h2 className="text-center text-[22px] font-medium tracking-[0.02em]">
          Discover Your Life Cycle
        </h2>
        <p className="mt-3 text-center text-ink-light text-sm tracking-[0.04em]">
          Enter your birth date to reveal your 12-year cycle
        </p>

        <BirthDataForm onResult={handleResult} />
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
    </main>
  );
}
