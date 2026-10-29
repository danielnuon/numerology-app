"use client";

/**
 * PartnerComparison
 *
 * Compares the reading on the page with someone else's (a partner, parent,
 * child or friend), year by year, using the family's compatibility rules
 * (src/lib/numerology/compatibility.ts). It rests as one "Compare with
 * someone close" button under the reading. That opens
 * the birth date form in partner mode, and the comparison then shows:
 *
 * - CompatibilitySummary: both total scores, the overall stability
 *   assessment and this year's interaction
 * - a cycle stepper between the visitor's current 12-year cycle and up to
 *   two complete cycles before it
 * - a table of the chosen cycle's 12 years, with each person's number and
 *   how the two meet that year, as a symbol and a word (never color alone);
 *   a year before someone's birth reads "Not born yet"
 * - a button to share the comparison (/r/A+B), with quiet links to download
 *   its preview card and to remove it
 * - "How to read this", closed by default: what each interaction word means
 *   and a link to how the totals are read
 *
 * HomeClient owns the partner's date, so a shared comparison link can open
 * straight onto it. The partner's date is never saved to the browser.
 */

import { addTransitionType, startTransition, useId, useState, ViewTransition } from "react";
import Link from "next/link";
import { BirthDataForm } from "@/components/birth-data-form";
import type { CycleResultWithYear } from "@/lib/numerology/derive";
import { computeCycleFromBirthDate } from "@/lib/numerology/derive";
import {
  assessStability,
  compareCycles,
  comparisonCycleStarts,
  INTERACTION_ORDER,
  INTERACTION_TEXT,
  summarizeComparison,
} from "@/lib/numerology/compatibility";
import {
  CompatibilitySummary,
  InteractionLabel,
  type SummaryPerson,
} from "@/components/compatibility-summary";
import { buildComparisonSharePath, encodeBirthDate, type DecodedShare } from "@/lib/numerology/url-encoding";
import type { NewYearRule } from "@/lib/numerology/zodiac";
import { shareLink } from "@/lib/share";
import { trackEvent } from "@/lib/track";
import { SHARED_COMPARISON_TITLE } from "@/lib/site-copy";
import { MORE_LINK, TOTAL_SCORE_SECTION_ID } from "@/components/ui/page-parts";

/** A cycle number in the table; the wheel and the reading carry each year's tier. */
function CycleNumber({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="text-ink-light">
        <span aria-hidden="true">—</span>
        <span className="sr-only">Not born yet</span>
      </span>
    );
  }
  return <span className="font-sans text-base tabular-nums">{value}</span>;
}

/** Interface chevron, matching the zodiac line weight. */
function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d={direction === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} />
    </svg>
  );
}

/**
 * Steps between the 12-year cycles a comparison offers, newest first: the
 * left arrow goes back a cycle, the right one forward. The label between
 * them names the cycle shown and, when one person was born partway through
 * it, how many years the two share.
 */
function CycleStepper({
  starts,
  selected,
  sharedYears,
  onChange,
}: {
  starts: number[];
  selected: number;
  sharedYears: number;
  onChange: (start: number) => void;
}) {
  const index = starts.indexOf(selected);
  const earlier = starts[index + 1];
  const later = index > 0 ? starts[index - 1] : undefined;
  const stepClass =
    "pressable grid size-11 shrink-0 place-items-center rounded-full text-ink-light hover:text-ink active:scale-[0.97] disabled:pointer-events-none disabled:opacity-30";
  return (
    <div className="mt-5 flex items-center justify-between gap-2">
      <button
        type="button"
        aria-label="Earlier cycle"
        disabled={earlier === undefined}
        onClick={() => earlier !== undefined && onChange(earlier)}
        className={stepClass}
      >
        <Chevron direction="left" />
      </button>
      <p aria-live="polite" className="text-center text-xs uppercase tracking-[0.12em] text-ink-light tabular-nums">
        Cycle {selected}–{selected + 11}
        {sharedYears < 12 && ` · ${sharedYears} years together`}
      </p>
      <button
        type="button"
        aria-label="Later cycle"
        disabled={later === undefined}
        onClick={() => later !== undefined && onChange(later)}
        className={stepClass}
      >
        <Chevron direction="right" />
      </button>
    </div>
  );
}

