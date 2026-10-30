"use client";

/**
 * The woven flame travels between pages. Every page's own flame (the home
 * page's beside the title, the small one in the other pages' header) wears
 * the same view-transition name, `solini-flame`, through `.flame-anchor` in
 * globals.css, so on a page change the browser glides and scales it from
 * where it was on the old page to where it lands on the new one while the
 * rest of the page changes around it.
 *
 * A page opened from a link shows a flame that arrived; a page loaded
 * directly (a typed address, a shared link, a refresh) has nothing to travel
 * from, so its flame weaves itself in instead. `usePageArrival` tells the two
 * apart.
 */

import { useEffect, useRef, useState } from "react";
import { SoliniMark } from "@/components/ui/solini-mark";

/** Becomes true once the first page has been shown in this tab. */
let pageShown = false;

/**
 * How this page arrived: "load" for the first page shown in this tab
 * (including the server's render, so the two agree), "navigate" for every
 * page reached by a link after it.
 */
export function usePageArrival(): "load" | "navigate" {
  const [arrival] = useState<"load" | "navigate">(() => (pageShown ? "navigate" : "load"));
  useEffect(() => {
    pageShown = true;
  }, []);
  return arrival;
}

/** Lets tests start again from a first page load. */
export function resetPageArrival() {
  pageShown = false;
}

/**
 * Wraps a page's flame so that it travels to the next page. A flame scrolled
 * well out of view gives up its name (`data-out-of-view`), so the next
 * page's flame arrives with the page instead of flying in from far away.
 */
export function FlameAnchor({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const anchor = ref.current;
    if (!anchor || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      anchor.toggleAttribute("data-out-of-view", !entry.isIntersecting);
    });
    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);
  return (
    <span ref={ref} className={`flame-anchor inline-flex ${className}`}>
      {children}
    </span>
  );
}

/** The small flame beside the Solini link at the top of the companion pages. */
export function PageFlame({ className = "" }: { className?: string }) {
  const arrival = usePageArrival();
  return (
    <FlameAnchor>
      <SoliniMark woven={arrival === "load"} landed={arrival === "navigate"} className={className} />
    </FlameAnchor>
  );
}
