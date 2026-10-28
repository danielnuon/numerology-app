"use client";

/**
 * ShareReading
 *
 * Share actions under a reading: the native share sheet where the browser has
 * one (most phones), otherwise copy the link; plus "Download image", which
 * saves the share route's preview card. The link is /r/YYYY-MM-DD, so anyone
 * who opens it sees this reading and a preview card in chat apps.
 */

import { useState } from "react";
import { buildSharePath, encodeBirthDate } from "@/lib/numerology/url-encoding";
import { SHARED_READING_TITLE } from "@/lib/site-copy";
import type { NewYearRule } from "@/lib/numerology/zodiac";

interface Props {
  /** Birth year of the reading being shared. */
  year: number;
  /** Birth month (1–12). */
  month: number;
  /** Birth day (1–31). */
  day: number;
  /** New Year rule the reading uses; the link carries it so recipients match. */
  rule: NewYearRule;
}

/** Feedback after an action, read out by screen readers. */
type Status = "idle" | "copied" | "failed";

const STATUS_TEXT: Record<Status, string> = {
  idle: "",
  copied: "Link copied. Paste it anywhere to share your reading.",
  failed: "Couldn't copy automatically. Copy the link from the address bar instead.",
};

const SHARE_TEXT = "Here's my 12-year Khmer numerology cycle. See yours on Solini.";

const ACTION_CLASS = [
  "pressable inline-flex items-center justify-center min-h-[44px] px-5 rounded-full",
  "border border-border text-sm text-ink-light tracking-[0.04em]",
  "hover:text-ink hover:border-gold active:opacity-70",
].join(" ");

export function ShareReading({ year, month, day, rule }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const sharePath = buildSharePath(year, month, day, rule);

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  async function handleShare() {
    const url = new URL(sharePath, window.location.origin).toString();
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: SHARED_READING_TITLE, text: SHARE_TEXT, url });
        return;
      } catch (error) {
        // Closing the share sheet is not a failure; anything else falls back to copying.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copyLink(url);
  }

  return (
    <section
      aria-label="Share your reading"
      className="w-full max-w-[480px] mx-auto mt-10 text-center"
    >
      <p className="font-display text-xl text-ink tracking-[0.04em]">
        Share your reading
      </p>
      <p className="mt-1 text-sm text-ink-light leading-relaxed">
        Send your cycle to friends and family so they can find theirs.
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={handleShare}
          className={[
            "pressable inline-flex items-center justify-center min-h-[44px] px-6 rounded-full",
            "border border-gold-deep text-gold-deep text-sm font-medium uppercase tracking-[0.14em]",
            "hover:bg-gold-deep hover:text-parchment hover:shadow-[var(--shadow-glow)]",
            "active:scale-[0.98] active:bg-gold-deep active:text-parchment",
          ].join(" ")}
        >
          Share
        </button>
        <a
          href={`${sharePath}/opengraph-image`}
          download={`solini-reading-${encodeBirthDate(year, month, day)}.png`}
          className={ACTION_CLASS}
        >
          Download image
        </a>
      </div>

      <p role="status" className="mt-3 min-h-[1.25rem] text-xs text-ink-light">
        {STATUS_TEXT[status]}
      </p>
      <p className="mt-1 text-xs text-ink-light">
        The link shows this birth date to anyone who opens it.
      </p>
    </section>
  );
}
