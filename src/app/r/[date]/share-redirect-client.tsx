"use client";

/**
 * ShareRedirectClient
 *
 * Client component rendered on the share route (/r/[date]). Redirects to
 * the home page URL the route built for the shared reading or comparison
 * (homeUrlFor in src/lib/home-params.ts), so the home page opens on it.
 *
 * Uses native `window.location.replace()` instead of Next.js's
 * `router.replace()` for reliable query param preservation
 * across Next.js versions.
 */

import { useEffect } from "react";

interface Props {
  /** The home page URL to open, query string included. */
  url: string;
}

export function ShareRedirectClient({ url }: Props) {
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
