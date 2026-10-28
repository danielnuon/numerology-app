import { ImageResponse } from "next/og";
import { decodeBirthDate } from "@/lib/numerology/url-encoding";
import { computeCycleFromBirthDate } from "@/lib/numerology/derive";
import { interpretTotal, interpretYear } from "@/lib/numerology/interpretation";
import { getCurrentYearColumn } from "@/lib/numerology/chart-helpers";
import { getActiveYear, getLifeArea } from "@/lib/numerology/year-lookup";
import { OG_COLORS, OG_SITE_LABEL, pillarColors } from "@/lib/og-theme";
import GenericOgImage from "../../opengraph-image";

export const alt =
  "A 12-year Khmer numerology reading from Solini: one luck number for each year, with this year lit and the cycle's total score.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ date: string }>;
};

export default async function OgImage({ params }: Props) {
  const { date } = await params;
  const decoded = decodeBirthDate(date);

  // Invalid date: show the site's own card.
  if (!decoded) return GenericOgImage();

  const result = computeCycleFromBirthDate(decoded.year, decoded.month, decoded.day);
  const totalInterp = interpretTotal(result.totalScore);

  // The lit pillar: the cycle year this person is in today.
  const currentYear = new Date().getFullYear();
  const activeYear = getActiveYear(currentYear, decoded.month, decoded.day);
  const litColumn = getCurrentYearColumn(decoded.year, currentYear, decoded.month, decoded.day);
  const litInterp = interpretYear(result.cycle[litColumn]);
  const litArea = getLifeArea(litColumn + 1);

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
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 300,
            color: OG_COLORS.ink,
            letterSpacing: "0.14em",
          }}
        >
          Solini
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: OG_COLORS.goldDeep,
            letterSpacing: "0.1em",
            marginTop: 6,
            marginBottom: 36,
          }}
        >
          A 12-year Khmer numerology reading
        </div>

        {/* Cycle pillars, with this year's pillar lit */}
        <div style={{ display: "flex", gap: 10 }}>
          {result.cycle.map((n, i) => {
            const { background, border } = pillarColors(interpretYear(n).tier);
            const isLit = i === litColumn;
            return (
              <div
                key={i}
                style={{
                  width: 72,
                  height: 96,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 12,
                  border: isLit ? `3px solid ${OG_COLORS.goldDeep}` : `1px solid ${border}`,
                  boxShadow: isLit ? `0 0 28px ${OG_COLORS.goldDeep}99` : "none",
                  background,
                  color: OG_COLORS.ink,
                  fontSize: 34,
                }}
              >
                {String(n)}
              </div>
            );
          })}
        </div>

        {/* This year */}
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 28,
            color: OG_COLORS.ink,
          }}
        >
          {`${activeYear}: ${litInterp.label}  ·  ${litArea}`}
        </div>

        {/* Whole cycle */}
        <div
          style={{
            display: "flex",
            marginTop: 10,
            fontSize: 22,
            color: OG_COLORS.inkLight,
          }}
        >
          {`Total score ${result.totalScore}: ${totalInterp.label}`}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 18,
            color: OG_COLORS.inkLight,
            letterSpacing: "0.06em",
          }}
        >
          {`Born ${date}  ·  Find yours at ${OG_SITE_LABEL}`}
        </div>
      </div>
    ),
    { ...size }
  );
}
