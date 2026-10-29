"use client";

/**
 * BirthDataForm
 *
 * Collects day, month, and year inputs from the user, auto-derives the
 * weekday and zodiac animal when all three fields are complete,
 * validates the date on submission, and emits the cycle result via an
 * `onResult` callback. Also holds the Khmer/Chinese New Year toggle, since
 * it decides the animal the preview and the reading use.
 *
 * In "partner" mode the same form takes a second person's date for a
 * comparison: it saves nothing to this browser, its fields get their own
 * ids, and the button reads "Compare".
 */

import { useState, useMemo, useRef } from "react";
import {
  deriveBirthData,
  validateBirthDate,
  zodiacAnimalByRule,
  computeCycleFromBirthDate,
  type CycleResultWithYear,
} from "@/lib/numerology/derive";
import { isRealCalendarDate, isSupportedYear } from "@/lib/numerology/calendar";
import { markUpdateNoticeSeen, saveBirthDate } from "@/lib/storage";
import type { NewYearRule } from "@/lib/numerology/zodiac";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import { NewYearToggle } from "@/components/new-year-toggle";
import { Reveal } from "@/components/ui/reveal";

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

/** Whose date the form takes: the visitor's own, or a partner's for a comparison. */
export type BirthDataFormMode = "primary" | "partner";

/** Wording and ids that differ between the two modes. */
const MODE_TEXT: Record<BirthDataFormMode, { idPrefix: string; formLabel: string; submit: string; footnote: string }> = {
  primary: {
    idPrefix: "birth",
    formLabel: "Birth date form",
    submit: "Reveal my cycle",
    footnote: "Free, no sign-up. Your birth date stays in this browser.",
  },
  partner: {
    idPrefix: "partner",
    formLabel: "Comparison birth date form",
    submit: "Compare",
    footnote: "This birth date isn't saved anywhere.",
  },
};

interface Props {
  /** "partner" takes a second person's date for a comparison and saves nothing. Defaults to "primary". */
  mode?: BirthDataFormMode;
  /** Called with the computed cycle result after successful form submission. */
  onResult: (result: CycleResultWithYear) => void;
  /** Optional initial values for pre-filling the form (e.g., from share URL). */
  initialValues?: { day: string; month: string; year: string };
  /** Which New Year turns the animal year, for the preview and the result. */
  newYearRule: NewYearRule;
  /** Called when the visitor switches the New Year rule. */
  onNewYearRuleChange: (rule: NewYearRule) => void;
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

/**
 * The field's new digits after an edit. Typing into a full field starts it
 * over with the typed digit, so a filled date can be corrected without
 * clearing it first. Pasting keeps the first digits that fit.
 */
function nextFieldValue(
  previous: string,
  raw: string,
  typed: string | null,
  maxLength: number
): string {
  const digits = digitsOnly(raw);
  if (digits.length <= maxLength) return digits;
  // The typed text, or (where the browser doesn't report it) what was added
  // after the existing digits.
  const typedDigits = typed
    ? digitsOnly(typed)
    : digits.startsWith(previous) ? digits.slice(previous.length) : "";
  if (previous.length === maxLength && typedDigits) return typedDigits.slice(0, maxLength);
  return digits.slice(0, maxLength);
}

/**
 * Whether a field is complete, so focus can move on. A day starting 4-9 or a
 * month starting 2-9 can't take a second digit, so it is complete at one.
 */
export function isFieldComplete(value: string, maxLength: number, maxFirstDigit?: number): boolean {
  if (value.length >= maxLength) return true;
  return (
    maxFirstDigit !== undefined &&
    value.length === 1 &&
    Number(value) > maxFirstDigit
  );
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
  /** Largest first digit that still allows a second one (3 for days, 1 for months). */
  maxFirstDigit?: number;
  inputRef?: React.Ref<HTMLInputElement>;
  /** Called when an edit completes the field, to move focus on. */
  onComplete?: () => void;
  /** Called on Backspace in an empty field, to move focus back. */
  onBackspaceEmpty?: () => void;
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
  maxFirstDigit,
  inputRef,
  onComplete,
  onBackspaceEmpty,
  className = "",
}: DateFieldProps) {
  // "birth-day" → "error-day"; partner fields keep their prefix ("error-partner-day")
  const errorId = `error-${id.replace("birth-", "")}`;
  return (
    <div className={`flex flex-col min-w-0 ${className}`}>
      <label
        htmlFor={id}
        className="mb-2 text-center text-base text-ink-light"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        ref={inputRef}
        onChange={(e) => {
          const native = e.nativeEvent as InputEvent;
          const typed = native.data ?? null;
          const next = nextFieldValue(value, e.target.value, typed, maxLength);
          onChange(next);
          // Move on only after typing or pasting, never after deleting.
          const inserted = native.inputType
            ? native.inputType.startsWith("insert")
            : digitsOnly(e.target.value).length > value.length;
          if (inserted && isFieldComplete(next, maxLength, maxFirstDigit)) {
            onComplete?.();
          }
        }}
        onFocus={(e) => {
          // Select the contents so typing replaces them. Deferred because
          // iOS Safari drops a selection made during the focus event.
          const input = e.currentTarget;
          requestAnimationFrame(() => {
            if (document.activeElement === input) input.setSelectionRange(0, input.value.length);
          });
        }}
        onKeyDown={(e) => {
          if (e.key === "Backspace" && value === "") onBackspaceEmpty?.();
        }}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className="lantern-input pressable"
      />
      {error && (
        <p id={errorId} role="alert" className="animate-settle-in mt-2 text-sm text-tier-weak">
          {error}
        </p>
      )}
    </div>
  );
}

