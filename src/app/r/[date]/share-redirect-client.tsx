"use client";

/**
 * ShareRedirectClient
 *
 * Client component rendered on the share route (/r/[date]).
 * Redirects to the home page with pre-fill query params so the
 * birth data form auto-populates and computes the cycle result. A shared
 * comparison also passes the partner's date (?pday=&pmonth=&pyear=&pny=).
 *
 * Uses native `window.location.replace()` instead of Next.js's
 * `router.replace()` for reliable query param preservation
 * across Next.js versions.
 */

import { useEffect } from "react";
import type { NewYearRule } from "@/lib/numerology/zodiac";
import type { DecodedShare } from "@/lib/numerology/url-encoding";

interface Props {
  day: number;
  month: number;
  year: number;
  /** New Year rule the reading was shared with; passed on as ?ny=. */
  rule: NewYearRule;
  /** The partner in a shared comparison, if the link has one. */
  partner?: DecodedShare | null;
}

/** The home page URL that opens this reading, and the comparison if there is one. */
export function homeUrlFor({ day, month, year, rule, partner }: Props): string {
  const params = new URLSearchParams({
    day: String(day),
    month: String(month),
    year: String(year),
    ny: rule,
  });
  if (partner) {
    params.set("pday", String(partner.day));
    params.set("pmonth", String(partner.month));
    params.set("pyear", String(partner.year));
    params.set("pny", partner.rule);
  }
  return `/?${params.toString()}`;
}

export function ShareRedirectClient(props: Props) {
  const url = homeUrlFor(props);
  useEffect(() => {
    // Native browser redirect preserves query params reliably
    window.location.replace(url);
  }, [url]);

  // Brief loading state while redirecting
  return (
    <main className="flex flex-1 flex-col items-center justify-center safe-gutter py-16">
      <p className="text-ink-light text-sm italic">Opening this reading…</p>
    </main>
  );
}
