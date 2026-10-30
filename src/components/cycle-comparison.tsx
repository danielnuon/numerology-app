"use client";

/**
 * CycleComparison
 *
 * Compares the reading on the page with the cycles of up to five more
 * people (a partner, parents, children, friends: a household), year by
 * year, using Khmer numerology's compatibility rules and, for three or more
 * people, Solini's extension of them (src/lib/numerology/compatibility.ts).
 * It rests as one "Compare with someone close" button under the reading.
 * That opens the birth date form in partner mode, and the comparison then
 * shows:
 *
 * - CompatibilitySummary: everyone's total score, each removable but the
 *   first, the overall stability assessment and this year's interaction
 * - "Add someone", which opens the same form in the card, up to six people
 * - for three or more, a note that this reading is Solini's extension, with
 *   a link to the rule
 * - a cycle stepper between the visitor's current 12-year cycle and up to
 *   two complete cycles before it
 * - a table of the chosen cycle's 12 years, with each person's number and
 *   how they meet that year, as a symbol and a word (never color alone);
 *   a year before someone's birth reads "Not born yet"
 * - for three or more, "Pair by pair": this year's interaction for every
 *   pair, by the pair rule alone, so the group's year can be checked
 * - a button to share the comparison (/r/A+B+C, names in ?n=), with quiet
 *   links to download its preview card and to remove everyone
 * - "How to read this", closed by default: what each interaction word means
 *   and links to how the totals and groups are read
 *
 * HomeClient owns the other people, so a shared comparison link can open
 * straight onto them. Their dates and names are never saved to the browser.
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
  MAX_COMPARED_PEOPLE,
  pairInteractions,
  summarizeComparison,
} from "@/lib/numerology/compatibility";
import {
  CompatibilitySummary,
  InteractionLabel,
  type SummaryPerson,
} from "@/components/compatibility-summary";
import { buildComparisonSharePath, encodeBirthDate, type DecodedShare } from "@/lib/numerology/url-encoding";
import type { NewYearRule, ZodiacAnimal } from "@/lib/numerology/zodiac";
import { shareLink } from "@/lib/share";
import { trackEvent } from "@/lib/track";
import { peopleCountWord, sharedComparisonTitle } from "@/lib/site-copy";
import { HOUSEHOLD_SECTION_ID, MORE_LINK, TOTAL_SCORE_SECTION_ID } from "@/components/ui/page-parts";
import { Reveal } from "@/components/ui/reveal";

/** Someone compared with the reading on the page. */
export interface ComparedPerson {
  share: DecodedShare;
  /** The name they were given, or null. */
  name: string | null;
  /** True for the visitor themselves, entered on someone else's shared reading. */
  isVisitor: boolean;
}

