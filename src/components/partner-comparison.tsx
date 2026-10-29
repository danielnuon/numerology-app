"use client";

/**
 * PartnerComparison
 *
 * Compares the reading on the page with someone else's (a partner, parent,
 * child or friend), year by year, using Khmer numerology's compatibility rules
 * (src/lib/numerology/compatibility.ts). It rests as one "Compare with
 * someone close" button under the reading. That opens
 * the birth date form in partner mode, and the comparison then shows:
 *
 * - CompatibilitySummary: both total scores, the overall stability
 *   assessment, this year's interaction and a count of each interaction
 * - a Cycle switch between the visitor's current 12-year cycle and up to
 *   two complete cycles before it (Current, Previous, Before that)
 * - a table of the chosen cycle's 12 years, with each person's number and
 *   how the two meet that year, as a symbol and a word (never color alone);
 *   a year before someone's birth reads "Not born yet"
 * - a link to share the comparison (/r/A+B), its preview card to download,
 *   and a way to remove it
 *
 * HomeClient owns the partner's date, so a shared comparison link can open
 * straight onto it. The partner's date is never saved to the browser.
 */

import { addTransitionType, startTransition, useRef, useState, ViewTransition } from "react";
import { BirthDataForm } from "@/components/birth-data-form";
import type { CycleResultWithYear } from "@/lib/numerology/derive";
import { computeCycleFromBirthDate } from "@/lib/numerology/derive";
import { interpretYear } from "@/lib/numerology/interpretation";
import { TierIcon } from "@/components/ui/tier-icon";
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

/** A cycle number with its tier symbol, which is decoration beside the number. */
function NumberWithTier({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="text-ink-light">
        <span aria-hidden="true">—</span>
        <span className="sr-only">Not born yet</span>
      </span>
    );
  }
  const tier = interpretYear(value).tier;
  return (
    <span className="inline-flex items-center justify-center gap-1.5 tabular-nums">
      <span className="font-sans text-lg text-ink">{value}</span>
      <TierIcon tier={tier} />
    </span>
  );
}

/** Names for the cycles a comparison offers, newest first. */
const CYCLE_NAMES = ["Current", "Previous", "Before that"];

/** Accessible names that say "cycle", since the visible tab names lean on the "Cycle" heading. */
const CYCLE_FULL_NAMES = ["Current cycle", "Previous cycle", "Cycle before that"];

/**
 * Picks which 12-year cycle the comparison shows. Tabs pattern, like the
 * reading's Year / Cycle switch: arrow keys move the choice and focus
 * together, and the ink outline glides to the chosen cycle.
 */
function CycleTabs({ starts, selected, onChange }: { starts: number[]; selected: number; onChange: (start: number) => void }) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    const last = starts.length - 1;
    const next = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    tabRefs.current[next]?.focus();
    onChange(starts[next]);
  }

  return (
    <div className="mt-5">
      <p id="compare-cycle-label" className="text-xs uppercase tracking-[0.12em] text-ink-light">Cycle</p>
      <div
        role="tablist"
        aria-labelledby="compare-cycle-label"
        className={`mt-2 grid gap-1 rounded-2xl border border-border p-1 ${starts.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}
      >
        {starts.map((start, index) => {
          const isSelected = start === selected;
          return (
            <button
              key={start}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`compare-cycle-tab-${start}`}
              aria-selected={isSelected}
              aria-controls="compare-cycle-panel"
              aria-label={`${CYCLE_FULL_NAMES[index]}, ${start} to ${start + 11}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange(start)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={[
                "pressable relative flex min-h-[52px] min-w-0 flex-col items-center justify-center rounded-xl px-1 active:scale-[0.97]",
                isSelected ? "text-ink" : "text-ink-light hover:text-ink",
              ].join(" ")}
            >
              {isSelected && (
                <ViewTransition name="compare-cycle-selection" share="auto" default="none">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-xl bg-ink/[0.06] ring-1 ring-inset ring-ink"
                  />
                </ViewTransition>
              )}
              <span className={`relative text-sm ${isSelected ? "font-medium" : ""}`}>{CYCLE_NAMES[index]}</span>
              <span className="relative text-xs tabular-nums">
                {start}–{start + 11}
              </span>
            </button>
          );
        })}
      </div>
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
  const years = compareCycles(
    reading.cycle,
    reading.birthYear,
    partnerReading.cycle,
    partnerReading.birthYear,
    cycleStart
  );
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

      {cycleStarts.length > 1 && (
        <CycleTabs starts={cycleStarts} selected={cycleStart} onChange={handleCycleChange} />
      )}

      {/* The chosen cycle crossfades in place */}
      <ViewTransition update={{ "compare-cycle": "panel-swap", default: "none" }} default="none">
        <div
          id="compare-cycle-panel"
          {...(cycleStarts.length > 1 && { role: "tabpanel", "aria-labelledby": `compare-cycle-tab-${cycleStart}` })}
        >
          <div className="mt-4">
            <CompatibilitySummary
              people={people}
              assessment={assessStability(reading.totalScore, partnerReading.totalScore)}
              summary={summarizeComparison(years, activeYear)}
              cycle={{ start: cycleStart, end: cycleStart + 11 }}
            />
          </div>

          {/* Year by year through the chosen cycle */}
          <table className="mt-6 w-full border-collapse text-left">
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
                  <tr key={row.year} className="border-t border-border-light">
                    <th scope="row" className={`py-2 pr-2 text-sm ${isNow ? "font-semibold text-gold-deep" : "font-normal text-ink-light"}`}>
                      {row.year}
                      {isNow && <span className="block text-xs uppercase tracking-[0.12em]">Now</span>}
                    </th>
                    <td className="px-1 py-2 text-center"><NumberWithTier value={row.firstNumber} /></td>
                    <td className="px-1 py-2 text-center"><NumberWithTier value={row.secondNumber} /></td>
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
        </div>
      </ViewTransition>

      {/* What each word means */}
      <dl className="mt-5 grid gap-1.5 text-sm">
        {INTERACTION_ORDER.map((interaction) => (
          <div key={interaction} className="flex gap-2">
            <dt className="shrink-0">
              <InteractionLabel interaction={interaction} />
            </dt>
            <dd className="text-ink-light">{INTERACTION_TEXT[interaction].meaning}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleShare}
            className={[
              "pressable inline-flex min-h-[44px] items-center justify-center rounded-full px-5",
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
            className={[
              "pressable inline-flex min-h-[44px] items-center justify-center rounded-full px-5",
              "border border-border text-sm text-ink-light tracking-[0.04em]",
              "hover:text-ink hover:border-gold active:scale-[0.97]",
            ].join(" ")}
          >
            Download image
          </a>
        </div>
        <button type="button" onClick={handleRemove} className={TEXT_LINK_CLASS}>
          Remove comparison
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
    </section>
  );
}
