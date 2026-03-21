"use client";

/**
 * ShareRedirectClient
 *
 * Client component rendered on the share route (/r/[date]).
 * Redirects to the home page with pre-fill query params so the
 * birth data form auto-populates and computes the cycle result.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  day: number;
  month: number;
  year: number;
}

export function ShareRedirectClient({ day, month, year }: Props) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home with pre-fill params
    router.replace(`/?day=${day}&month=${month}&year=${year}`);
  }, [router, day, month, year]);

  // Brief loading state while redirecting
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <p className="text-ink-light text-sm italic">Loading your reading...</p>
    </main>
  );
}