/** A cycle number in the table; the wheel and the reading carry each year's tier. */
function CycleNumber({ value, isCompact = false }: { value: number | null; isCompact?: boolean }) {
  if (value === null) {
    return (
      <span className="text-ink-light">
        <span aria-hidden="true">—</span>
        <span className="sr-only">Not born yet</span>
      </span>
    );
  }
  return <span className={`font-sans tabular-nums ${isCompact ? "text-sm sm:text-base" : "text-base"}`}>{value}</span>;
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
 * The one surface the comparison lives on, whichever state it is in, so a
 * change of state morphs it in place (class `reading-bloom` in globals.css).
 */
function CompareCard({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition name="compare-card" update={{ "compare-morph": "reading-bloom", default: "none" }} default="none">
      {children}
    </ViewTransition>
  );
}

/**
 * What each interaction word means and how the totals are read, closed until
 * asked for, at the end of the comparison where readers look for it.
 */
function HowToRead({ isGroup }: { isGroup: boolean }) {
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
          className={`size-4 transition-transform duration-[var(--duration-standard)] ease-standard ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 6l5 5 5-5" />
        </svg>
      </button>
      <Reveal open={open} id={panelId} className="pb-2">
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
        <p className="mt-3 flex flex-col items-start gap-2 text-sm">
          <Link href={`/how-it-works#${TOTAL_SCORE_SECTION_ID}`} className={MORE_LINK}>
            How the totals are read
          </Link>
          {isGroup && (
            <Link href={`/how-it-works#${HOUSEHOLD_SECTION_ID}`} className={MORE_LINK}>
              How three or more people are read
            </Link>
          )}
        </p>
      </Reveal>
    </div>
  );
}

/**
 * This year's interaction for every pair, by Khmer numerology's pair rule
 * alone, closed until asked for. Only a comparison of three or more has it,
 * since for two the pair is the whole comparison.
 */
function PairByPair({ year, numbers, terms }: { year: number; numbers: (number | null)[]; terms: string[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const pairs = pairInteractions(numbers);
  if (pairs.length === 0) return null;
  return (
    <div className="mt-4 border-t border-border-light pt-1">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="pressable flex min-h-[44px] w-full items-center justify-between gap-2 text-left text-sm text-ink-light hover:text-ink active:scale-[0.97]"
      >
        Pair by pair, {year}
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-4 transition-transform duration-[var(--duration-standard)] ease-standard ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 6l5 5 5-5" />
        </svg>
      </button>
      <Reveal open={open} id={panelId} className="pb-2">
        <p className="text-sm text-ink-light">Khmer numerology&apos;s own rule, two people at a time.</p>
        <ul className="mt-2 grid gap-1.5 text-sm">
          {pairs.map(({ first, second, interaction }) => (
            <li key={`${first}-${second}`} className="flex flex-wrap justify-between gap-x-3">
              <span className="text-ink">
                {terms[first]} &amp; {terms[second]}
              </span>
              <InteractionLabel interaction={interaction} />
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}

interface Props {
  /** The reading on the page: the visitor's, or the one a share link opened. */
  reading: CycleResultWithYear;
  /** The New Year rule the reading on the page is counted with. */
  readingRule: NewYearRule;
  /** The reading's owner's name from a shared comparison link, or null. */
  readingName?: string | null;
  /** The visitor's current cycle year (see getActiveYear); the table starts here. */
  activeYear: number;
  /** Everyone compared with the reading, in order; empty before anyone is added. */
  others: ComparedPerson[];
  /** Called with the new list when someone is added or removed. */
  onOthersChange: (others: ComparedPerson[]) => void;
  /** True when the reading came from someone else's share link, so the visitor compares it with their own. */
  isShared?: boolean;
}

/** One person as the labels need them. */
interface LabeledPerson {
  name: string | null;
  isVisitor: boolean;
  animal: ZodiacAnimal;
}

/**
 * What the comparison calls each person: their name if they have one, "You"
 * for the visitor, and otherwise "Them" opposite the visitor in a pair, or
 * their zodiac animal, numbered when two share one ("Ox", "Ox 2").
 */
export function personTerms(people: readonly LabeledPerson[]): string[] {
  const seen = new Map<ZodiacAnimal, number>();
  return people.map((person, index) => {
    if (person.name) return person.name;
    if (person.isVisitor) return "You";
    if (people.length === 2 && people[1 - index].isVisitor) return "Them";
    const count = (seen.get(person.animal) ?? 0) + 1;
    seen.set(person.animal, count);
    return count === 1 ? person.animal : `${person.animal} ${count}`;
  });
}

/** Shared look for the quiet text links, matching "Back to the reading". */
const TEXT_LINK_CLASS =
  "pressable inline-flex min-h-[44px] items-center px-2 text-base text-ink-light underline underline-offset-4 decoration-border hover:text-ink active:opacity-70";

export function CycleComparison({
  reading,
  readingRule,
  readingName = null,
  activeYear,
  others,
  onOthersChange,
  isShared = false,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  // The form starts on the reading's rule, so everyone is counted alike unless changed.
  const [partnerRule, setPartnerRule] = useState<NewYearRule>(readingRule);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");
  // The cycle's first year; null follows the current cycle.
  const [pickedCycle, setPickedCycle] = useState<number | null>(null);

  // The card changes between its states (the button, the form, the
  // comparison) as one surface that grows or shrinks in place, the same
  // morph as the birth date form blooming into the reading.
  function morph(update: () => void) {
    startTransition(() => {
      addTransitionType("compare-morph");
      update();
    });
  }

  function handleCycleChange(start: number) {
    startTransition(() => {
      addTransitionType("compare-cycle");
      setPickedCycle(start);
    });
  }

  // On a shared reading, the first person added is the visitor themselves.
  const isAddingVisitor = isShared && others.length === 0;

  function handlePartnerResult(result: CycleResultWithYear, name: string | null) {
    trackEvent("Comparison made", isShared);
    morph(() => {
      onOthersChange([
        ...others,
        {
          share: {
            year: result.birthYear,
            month: result.birthData.gregorianMonth,
            day: result.birthDay,
            rule: partnerRule,
          },
          name,
          isVisitor: isAddingVisitor,
        },
      ]);
      setFormOpen(false);
      setShareStatus("idle");
    });
  }

  function handleRemove(index: number) {
    morph(() => {
      // Index 0 is the reading itself, so others start at 1
      onOthersChange(others.filter((_, i) => i !== index - 1));
      setShareStatus("idle");
    });
  }

  function handleRemoveAll() {
    morph(() => {
      onOthersChange([]);
      setShareStatus("idle");
      setPickedCycle(null);
    });
  }

  // Resting state: one button under the reading.
  if (others.length === 0 && !formOpen) {
    return (
      <CompareCard>
        <section aria-label="Compare cycles" className="mt-10 w-full max-w-[480px] text-center">
          <button
            type="button"
            onClick={() => morph(() => setFormOpen(true))}
            className="pressable min-h-[52px] w-full rounded-full border border-border px-6 text-base text-ink hover:border-gold-deep active:scale-[0.97]"
          >
            {isShared ? "Compare it with yours" : "Compare with someone close"}
          </button>
          <p className="mt-2 text-sm text-ink-light">
            {isShared
              ? "See how this cycle meets your own, year by year."
              : "A partner, parent, child or friend, or your whole household: see how your cycles meet, year by year."}
          </p>
        </section>
      </CompareCard>
    );
  }

  // Entering someone's date: the first person, or one more.
  if (formOpen) {
    const isFirst = others.length === 0;
    const heading = !isFirst ? "Add someone" : isShared ? "Compare it with yours" : "Compare with someone close";
    const intro = isAddingVisitor
      ? "Enter your birth date to see how the two cycles meet."
      : isFirst
        ? "Enter their birth date to see how your cycles meet."
        : "Enter their birth date to add them to the comparison.";
    return (
      <CompareCard>
        <section
          aria-labelledby="compare-heading"
          className="glass mt-10 w-full max-w-[480px] rounded-2xl p-6 sm:p-10"
        >
          <h2 id="compare-heading" className="text-center font-display text-2xl leading-tight tracking-[0.03em] text-ink">
            {heading}
          </h2>
          <p className="mt-2 text-center text-base text-ink-light">{intro}</p>
          <BirthDataForm
            mode="partner"
            askName={!isAddingVisitor}
            onResult={handlePartnerResult}
            newYearRule={partnerRule}
            onNewYearRuleChange={setPartnerRule}
          />
          <button type="button" onClick={() => morph(() => setFormOpen(false))} className={`${TEXT_LINK_CLASS} mx-auto mt-3 flex`}>
            Cancel
          </button>
        </section>
      </CompareCard>
    );
  }

  const readings = [
    reading,
    ...others.map(({ share }) => computeCycleFromBirthDate(share.year, share.month, share.day, share.rule)),
  ];
  const readingShare: DecodedShare = {
    year: reading.birthYear,
    month: reading.birthData.gregorianMonth,
    day: reading.birthDay,
    rule: readingRule,
  };
  const shares = [readingShare, ...others.map((other) => other.share)];
  const names = [readingName, ...others.map((other) => other.name)];
  const terms = personTerms([
    { name: readingName, isVisitor: !isShared, animal: reading.birthData.zodiacAnimal },
    ...others.map((other, i) => ({ ...other, animal: readings[i + 1].birthData.zodiacAnimal })),
  ]);
  const count = readings.length;
  const isGroup = count > 2;
  const hasVisitor = !isShared || others.some((other) => other.isVisitor);

  const cycleStarts = comparisonCycleStarts(
    reading.birthYear,
    readings.slice(1).map((r) => r.birthYear),
    activeYear
  );
  const cycleStart = pickedCycle !== null && cycleStarts.includes(pickedCycle) ? pickedCycle : cycleStarts[0];
  const yearsFrom = (start: number) => compareCycles(readings, start);
  const years = yearsFrom(cycleStart);
  // This year's interaction always comes from the current cycle, whichever one the table shows
  const now = summarizeComparison(yearsFrom(cycleStarts[0]), activeYear).current;
  const people: SummaryPerson[] = readings.map((r, i) => ({
    term: terms[i],
    date: shares[i],
    animal: r.birthData.zodiacAnimal,
    total: r.totalScore,
  }));
  const sharePath = buildComparisonSharePath(shares, names);
  // The preview card can't read the query string, so it never shows names
  const imagePath = `${buildComparisonSharePath(shares)}/opengraph-image`;
  const hasNames = names.some((name) => name !== null);

  async function handleShare() {
    trackEvent("Comparison shared", isShared);
    const url = new URL(sharePath, window.location.origin).toString();
    const outcome = await shareLink({
      url,
      title: sharedComparisonTitle(count),
      text: "Here's how our Khmer numerology cycles meet, year by year. See it on Solini.",
    });
    if (outcome === "copied" || outcome === "failed") setShareStatus(outcome);
  }

  return (
    <CompareCard>
      <section
        aria-labelledby="compare-heading"
        className="glass mt-10 w-full max-w-[640px] rounded-2xl p-4 min-[360px]:p-5 sm:p-8"
      >
        <h2 id="compare-heading" className="font-display text-2xl leading-tight tracking-[0.03em] text-ink">
          {hasVisitor ? "Your cycles together" : `${peopleCountWord(count)} cycles together`}
        </h2>

        <div className="mt-4">
          <CompatibilitySummary
            people={people}
            assessment={assessStability(readings.map((r) => r.totalScore))}
            current={now?.interaction ? { year: now.year, interaction: now.interaction } : null}
            onRemove={handleRemove}
          >
            {isGroup && (
              <p className="mt-2 text-sm leading-relaxed text-ink-light">
                Khmer numerology compares two people at a time. For three or more, Solini extends its pair
                rule.{" "}
                <Link href={`/how-it-works#${HOUSEHOLD_SECTION_ID}`} className={MORE_LINK}>
                  See how
                </Link>
              </p>
            )}
          </CompatibilitySummary>
        </div>

        <div className="mt-4">
          {count < MAX_COMPARED_PEOPLE ? (
            <button
              type="button"
              onClick={() => morph(() => setFormOpen(true))}
              className="pressable inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border px-5 text-base text-ink hover:border-gold-deep active:scale-[0.97]"
            >
              <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="size-4 text-gold-deep">
                <path d="M8 3v10M3 8h10" />
              </svg>
              Add someone
            </button>
          ) : (
            <p className="text-sm text-ink-light">Six people is the most one comparison holds.</p>
          )}
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
          <table className="mt-2 w-full table-fixed border-collapse text-left">
            <caption className="sr-only">
              Year by year from {cycleStart} to {cycleStart + 11}: each person&apos;s number and how they meet
            </caption>
            {/* On a phone the year and Together columns narrow, so names fit
                beside them and six people's numbers fit at 320px; "▼ Low
                together" then wraps */}
            <colgroup>
              <col className="w-[2.5rem] sm:w-[3.25rem]" />
              {terms.map((term, i) => (
                <col key={i} />
              ))}
              {/* From sm, wide enough for "▼ Low together", the longest word, on one line */}
              <col className="w-[5.5rem] sm:w-[8.5rem]" />
            </colgroup>
            <thead>
              <tr className="text-xs uppercase tracking-[0.12em] text-ink-light">
                <th scope="col" className="py-2 pr-1 align-bottom font-normal sm:pr-2">Year</th>
                {terms.map((term, i) => (
                  <th
                    key={i}
                    scope="col"
                    title={term}
                    className={`px-0.5 py-2 text-center align-bottom font-normal ${isGroup ? "" : "truncate"}`}
                  >
                    {isGroup ? (
                      // A group's columns are too narrow for names on a phone, so they read upward there
                      <span className="mx-auto block max-h-[5.5rem] truncate [writing-mode:vertical-rl] rotate-180 sm:max-h-none sm:rotate-0 sm:[writing-mode:horizontal-tb]">
                        {term}
                      </span>
                    ) : (
                      term
                    )}
                  </th>
                ))}
                <th scope="col" className="py-2 pl-1 align-bottom font-normal sm:pl-2">Together</th>
              </tr>
            </thead>
            <tbody>
              {years.map((row) => {
                const isNow = row.year === activeYear;
                return (
                  <tr key={row.year} className={`border-t border-border-light ${isNow ? "text-gold-deep" : "text-ink"}`}>
                    <th scope="row" className={`py-2 pr-1 text-sm tabular-nums sm:pr-2 ${isNow ? "font-semibold" : "font-normal text-ink-light"}`}>
                      {row.year}
                      {isNow && <span className="block text-xs uppercase tracking-[0.12em]">Now</span>}
                    </th>
                    {row.numbers.map((value, i) => (
                      <td key={i} className="px-0.5 py-2 text-center"><CycleNumber value={value} isCompact={isGroup} /></td>
                    ))}
                    <td className="py-2 pl-1 text-sm sm:pl-2">
                      {row.interaction ? (
                        <>
                          <InteractionLabel interaction={row.interaction} />
                          {/* In a group, say whose reset unsettles the year */}
                          {isGroup && row.resetting.length > 0 && (
                            <span className="block text-xs text-ink-light">
                              {row.resetting.map((i) => terms[i]).join(", ")} {row.resetting.length > 1 ? "reset" : "resets"}
                            </span>
                          )}
                        </>
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

        {isGroup && now && <PairByPair year={now.year} numbers={now.numbers} terms={terms} />}

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
            href={imagePath}
            download={`solini-comparison-${shares.map((share) => encodeBirthDate(share.year, share.month, share.day)).join("-")}.png`}
            className={TEXT_LINK_CLASS}
          >
            Download image
          </a>
          <button type="button" onClick={handleRemoveAll} aria-label="Remove comparison" className={TEXT_LINK_CLASS}>
            {isGroup ? "Remove all" : "Remove"}
          </button>
        </div>
        <p role="status" className="mt-2 min-h-[1.25rem] text-sm text-ink-light">
          {shareStatus === "copied" && (
            <span className="animate-settle-in inline-block">
              Link copied. It shows {isGroup ? "everyone's birth dates" : "both birth dates"}
              {hasNames && " and the names you added"} to anyone who opens it.
            </span>
          )}
          {shareStatus === "failed" && (
            <span className="animate-settle-in inline-block">Couldn&apos;t copy automatically. Copy the link from the address bar instead.</span>
          )}
        </p>

        <HowToRead isGroup={isGroup} />
      </section>
    </CompareCard>
  );
}