/**
 * What each interaction word means and how the totals are read, closed until
 * asked for, at the end of the comparison where readers look for it.
 */
function HowToRead() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="mt-2 border-t border-border-light pt-1">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="pressable flex min-h-[44px] w-full items-center justify-between gap-2 text-left text-sm text-ink-light hover:text-ink active:scale-[0.97]"
      >
        How to read this
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-4 transition-transform duration-[var(--duration-gentle)] ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 6l5 5 5-5" />
        </svg>
      </button>
      {open && (
        <div id={panelId} className="animate-settle-in pb-2">
          <dl className="grid gap-1.5 text-sm">
            {INTERACTION_ORDER.map((interaction) => (
              <div key={interaction} className="flex gap-2">
                <dt className="shrink-0">
                  <InteractionLabel interaction={interaction} />
                </dt>
                <dd className="text-ink-light">{INTERACTION_TEXT[interaction].meaning}</dd>
              </div>
            ))}
          </dl>
          <Link href={`/how-it-works#${TOTAL_SCORE_SECTION_ID}`} className={`${MORE_LINK} mt-3 inline-block text-sm`}>
            How the totals are read
          </Link>
        </div>
      )}
    </div>
  );
}

interface Props {
  /** The reading on the page: the visitor's, or the one a share link opened. */
  reading: CycleResultWithYear;
  /** The New Year rule the reading on the page is counted with. */
  readingRule: NewYearRule;
  /** The visitor's current cycle year (see getActiveYear); the table starts here. */
  activeYear: number;
  /** The partner's birth date and rule, or null before one is entered. */
  partner: DecodedShare | null;
  /** Called with the partner's date on "Compare", and with null on "Remove comparison". */
  onPartnerChange: (partner: DecodedShare | null) => void;
  /** True when the reading came from someone else's share link, so the visitor compares it with their own. */
  isShared?: boolean;
}

/**
 * What the comparison calls each person. On the visitor's own reading they
 * are "You" and "Them". On a shared reading the visitor enters their own
 * date, so the order flips; a shared comparison holds neither, so it
 * numbers them.
 */
function personTerms(isShared: boolean, enteredHere: boolean): [string, string] {
  if (!isShared) return ["You", "Them"];
  return enteredHere ? ["Them", "You"] : ["First", "Second"];
}

/** Shared look for the quiet text links, matching "Back to the reading". */
const TEXT_LINK_CLASS =
  "pressable inline-flex min-h-[44px] items-center px-2 text-base text-ink-light underline underline-offset-4 decoration-border hover:text-ink active:opacity-70";

