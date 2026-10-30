"use client";

/**
 * ShareRedirectClient
 *
 * Client component rendered on the share route (/r/[date]).
 * Redirects to the home page with pre-fill query params so the
 * birth data form auto-populates and computes the cycle result. A shared
 * comparison also passes everyone else's reading as one ?p= each (a share
 * segment, such as 2000-03-15-cny) and any names as one ?n= per person.
 *
 * Uses native `window.location.replace()` instead of Next.js's
 * `router.replace()` for reliable query param preservation
 * across Next.js versions.
 */

import { useEffect } from "react";
import type { NewYearRule } from "@/lib/numerology/zodiac";
import { encodeComparisonSegment, type DecodedShare } from "@/lib/numerology/url-encoding";

interface Props {
  day: number;
  month: number;
  year: number;
  /** New Year rule the reading was shared with; passed on as ?ny=. */
  rule: NewYearRule;
  /** Everyone else in a shared comparison, in the link's order. */
  others?: DecodedShare[];
  /** Each person's name in a shared comparison, the reading's first; null where none. */
  names?: (string | null)[];
}

/** The home page URL that opens this reading, and the comparison if there is one. */
export function homeUrlFor({ day, month, year, rule, others = [], names = [] }: Props): string {
  const params = new URLSearchParams({
    day: String(day),
    month: String(month),
    year: String(year),
    ny: rule,
  });
  for (const other of others) params.append("p", encodeComparisonSegment([other]));
  if (names.some((name) => name !== null)) {
    for (const name of names) params.append("n", name ?? "");
  }
  return `/?${params.toString()}`;
}

export function ShareRedirectClient(props: Props) {
  const url = homeUrlFor(props);
  useEffect(() => {
    // Native browser redirect preserves query params reliably
    window.location.replace(url);
  }, [url]);

  // Brief loading state while redirecting. It rises in after a beat, so a
  // quick redirect never flashes it.
  return (
    <main className="flex flex-1 flex-col items-center justify-center safe-gutter py-16">
      <p className="rise text-ink-light text-sm italic" style={{ "--rise-delay": "300ms" } as React.CSSProperties}>
        Opening this reading…
      </p>
    </main>
  );
}
