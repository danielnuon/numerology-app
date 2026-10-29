"use client";

/**
 * CycleWalkthrough
 *
 * Works a 12-year cycle out step by step for one birth date: the three
 * starting numbers, the three rows, each column's sum and remainder, the
 * cycle, and what its total score means (alone and beside a partner's, which
 * the comparison links to). The date comes from the page's query string; without one it is the
 * visitor's saved birth date, read after hydration, and failing that the
 * worked example from the system spec.
 */

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { MORE_LINK, NumberRow, PillLink, Section, TOTAL_SCORE_SECTION_ID } from "@/components/ui/page-parts";
import { SectionDivider } from "@/components/ui/section-divider";
import { computeCycleFromBirthDate, validateBirthDate } from "@/lib/numerology/derive";
import { STABILITY_TEXT } from "@/lib/numerology/compatibility";
import { interpretTotal } from "@/lib/numerology/interpretation";
import { getLifeArea } from "@/lib/numerology/year-lookup";
import { DEFAULT_NEW_YEAR_RULE, type NewYearRule } from "@/lib/numerology/zodiac";
import { readStoredBirthDate, readStoredNewYearRule } from "@/lib/storage";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const RULE_NAMES: Record<NewYearRule, string> = { khmer: "Khmer New Year", chinese: "Chinese New Year" };

/** The worked example from the system spec: Thursday 24 July 1997. */
export const EXAMPLE_DATE: WalkthroughDate = { year: 1997, month: 7, day: 24, rule: DEFAULT_NEW_YEAR_RULE };

export interface WalkthroughDate {
  year: number;
  month: number;
  day: number;
  rule: NewYearRule;
}

/**
 * Every total a cycle can have. The rows always sum to 184 and 9, 10 or 11
 * columns drop by 12; a derive test checks every date from 1900 to 2030.
 */
const POSSIBLE_TOTALS = [52, 64, 76] as const;

const subscribeToNothing = () => () => {};

/** The visitor's saved birth date and New Year choice, or null. Client only. */
function storedDate(): WalkthroughDate | null {
  const stored = readStoredBirthDate();
  if (!stored || validateBirthDate(stored.year, stored.month, stored.day).length > 0) return null;
  return { ...stored, rule: readStoredNewYearRule() ?? DEFAULT_NEW_YEAR_RULE };
}

