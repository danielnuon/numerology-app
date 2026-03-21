import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { decodeBirthDate } from "@/lib/numerology/url-encoding";
import { computeCycleFromBirthDate } from "@/lib/numerology/derive";
import { interpretTotal } from "@/lib/numerology/interpretation";
import { ShareRedirectClient } from "./share-redirect-client";

type Props = {
  params: Promise<{ date: string }>;
};

/**
 * Generates personalized OG metadata for a shared cycle reading.
 * If the date is invalid, falls back to the generic site metadata.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const decoded = decodeBirthDate(date);

  if (!decoded) {
    // Invalid date — return generic metadata (graceful fallback)
    return {
      title: "Khmer Numerology — Life Cycle Calculator",
      description:
        "Discover your 12-year life cycle through Khmer numerology. Combines Khmer lunar calendar, Chinese zodiac, and weekday birth data.",
    };
  }

  const result = computeCycleFromBirthDate(
    decoded.year,
    decoded.month,
    decoded.day
  );
  const totalInterp = interpretTotal(result.totalScore);
  const cycleStr = result.cycle.join(", ");

  return {
    title: `Life Cycle Reading — Khmer Numerology`,
    description: `Born ${date}: cycle [${cycleStr}], total score ${result.totalScore} (${totalInterp.label}). Discover your 12-year life cycle.`,
    openGraph: {
      title: "Life Cycle Reading — Khmer Numerology",
      description: `Born ${date}: total score ${result.totalScore} (${totalInterp.label}). Discover your 12-year life cycle through Khmer numerology.`,
      type: "website",
      locale: "en_US",
      siteName: "Khmer Numerology",
    },
    twitter: {
      card: "summary_large_image",
      title: "Life Cycle Reading — Khmer Numerology",
      description: `Born ${date}: total score ${result.totalScore} (${totalInterp.label}). Discover your 12-year life cycle.`,
    },
  };
}

/**
 * Share route page — decodes the birth date from the URL and redirects
 * to the home page with pre-fill query params.
 * Invalid dates redirect to the home page without params.
 */
export default async function SharePage({ params }: Props) {
  const { date } = await params;
  const decoded = decodeBirthDate(date);

  if (!decoded) {
    // Invalid date — redirect to home form
    redirect("/");
  }

  // Render a client component that pre-fills the form on the home page
  return (
    <ShareRedirectClient
      day={decoded.day}
      month={decoded.month}
      year={decoded.year}
    />
  );
}
