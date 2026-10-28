"use client";

/**
 * DetailPanel
 *
 * Tab panel below the cycle chart for the selected pillar. Shows years, life
 * area domain, tier interpretation, and guidance. When the selection changes
 * inside a transition, the old content fades out and the new content settles
 * in via a native view transition.
 */

import { ViewTransition } from "react";
import { interpretYear } from "@/lib/numerology/interpretation";
import { getLifeArea } from "@/lib/numerology/year-lookup";
import { getZodiacAnimalForYear } from "@/lib/numerology/zodiac";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import {
  getTierSymbol,
  getTierTextClass,
  getYearsForColumn,
} from "@/lib/numerology/chart-helpers";

export interface DetailPanelProps {
  /** Element id, referenced by the pillars' aria-controls. */
  id: string;
  /** Id of the pillar (tab) that labels this panel. */
  labelledBy: string;
  /** The cycle number for the selected pillar (0–11). */
  cycleNumber: number;
  /** 0-indexed column position. */
  columnIndex: number;
  /** Birth year of the person (cycle anchor). */
  birthYear: number;
  /** The year considered "now". */
  currentYear: number;
  /** When set, shows specific year data instead of grouped years. */
  selectedYear?: number | null;
}

export function DetailPanel({
  id,
  labelledBy,
  cycleNumber,
  columnIndex,
  birthYear,
  currentYear,
  selectedYear,
}: DetailPanelProps) {
  const interp = interpretYear(cycleNumber);
  const domain = getLifeArea(columnIndex + 1);

  // A year picked on the timeline shows just that year. A pillar picked on
  // the chart stands for every year that shares it, so list the nearest few.
  const isSingleYear = selectedYear != null;
  const years = isSingleYear
    ? [selectedYear]
    : getYearsForColumn(birthYear, columnIndex, currentYear);

  const symbol = getTierSymbol(interp.tier);
  const isZero = interp.tier === "zero";

  return (
    <ViewTransition update="panel-swap" default="none">
      <div
        id={id}
        data-tier={interp.tier}
        role="tabpanel"
        aria-labelledby={labelledBy}
        className={[
          "lamp-panel mt-4 rounded-xl border border-border p-5 text-ink",
          isZero ? "bg-tier-zero/70" : "bg-parchment/40",
        ].join(" ")}
      >
        {/* Header row: domain + years */}
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
          <span
            className="text-xs font-semibold uppercase tracking-widest text-ink-light"
            style={{ fontVariant: "small-caps" }}
          >
            {isSingleYear ? `Year ${selectedYear}` : domain}
          </span>
          {isSingleYear ? (
            <>
              <span className="text-sm text-ink-light" style={{ fontVariant: "small-caps" }}>
                {domain}
              </span>
              {/* The animal that rules this calendar year */}
              <span className="ml-auto inline-flex items-center gap-1.5 self-center text-sm text-ink-light">
                <ZodiacIcon
                  animal={getZodiacAnimalForYear(selectedYear)}
                  className="size-6 self-center text-gold-deep"
                />
                Year of the {getZodiacAnimalForYear(selectedYear)}
              </span>
            </>
          ) : (
            <span className="text-sm text-ink-light">{years.join(" · ")}</span>
          )}
        </div>

        {/* Tier symbol + label + cycle number */}
        <div className="flex items-center gap-3 mb-3">
          <span
            aria-hidden="true"
            className={`text-2xl leading-none ${getTierTextClass(interp.tier)}`}
          >
            {symbol}
          </span>
          <div>
            <p className="font-display text-lg leading-tight tracking-[0.03em] text-ink">
              {interp.label}
            </p>
            <p className="text-sm text-ink-light">Cycle number {cycleNumber}</p>
          </div>
        </div>

        <p className="text-sm mb-3 text-ink-light">{interp.description}</p>

        {/* Guidance (italic) */}
        <p className="text-sm italic border-l-2 pl-3 border-gold/40 text-ink-light">
          {interp.guidance}
        </p>
      </div>
    </ViewTransition>
  );
}
