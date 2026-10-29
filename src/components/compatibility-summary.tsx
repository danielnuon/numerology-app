/**
 * CompatibilitySummary
 *
 * A comparison at a glance: both people's dates and total scores, the
 * overall stability assessment, the current year's interaction (when the
 * shown cycle holds it) and how many of the cycle's years have each
 * interaction. A link under the assessment leads to how the totals are
 * read, including the case Khmer numerology's rules leave out. It sits at the top
 * of PartnerComparison, above the year-by-year table, and depends on nothing
 * around it: it brings its own border and padding and fills the width it's
 * given. The comparison link's preview image (/r/A+B/opengraph-image) draws
 * the same summary as a 1200×630 card for sharing and download.
 */

import {
  INTERACTION_ORDER,
  INTERACTION_TEXT,
  STABILITY_TEXT,
  type ComparisonSummary,
  type StabilityAssessment,
  type YearInteraction,
} from "@/lib/numerology/compatibility";
import type { ZodiacAnimal } from "@/lib/numerology/zodiac";
import Link from "next/link";
import { MORE_LINK, TOTAL_SCORE_SECTION_ID } from "@/components/ui/page-parts";

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
  summary: ComparisonSummary;
  /** The 12-year cycle the counts cover. */
  cycle: { start: number; end: number };
}

export function CompatibilitySummary({ people, assessment, summary, cycle }: Props) {
  // The current year, if it's in the cycle shown and both people were born by then
  const current = summary.current?.interaction
    ? { year: summary.current.year, interaction: summary.current.interaction }
    : null;
  const yearCount = cycle.end - cycle.start + 1;
  const stability = STABILITY_TEXT[assessment];
  return (
    <div className="rounded-xl border border-border p-4 sm:p-5">
      {/* Whose cycles these are, with each total score */}
      <dl className="grid grid-cols-2 gap-3">
        {people.map((person) => (
          <div key={person.term} className="min-w-0">
            <dt className="text-xs uppercase tracking-[0.14em] text-ink-light">{person.term}</dt>
            <dd className="mt-1 text-sm text-ink">{formatBirthDate(person.date)}</dd>
            <dd className="text-sm text-ink-light">Year of the {person.animal}</dd>
            <dd className="mt-2 text-sm text-ink-light">
              Total <span className="font-display text-2xl text-gold-deep">{person.total}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 border-t border-border-light pt-4">
        <p className="font-display text-lg text-ink">{stability.label}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-light">{stability.description}</p>
        <Link href={`/how-it-works#${TOTAL_SCORE_SECTION_ID}`} className={`${MORE_LINK} mt-2 inline-block text-sm`}>
          How the totals are read
        </Link>
      </div>

      {current && (
        <p className="mt-4 flex flex-wrap items-baseline gap-x-2 text-base">
          <span className="font-semibold text-gold-deep">Now, {current.year}:</span>
          <InteractionLabel interaction={current.interaction} />
        </p>
      )}

      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.12em] text-ink-light">
          Cycle {cycle.start}–{cycle.end}
          {summary.sharedYears < yearCount && ` · ${summary.sharedYears} years together`}
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
          {INTERACTION_ORDER.map((interaction) => (
            <li key={interaction} className="inline-flex items-center gap-1.5">
              <span className="font-sans tabular-nums text-ink">{summary.counts[interaction]}</span>
              <InteractionLabel interaction={interaction} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