/** "24 July 1997" */
function formatDate({ year, month, day }: WalkthroughDate): string {
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

interface Props {
  /** A birth date from the query string, already validated; null for none. */
  date: WalkthroughDate | null;
}

export function CycleWalkthrough({ date }: Props) {
  // After hydration, a visitor with no date in the link sees their saved one.
  const isHydrated = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const saved = useMemo(() => (isHydrated && !date ? storedDate() : null), [isHydrated, date]);
  const shown = date ?? saved ?? EXAMPLE_DATE;
  const isExample = !date && !saved;

  const result = computeCycleFromBirthDate(shown.year, shown.month, shown.day, shown.rule);
  const { rows, cycle, totalScore, birthData } = result;
  const total = interpretTotal(totalScore);
  const dayRow = Array.from({ length: 12 }, (_, i) => rows.day[i] ?? null);
  const readingHref = isExample
    ? "/"
    : `/?day=${shown.day}&month=${shown.month}&year=${shown.year}&ny=${shown.rule}`;

  return (
    <>
      <p className="mt-4 max-w-[520px] text-center text-ink-light leading-relaxed">
        {isExample ? (
          <>
            This walks through an example birth date, {formatDate(shown)}.{" "}
            <Link href="/" className={MORE_LINK}>
              Enter yours
            </Link>{" "}
            and come back to see your own.
          </>
        ) : (
          <>
            Here is how the reading for {formatDate(shown)} is worked out.
            Every step can be checked by hand.
          </>
        )}
      </p>

      <SectionDivider compact />

      <Section title="1. Three starting numbers">
        <ul className="space-y-3">
          <li>
            <span className="font-display text-xl text-gold-deep tabular-nums">{rows.month[0]}</span>
            <span className="text-ink"> · Month.</span> {MONTH_NAMES[shown.month - 1]} is month{" "}
            {rows.month[0]}, counting from <em>Mikasar</em>, the lunar month
            around December, as 1.
          </li>
          <li>
            <span className="font-display text-xl text-gold-deep tabular-nums">{birthData.zodiacNumber}</span>
            <span className="text-ink"> · Animal.</span> The Year of the{" "}
            {birthData.zodiacAnimal}, number {birthData.zodiacNumber} counting
            from the Rat as 1. The animal year here turns at{" "}
            {RULE_NAMES[shown.rule]}.
          </li>
          <li>
            <span className="font-display text-xl text-gold-deep tabular-nums">{birthData.weekday}</span>
            <span className="text-ink"> · Weekday.</span> Born on a{" "}
            {WEEKDAY_NAMES[birthData.weekday - 1]}, number {birthData.weekday}{" "}
            counting from Sunday as 1.
          </li>
        </ul>
      </Section>

      <SectionDivider />

      <Section title="2. Three rows">
        <p>
          Each number starts a row that counts up one step per column. The
          month and animal rows wrap from 12 back to 1. The weekday row
          wraps from 7 back to 1 and fills only the first seven columns.
        </p>
        <div className="glass rounded-2xl p-3 min-[360px]:p-4 sm:p-6">
          <NumberRow label="Month" values={rows.month} />
          <NumberRow label={`Animal (${birthData.zodiacAnimal})`} values={rows.zodiac} />
          <NumberRow label={`Weekday (${WEEKDAY_NAMES[birthData.weekday - 1]})`} values={dayRow} />
        </div>
      </Section>

      <SectionDivider />

      <Section title="3. Add each column">
        <p>
          Each column is added up and divided by 12. The remainder, from 0
          to 11, is that year&apos;s number. The first column is the year
          from your birth to your first birthday, the next column the year
          after, and each year belongs to a life area.
        </p>
        <ol className="glass divide-y divide-border rounded-2xl px-3 text-sm min-[360px]:px-4 sm:px-6" aria-label="Each year's sum">
          {cycle.map((n, i) => {
            const parts = [rows.month[i], rows.zodiac[i], rows.day[i]].filter((v) => v !== undefined);
            const sum = parts.reduce((a, b) => a + b, 0);
            return (
              <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-3 py-2.5">
                <span className="text-ink">
                  {shown.year + i}
                  <span className="text-ink-light"> · {getLifeArea(i + 1)}</span>
                </span>
                <span className="tabular-nums text-ink-light">
                  {parts.join(" + ")} = {sum} →{" "}
                  <span className="font-display text-base text-gold-deep">{n}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </Section>

      <SectionDivider />

      <Section title="4. The cycle">
        <div className="glass rounded-2xl p-3 min-[360px]:p-4 sm:p-6">
          <NumberRow label="One number for each year" values={cycle} highlight />
          <p className="mt-4 text-sm text-ink">
            Total score {totalScore}: {total.label}.
          </p>
        </div>
        <p>
          After twelve years the cycle starts again with the first number.{" "}
          <Link href="/meaning" className={MORE_LINK}>
            What each number means
          </Link>
          .
        </p>
      </Section>

      <SectionDivider />

      <Section title="5. The total score" id={TOTAL_SCORE_SECTION_ID}>
        <p>
          Add the twelve numbers of the cycle and you have the total score. It can only be 52, 64 or
          76. Across the twelve columns the three rows always add up to 184, and in every cycle 9, 10 or
          11 columns reach 12 or more and drop by 12, which leaves 76, 64 or 52.
        </p>
        <ul className="glass space-y-2 rounded-2xl p-3 text-sm min-[360px]:p-4 sm:p-6">
          {POSSIBLE_TOTALS.map((possible) => (
            <li key={possible} className="flex gap-3">
              <span className="w-8 shrink-0 font-sans tabular-nums text-ink">{possible}</span>
              <span className={possible === totalScore ? "text-gold-deep" : "text-ink"}>
                {interpretTotal(possible).label}
                {possible === totalScore && " (yours)"}
              </span>
            </li>
          ))}
        </ul>
        <p>When you compare with a partner, the two totals together give the overall reading:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Both 76: <span className="text-ink">{STABILITY_TEXT.strong.label}</span>
          </li>
          <li>
            Both 64, or 64 and 76: <span className="text-ink">{STABILITY_TEXT.moderate.label}</span>
          </li>
          <li>
            76 and 52: <span className="text-ink">{STABILITY_TEXT.mixed.label}</span>
          </li>
          <li>
            Both 52: <span className="text-ink">{STABILITY_TEXT.challenging.label}</span>
          </li>
        </ul>
        <p>
          The family&apos;s rules don&apos;t cover 64 and 52. Solini reads that as mixed too, because one
          of you is on steady ground and the other isn&apos;t. That part is our choice, not a family rule.
        </p>
      </Section>

      <div className="mt-16">
        <PillLink href={readingHref}>{isExample ? "See your cycle" : "See the full reading"}</PillLink>
      </div>
    </>
  );
}
