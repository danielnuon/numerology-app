/**
 * Sharing a link from the browser.
 *
 * Opens the native share sheet where the browser has one (most phones) and
 * copies the link otherwise. Used by every share button, so a reading and a
 * comparison share the same way.
 */

/** What happened when sharing: shown to the visitor, except for "shared" and "canceled". */
export type ShareOutcome = "shared" | "canceled" | "copied" | "failed";

/** The link and the words that travel with it in the share sheet. */
export interface ShareContent {
  /** Absolute URL to share. */
  url: string;
  title: string;
  text: string;
}

/** Copies the URL to the clipboard, reporting whether it worked. */
async function copyLink(url: string): Promise<ShareOutcome> {
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

/**
 * Shares the link with the native share sheet, or copies it when there is no
 * sheet or the sheet fails. Closing the sheet counts as canceled, not failed.
 */
export async function shareLink(content: ShareContent): Promise<ShareOutcome> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share(content);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "canceled";
    }
  }
  return copyLink(content.url);
}
