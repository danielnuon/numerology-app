/**
 * CompatibilitySummary
 *
 * A comparison at a glance: everyone's dates and total scores, the overall
 * stability assessment and this year's interaction. It opens
 * CycleComparison, above the cycle stepper and the year-by-year table, and
 * fills the width it's given. Each person after the first can be removed
 * from their tile. How the totals are read sits with the other explanations
 * in the comparison's "How to read this". The comparison link's preview
 * image (/r/A+B/opengraph-image) draws a fuller version of this summary as
 * a 1200×630 card for sharing and download.
 */

import {
  INTERACTION_TEXT,
  stabilityText,
  type StabilityAssessment,
  type YearInteraction,
} from "@/lib/numerology/compatibility";
import type { ZodiacAnimal } from "@/lib/numerology/zodiac";

/** Text color for each interaction's symbol and word; the word always carries the meaning. */
export const INTERACTION_COLOR_CLASS: Record<YearInteraction, string> = {
  amplified: "text-gold-deep",
  stabilized: "text-tier-strong",
  neutral: "text-ink-light",
  risk: "text-tier-weak",
  unstable: "text-ink-light",
};

/** One person in the comparison. */
export interface SummaryPerson {
  /** What the comparison calls this person: a name, "You", "Them" or their zodiac animal. */
  term: string;
  date: { year: number; month: number; day: number };
  animal: ZodiacAnimal;
  total: number;
}

/** "July 24, 1997" for a birth date. */
export function formatBirthDate({ year, month, day }: SummaryPerson["date"]): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/** An interaction's symbol (decoration) and word, in its color. */
export function InteractionLabel({ interaction }: { interaction: YearInteraction }) {
  const text = INTERACTION_TEXT[interaction];
  return (
    <span className={`inline-flex items-center gap-1.5 ${INTERACTION_COLOR_CLASS[interaction]}`}>
      <span aria-hidden="true">{text.symbol}</span>
      {text.label}
    </span>
  );
}

interface Props {
  /** Everyone in the comparison, the reading's owner first (two to six). */
  people: SummaryPerson[];
  assessment: StabilityAssessment;
  /** This year's interaction, or null when fewer than two people were born yet. */
  current: { year: number; interaction: YearInteraction } | null;
  /** Called with a person's index to remove them; the first person can't be removed. */
  onRemove?: (index: number) => void;
  /** Sits between the assessment and the current year, such as a note on how a group is read. */
  children?: React.ReactNode;
}

/** A remove control's cross, matching the interface line weight. */
function Cross() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="size-3.5">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function CompatibilitySummary({ people, assessment, current, onRemove, children }: Props) {
  const stability = stabilityText(assessment, people.length);
  return (
    <div>
      {/* Whose cycles these are, with each total score */}
      <dl className={`grid grid-cols-2 gap-3 ${people.length > 2 ? "sm:grid-cols-3" : ""}`}>
        {people.map((person, index) => (
          <div key={index} className="relative min-w-0">
            <dt className={`truncate text-xs uppercase tracking-[0.14em] text-ink-light ${onRemove && index > 0 ? "pr-8" : ""}`}>
              {person.term}
            </dt>
            {onRemove && index > 0 && (
              // The visible cross is small; the button around it is a full 44px target
              <dd className="absolute -right-2 -top-3.5">
                <button
                  type="button"
                  aria-label={`Remove ${person.term === "You" ? "yourself" : person.term}`}
                  onClick={() => onRemove(index)}
                  className="pressable grid size-11 place-items-center rounded-full text-ink-light hover:text-ink active:scale-[0.97]"
                >
                  <Cross />
                </button>
              </dd>
            )}
            <dd className="mt-1 text-sm text-ink">{formatBirthDate(person.date)}</dd>
            <dd className="text-sm text-ink-light">
              {person.animal} · Total{" "}
              <span className="font-display text-xl text-gold-deep tabular-nums">{person.total}</span>
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-sm leading-relaxed text-ink-light">
        <span className="font-display text-lg text-ink">{stability.label}.</span> {stability.description}
      </p>
      {children}

      {current && (
        <p className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 rounded-xl bg-gold-deep/[0.07] px-4 py-3 text-base">
          <span className="font-semibold text-gold-deep">Now, {current.year}</span>
          <InteractionLabel interaction={current.interaction} />
        </p>
      )}
    </div>
  );
}
