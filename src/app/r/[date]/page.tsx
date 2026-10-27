import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { decodeBirthDate } from "@/lib/numerology/url-encoding";
import { computeCycleFromBirthDate } from "@/lib/numerology/derive";
import { interpretTotal } from "@/lib/numerology/interpretation";
import {
  SHARED_READING_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
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
  const decoded = decodeBirthDate(date);

  if (!decoded) {
    // Invalid date — return generic metadata (graceful fallback)
    return { title: SITE_TITLE, description: SITE_DESCRIPTION };
  }

  const result = computeCycleFromBirthDate(
    decoded.year,
    decoded.month,
    decoded.day
  );
  const description = sharedReadingDescription(
    result.totalScore,
    interpretTotal(result.totalScore).label
  );

  return {
    title: SHARED_READING_TITLE,
    description,
    openGraph: {
      title: SHARED_READING_TITLE,
      description,
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: SHARED_READING_TITLE,
      description,
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

  // Render a client component that redirects via native browser API.
  // window.location.replace() is used instead of router.replace() for
  // reliable query param preservation across Next.js versions.
  return (
    <ShareRedirectClient
      day={decoded.day}
      month={decoded.month}
      year={decoded.year}
    />
  );
}
