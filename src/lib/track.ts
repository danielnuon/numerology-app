/**
 * Product events for Vercel Web Analytics.
 *
 * Four moments show whether Solini is working: a reading revealed, a
 * reading or comparison shared, and a comparison made. Each event carries
 * one flag, fromSharedLink, and never a birth date. For "Reading revealed"
 * it says the visit began on someone else's shared link, so it counts
 * recipients who went on to read their own; for the others, that the
 * reading on screen is someone else's. The event's page URL passes through
 * the same redaction as page views (see analytics.ts). Custom events are
 * only recorded on Vercel plans that include them; elsewhere they are
 * dropped without error.
 */

import { track } from "@vercel/analytics";

/** The events Solini sends. */
export type ProductEvent = "Reading revealed" | "Reading shared" | "Comparison made" | "Comparison shared";

/** Sends one product event with its shared-link flag. */
export function trackEvent(name: ProductEvent, fromSharedLink: boolean): void {
  track(name, { fromSharedLink });
}
