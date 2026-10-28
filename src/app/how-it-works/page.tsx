import type { Metadata } from "next";
import { CycleWalkthrough, type WalkthroughDate } from "@/components/cycle-walkthrough";
import { InfoPage, MorePages } from "@/components/ui/page-parts";
import { validateBirthDate } from "@/lib/numerology/derive";
import { DEFAULT_NEW_YEAR_RULE, isNewYearRule } from "@/lib/numerology/zodiac";
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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** The first value of a query parameter, ignoring repeats. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** The birth date in ?day=&month=&year=(&ny=), if it is a valid one. */
function dateFromParams(params: Record<string, string | string[] | undefined>): WalkthroughDate | null {
  const day = parseInt(first(params.day) ?? "", 10);
  const month = parseInt(first(params.month) ?? "", 10);
  const year = parseInt(first(params.year) ?? "", 10);
  if (validateBirthDate(year, month, day).length > 0) return null;
  const ny = first(params.ny);
  return { year, month, day, rule: isNewYearRule(ny) ? ny : DEFAULT_NEW_YEAR_RULE };
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
