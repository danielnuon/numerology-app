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

/**
 * Solini's one brand line, under the name on the home page, in link
 * previews and as the About page's title. "Khmer numerology" is the plain
 * description that goes with it.
 */
export const SITE_TAGLINE = "A lantern for every year in your cycle";

/** Browser tab and search result title. */
export const SITE_TITLE = `Solini — Khmer numerology, ${SITE_TAGLINE.toLowerCase()}`;

/** Search result snippet and default link-preview description. */
export const SITE_DESCRIPTION =
  "Enter your birth date to see your 12-year life cycle in Khmer numerology: a luck number for every year, worked from your birth month, zodiac animal and weekday. Free, no sign-up.";

/** Link-preview title, kept short so it is not cut off in chat apps. */
export const SHARE_TITLE = `Solini — ${SITE_TAGLINE}`;

/** Link-preview description, kept under ~120 characters for chat apps. */
export const SHARE_DESCRIPTION =
  "See your luck for every year of a 12-year cycle, from Khmer numerology. Free, and it takes seconds.";

/** Title for a shared reading's link preview. */
export const SHARED_READING_TITLE = "A 12-year Khmer numerology reading — Solini";

/** One year of a reading as the share text and previews name it. */
export interface YearHeadline {
  /** The calendar year, e.g. 2026. */
  year: number;
  /** The luck tier's label, e.g. "Very strong luck". */
  label: string;
  /** The year's life area, e.g. "Allies". */
  area: string;
}

/** "2026: Very strong luck · Allies", the line the reading's preview image shows. */
export function yearHeadline({ year, label, area }: YearHeadline): string {
  return `${year}: ${label} · ${area}`;
}

/**
 * Link-preview description for a shared reading. Leads with this year's
 * reading rather than the total score, which only ever comes to 52, 64 or
 * 76. Leaves out the birth date, which the preview image already shows.
 */
export function sharedReadingDescription(headline: YearHeadline): string {
  return `${yearHeadline(headline)}. See this 12-year cycle, then find your own in seconds.`;
}

/**
 * The message sent with a shared reading: this year's reading in a line,
 * then the invitation. A reading opened from someone else's link isn't the
 * visitor's, so it says "A", not "My".
 */
export function shareReadingText({ year, label, area }: YearHeadline, isShared: boolean): string {
  return `${isShared ? "A" : "My"} ${year} Khmer numerology reading: ${label} · ${area}. See yours on Solini.`;
}

/** How many people a comparison holds, as a word ("Two" to "Six"); larger counts stay digits. */
export function peopleCountWord(count: number): string {
  return ["Two", "Three", "Four", "Five", "Six"][count - 2] ?? String(count);
}

/** Title for a shared comparison's link preview: "Two Khmer numerology cycles, compared — Solini". */
export function sharedComparisonTitle(count: number): string {
  return `${peopleCountWord(count)} Khmer numerology cycles, compared — Solini`;
}

/**
 * Link-preview description for a shared comparison of `count` people.
 * Leaves out the birth dates and names, like a shared reading's description.
 */
export function sharedComparisonDescription(assessmentLabel: string, count: number): string {
  return `${assessmentLabel}: see how these ${peopleCountWord(count).toLowerCase()} 12-year cycles meet, year by year, then compare your own.`;
}

/** About page title. */
export const ABOUT_TITLE = "About Solini — the Khmer numerology tradition behind it";

/** About page search snippet and link-preview description. */
export const ABOUT_DESCRIPTION =
  "Where Solini's 12-year cycle comes from, how it is worked out from your birth month, zodiac animal and weekday, and how to read the numbers.";

/** "How your cycle is made" page title. */
export const HOW_IT_WORKS_TITLE = "How your cycle is made — Solini";

/** "How your cycle is made" search snippet and link-preview description. */
export const HOW_IT_WORKS_DESCRIPTION =
  "Follow a 12-year Khmer numerology cycle being worked out step by step: three starting numbers, three rows, and each column's sum.";

/** "What the numbers mean" page title. */
export const MEANING_TITLE = "What the numbers mean — Solini";

/** "What the numbers mean" search snippet and link-preview description. */
export const MEANING_DESCRIPTION =
  "What each number from 0 to 11 means in a Khmer numerology cycle, the twelve life areas, and how to read the total score.";

/** "Our heritage" page title. */
export const HERITAGE_TITLE = "Our heritage: Cambodia and the Khmer people — Solini";

/** "Our heritage" search snippet and link-preview description. */
export const HERITAGE_DESCRIPTION =
  "How the Khmer have read time for centuries, from the zero carved in stone and Angkor Wat's equinox sunrise to the New Year, and where Solini's numerology fits. Khmer or Cambodian, the Khmer Rouge years and the family story behind Solini.";