export function BirthDataForm({
  mode = "primary",
  onResult,
  initialValues,
  newYearRule,
  onNewYearRuleChange,
}: Props) {
  const [day, setDay] = useState(initialValues?.day ?? "");
  const [month, setMonth] = useState(initialValues?.month ?? "");
  const [year, setYear] = useState(initialValues?.year ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const text = MODE_TEXT[mode];

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
    return deriveBirthData(yearNum, monthNum, dayNum, newYearRule);
  }, [dayNum, monthNum, yearNum, newYearRule]);

  // The last complete date's preview, kept so the line can fold away
  // showing it once a field is cleared
  const [shownDerived, setShownDerived] = useState(derived);
  if (derived && derived !== shownDerived) setShownDerived(derived);

  // The animal under each rule, once the date is complete, so the toggle can
  // say whether the choice matters for this birth date.
  const animalsByRule = useMemo(
    () => (derived ? zodiacAnimalByRule(yearNum, monthNum, dayNum) : null),
    [derived, yearNum, monthNum, dayNum]
  );

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
    const result = computeCycleFromBirthDate(yearNum, monthNum, dayNum, newYearRule);
    if (mode === "primary") {
      saveBirthDate(dayNum, monthNum, yearNum);
      // A date saved now is read with the current rules, so the note about
      // the 2026 changes would only confuse this visitor later.
      markUpdateNoticeSeen();
    }
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
      aria-label={text.formLabel}
    >
      {/* Date inputs */}
      <div className="mt-6 sm:mt-8 grid grid-cols-[1fr_1fr_1.5fr] gap-3 sm:gap-4">
        <DateField
          id={`${text.idPrefix}-day`}
          label="Day"
          placeholder="DD"
          maxLength={2}
          autoComplete="bday-day"
          maxFirstDigit={3}
          inputRef={dayRef}
          onComplete={() => monthRef.current?.focus()}
          value={day}
          error={errors.day}
          onChange={(digits) => {
            setDay(digits);
            revalidate(digits, month, year);
          }}
        />
        <DateField
          id={`${text.idPrefix}-month`}
          label="Month"
          placeholder="MM"
          maxLength={2}
          autoComplete="bday-month"
          maxFirstDigit={1}
          inputRef={monthRef}
          onComplete={() => yearRef.current?.focus()}
          onBackspaceEmpty={() => dayRef.current?.focus()}
          value={month}
          error={errors.month}
          onChange={(digits) => {
            setMonth(digits);
            revalidate(day, digits, year);
          }}
        />
        <DateField
          id={`${text.idPrefix}-year`}
          label="Year"
          placeholder="YYYY"
          maxLength={4}
          autoComplete="bday-year"
          inputRef={yearRef}
          onBackspaceEmpty={() => monthRef.current?.focus()}
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
        <p role="alert" className="animate-settle-in mt-3 text-center text-sm text-tier-weak">
          {errors.date}
        </p>
      )}

      {/* Auto-derived zodiac and weekday. Takes no space until the date is
          complete, then opens in place so the button glides down rather
          than jumping. While it closes it keeps showing the last date. */}
      <div aria-live="polite">
        <Reveal open={derived !== null}>
          {shownDerived && (
            <p className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-ink-light">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-gold-deep/[0.06] py-1 pl-2 pr-4">
                <ZodiacIcon animal={shownDerived.zodiacAnimal} className="size-6 text-gold-deep" />
                <span>
                  Year of the{" "}
                  <span className="font-display text-base text-gold-deep">{shownDerived.zodiacAnimal}</span>
                </span>
              </span>
              <span className="inline-flex items-center rounded-full border border-border bg-gold-deep/[0.06] px-4 py-1.5">
                <span>
                  Born on a{" "}
                  <span className="font-display text-base text-gold-deep">
                    {WEEKDAY_NAMES[shownDerived.weekday]}
                  </span>
                </span>
              </span>
            </p>
          )}
        </Reveal>
      </div>

      <NewYearToggle
        rule={newYearRule}
        onChange={onNewYearRuleChange}
        animals={animalsByRule}
      />

      {/* Submit */}
      <div className="mt-6">
        <button
          type="submit"
          className={[
            // The one filled shape on the card, so the next step is obvious
            "w-full rounded-full bg-gold-deep text-parchment",
            "py-3 px-6 min-h-[56px]",
            "text-lg font-semibold tracking-[0.02em]",
            "breathe-glow hover:bg-gold-light",
            "pressable active:scale-[0.97]",
          ].join(" ")}
        >
          {text.submit}
        </button>
        <p className="mt-3 text-center text-sm text-ink-light">
          {text.footnote}
        </p>
      </div>
    </form>
  );
}
