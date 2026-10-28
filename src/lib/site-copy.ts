/**
 * Site Copy
 *
 * Product name, taglines and link-preview text shared by the page metadata,
 * the web app manifest and the share route, so search results, home-screen
 * installs and shared links all describe Solini the same way.
 *
 * Wording rules: describe the reading as a Khmer numerology tradition, not a
 * forecast, and only promise what the app does (free, no sign-up, the birth
 * date is saved in this browser only).
 */

export const SITE_NAME = "Solini";

/** Browser tab and search result title. */
export const SITE_TITLE = "Solini — Your 12-Year Khmer Numerology Cycle";

/** Search result snippet and default link-preview description. */
export const SITE_DESCRIPTION =
  "Enter your birth date to see your 12-year life cycle in Khmer numerology: a luck number for every year, worked from your birth month, zodiac animal and weekday. Free, no sign-up.";

/** Link-preview title, kept short so it is not cut off in chat apps. */
export const SHARE_TITLE = "Solini — Khmer numerology, year by year";

/** Link-preview description, kept under ~120 characters for chat apps. */
export const SHARE_DESCRIPTION =
  "See your luck for every year of a 12-year cycle, from a Cambodian numerology tradition. Free, and it takes seconds.";

/** Title for a shared reading's link preview. */
export const SHARED_READING_TITLE = "A 12-year Khmer numerology reading — Solini";

/**
 * Link-preview description for a shared reading. Leaves out the birth date,
 * which the preview image already shows.
 */
export function sharedReadingDescription(
  totalScore: number,
  totalLabel: string
): string {
  return `Total score ${totalScore}: ${totalLabel}. See this 12-year cycle, then find your own in seconds.`;
}

/** About page title. */
export const ABOUT_TITLE = "About Solini — the Khmer numerology tradition behind it";

/** About page search snippet and link-preview description. */
export const ABOUT_DESCRIPTION =
  "Where Solini's 12-year cycle comes from, how it is worked out from your birth month, zodiac animal and weekday, and how to read the numbers.";
