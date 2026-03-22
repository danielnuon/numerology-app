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

interface Props {
  day: number;
  month: number;
  year: number;
}

export function ShareRedirectClient({ day, month, year }: Props) {
  useEffect(() => {
    // Native browser redirect preserves query params reliably
    window.location.replace(`/?day=${day}&month=${month}&year=${year}`);
  }, [day, month, year]);

  // Brief loading state while redirecting
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <p className="text-ink-light text-sm italic">Loading your reading...</p>
    </main>
  );
}
