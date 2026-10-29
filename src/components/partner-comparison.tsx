"use client";

/**
 * PartnerComparison
 *
 * Compares the reading on the page with a partner's, year by year, using the
 * family's compatibility rules (src/lib/numerology/compatibility.ts). It
 * rests as one "Compare with a partner" button under the reading. That opens
 * the birth date form in partner mode, and the comparison then shows:
 *
 * - CompatibilitySummary: both total scores, the overall stability
 *   assessment, this year's interaction and a count of each interaction
 * - a table of the 12 years from the visitor's current cycle year, with each
 *   person's number and how the two meet that year, as a symbol and a word
 *   (never color alone)
 * - a link to share the comparison (/r/A+B), its preview card to download,
 *   and a way to remove it
 *
 * HomeClient owns the partner's date, so a shared comparison link can open
 * straight onto it. The partner's date is never saved to the browser.
 */

import { useState } from "react";
import { BirthDataForm } from "@/components/birth-data-form";
import type { CycleResultWithYear } from "@/lib/numerology/derive";
import { computeCycleFromBirthDate } from "@/lib/numerology/derive";
import { interpretYear } from "@/lib/numerology/interpretation";
import { getTierSymbol, getTierTextClass } from "@/lib/numerology/chart-helpers";
import {
  assessStability,
  compareCycles,
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
import { SHARED_COMPARISON_TITLE } from "@/lib/site-copy";

/** A cycle number with its tier symbol, which is decoration beside the number. */
function NumberWithTier({ value }: { value: number }) {
  const tier = interpretYear(value).tier;
  return (
    <span className="inline-flex items-center justify-center gap-1.5 tabular-nums">
      <span className="font-sans text-lg text-ink">{value}</span>
      <span aria-hidden="true" className={`text-xs ${getTierTextClass(tier)}`}>
        {getTierSymbol(tier)}
      </span>
    </span>
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
}

/** Shared look for the quiet text links, matching "Back to the reading". */
const TEXT_LINK_CLASS =
  "pressable inline-flex min-h-[44px] items-center px-2 text-base text-ink-light underline underline-offset-4 decoration-border hover:text-ink active:opacity-70";

export function PartnerComparison({ reading, readingRule, activeYear, partner, onPartnerChange }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  // The partner form starts on the reading's rule, so both are counted alike unless changed.
  const [partnerRule, setPartnerRule] = useState<NewYearRule>(readingRule);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");

  function handlePartnerResult(result: CycleResultWithYear) {
    onPartnerChange({
      year: result.birthYear,
      month: result.birthData.gregorianMonth,
      day: result.birthDay,
      rule: partnerRule,
    });
    setFormOpen(false);
    setShareStatus("idle");
  }

  function handleRemove() {
    onPartnerChange(null);
    setShareStatus("idle");
  }

  // Resting state: one button under the reading.
  if (!partner && !formOpen) {
    return (
      <section aria-label="Compare with a partner" className="mt-10 w-full max-w-[480px] text-center">
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="pressable min-h-[52px] w-full rounded-full border border-border px-6 text-base text-ink hover:border-gold-deep active:scale-[0.97]"
        >
          Compare with a partner
        </button>
        <p className="mt-2 text-sm text-ink-light">
          See how your cycle meets someone else&apos;s, year by year.
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
          Compare with a partner
        </h2>
        <p className="mt-2 text-center text-base text-ink-light">
          Enter your partner&apos;s birth date to see compatibility.
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
  const years = compareCycles(
    reading.cycle,
    reading.birthYear,
    partnerReading.cycle,
    partnerReading.birthYear,
    activeYear
  );
  const readingDate = {
    year: reading.birthYear,
    month: reading.birthData.gregorianMonth,
    day: reading.birthDay,
  };
  const people: [SummaryPerson, SummaryPerson] = [
    { term: "You", date: readingDate, animal: reading.birthData.zodiacAnimal, total: reading.totalScore },
    { term: "Partner", date: partner, animal: partnerReading.birthData.zodiacAnimal, total: partnerReading.totalScore },
  ];
  const sharePath = buildComparisonSharePath({ ...readingDate, rule: readingRule }, partner);

  async function handleShare() {
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
        Your cycles together
      </h2>

      <div className="mt-4">
        <CompatibilitySummary
          people={people}
          assessment={assessStability(reading.totalScore, partnerReading.totalScore)}
          summary={summarizeComparison(years, activeYear)}
          yearCount={years.length}
        />
      </div>

      {/* Year by year, starting with the visitor's current cycle year */}
      <table className="mt-6 w-full border-collapse text-left">
        <caption className="sr-only">Year by year: each person&apos;s number and how they meet</caption>
        <thead>
          <tr className="text-xs uppercase tracking-[0.12em] text-ink-light">
            <th scope="col" className="py-2 pr-2 font-normal">Year</th>
            <th scope="col" className="px-1 py-2 text-center font-normal">You</th>
            <th scope="col" className="px-1 py-2 text-center font-normal">Partner</th>
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
                  <InteractionLabel interaction={row.interaction} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
        {shareStatus === "copied" && "Link copied. It shows both birth dates to anyone who opens it."}
        {shareStatus === "failed" && "Couldn't copy automatically. Copy the link from the address bar instead."}
      </p>
    </section>
  );
}
