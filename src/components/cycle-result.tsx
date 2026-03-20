/**
 * CycleResult
 *
 * Temporary display component for the 12-number numerology cycle.
 * Shows the cycle values, life area labels, and total score interpretation.
 *
 * NOTE: This is a placeholder — the Interactive Cycle Chart story will replace
 * it with a full pillar grid.
 */

import { getLifeArea, LIFE_AREA_MAP } from "@/lib/numerology/year-lookup";
import { interpretYear, interpretTotal } from "@/lib/numerology/interpretation";
import type { CycleResultWithYear } from "@/lib/numerology/derive";

/** Tier id → Tailwind text color class */
const TIER_TEXT_COLOR: Record<string, string> = {
  "very-strong": "text-tier-very-strong",
  strong: "text-tier-strong",
  moderate: "text-tier-moderate",
  weak: "text-tier-weak",
  zero: "text-tier-zero",
};

interface Props {
  result: CycleResultWithYear;
}

export function CycleResult({ result }: Props) {
  const { cycle, totalScore, birthData } = result;
  const totalInterp = interpretTotal(totalScore);

  return (
    <div
      aria-label="Cycle result"
      className="mt-8"
    >
      {/* Birth data summary */}
      <p className="text-sm text-ink-light text-center mb-6 italic">
        {birthData.zodiacAnimal} · {totalInterp.label}
      </p>

      {/* Cycle grid — 12 columns */}
      <div
        className="overflow-x-auto"
        role="table"
        aria-label="12-year life cycle"
      >
        <div className="min-w-[480px]">
          {/* Life area labels */}
          <div role="row" className="flex">
            {Object.keys(LIFE_AREA_MAP).map((col) => {
              const colNum = Number(col);
              return (
                <div
                  key={col}
                  role="columnheader"
                  className="flex-1 text-center text-[10px] uppercase tracking-[0.06em] text-ink-faint pb-1 px-1"
                >
                  {getLifeArea(colNum)}
                </div>
              );
            })}
          </div>

          {/* Cycle numbers */}
          <div role="row" className="flex border-t border-border-light pt-2">
            {cycle.map((num, idx) => {
              const interp = interpretYear(num);
              const colorClass = TIER_TEXT_COLOR[interp.tier] ?? "text-ink";
              return (
                <div
                  key={idx}
                  role="cell"
                  title={interp.label}
                  className={[
                    "flex-1 text-center text-xl font-medium",
                    colorClass,
                  ].join(" ")}
                >
                  {num}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Total score */}
      <div className="mt-6 pt-4 border-t border-border-light text-center">
        <p className="text-xs uppercase tracking-[0.08em] text-ink-faint">
          Total score
        </p>
        <p className="text-2xl font-medium text-ink mt-1">{totalScore}</p>
        <p className="text-sm text-ink-light mt-1 italic">
          {totalInterp.description}
        </p>
      </div>
    </div>
  );
}
