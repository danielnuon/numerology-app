/**
 * Comparison Image
 *
 * The preview card for a comparison link (/r/A+B, up to six people): the
 * compatibility summary as a 1200×630 image, so chat apps show how the
 * cycles meet and "Download image" on the comparison saves the same card. It
 * mirrors CompatibilitySummary for the first person's current cycle:
 * everyone's total, the stability assessment, the current year's
 * interaction and a count of each interaction over the cycle. The image
 * route can't read the link's query string, so it shows dates and animals,
 * never names.
 *
 * Satori draws it, so every div with more than one child sets
 * display: flex, and the interaction symbols are SVG shapes rather than
 * Unicode, which the default font may not have.
 */

import { ImageResponse } from "next/og";
import type { ReactNode } from "react";
import {
  assessStability,
  compareCycles,
  cycleStartYear,
  INTERACTION_ORDER,
  INTERACTION_TEXT,
  stabilityText,
  summarizeComparison,
  type YearInteraction,
} from "@/lib/numerology/compatibility";
import { computeCycleFromBirthDate } from "@/lib/numerology/derive";
import { encodeBirthDate, type DecodedComparison } from "@/lib/numerology/url-encoding";
import { getActiveYear } from "@/lib/numerology/year-lookup";
import { OG_COLORS, OG_INTERACTION_COLORS, OG_SITE_LABEL } from "@/lib/og-theme";
import { peopleCountWord } from "@/lib/site-copy";
import { ZODIAC_ICON_PATHS } from "@/components/ui/zodiac-icon";

/** Each interaction's symbol as a shape on a 24-unit grid. */
const INTERACTION_SHAPES: Record<YearInteraction, (color: string) => ReactNode> = {
  amplified: (color) => (
    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" fill={color} />
  ),
  stabilized: (color) => <path d="M12 4l9 15H3z" fill={color} />,
  neutral: (color) => <path d="M4 12h16" stroke={color} strokeWidth="2.5" strokeLinecap="round" />,
  risk: (color) => <path d="M12 20L3 5h18z" fill={color} />,
  unstable: (color) => (
    <>
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="2.5" fill={color} />
    </>
  ),
};

function InteractionIcon({ interaction, size }: { interaction: YearInteraction; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {INTERACTION_SHAPES[interaction](OG_INTERACTION_COLORS[interaction])}
    </svg>
  );
}

/** Renders the comparison card for two to six decoded birth dates. */
export function comparisonImage({ people: shares }: DecodedComparison, size: { width: number; height: number }) {
  const readings = shares.map((share) => computeCycleFromBirthDate(share.year, share.month, share.day, share.rule));
  const [first] = shares;
  // The first person's current cycle, as the page opens on.
  const activeYear = getActiveYear(new Date().getFullYear(), first.month, first.day);
  const cycleStart = cycleStartYear(readings[0].birthYear, activeYear);
  const years = compareCycles(readings, cycleStart);
  const summary = summarizeComparison(years, activeYear);
  const current = summary.current?.interaction ?? null;
  const stability = stabilityText(assessStability(readings.map((r) => r.totalScore)), shares.length);
  const people = shares.map((share, i) => ({ share, reading: readings[i] }));
  // A pair has room for a date and animal on one line; a group stacks them and draws smaller.
  const isGroup = people.length > 2;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(circle at 50% 30%, ${OG_COLORS.card}, ${OG_COLORS.page} 70%)`,
          fontFamily: "Georgia, serif",
          color: OG_COLORS.ink,
        }}
      >
        <div style={{ display: "flex", fontSize: 22, color: OG_COLORS.goldDeep, letterSpacing: "0.12em" }}>
          {`Solini  ·  ${peopleCountWord(people.length)} Khmer numerology cycles, compared`}
        </div>

        {/* Both people, with their totals */}
        <div style={{ display: "flex", gap: isGroup ? 24 : 120, marginTop: 30 }}>
          {people.map(({ share, reading }, index) => (
            <div
              key={index}
              // Satori fails on an undefined style value, so a pair leaves width out
              style={{ display: "flex", flexDirection: "column", alignItems: "center", ...(isGroup && { width: 168 }) }}
            >
              <svg
                width={isGroup ? 36 : 44}
                height={isGroup ? 36 : 44}
                viewBox="0 0 32 32"
                fill="none"
                stroke={OG_COLORS.goldDeep}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {ZODIAC_ICON_PATHS[reading.birthData.zodiacAnimal].map((d) => (
                  <path key={d} d={d} />
                ))}
              </svg>
              <div style={{ display: "flex", marginTop: 8, fontSize: isGroup ? 18 : 20, color: OG_COLORS.inkLight }}>
                {isGroup
                  ? encodeBirthDate(share.year, share.month, share.day)
                  : `${encodeBirthDate(share.year, share.month, share.day)}  ·  Year of the ${reading.birthData.zodiacAnimal}`}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
                <div style={{ display: "flex", fontSize: 20, color: OG_COLORS.inkLight }}>Total</div>
                <div style={{ display: "flex", fontSize: isGroup ? 44 : 56, color: OG_COLORS.goldDeep }}>
                  {String(reading.totalScore)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall assessment */}
        <div style={{ display: "flex", marginTop: 18, fontSize: 44, letterSpacing: "0.04em" }}>
          {stability.label}
        </div>
        <div style={{ display: "flex", marginTop: 6, fontSize: 22, color: OG_COLORS.inkLight }}>
          {stability.description}
        </div>

        {/* The current year */}
        {current && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 26, fontSize: 28 }}>
            <div style={{ display: "flex", color: OG_COLORS.goldDeep }}>{`Now, ${activeYear}:`}</div>
            <InteractionIcon interaction={current} size={26} />
            <div style={{ display: "flex", color: OG_INTERACTION_COLORS[current] }}>
              {INTERACTION_TEXT[current].label}
            </div>
          </div>
        )}

        {/* Count of each interaction */}
        <div style={{ display: "flex", gap: 14, marginTop: 26 }}>
          {INTERACTION_ORDER.map((interaction) => (
            <div
              key={interaction}
              style={{
                width: 168,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "12px 0",
                borderRadius: 12,
                border: `1px solid ${OG_COLORS.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <InteractionIcon interaction={interaction} size={22} />
                <div style={{ display: "flex", fontSize: 34 }}>{String(summary.counts[interaction])}</div>
              </div>
              <div
                style={{ display: "flex", marginTop: 2, fontSize: 18, color: OG_INTERACTION_COLORS[interaction] }}
              >
                {INTERACTION_TEXT[interaction].label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontSize: 18,
            color: OG_COLORS.inkLight,
            letterSpacing: "0.06em",
          }}
        >
          {`Cycle ${cycleStart}–${cycleStart + 11}  ·  Compare yours at ${OG_SITE_LABEL}`}
        </div>
      </div>
    ),
    { ...size }
  );
}
