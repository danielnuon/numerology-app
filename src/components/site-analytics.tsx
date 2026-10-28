"use client";

/**
 * SiteAnalytics
 *
 * Vercel Web Analytics (page views) and Speed Insights (real-user
 * performance). Neither sets cookies. Every URL passes through
 * redactEvent() first so a birth date in the path or query is never sent.
 *
 * Lives in a client component because `beforeSend` is a function, which a
 * server component like the root layout cannot pass down.
 */

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { redactEvent } from "@/lib/analytics";

export function SiteAnalytics() {
  return (
    <>
      <Analytics beforeSend={redactEvent} />
      <SpeedInsights beforeSend={redactEvent} />
    </>
  );
}
