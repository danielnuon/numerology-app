/**
 * Privacy filter for Vercel Web Analytics and Speed Insights.
 *
 * Both scripts report the page URL with every event. Solini carries a
 * visitor's birth date in two places: the share route path (/r/[date]) and
 * the pre-fill query (?day=&month=&year=). The site promises that a birth
 * date stays in the browser, so every URL is redacted before it is sent.
 */

const SHARE_ROUTE = /^\/r\/[^/]+/;

/**
 * Returns the URL with its query string and hash removed and any share
 * route date replaced by the `[date]` placeholder. Returns null when the
 * URL cannot be parsed, so the caller drops the event instead of leaking it.
 */
export function redactUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const path = parsed.pathname.replace(SHARE_ROUTE, "/r/[date]");
  return `${parsed.origin}${path}`;
}

/** `beforeSend` for both packages: redact the URL or drop the event. */
export function redactEvent<T extends { url: string }>(event: T): T | null {
  const url = redactUrl(event.url);
  return url === null ? null : { ...event, url };
}
