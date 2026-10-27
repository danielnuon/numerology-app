"use client";

/**
 * BirthDataForm
 *
 * Collects day, month, and year inputs from the user, auto-derives the
 * weekday and Chinese zodiac animal when all three fields are complete,
 * validates the date on submission, and emits the cycle result via an
 * `onResult` callback.
 */

import { useState, useMemo } from "react";
import {
  deriveBirthData,
  validateBirthDate,
  computeCycleFromBirthDate,
  type CycleResultWithYear,
} from "@/lib/numerology/derive";
import { isRealCalendarDate, isSupportedYear } from "@/lib/numerology/calendar";
import { saveBirthDate } from "@/lib/storage";

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

/** Keeps only digits, so letters and signs never reach the field. */
function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function BirthDataForm({ onResult, initialValues }: Props) {
  const [day, setDay] = useState(initialValues?.day ?? "");
  const [month, setMonth] = useState(initialValues?.month ?? "");
  const [year, setYear] = useState(initialValues?.year ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Parse current field values as numbers (NaN if empty/invalid)
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  // Preview the zodiac and weekday as soon as the three fields form a real
  // date, before submission. Future dates still preview; they are rejected
  // on submit with a message.
  const derived = useMemo(() => {
    const partsInRange =
      isSupportedYear(yearNum) &&
      Number.isInteger(monthNum) && monthNum >= 1 && monthNum <= 12 &&
      Number.isInteger(dayNum) && dayNum >= 1 && dayNum <= 31;
    if (!partsInRange || !isRealCalendarDate(yearNum, monthNum, dayNum)) {
      return null;
    }
    return deriveBirthData(yearNum, monthNum, dayNum);
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
    saveBirthDate(dayNum, monthNum, yearNum);
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
      <div className="flex gap-4 sm:gap-6 mt-8">
        {/* Day */}
        <div className="flex flex-col flex-1 min-w-0">
          <label
            htmlFor="birth-day"
            className="text-xs uppercase tracking-[0.08em] text-ink-light mb-2"
          >
            Day
          </label>
          <input
            id="birth-day"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            maxLength={2}
            placeholder="DD"
            value={day}
            onChange={(e) => {
              const digits = digitsOnly(e.target.value);
              setDay(digits);
              revalidate(digits, month, year);
            }}
            aria-invalid={!!errors.day}
            aria-describedby={errors.day ? "error-day" : undefined}
            className={[
              "bg-transparent border-0 border-b pb-2 outline-none w-full",
              "text-ink text-xl font-display tracking-[0.06em] placeholder:text-ink-faint",
              "pressable focus:border-gold-deep focus:shadow-[0_1px_0_0_var(--color-gold-deep)] focus-visible:outline-none min-h-[44px]",
              errors.day
                ? "border-tier-weak"
                : "border-border",
            ].join(" ")}
          />
          {errors.day && (
            <p id="error-day" role="alert" className="mt-1 text-xs text-tier-weak">
              {errors.day}
            </p>
          )}
        </div>

        {/* Month */}
        <div className="flex flex-col flex-1 min-w-0">
          <label
            htmlFor="birth-month"
            className="text-xs uppercase tracking-[0.08em] text-ink-light mb-2"
          >
            Month
          </label>
          <input
            id="birth-month"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            maxLength={2}
            placeholder="MM"
            value={month}
            onChange={(e) => {
              const digits = digitsOnly(e.target.value);
              setMonth(digits);
              revalidate(day, digits, year);
            }}
            aria-invalid={!!errors.month}
            aria-describedby={errors.month ? "error-month" : undefined}
            className={[
              "bg-transparent border-0 border-b pb-2 outline-none w-full",
              "text-ink text-xl font-display tracking-[0.06em] placeholder:text-ink-faint",
              "pressable focus:border-gold-deep focus:shadow-[0_1px_0_0_var(--color-gold-deep)] focus-visible:outline-none min-h-[44px]",
              errors.month
                ? "border-tier-weak"
                : "border-border",
            ].join(" ")}
          />
          {errors.month && (
            <p id="error-month" role="alert" className="mt-1 text-xs text-tier-weak">
              {errors.month}
            </p>
          )}
        </div>

        {/* Year */}
        <div className="flex flex-col flex-[1.25] sm:flex-[2] min-w-0">
          <label
            htmlFor="birth-year"
            className="text-xs uppercase tracking-[0.08em] text-ink-light mb-2"
          >
            Year
          </label>
          <input
            id="birth-year"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            maxLength={4}
            placeholder="YYYY"
            value={year}
            onChange={(e) => {
              const digits = digitsOnly(e.target.value);
              setYear(digits);
              revalidate(day, month, digits);
            }}
            aria-invalid={!!errors.year}
            aria-describedby={errors.year ? "error-year" : undefined}
            className={[
              "bg-transparent border-0 border-b pb-2 outline-none w-full",
              "text-ink text-xl font-display tracking-[0.06em] placeholder:text-ink-faint",
              "pressable focus:border-gold-deep focus:shadow-[0_1px_0_0_var(--color-gold-deep)] focus-visible:outline-none min-h-[44px]",
              errors.year
                ? "border-tier-weak"
                : "border-border",
            ].join(" ")}
          />
          {errors.year && (
            <p id="error-year" role="alert" className="mt-1 text-xs text-tier-weak">
              {errors.year}
            </p>
          )}
        </div>
      </div>

      {/* General date error (e.g. future date, invalid calendar date) */}
      {errors.date && (
        <p role="alert" className="mt-2 text-xs text-tier-weak">
          {errors.date}
        </p>
      )}

      {/* Auto-derived display */}
      {derived && (
        <div
          aria-live="polite"
          className="mt-6 flex flex-wrap gap-6 animate-settle-in"
        >
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.08em] text-ink-light">
              Zodiac
            </span>
            <span className="text-ink mt-1">{derived.zodiacAnimal}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.08em] text-ink-light">
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
            "w-full rounded-full border border-gold-deep text-gold-deep",
            "py-3 px-6 min-h-[48px]",
            "text-sm font-medium uppercase tracking-[0.14em]",
            "bg-transparent hover:bg-gold-deep hover:text-parchment hover:shadow-[var(--shadow-glow)]",
            "pressable active:scale-[0.98] active:bg-gold-deep active:text-parchment",
          ].join(" ")}
        >
          Reveal My Cycle
        </button>
      </div>
    </form>
  );
}
