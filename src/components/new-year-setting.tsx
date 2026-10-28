"use client";

/**
 * NewYearSetting
 *
 * Lets the visitor choose which New Year turns their animal year: Khmer New
 * Year (mid-April, the default) or Chinese New Year (late January to
 * February). Says plainly whether the choice changes this reading, since it
 * only does for births between the two New Years.
 */

import { useRef } from "react";
import { zodiacAnimalByRule } from "@/lib/numerology/derive";
import type { NewYearRule } from "@/lib/numerology/zodiac";

interface Props {
  /** The rule the reading is currently counted with. */
  rule: NewYearRule;
  /** Birth date of the reading, to tell whether the choice matters. */
  year: number;
  month: number;
  day: number;
  /** Called when the visitor picks the other rule. */
  onChange: (rule: NewYearRule) => void;
}

const OPTIONS: { rule: NewYearRule; label: string; when: string }[] = [
  { rule: "khmer", label: "Khmer New Year", when: "mid-April" },
  { rule: "chinese", label: "Chinese New Year", when: "Jan–Feb" },
];

export function NewYearSetting({ rule, year, month, day, onChange }: Props) {
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const animals = zodiacAnimalByRule(year, month, day);
  const choiceMatters = animals.khmer !== animals.chinese;

  // Radio-group keys: arrows move the choice and focus together.
  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const next = (index + 1) % OPTIONS.length;
    optionRefs.current[next]?.focus();
    onChange(OPTIONS[next].rule);
  }

  return (
    <section
      aria-labelledby="new-year-setting-title"
      className="w-full max-w-[480px] mx-auto mt-10 text-center"
    >
      <p id="new-year-setting-title" className="font-display text-xl text-ink tracking-[0.04em]">
        When your animal year begins
      </p>
      <p className="mt-1 text-sm text-ink-light leading-relaxed">
        In Cambodia the animal year turns at Khmer New Year. Some families
        count it from Chinese New Year instead.
      </p>

      <div
        role="radiogroup"
        aria-labelledby="new-year-setting-title"
        className="mt-5 inline-flex flex-wrap justify-center gap-2"
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
                "pressable inline-flex flex-col items-center justify-center min-h-[44px] px-5 py-2 rounded-full border text-sm",
                selected
                  ? "border-gold-deep text-gold-deep bg-gold-deep/[0.08]"
                  : "border-border text-ink-light hover:text-ink hover:border-gold",
              ].join(" ")}
            >
              <span>{option.label}</span>
              <span className="text-xs opacity-80">{option.when}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-ink-light leading-relaxed" aria-live="polite">
        {choiceMatters
          ? `This birth date falls between the two New Years, so the choice matters: Khmer New Year gives the ${animals.khmer}, Chinese New Year the ${animals.chinese}.`
          : `Both give the ${animals.khmer} for this birth date, so the reading is the same either way.`}
      </p>
    </section>
  );
}
