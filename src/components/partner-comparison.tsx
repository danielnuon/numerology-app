"use client";

/**
 * PartnerComparison
 *
 * Compares the reading on the page with a partner's, year by year, using the
 * family's compatibility rules (src/lib/numerology/compatibility.ts). It
 * rests as one "Compare with a partner" button under the reading. That opens
 * the birth date form in partner mode, and the comparison then shows:
 *
 * - both total scores and the overall stability assessment
 * - a table of the 12 years from the visitor's current cycle year, with each
 *   person's number and how the two meet that year, as a symbol and a word
 *   (never color alone)
 * - a link to share the comparison (/r/A+B) and a way to remove it
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
  STABILITY_TEXT,
  type YearInteraction,
} from "@/lib/numerology/compatibility";
import { buildComparisonSharePath, type DecodedShare } from "@/lib/numerology/url-encoding";
import type { NewYearRule } from "@/lib/numerology/zodiac";
import { shareLink } from "@/lib/share";
import { SHARED_COMPARISON_TITLE } from "@/lib/site-copy";

/** How each interaction looks and reads: a symbol and a word, so color is never the only cue. */
export const INTERACTION_DISPLAY: Record<
  YearInteraction,
  { symbol: string; label: string; colorClass: string; meaning: string }
> = {
  amplified: {
    symbol: "★",
    label: "Amplified",
    colorClass: "text-gold-deep",
    meaning: "Both years are strong, so the luck builds.",
  },
  stabilized: {
    symbol: "▲",
    label: "Stabilized",
    colorClass: "text-tier-strong",
    meaning: "The stronger year steadies the weaker one.",
  },
  neutral: {
    symbol: "—",
    label: "Neutral",
    colorClass: "text-ink-light",
    meaning: "No strong pull either way.",
  },
  risk: {
    symbol: "▼",
    label: "Risk",
    colorClass: "text-tier-weak",
    meaning: "Both years are low, so weakness compounds. Go gently.",
  },
  unstable: {
    symbol: "⊙",
    label: "Unstable",
    colorClass: "text-ink-light",
    meaning: "A reset year on either side unsettles the pair.",
  },
};

/** The legend lists interactions from most to least supportive. */
const LEGEND_ORDER: YearInteraction[] = ["amplified", "stabilized", "neutral", "risk", "unstable"];

/** "July 24, 1997" for a birth date. */
function formatDate({ year, month, day }: { year: number; month: number; day: number }): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

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

  const comparedPartner = partner;
  const partnerReading = computeCycleFromBirthDate(partner.year, partner.month, partner.day, partner.rule);
  const years = compareCycles(
    reading.cycle,
    reading.birthYear,
    partnerReading.cycle,
    partnerReading.birthYear,
    activeYear
  );
  const assessment = STABILITY_TEXT[assessStability(reading.totalScore, partnerReading.totalScore)];
  const readingDate = {
    year: reading.birthYear,
    month: reading.birthData.gregorianMonth,
    day: reading.birthDay,
  };

  async function handleShare() {
    const path = buildComparisonSharePath({ ...readingDate, rule: readingRule }, comparedPartner);
    const url = new URL(path, window.location.origin).toString();
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

      {/* Whose cycles these are, with each total score */}
      <dl className="mt-4 grid grid-cols-2 gap-3">
        {[
          { term: "You", date: readingDate, animal: reading.birthData.zodiacAnimal, total: reading.totalScore },
          { term: "Partner", date: partner, animal: partnerReading.birthData.zodiacAnimal, total: partnerReading.totalScore },
        ].map((person) => (
          <div key={person.term} className="min-w-0 rounded-xl border border-border p-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-ink-light">{person.term}</dt>
            <dd className="mt-1 text-sm text-ink">{formatDate(person.date)}</dd>
            <dd className="text-sm text-ink-light">Year of the {person.animal}</dd>
            <dd className="mt-2 text-sm text-ink-light">
              Total <span className="font-display text-2xl text-gold-deep">{person.total}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <p className="font-display text-lg text-ink">{assessment.label}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-light">{assessment.description}</p>
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
            const display = INTERACTION_DISPLAY[row.interaction];
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
                  <span className={`inline-flex items-center gap-1.5 ${display.colorClass}`}>
                    <span aria-hidden="true">{display.symbol}</span>
                    {display.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* What each word means */}
      <dl className="mt-5 grid gap-1.5 text-sm">
        {LEGEND_ORDER.map((interaction) => {
          const display = INTERACTION_DISPLAY[interaction];
          return (
            <div key={interaction} className="flex gap-2">
              <dt className={`inline-flex shrink-0 items-center gap-1.5 ${display.colorClass}`}>
                <span aria-hidden="true">{display.symbol}</span>
                {display.label}
              </dt>
              <dd className="text-ink-light">{display.meaning}</dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
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
