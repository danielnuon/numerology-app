"use client";

/**
 * HistoryScroll
 *
 * Back, Forward and Reload land on the page where the visitor left it, at
 * once. Renders nothing. It covers two gaps:
 *
 * - Smooth scrolling on `<html>` is for in-page links, and Next.js switches
 *   it off for a link to a new page (`data-scroll-behavior` in the layout),
 *   but not for the browser's own scroll restoration after Back or Forward,
 *   which would otherwise glide through the page from the last page's
 *   position. So from each history step until the restored page has
 *   settled, scrolling is instant.
 * - A returning visitor's reading comes from the browser's storage, so it
 *   isn't in the page the server sends: that page holds only the short birth
 *   date form. On a reload, or when a phone reopens a tab it had put away,
 *   the browser restores the scroll position against that short page and
 *   stops at its end, partway down the reading that then appears. So the
 *   position is also remembered here when the page is hidden, and put back
 *   once the page has grown tall enough to hold it.
 */

import { useEffect } from "react";

/** How long after a history step the page counts as restored. */
export const RESTORE_WINDOW_MS = 1000;

/** How long after a reload the page may still grow into its remembered position. */
export const REGROW_WINDOW_MS = 5000;

/**
 * Prefix of the session storage keys that remember each page's scroll
 * position for the tab. The page's path and query string follow it.
 */
export const SCROLL_STORAGE_PREFIX = "solini:scroll:";

/** Anything the visitor does that means the scroll position is now theirs. */
const INPUT_EVENTS = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

function storageKey(): string {
  return SCROLL_STORAGE_PREFIX + window.location.pathname + window.location.search;
}

/** The position remembered for this page, or null. */
function readRememberedScroll(): number | null {
  try {
    const saved = sessionStorage.getItem(storageKey());
    const top = saved === null ? NaN : Number(saved);
    return Number.isFinite(top) ? top : null;
  } catch {
    // Storage blocked or the entry unreadable: nothing to restore
    return null;
  }
}

function rememberScroll(): void {
  try {
    sessionStorage.setItem(storageKey(), String(window.scrollY));
  } catch {
    // Storage blocked or full: the browser's own restoration still applies
  }
}

/** Whether this page load is a reload or a return through history, which restore the scroll position. */
function isRestoringLoad(): boolean {
  const [entry] = performance.getEntriesByType?.("navigation") ?? [];
  const type = (entry as PerformanceNavigationTiming | undefined)?.type;
  return type === "reload" || type === "back_forward";
}

export function HistoryScroll() {
  useEffect(() => {
    const html = document.documentElement;
    let timer = 0;
    const handlePopState = () => {
      html.style.scrollBehavior = "auto";
      window.clearTimeout(timer);
      timer = window.setTimeout(() => html.style.removeProperty("scroll-behavior"), RESTORE_WINDOW_MS);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.clearTimeout(timer);
      html.style.removeProperty("scroll-behavior");
    };
  }, []);

  useEffect(() => {
    // Read before anything is remembered for this load
    const remembered = isRestoringLoad() ? readRememberedScroll() : null;

    const handleHidden = () => {
      if (document.visibilityState === "hidden") rememberScroll();
    };
    document.addEventListener("visibilitychange", handleHidden);
    window.addEventListener("pagehide", rememberScroll);
    const stopRemembering = () => {
      document.removeEventListener("visibilitychange", handleHidden);
      window.removeEventListener("pagehide", rememberScroll);
    };

    if (remembered === null || typeof ResizeObserver !== "function") return stopRemembering;

    // The page as the server sent it may be too short for the position.
    // Wait for it to grow, unless the visitor starts scrolling themselves.
    const reach = () => document.documentElement.scrollHeight - window.innerHeight;
    let timer = 0;
    const observer = new ResizeObserver(() => {
      if (reach() < remembered) return;
      // Already there when the browser's own restoration reached it
      if (Math.abs(window.scrollY - remembered) > 1) window.scrollTo({ top: remembered, behavior: "instant" });
      stopWaiting();
    });
    function stopWaiting() {
      observer.disconnect();
      window.clearTimeout(timer);
      for (const type of INPUT_EVENTS) window.removeEventListener(type, stopWaiting);
    }
    observer.observe(document.body);
    timer = window.setTimeout(stopWaiting, REGROW_WINDOW_MS);
    for (const type of INPUT_EVENTS) window.addEventListener(type, stopWaiting, { passive: true });

    return () => {
      stopWaiting();
      stopRemembering();
    };
  }, []);

  return null;
}
