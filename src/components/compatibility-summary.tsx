/**
 * CompatibilitySummary
 *
 * A comparison at a glance: both people's dates and total scores, the
 * overall stability assessment and this year's interaction. It opens
 * PartnerComparison, above the cycle stepper and the year-by-year table, and
 * fills the width it's given. How the totals are read sits with the other
 * explanations in the comparison's "How to read this". The comparison
 * link's preview image (/r/A+B/opengraph-image) draws a fuller version of
 * this summary as a 1200×630 card for sharing and download.
 */

import {
  INTERACTION_TEXT,
  STABILITY_TEXT,
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
  /** What the comparison calls this person: "You", "Them", "First" or "Second". */
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
  people: [SummaryPerson, SummaryPerson];
  assessment: StabilityAssessment;
  /** This year's interaction, or null when either person wasn't born yet. */
  current: { year: number; interaction: YearInteraction } | null;
}

export function CompatibilitySummary({ people, assessment, current }: Props) {
  const stability = STABILITY_TEXT[assessment];
  return (
    <div>
      {/* Whose cycles these are, with each total score */}
      <dl className="grid grid-cols-2 gap-3">
        {people.map((person) => (
          <div key={person.term} className="min-w-0">
            <dt className="text-xs uppercase tracking-[0.14em] text-ink-light">{person.term}</dt>
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

      {current && (
        <p className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 rounded-xl bg-gold-deep/[0.07] px-4 py-3 text-base">
          <span className="font-semibold text-gold-deep">Now, {current.year}</span>
          <InteractionLabel interaction={current.interaction} />
        </p>
      )}
    </div>
  );
}
