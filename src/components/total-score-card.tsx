"use client";

/**
 * TotalScoreCard
 *
 * The total score under the wheel. Tapping it opens the card in place onto
 * the scale of totals: every cycle comes to 52, 64 or 76, so the scale is
 * three lantern stops, with this cycle's stop lit in its tier's light and
 * ringed in ink, how common each total is, and why there are only three.
 */

import { useId, useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { interpretTotal } from "@/lib/numerology/interpretation";
import { TOTAL_SCALE, type TotalTier } from "@/lib/numerology/interpretation-data";

/** Lantern light for each total tier, from the luck tier tokens. */
const STOP_LIGHT: Record<TotalTier, string> = {
  weak: "border-tier-weak/70 shadow-[0_0_22px_-4px_var(--color-tier-weak)]",
  moderate: "border-tier-moderate/70 shadow-[0_0_22px_-4px_var(--color-tier-moderate)]",
  strong: "border-tier-strong/70 shadow-[0_0_22px_-4px_var(--color-tier-strong)]",
};

export interface TotalScoreCardProps {
  /** Sum of all 12 cycle values: 52, 64 or 76. */
  totalScore: number;
}

export function TotalScoreCard({ totalScore }: TotalScoreCardProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const interp = interpretTotal(totalScore);

  return (
    <div className="pressable mt-6 origin-top rounded-xl border border-border bg-parchment/40 has-[>button:hover]:border-gold has-[>button:active]:scale-[0.97]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full flex-col gap-2 rounded-xl px-5 py-4 text-left sm:flex-row sm:items-center sm:gap-4"
      >
        <span className="flex shrink-0 items-baseline gap-2">
          <span className="text-ink-light text-sm uppercase tracking-[0.14em] whitespace-nowrap">
            Total score
          </span>
          <span className="font-display text-3xl text-gold-deep title-glow tabular-nums">{totalScore}</span>
        </span>
        <span className="hidden sm:block w-px h-8 bg-border" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink leading-tight">{interp.label}</span>
          <span className="block text-sm text-ink-light">{interp.description}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 self-end text-sm text-ink-light sm:self-center">
          {open ? "Hide scale" : "See the scale"}
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={`size-3.5 transition-transform duration-[var(--duration-standard)] ease-standard ${open ? "rotate-180" : ""}`}
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </span>
      </button>

      <Reveal open={open} id={panelId} className="px-5 pb-5">
        <div className="relative pt-1">
          {/* The rail the three lanterns hang on */}
          <div aria-hidden="true" className="absolute left-[16%] right-[16%] top-[38px] h-px bg-border" />
          <ol aria-label="Every cycle totals 52, 64 or 76" className="relative grid grid-cols-3 gap-2 text-center">
            {TOTAL_SCALE.map((stop) => {
              const yours = stop.total === totalScore;
              const tier = interpretTotal(stop.total).tier;
              return (
                <li key={stop.total} className="flex flex-col items-center gap-1">
                  <span className="min-h-[1.25rem] text-sm uppercase tracking-[0.14em] text-ink">
                    {yours ? "Yours" : ""}
                  </span>
                  <span
                    className={[
                      "grid size-11 place-items-center rounded-full border bg-parchment font-display text-lg tabular-nums",
                      yours ? `text-ink ring-1 ring-ink ring-offset-2 ring-offset-manuscript ${STOP_LIGHT[tier]}` : "border-border text-ink-light",
                    ].join(" ")}
                  >
                    {stop.total}
                  </span>
                  <span className="text-sm text-ink">{stop.band}</span>
                  <span className="text-sm text-ink-light">{stop.share}</span>
                </li>
              );
            })}
          </ol>
        </div>
        <p className="mt-4 max-w-[65ch] text-sm text-ink-light">
          Why only three? Before anything is taken away, the twelve columns
          always add up to 184. Each year keeps what is left after every full
          12 is removed, and a whole cycle always sheds 9, 10 or 11 twelves,
          so every total is 76, 64 or 52.
        </p>
      </Reveal>
    </div>
  );
}
