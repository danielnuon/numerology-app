"use client";

/**
 * BirthDataForm
 *
 * Collects day, month, and year inputs from the user, auto-derives the
 * weekday and Chinese zodiac animal when all three fields are complete,
 * validates the date on submission, and emits the cycle result via an
 * `onResult` callback.
 */

import { useState, useMemo, useEffect } from "react";
import {
  deriveBirthData,
  validateBirthDate,
  computeCycleFromBirthDate,
  type CycleResultWithYear,
  BIRTH_YEAR_MIN,
  BIRTH_YEAR_MAX,
} from "@/lib/numerology/derive";

const WEEKDAY_NAMES = [
  "", // 1-indexed padding
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface Props {
  /** Called with the computed cycle result after successful form submission. */
  onResult: (result: CycleResultWithYear) => void;
  /** Optional initial values for pre-filling the form (e.g., from share URL). */
  initialValues?: { day: string; month: string; year: string };
}

interface FieldErrors {
  day?: string;
  month?: string;
  year?: string;
  date?: string;
}

export function BirthDataForm({ onResult, initialValues }: Props) {
  const [day, setDay] = useState(initialValues?.day ?? "");
  const [month, setMonth] = useState(initialValues?.month ?? "");
  const [year, setYear] = useState(initialValues?.year ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Parse current field values as numbers (NaN if empty/invalid)
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  // Auto-derive zodiac and weekday once all three fields look valid
  const derived = useMemo(() => {
    if (
      !Number.isInteger(dayNum) ||
      !Number.isInteger(monthNum) ||
      !Number.isInteger(yearNum) ||
      dayNum < 1 || dayNum > 31 ||
      monthNum < 1 || monthNum > 12 ||
      yearNum < BIRTH_YEAR_MIN || yearNum > BIRTH_YEAR_MAX
    ) {
      return null;
    }

    // Quick calendar check before deriving
    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (
      date.getFullYear() !== yearNum ||
      date.getMonth() !== monthNum - 1 ||
      date.getDate() !== dayNum
    ) {
      return null;
    }

    try {
      return deriveBirthData(yearNum, monthNum, dayNum);
    } catch {
      return null;
    }
  }, [dayNum, monthNum, yearNum]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    const validationErrors = validateBirthDate(yearNum, monthNum, dayNum);
    if (validationErrors.length > 0) {
      const mapped: FieldErrors = {};
      for (const err of validationErrors) {
        mapped[err.field] = err.message;
      }
      setErrors(mapped);
      return;
    }

    setErrors({});
    const result = computeCycleFromBirthDate(yearNum, monthNum, dayNum);
    onResult(result);
  }

  // Re-validate on change if user has already attempted submission
  function revalidate(
    newDay: string,
    newMonth: string,
    newYear: string
  ) {
    if (!submitted) return;
    const d = parseInt(newDay, 10);
    const m = parseInt(newMonth, 10);
    const y = parseInt(newYear, 10);
    const errs = validateBirthDate(y, m, d);
    const mapped: FieldErrors = {};
    for (const err of errs) {
      mapped[err.field] = err.message;
    }
    setErrors(mapped);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Birth date form"
    >
      {/* Date inputs */}
      <div className="flex gap-6 mt-8">
        {/* Day */}
        <div className="flex flex-col flex-1 min-w-0">
          <label
            htmlFor="birth-day"
            className="text-xs uppercase tracking-[0.08em] text-ink-faint mb-2"
          >
            Day
          </label>
          <input
            id="birth-day"
            type="number"
            inputMode="numeric"
            min={1}
            max={31}
            placeholder="DD"
            value={day}
            onChange={(e) => {
              setDay(e.target.value);
              revalidate(e.target.value, month, year);
            }}
            aria-invalid={!!errors.day}
            aria-describedby={errors.day ? "error-day" : undefined}
            className={[
              "bg-transparent border-0 border-b pb-2 outline-none w-full",
              "text-ink text-lg font-serif placeholder:text-ink-faint",
              "focus:border-gold transition-colors min-h-[44px]",
              errors.day
                ? "border-[#A0522D]"
                : "border-border",
            ].join(" ")}
          />
          {errors.day && (
            <p id="error-day" role="alert" className="mt-1 text-xs text-[#A0522D]">
              {errors.day}
            </p>
          )}
        </div>

        {/* Month */}
        <div className="flex flex-col flex-1 min-w-0">
          <label
            htmlFor="birth-month"
            className="text-xs uppercase tracking-[0.08em] text-ink-faint mb-2"
          >
            Month
          </label>
          <input
            id="birth-month"
            type="number"
            inputMode="numeric"
            min={1}
            max={12}
            placeholder="MM"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              revalidate(day, e.target.value, year);
            }}
            aria-invalid={!!errors.month}
            aria-describedby={errors.month ? "error-month" : undefined}
            className={[
              "bg-transparent border-0 border-b pb-2 outline-none w-full",
              "text-ink text-lg font-serif placeholder:text-ink-faint",
              "focus:border-gold transition-colors min-h-[44px]",
              errors.month
                ? "border-[#A0522D]"
                : "border-border",
            ].join(" ")}
          />
          {errors.month && (
            <p id="error-month" role="alert" className="mt-1 text-xs text-[#A0522D]">
              {errors.month}
            </p>
          )}
        </div>

        {/* Year */}
        <div className="flex flex-col flex-[2] min-w-0">
          <label
            htmlFor="birth-year"
            className="text-xs uppercase tracking-[0.08em] text-ink-faint mb-2"
          >
            Year
          </label>
          <input
            id="birth-year"
            type="number"
            inputMode="numeric"
            min={BIRTH_YEAR_MIN}
            max={BIRTH_YEAR_MAX}
            placeholder="YYYY"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              revalidate(day, month, e.target.value);
            }}
            aria-invalid={!!errors.year}
            aria-describedby={errors.year ? "error-year" : undefined}
            className={[
              "bg-transparent border-0 border-b pb-2 outline-none w-full",
              "text-ink text-lg font-serif placeholder:text-ink-faint",
              "focus:border-gold transition-colors min-h-[44px]",
              errors.year
                ? "border-[#A0522D]"
                : "border-border",
            ].join(" ")}
          />
          {errors.year && (
            <p id="error-year" role="alert" className="mt-1 text-xs text-[#A0522D]">
              {errors.year}
            </p>
          )}
        </div>
      </div>

      {/* General date error (e.g. future date, invalid calendar date) */}
      {errors.date && (
        <p role="alert" className="mt-2 text-xs text-[#A0522D]">
          {errors.date}
        </p>
      )}

      {/* Auto-derived display */}
      {derived && (
        <div
          aria-live="polite"
          className={[
            "mt-6 flex flex-wrap gap-6",
            prefersReducedMotion ? "" : "animate-[fadeIn_0.3s_ease-in]",
          ].join(" ")}
          style={prefersReducedMotion ? undefined : { animation: "fadeIn 0.3s ease-in" }}
        >
          {!prefersReducedMotion && <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>}
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.08em] text-ink-faint">
              Zodiac
            </span>
            <span className="text-ink mt-1">{derived.zodiacAnimal}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.08em] text-ink-faint">
              Day of week
            </span>
            <span className="text-ink mt-1">
              {WEEKDAY_NAMES[derived.weekday]}
            </span>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="mt-10">
        <button
          type="submit"
          className={[
            "w-full border border-ink text-ink",
            "py-3 px-6 min-h-[44px]",
            "text-sm uppercase tracking-[0.08em]",
            "bg-transparent hover:bg-ink hover:text-manuscript",
            "transition-colors duration-200",
          ].join(" ")}
        >
          Reveal My Cycle
        </button>
      </div>
    </form>
  );
}
