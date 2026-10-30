"use client";

/**
 * HistoryScroll
 *
 * Back and Forward land on the page where the visitor left it, at once.
 * Smooth scrolling on `<html>` is for in-page links, and Next.js switches it
 * off for a link to a new page (`data-scroll-behavior` in the layout), but
 * not for the browser's own scroll restoration after Back or Forward, which
 * would otherwise glide through the page from the last page's position. So
 * from each history step until the restored page has settled, scrolling is
 * instant. Renders nothing.
 */

import { useEffect } from "react";

/** How long after a history step the page counts as restored. */
export const RESTORE_WINDOW_MS = 1000;

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
  return null;
}
