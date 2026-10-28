"use client";

/**
 * NewYearToggle
 *
 * A two-way toggle on the birth date form for which New Year turns the
 * animal year: Khmer New Year (mid-April, the default) or Chinese New Year
 * (late January to February). Once the date is complete it says whether the
 * choice changes this birth date's animal, which only happens for births
 * between the two New Years.
 */

import { startTransition, useRef, ViewTransition } from "react";
import type { NewYearRule, ZodiacAnimal } from "@/lib/numerology/zodiac";

interface Props {
  /** The rule the reading is currently counted with. */
  rule: NewYearRule;
  /** Called when the visitor picks the other rule. */
  onChange: (rule: NewYearRule) => void;
  /** The animal each rule gives, once the birth date is complete. */
  animals?: Record<NewYearRule, ZodiacAnimal> | null;
}

const OPTIONS: { rule: NewYearRule; label: string }[] = [
  { rule: "khmer", label: "Khmer" },
  { rule: "chinese", label: "Chinese" },
];

export function NewYearToggle({ rule, onChange, animals }: Props) {
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const choiceMatters = !!animals && animals.khmer !== animals.chinese;

  // A transition, like every selection change, so the outline glides across
  // and the reading below crossfades instead of jumping.
  function choose(next: NewYearRule) {
    startTransition(() => onChange(next));
  }

  // Radio-group keys: arrows move the choice and focus together.
  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const next = (index + 1) % OPTIONS.length;
    optionRefs.current[next]?.focus();
    choose(OPTIONS[next].rule);
  }

  return (
    <div className="mt-5 flex flex-col items-center">
      <p id="new-year-toggle-label" className="text-center text-xs uppercase tracking-[0.12em] text-ink-light">
        New Year that starts your animal year
      </p>
      <div
        role="radiogroup"
        aria-labelledby="new-year-toggle-label"
        className="mt-2 grid w-full grid-cols-2 gap-1 rounded-full border border-border p-1"
      >
        {OPTIONS.map((option, index) => {
          const selected = option.rule === rule;
          return (
            <button
              key={option.rule}
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${option.label} New Year`}
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(option.rule)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={[
                "pressable relative min-h-[44px] min-w-0 whitespace-nowrap rounded-full px-2 text-sm active:scale-[0.97]",
                // Ink marks the selection; gold is kept for "now"
                selected ? "font-medium text-ink" : "text-ink-light hover:text-ink",
              ].join(" ")}
            >
              {/* Selection outline: one shared element that glides between options */}
              {selected && (
                <ViewTransition name="new-year-selection" share="auto" default="none">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full bg-ink/[0.06] ring-1 ring-inset ring-ink"
                  />
                </ViewTransition>
              )}
              <span className="relative">{option.label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs leading-relaxed text-ink-light" aria-live="polite">
        {choiceMatters
          ? `Your birth date falls between the two: Khmer New Year makes you the ${animals.khmer}, Chinese New Year the ${animals.chinese}.`
          : "Cambodia turns the animal year at Khmer New Year in mid-April. Some families count from Chinese New Year."}
      </p>
    </div>
  );
}
