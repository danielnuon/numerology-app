"use client";

/**
 * DetailPanel
 *
 * The full reading for one year of the cycle: life area, zodiac animal, tier
 * interpretation and guidance, plus the other years that share its number.
 * Shown inside the reading that blooms out of the cycle wheel's center.
 */

import { interpretYear } from "@/lib/numerology/interpretation";
import { getLifeArea } from "@/lib/numerology/year-lookup";
import { getZodiacAnimalForYear } from "@/lib/numerology/zodiac";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import { getTierSymbol, getTierTextClass } from "@/lib/numerology/chart-helpers";

export interface DetailPanelProps {
  /** Id for the heading, so the surrounding dialog can be labelled by it. */
  headingId: string;
  /** The cycle number for the year (0–11). */
  cycleNumber: number;
  /** 0-indexed position of the year in the cycle. */
  columnIndex: number;
  /** Birth year of the person (cycle anchor). */
  birthYear: number;
  /** The calendar year being read. */
  year: number;
  /** Whether this is the person's current cycle year. */
  isCurrent: boolean;
}

export function DetailPanel({
  headingId,
  cycleNumber,
  columnIndex,
  birthYear,
  year,
  isCurrent,
}: DetailPanelProps) {
  const interp = interpretYear(cycleNumber);
  const domain = getLifeArea(columnIndex + 1);
  const animal = getZodiacAnimalForYear(year);
  // The same number comes round every 12 years
  const otherYears = [year - 12, year + 12].filter((y) => y >= birthYear);

  return (
    <div className="text-ink">
      <p className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 pr-12 text-xs uppercase tracking-[0.14em] text-ink-light">
        <span className="font-semibold">{year}{isCurrent ? " · Now" : ""}</span>
        <span>{domain}</span>
      </p>

      <div className="mb-3 flex items-center gap-3">
        <span className="font-sans text-5xl font-medium leading-none tabular-nums">
          {cycleNumber}
        </span>
        <div className="min-w-0">
          <h3
            id={headingId}
            className="flex items-center gap-2 font-display text-lg leading-tight tracking-[0.03em]"
          >
            <span aria-hidden="true" className={getTierTextClass(interp.tier)}>
              {getTierSymbol(interp.tier)}
            </span>
            {interp.label}
          </h3>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-light">
            <ZodiacIcon animal={animal} className="size-5 text-gold-deep" />
            Year of the {animal}
          </p>
        </div>
      </div>

      <p className="mb-3 text-sm text-ink-light">{interp.description}</p>

      <p className="text-sm italic border-l-2 pl-3 border-gold/40 text-ink-light">
        {interp.guidance}
      </p>

      {otherYears.length > 0 && (
        <p className="mt-3 text-xs text-ink-light">
          This number also falls in {otherYears.join(" and ")}.
        </p>
      )}
    </div>
  );
}
