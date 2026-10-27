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
import {
  getTierSymbol,
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
  
  // If a specific year is selected (from timeline), show just that year
  // Otherwise show the grouped years from the pillar
  const years = selectedYear !== undefined && selectedYear !== null
    ? [selectedYear]
    : getYearsForColumn(birthYear, columnIndex, currentYear);
    
  const symbol = getTierSymbol(interp.tier);
  const isZero = interp.tier === "zero";

  return (
    <ViewTransition update="panel-swap" default="none">
      <div
        id={id}
        role="tabpanel"
        aria-labelledby={labelledBy}
        className={[
          "mt-4 rounded-sm border border-border p-5 paper-texture",
          isZero
            ? "bg-tier-zero text-parchment"
            : "bg-manuscript text-ink",
        ].join(" ")}
      >
        {/* Header row: domain + years */}
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
          <span
            className={[
              "text-xs font-semibold uppercase tracking-widest",
              isZero ? "text-parchment/80" : "text-ink-light",
            ].join(" ")}
            style={{ fontVariant: "small-caps" }}
          >
            {selectedYear !== undefined && selectedYear !== null 
              ? `Year ${selectedYear}` 
              : domain}
          </span>
          {selectedYear === undefined || selectedYear === null ? (
            <span
              className={[
                "text-sm",
                isZero ? "text-parchment/75" : "text-ink-light",
              ].join(" ")}
            >
              {years.join(" · ")}
            </span>
          ) : (
            <span
              className={[
                "text-sm",
                isZero ? "text-parchment/75" : "text-ink-light",
              ].join(" ")}
              style={{ fontVariant: "small-caps" }}
            >
              {domain}
            </span>
          )}
        </div>

        {/* Tier symbol + label + cycle number */}
        <div className="flex items-center gap-3 mb-3">
          <span
            aria-hidden="true"
            className={[
              "text-2xl leading-none",
              isZero ? "text-parchment/80" : "text-gold",
            ].join(" ")}
          >
            {symbol}
          </span>
          <div>
            <p
              className={[
                "text-base font-semibold leading-tight",
                isZero ? "text-parchment" : "text-ink",
              ].join(" ")}
            >
              {interp.label}
            </p>
            <p
              className={[
                "text-sm",
                isZero ? "text-parchment/80" : "text-ink-light",
              ].join(" ")}
            >
              Cycle number {cycleNumber}
            </p>
          </div>
        </div>

        {/* Description */}
        <p
          className={[
            "text-sm mb-3",
            isZero ? "text-parchment/80" : "text-ink-light",
          ].join(" ")}
        >
          {interp.description}
        </p>

        {/* Guidance (italic) */}
        <p
          className={[
            "text-sm italic border-l-2 pl-3",
            isZero
              ? "border-parchment/40 text-parchment/80"
              : "border-gold/40 text-ink-light",
          ].join(" ")}
        >
          {interp.guidance}
        </p>
      </div>
    </ViewTransition>
  );
}
