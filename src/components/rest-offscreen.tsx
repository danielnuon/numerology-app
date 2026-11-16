"use client";

/**
 * RestOffscreen
 *
 * A living surface that is off screen rests: its loops are paused until it
 * comes back, and pick up where they stopped. Renders nothing.
 *
 * A looping glow is animated by the compositor, but the page still restyles
 * every running animation on each frame it draws, and it draws one for every
 * frame of a scroll. On a long page nearly all the glows are off screen at
 * any moment (the header's flame, the wheel, most of the timeline's sixty
 * dots), and they were costing as much as the ones in view. Profiling a
 * phone-sized page put half of a scroll's main-thread time there.
 *
 * Each element matching `LIVING_SURFACES` is watched with an
 * IntersectionObserver, which also sees the timeline's own sideways scroll,
 * and carries `data-resting` while it is out of view (`[data-resting]` in
 * globals.css pauses the animations inside it). Elements that arrive later,
 * such as a reading, are found as the page changes.
 */

import { useEffect } from "react";

/**
 * The elements whose loops rest off screen. Each holds its loops inside it,
 * on its pseudo-elements or its descendants. The sky's glows are fixed to
 * the screen, so they never rest.
 */
export const LIVING_SURFACES = [
  ".solini-mark",
  ".title-glow",
  ".breathe-glow",
  ".lamp-orb",
  ".wheel-depth-ring",
  ".wheel-hub",
  ".wheel-reading",
].join(", ");

/** The attribute a resting element carries. */
export const RESTING_ATTR = "data-resting";

/** How far outside the screen a surface wakes, so it is already moving when it arrives. */
const WAKE_MARGIN = "160px";

export function RestOffscreen() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || typeof MutationObserver === "undefined") return;

    const watched = new Set<Element>();
    const visibility = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.toggleAttribute(RESTING_ATTR, !entry.isIntersecting);
      },
      { rootMargin: WAKE_MARGIN }
    );

    function findSurfaces() {
      for (const el of watched) {
        if (el.isConnected) continue;
        visibility.unobserve(el);
        watched.delete(el);
      }
      for (const el of document.querySelectorAll(LIVING_SURFACES)) {
        if (watched.has(el)) continue;
        watched.add(el);
        visibility.observe(el);
      }
    }

    // The page changes in bursts (a reading opening, a route change); one
    // look per frame covers each burst.
    let frame = 0;
    const changes = new MutationObserver(() => {
      frame ||= requestAnimationFrame(() => {
        frame = 0;
        findSurfaces();
      });
    });
    changes.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    findSurfaces();

    return () => {
      cancelAnimationFrame(frame);
      changes.disconnect();
      visibility.disconnect();
      for (const el of watched) el.removeAttribute(RESTING_ATTR);
    };
  }, []);

  return null;
}
