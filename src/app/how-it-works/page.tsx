import type { Metadata } from "next";
import { CycleWalkthrough, type WalkthroughDate } from "@/components/cycle-walkthrough";
import { InfoPage, MorePages } from "@/components/ui/page-parts";
import { decodeReadingQuery, firstQueryValue, type QueryValue } from "@/lib/numerology/url-encoding";
import { HOW_IT_WORKS_DESCRIPTION, HOW_IT_WORKS_TITLE, SITE_NAME } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: HOW_IT_WORKS_TITLE,
  description: HOW_IT_WORKS_DESCRIPTION,
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: HOW_IT_WORKS_TITLE,
    description: HOW_IT_WORKS_DESCRIPTION,
    url: "/how-it-works",
    siteName: SITE_NAME,
  },
  twitter: { title: HOW_IT_WORKS_TITLE, description: HOW_IT_WORKS_DESCRIPTION },
};

type Props = {
  searchParams: Promise<Record<string, QueryValue>>;
};

/** The birth date in ?day=&month=&year=(&ny=), if it is a valid one. */
function dateFromParams(params: Record<string, QueryValue>): WalkthroughDate | null {
  return decodeReadingQuery({
    day: firstQueryValue(params.day),
    month: firstQueryValue(params.month),
    year: firstQueryValue(params.year),
    ny: firstQueryValue(params.ny),
  });
}

/**
 * How your cycle is made: the reading for one birth date worked out step by
 * step. The date comes from the query string (the reading links here with
 * it); without one the walkthrough falls back to a saved date or an example.
 */
export default async function HowItWorksPage({ searchParams }: Props) {
  const date = dateFromParams(await searchParams);
  return (
    <InfoPage title="How your cycle is made">
      <CycleWalkthrough date={date} />
      <MorePages current="/how-it-works" />
    </InfoPage>
  );
}
