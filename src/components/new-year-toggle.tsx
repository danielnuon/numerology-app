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

import { useRef } from "react";
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

  // Radio-group keys: arrows move the choice and focus together.
  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const next = (index + 1) % OPTIONS.length;
    optionRefs.current[next]?.focus();
    onChange(OPTIONS[next].rule);
  }

  return (
    <div className="mt-5 flex flex-col items-center">
      <p id="new-year-toggle-label" className="text-center text-xs uppercase tracking-[0.12em] text-ink-light">
        Animal year starts at
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
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(option.rule)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={[
                "pressable min-h-[44px] min-w-0 whitespace-nowrap rounded-full px-2 text-sm",
                selected
                  ? "bg-gold-deep/[0.12] text-gold-deep shadow-[inset_0_0_0_1px_var(--color-gold-deep)]"
                  : "text-ink-light hover:text-ink",
              ].join(" ")}
            >
              {option.label}
              {/* Dropped visually on the narrowest phones so each option fits on one line. */}
              <span className="max-[359px]:sr-only"> New Year</span>
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
