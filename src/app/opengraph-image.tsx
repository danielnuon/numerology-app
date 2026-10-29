import { ImageResponse } from "next/og";
import { interpretYear } from "@/lib/numerology/interpretation";
import { OG_COLORS, OG_SITE_LABEL, lanternOrb } from "@/lib/og-theme";
import { SITE_TAGLINE } from "@/lib/site-copy";

export const alt = "Solini, Khmer numerology. A sample 12-year cycle: one luck number for each year.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The worked example's cycle (July 24, 1997), used as a sample on the card. */
const SAMPLE_CYCLE = [3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8];

export default function OgImage() {
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
            fontSize: 72,
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
            fontSize: 28,
            color: OG_COLORS.goldDeep,
            letterSpacing: "0.1em",
            marginTop: 8,
          }}
        >
          Khmer numerology
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "36px 0" }}>
          <div style={{ width: 90, height: 1, background: OG_COLORS.border }} />
          <div style={{ width: 8, height: 8, background: OG_COLORS.gold, transform: "rotate(45deg)" }} />
          <div style={{ width: 90, height: 1, background: OG_COLORS.border }} />
        </div>

        {/* Sample cycle as lantern orbs */}
        <div style={{ display: "flex", gap: 14 }}>
          {SAMPLE_CYCLE.map((n, i) => {
            const { background, border, boxShadow } = lanternOrb(interpretYear(n).tier);
            return (
              <div
                key={i}
                style={{
                  width: 66,
                  height: 66,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 33,
                  border: `1px solid ${border}`,
                  boxShadow,
                  background,
                  color: OG_COLORS.ink,
                  fontSize: 30,
                }}
              >
                {String(n)}
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 22,
            color: OG_COLORS.inkLight,
            letterSpacing: "0.06em",
          }}
        >
          {`${SITE_TAGLINE}  ·  ${OG_SITE_LABEL}`}
        </div>
      </div>
    ),
    { ...size }
  );
}
