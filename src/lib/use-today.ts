/**
 * useToday
 *
 * The one place a page reads the clock for "today". A reading depends on
 * the date (the active year waits for the birthday), and the server and the
 * visitor can be on different dates: the server keeps UTC, and a visitor in
 * Phnom Penh is a day ahead of it for seven hours of every day. If each
 * read its own clock while the page hydrates, a reading near a birthday
 * would render one year on the server and another in the browser, and React
 * would throw the server's page away.
 *
 * So the server page passes the moment it rendered (`renderedAt`), and the
 * first browser render uses the same moment. Once the page has hydrated,
 * today becomes the visitor's own date, and a reading that differs updates
 * in place. The date is read once and kept, so every part of the page
 * agrees on it.
 */

import { useMemo } from "react";
import { useIsHydrated } from "./use-is-hydrated";

/** The UTC calendar day of a moment, as a Date whose local parts hold that day. */
export function utcDay(moment: Date): Date {
  return new Date(moment.getUTCFullYear(), moment.getUTCMonth(), moment.getUTCDate(), 12);
}

/**
 * Today as a Date to read with getFullYear, getMonth and getDate.
 *
 * @param renderedAt - When the server rendered the page, in milliseconds
 *   since the epoch (`Date.now()` in the server page)
 */
export function useToday(renderedAt: number): Date {
  const isHydrated = useIsHydrated();
  return useMemo(
    () => (isHydrated ? new Date() : utcDay(new Date(renderedAt))),
    [isHydrated, renderedAt]
  );
}
