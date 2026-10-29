import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { decodeComparisonSegment, decodeShareSegment } from "@/lib/numerology/url-encoding";
import { assessStability, STABILITY_TEXT } from "@/lib/numerology/compatibility";
import { computeCycleFromBirthDate } from "@/lib/numerology/derive";
import { interpretAreaYear } from "@/lib/numerology/interpretation";
import { getActiveYear, getCycleIndex, getYearNumber } from "@/lib/numerology/year-lookup";
import {
  SHARED_COMPARISON_TITLE,
  SHARED_READING_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  sharedComparisonDescription,
  sharedReadingDescription,
} from "@/lib/site-copy";
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

  // A comparison (/r/A+B) describes how the two cycles meet.
  const comparison = decodeComparisonSegment(date);
  if (comparison) {
    const [first, second] = [comparison.first, comparison.second].map((share) =>
      computeCycleFromBirthDate(share.year, share.month, share.day, share.rule)
    );
    const assessment = STABILITY_TEXT[assessStability(first.totalScore, second.totalScore)];
    return previewMetadata(SHARED_COMPARISON_TITLE, sharedComparisonDescription(assessment.label));
  }

  const decoded = decodeShareSegment(date);

  if (!decoded) {
    // Invalid date — return generic metadata (graceful fallback)
    return { title: SITE_TITLE, description: SITE_DESCRIPTION };
  }

  const result = computeCycleFromBirthDate(
    decoded.year,
    decoded.month,
    decoded.day,
    decoded.rule
  );
  // This year's reading, the same one the preview image lights
  const activeYear = getActiveYear(new Date().getFullYear(), decoded.month, decoded.day);
  const thisYear = interpretAreaYear(
    getCycleIndex(decoded.year, activeYear) + 1,
    getYearNumber(result.cycle, decoded.year, activeYear)
  );
  const description = sharedReadingDescription({
    year: activeYear,
    label: thisYear.label,
    area: thisYear.area,
  });

  return previewMetadata(SHARED_READING_TITLE, description);
}

/** Page and link-preview metadata for a shared reading or comparison. */
function previewMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Share route page — decodes the birth date (or a comparison's two dates)
 * from the URL and redirects to the home page with pre-fill query params.
 * Invalid dates redirect to the home page without params.
 */
export default async function SharePage({ params }: Props) {
  const { date } = await params;
  const comparison = decodeComparisonSegment(date);
  if (comparison) {
    const { first, second } = comparison;
    return (
      <ShareRedirectClient
        day={first.day}
        month={first.month}
        year={first.year}
        rule={first.rule}
        partner={second}
      />
    );
  }

  const decoded = decodeShareSegment(date);

  if (!decoded) {
    // Invalid date — redirect to home form
    redirect("/");
  }

  // Render a client component that redirects via native browser API.
  // window.location.replace() is used instead of router.replace() for
  // reliable query param preservation across Next.js versions.
  return (
    <ShareRedirectClient
      day={decoded.day}
      month={decoded.month}
      year={decoded.year}
      rule={decoded.rule}
    />
  );
}
