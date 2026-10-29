/**
 * UpdateNotice
 *
 * A one-time note above a returning visitor's restored reading, explaining
 * the 2026 changes that can make it differ from what they saw before: each
 * cycle year now begins on the birthday, and the animal year turns at Khmer
 * New Year by default. The animal line only appears when that default
 * actually changes this birth date's animal. HomeClient decides when the
 * note shows and owns the live region it is announced through.
 */

import { getZodiacAnimal, type NewYearRule } from "@/lib/numerology/zodiac";

interface Props {
  /** The restored birth date the reading was made from. */
  birthYear: number;
  /** Birth month, 1–12. */
  birthMonth: number;
  /** Birth day of the month. */
  birthDay: number;
  /** True when the visitor picked a New Year rule themselves, so the default never applied. */
  hasChosenRule: boolean;
  /** Called when the visitor dismisses the note with "Got it". */
  onDismiss: () => void;
}

export function UpdateNotice({ birthYear, birthMonth, birthDay, hasChosenRule, onDismiss }: Props) {
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  const animals: Record<NewYearRule, string> = {
    khmer: getZodiacAnimal(birthDate, "khmer"),
    chinese: getZodiacAnimal(birthDate, "chinese"),
  };
  // Only births between Chinese and Khmer New Year get a different animal.
  const animalChanged = !hasChosenRule && animals.khmer !== animals.chinese;

  return (
    <div className="glass mb-6 w-full max-w-[480px] rounded-2xl p-5 sm:p-6 text-left">
      <h2 className="font-display text-xl leading-tight tracking-[0.03em] text-ink">
        Your reading has changed a little
      </h2>
      <p className="mt-2 text-base leading-relaxed text-ink-light">
        Each year of your cycle now begins on your birthday. Until your
        birthday arrives, you&apos;ll see last year&apos;s number.
      </p>
      {animalChanged && (
        <p className="mt-2 text-base leading-relaxed text-ink-light">
          Your animal year now turns at Khmer New Year in mid-April, so
          your animal is the {animals.khmer} rather than the {animals.chinese}.
          You can count from Chinese New Year instead on the birth date form.
        </p>
      )}
      <button
        type="button"
        onClick={onDismiss}
        className="pressable mt-4 min-h-[44px] rounded-full border border-border px-6 text-base text-ink hover:border-gold-deep active:scale-[0.97]"
      >
        Got it
      </button>
    </div>
  );
}
