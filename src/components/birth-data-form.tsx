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
import { ZodiacIcon } from "@/components/ui/zodiac-icon";

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

interface DateFieldProps {
  id: string;
  label: string;
  placeholder: string;
  maxLength: number;
  /** Autofill hint, so Safari and Chrome can offer the saved birthday. */
  autoComplete: string;
  value: string;
  error?: string;
  onChange: (digits: string) => void;
  className?: string;
}

/** One labelled date part: a lit well that glows gold on focus and ember on error. */
function DateField({
  id,
  label,
  placeholder,
  maxLength,
  autoComplete,
  value,
  error,
  onChange,
  className = "",
}: DateFieldProps) {
  const errorId = `error-${id.replace("birth-", "")}`;
  return (
    <div className={`flex flex-col min-w-0 ${className}`}>
      <label
        htmlFor={id}
        className="mb-2 text-center text-xs uppercase tracking-[0.12em] text-ink-light"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(digitsOnly(e.target.value))}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className="lantern-input pressable"
      />
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-xs text-tier-weak">
          {error}
        </p>
      )}
    </div>
  );
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
      <div className="mt-8 grid grid-cols-[1fr_1fr_1.5fr] gap-3 sm:gap-4">
        <DateField
          id="birth-day"
          label="Day"
          placeholder="DD"
          maxLength={2}
          autoComplete="bday-day"
          value={day}
          error={errors.day}
          onChange={(digits) => {
            setDay(digits);
            revalidate(digits, month, year);
          }}
        />
        <DateField
          id="birth-month"
          label="Month"
          placeholder="MM"
          maxLength={2}
          autoComplete="bday-month"
          value={month}
          error={errors.month}
          onChange={(digits) => {
            setMonth(digits);
            revalidate(day, digits, year);
          }}
        />
        <DateField
          id="birth-year"
          label="Year"
          placeholder="YYYY"
          maxLength={4}
          autoComplete="bday-year"
          value={year}
          error={errors.year}
          onChange={(digits) => {
            setYear(digits);
            revalidate(day, month, digits);
          }}
        />
      </div>

      {/* General date error (e.g. future date, invalid calendar date) */}
      {errors.date && (
        <p role="alert" className="mt-3 text-center text-xs text-tier-weak">
          {errors.date}
        </p>
      )}

      {/* Auto-derived zodiac and weekday. The slot reserves room for the two
          chips (stacked on phones) so the button doesn't jump when they appear. */}
      <div aria-live="polite" className="mt-6 flex min-h-[92px] min-[480px]:min-h-[44px] justify-center">
        {derived && (
          <p className="animate-settle-in flex flex-wrap items-center justify-center gap-2 text-sm text-ink-light">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-gold-deep/[0.06] py-1 pl-2 pr-4">
              <ZodiacIcon animal={derived.zodiacAnimal} className="size-6 text-gold-deep" />
              <span>
                Year of the{" "}
                <span className="font-display text-base text-gold-deep">{derived.zodiacAnimal}</span>
              </span>
            </span>
            <span className="inline-flex items-center rounded-full border border-border bg-gold-deep/[0.06] px-4 py-1.5">
              <span>
                Born on a{" "}
                <span className="font-display text-base text-gold-deep">
                  {WEEKDAY_NAMES[derived.weekday]}
                </span>
              </span>
            </span>
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="mt-6">
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
        <p className="mt-3 text-center text-xs text-ink-light">
          Free, no sign-up. Your birth date stays in this browser.
        </p>
      </div>
    </form>
  );
}
