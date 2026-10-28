"use client";

/**
 * ShareRedirectClient
 *
 * Client component rendered on the share route (/r/[date]).
 * Redirects to the home page with pre-fill query params so the
 * birth data form auto-populates and computes the cycle result.
 *
 * Uses native `window.location.replace()` instead of Next.js's
 * `router.replace()` for reliable query param preservation
 * across Next.js versions.
 */

import { useEffect } from "react";
import type { NewYearRule } from "@/lib/numerology/zodiac";

interface Props {
  day: number;
  month: number;
  year: number;
  /** New Year rule the reading was shared with; passed on as ?ny=. */
  rule: NewYearRule;
}

export function ShareRedirectClient({ day, month, year, rule }: Props) {
  useEffect(() => {
    // Native browser redirect preserves query params reliably
    window.location.replace(`/?day=${day}&month=${month}&year=${year}&ny=${rule}`);
  }, [day, month, year, rule]);

  // Brief loading state while redirecting
  return (
    <main className="flex flex-1 flex-col items-center justify-center safe-gutter py-16">
      <p className="text-ink-light text-sm italic">Opening this reading…</p>
    </main>
  );
}
