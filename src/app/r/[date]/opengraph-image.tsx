import { ImageResponse } from "next/og";
import { decodeBirthDate } from "@/lib/numerology/url-encoding";
import { computeCycleFromBirthDate } from "@/lib/numerology/derive";
import { interpretTotal, interpretYear } from "@/lib/numerology/interpretation";

export const alt = "Life Cycle Reading — Khmer Numerology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ date: string }>;
};

/** Tier background colours for OG image pillars. */
function tierBg(tier: string): string {
  switch (tier) {
    case "very-strong":
      return "rgba(91,119,68,0.15)";
    case "strong":
      return "rgba(122,155,107,0.15)";
    case "moderate":
      return "rgba(184,134,11,0.15)";
    case "weak":
      return "rgba(160,82,45,0.15)";
    case "zero":
      return "#4A4039";
    default:
      return "rgba(184,134,11,0.15)";
  }
}

export default async function OgImage({ params }: Props) {
  const { date } = await params;
  const decoded = decodeBirthDate(date);

  if (!decoded) {
    // Fallback: generic OG image (same as root)
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
            background: "#F5F0E8",
            fontFamily: "Georgia, serif",
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 300,
              color: "#2C2417",
              letterSpacing: "0.08em",
            }}
          >
            Khmer Numerology
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#7A6F5F",
              fontStyle: "italic",
              marginTop: 16,
            }}
          >
            Discover your 12-year life cycle
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const result = computeCycleFromBirthDate(
    decoded.year,
    decoded.month,
    decoded.day
  );
  const totalInterp = interpretTotal(result.totalScore);

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
          background: "#F5F0E8",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 300,
            color: "#2C2417",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          Khmer Numerology
        </div>

        <div
          style={{
            fontSize: 20,
            color: "#7A6F5F",
            fontStyle: "italic",
            marginBottom: 24,
          }}
        >
          Life Cycle Reading
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div style={{ width: 60, height: 1, background: "#D5CBBA" }} />
          <div
            style={{
              width: 6,
              height: 6,
              background: "#B8860B",
              transform: "rotate(45deg)",
            }}
          />
          <div style={{ width: 60, height: 1, background: "#D5CBBA" }} />
        </div>

        {/* Cycle pillars */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {result.cycle.map((n, i) => {
            const interp = interpretYear(n);
            return (
              <div
                key={i}
                style={{
                  width: 64,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 4,
                  border: "1px solid #D5CBBA",
                  background: tierBg(interp.tier),
                  color: interp.tier === "zero" ? "#F5F0E8" : "#2C2417",
                  fontSize: 28,
                  fontWeight: 500,
                }}
              >
                {n}
              </div>
            );
          })}
        </div>

        {/* Total score */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: "#7A6F5F",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Total Score
          </div>
          <div style={{ fontSize: 28, color: "#2C2417", fontWeight: 500 }}>
            {result.totalScore}
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#7A6F5F",
              fontStyle: "italic",
            }}
          >
            {totalInterp.label}
          </div>
        </div>

        {/* Birth date */}
        <div style={{ fontSize: 14, color: "#A89F8F" }}>Born {date}</div>
      </div>
    ),
    { ...size }
  );
}
