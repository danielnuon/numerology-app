import { ImageResponse } from "next/og";

export const alt = "Khmer Numerology — Life Cycle Calculator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#F5F0E8",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Diamond motif */}
        <svg
          width="64"
          height="64"
          viewBox="0 0 32 32"
          style={{ marginBottom: 24 }}
        >
          <path d="M16 2 L30 16 L16 30 L2 16 Z" fill="none" stroke="#B8860B" strokeWidth="2" />
          <path d="M16 8 L24 16 L16 24 L8 16 Z" fill="#B8860B" opacity="0.3" />
          <circle cx="16" cy="16" r="3" fill="#2C2417" />
        </svg>

        <div
          style={{
            fontSize: 56,
            fontWeight: 300,
            color: "#2C2417",
            letterSpacing: "0.08em",
            marginBottom: 16,
          }}
        >
          Khmer Numerology
        </div>

        <div
          style={{
            fontSize: 24,
            color: "#7A6F5F",
            fontStyle: "italic",
            marginBottom: 32,
          }}
        >
          Uncover the rhythm of your years
        </div>

        {/* Decorative line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div style={{ width: 80, height: 1, background: "#D5CBBA" }} />
          <div
            style={{
              width: 8,
              height: 8,
              background: "#B8860B",
              transform: "rotate(45deg)",
            }}
          />
          <div style={{ width: 80, height: 1, background: "#D5CBBA" }} />
        </div>

        {/* Sample pillars */}
        <div style={{ display: "flex", gap: 8 }}>
          {[3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8].map((n, i) => (
            <div
              key={i}
              style={{
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
                border: "1px solid #D5CBBA",
                background:
                  n === 0
                    ? "#4A4039"
                    : n >= 10
                      ? "rgba(91,119,68,0.15)"
                      : n >= 7
                        ? "rgba(122,155,107,0.15)"
                        : n >= 4
                          ? "rgba(184,134,11,0.15)"
                          : "rgba(160,82,45,0.15)",
                color: n === 0 ? "#F5F0E8" : "#2C2417",
                fontSize: 20,
                fontWeight: 500,
              }}
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