export function PartnerComparison({ reading, readingRule, activeYear, partner, onPartnerChange, isShared = false }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  // True once the second date comes from this form rather than a shared comparison link
  const [enteredHere, setEnteredHere] = useState(false);
  // The partner form starts on the reading's rule, so both are counted alike unless changed.
  const [partnerRule, setPartnerRule] = useState<NewYearRule>(readingRule);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");
  // The cycle's first year; null follows the current cycle.
  const [pickedCycle, setPickedCycle] = useState<number | null>(null);

  function handleCycleChange(start: number) {
    startTransition(() => {
      addTransitionType("compare-cycle");
      setPickedCycle(start);
    });
  }

  function handlePartnerResult(result: CycleResultWithYear) {
    trackEvent("Comparison made", isShared);
    onPartnerChange({
      year: result.birthYear,
      month: result.birthData.gregorianMonth,
      day: result.birthDay,
      rule: partnerRule,
    });
    setEnteredHere(true);
    setFormOpen(false);
    setShareStatus("idle");
  }

  function handleRemove() {
    onPartnerChange(null);
    setShareStatus("idle");
    setPickedCycle(null);
  }

  // Resting state: one button under the reading.
  if (!partner && !formOpen) {
    return (
      <section aria-label="Compare cycles" className="mt-10 w-full max-w-[480px] text-center">
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="pressable min-h-[52px] w-full rounded-full border border-border px-6 text-base text-ink hover:border-gold-deep active:scale-[0.97]"
        >
          {isShared ? "Compare it with yours" : "Compare with someone close"}
        </button>
        <p className="mt-2 text-sm text-ink-light">
          {isShared
            ? "See how this cycle meets your own, year by year."
            : "A partner, parent, child or friend: see how your cycles meet, year by year."}
        </p>
      </section>
    );
  }

  // Entering the partner's date.
  if (!partner) {
    return (
      <section
        aria-labelledby="compare-heading"
        className="animate-settle-in glass mt-10 w-full max-w-[480px] rounded-2xl p-6 sm:p-10"
      >
        <h2 id="compare-heading" className="text-center font-display text-2xl leading-tight tracking-[0.03em] text-ink">
          {isShared ? "Compare it with yours" : "Compare with someone close"}
        </h2>
        <p className="mt-2 text-center text-base text-ink-light">
          {isShared
            ? "Enter your birth date to see how the two cycles meet."
            : "Enter their birth date to see how your cycles meet."}
        </p>
        <BirthDataForm
          mode="partner"
          onResult={handlePartnerResult}
          newYearRule={partnerRule}
          onNewYearRuleChange={setPartnerRule}
        />
        <button type="button" onClick={() => setFormOpen(false)} className={`${TEXT_LINK_CLASS} mx-auto mt-3 flex`}>
          Cancel
        </button>
      </section>
    );
  }

  const partnerReading = computeCycleFromBirthDate(partner.year, partner.month, partner.day, partner.rule);
  const cycleStarts = comparisonCycleStarts(reading.birthYear, partnerReading.birthYear, activeYear);
  const cycleStart = pickedCycle !== null && cycleStarts.includes(pickedCycle) ? pickedCycle : cycleStarts[0];
  const yearsFrom = (start: number) =>
    compareCycles(reading.cycle, reading.birthYear, partnerReading.cycle, partnerReading.birthYear, start);
  const years = yearsFrom(cycleStart);
  // This year's interaction always comes from the current cycle, whichever one the table shows
  const now = summarizeComparison(yearsFrom(cycleStarts[0]), activeYear).current;
  const readingDate = {
    year: reading.birthYear,
    month: reading.birthData.gregorianMonth,
    day: reading.birthDay,
  };
  const terms = personTerms(isShared, enteredHere);
  const people: [SummaryPerson, SummaryPerson] = [
    { term: terms[0], date: readingDate, animal: reading.birthData.zodiacAnimal, total: reading.totalScore },
    { term: terms[1], date: partner, animal: partnerReading.birthData.zodiacAnimal, total: partnerReading.totalScore },
  ];
  const sharePath = buildComparisonSharePath({ ...readingDate, rule: readingRule }, partner);

  async function handleShare() {
    trackEvent("Comparison shared", isShared);
    const url = new URL(sharePath, window.location.origin).toString();
    const outcome = await shareLink({
      url,
      title: SHARED_COMPARISON_TITLE,
      text: "Here's how our Khmer numerology cycles meet, year by year. See it on Solini.",
    });
    if (outcome === "copied" || outcome === "failed") setShareStatus(outcome);
  }

  return (
    <section
      aria-labelledby="compare-heading"
      className="animate-settle-in glass mt-10 w-full max-w-[640px] rounded-2xl p-4 min-[360px]:p-5 sm:p-8"
    >
      <h2 id="compare-heading" className="font-display text-2xl leading-tight tracking-[0.03em] text-ink">
        {isShared && !enteredHere ? "Two cycles together" : "Your cycles together"}
      </h2>

      <div className="mt-4">
        <CompatibilitySummary
          people={people}
          assessment={assessStability(reading.totalScore, partnerReading.totalScore)}
          current={now?.interaction ? { year: now.year, interaction: now.interaction } : null}
        />
      </div>

      {cycleStarts.length > 1 ? (
        <CycleStepper
          starts={cycleStarts}
          selected={cycleStart}
          sharedYears={summarizeComparison(years, activeYear).sharedYears}
          onChange={handleCycleChange}
        />
      ) : (
        <p className="mt-5 text-center text-xs uppercase tracking-[0.12em] text-ink-light tabular-nums">
          Cycle {cycleStart}–{cycleStart + 11}
        </p>
      )}

      {/* The chosen cycle crossfades in place */}
      <ViewTransition update={{ "compare-cycle": "panel-swap", default: "none" }} default="none">
        <table className="mt-2 w-full border-collapse text-left">
          <caption className="sr-only">
            Year by year from {cycleStart} to {cycleStart + 11}: each person&apos;s number and how they meet
          </caption>
          <thead>
            <tr className="text-xs uppercase tracking-[0.12em] text-ink-light">
              <th scope="col" className="py-2 pr-2 font-normal">Year</th>
              <th scope="col" className="px-1 py-2 text-center font-normal">{terms[0]}</th>
              <th scope="col" className="px-1 py-2 text-center font-normal">{terms[1]}</th>
              <th scope="col" className="py-2 pl-2 font-normal">Together</th>
            </tr>
          </thead>
          <tbody>
            {years.map((row) => {
              const isNow = row.year === activeYear;
              return (
                <tr key={row.year} className={`border-t border-border-light ${isNow ? "text-gold-deep" : "text-ink"}`}>
                  <th scope="row" className={`py-2 pr-2 text-sm tabular-nums ${isNow ? "font-semibold" : "font-normal text-ink-light"}`}>
                    {row.year}
                    {isNow && <span className="block text-xs uppercase tracking-[0.12em]">Now</span>}
                  </th>
                  <td className="px-1 py-2 text-center"><CycleNumber value={row.firstNumber} /></td>
                  <td className="px-1 py-2 text-center"><CycleNumber value={row.secondNumber} /></td>
                  <td className="py-2 pl-2 text-sm">
                    {row.interaction ? (
                      <InteractionLabel interaction={row.interaction} />
                    ) : (
                      <span className="text-ink-light">Not born yet</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ViewTransition>

      <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1">
        <button
          type="button"
          onClick={handleShare}
          className={[
            "pressable mr-2 inline-flex min-h-[44px] items-center justify-center rounded-full px-5",
            "border border-gold-deep text-base text-gold-deep",
            "hover:bg-gold-deep hover:text-parchment",
            "active:scale-[0.97] active:bg-gold-deep active:text-parchment",
          ].join(" ")}
        >
          Share this comparison
        </button>
        {/* The link's preview card is the summary as a 1200×630 image */}
        <a
          href={`${sharePath}/opengraph-image`}
          download={`solini-comparison-${encodeBirthDate(readingDate.year, readingDate.month, readingDate.day)}-${encodeBirthDate(partner.year, partner.month, partner.day)}.png`}
          className={TEXT_LINK_CLASS}
        >
          Download image
        </a>
        <button type="button" onClick={handleRemove} aria-label="Remove comparison" className={TEXT_LINK_CLASS}>
          Remove
        </button>
      </div>
      <p role="status" className="mt-2 min-h-[1.25rem] text-sm text-ink-light">
        {shareStatus === "copied" && (
          <span className="animate-settle-in inline-block">Link copied. It shows both birth dates to anyone who opens it.</span>
        )}
        {shareStatus === "failed" && (
          <span className="animate-settle-in inline-block">Couldn&apos;t copy automatically. Copy the link from the address bar instead.</span>
        )}
      </p>

      <HowToRead />
    </section>
  );
}
