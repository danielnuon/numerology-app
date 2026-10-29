"use client";

/**
 * Reveal
 *
 * Opens and closes a disclosure's content in place without animating layout.
 * The page takes its new shape in a single layout, then everything that
 * moved is glided from where it was drawn to where it now sits, using only
 * properties the compositor can run on its own:
 *
 * - content after the disclosure, on every level up to the page, slides
 *   with `transform`;
 * - every card around it that paints a background, border or shadow (the
 *   total score card, the glass card) has its bottom edge swept with a
 *   rounded `clip-path`, so the card appears to grow;
 * - the content itself is wiped open with the same sweep and fades in.
 *
 * Closing plays the same glide back and only then lets the page shrink.
 * Toggling mid-way reverses the glide from where it is. With Reduce Motion,
 * or where Web Animations are missing, it opens and closes at once.
 *
 * Animating height (or grid rows) instead would lay out and repaint the
 * whole page, glass blur included, on every frame. See "Transitions" in
 * docs/standards/design-language.md.
 */

import { useLayoutEffect, useRef, useState } from "react";
import { EASE, MOTION } from "@/lib/motion";

interface Props {
  open: boolean;
  /** For the toggle's aria-controls. */
  id?: string;
  /** Classes for the content wrapper (spacing, layout). */
  className?: string;
  children: React.ReactNode;
}

/** Room left around the content's clip so glows and focus rings show. */
const CLIP_MARGIN = 24;

const SPATIAL_EASE = `cubic-bezier(${EASE.standard.join(", ")})`;

interface Glide {
  animations: Animation[];
  /** Whether the content should be laid out once the glide ends. */
  target: boolean;
}

/** Whether an element draws a box of its own whose bottom edge would be seen to jump. */
function paintsSurface(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  const backdrop = style.backdropFilter || style.getPropertyValue("-webkit-backdrop-filter");
  return (
    !/rgba\(.*,\s*0\)|transparent/.test(style.backgroundColor) ||
    parseFloat(style.borderBottomWidth) > 0 ||
    style.boxShadow !== "none" ||
    (backdrop !== "" && backdrop !== "none")
  );
}

/**
 * What moves when the slot opens or closes: the elements after it on every
 * level up to the page, and the surfaces that contain it.
 */
function surroundings(slot: HTMLElement) {
  const following: HTMLElement[] = [];
  const surfaces: HTMLElement[] = [];
  for (let node: HTMLElement = slot; node.parentElement && node.parentElement !== document.body; node = node.parentElement) {
    for (let next = node.nextElementSibling; next; next = next.nextElementSibling) {
      if (next instanceof HTMLElement) following.push(next);
    }
    if (paintsSurface(node.parentElement)) surfaces.push(node.parentElement);
  }
  return { following, surfaces };
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Reveal({ open, id, className = "", children }: Props) {
  const slotRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glideRef = useRef<Glide | null>(null);
  // Only the first render sets whether the content is laid out; after that
  // the glide sets it on the element, at the moment that keeps the page
  // still. React leaves the attribute alone because this value never changes.
  const [initiallyShown] = useState(open);
  const shownRef = useRef(open);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    const content = contentRef.current;
    if (!slot || !content) return;

    const setShown = (shown: boolean) => {
      shownRef.current = shown;
      slot.toggleAttribute("data-shown", shown);
    };

    // Toggled mid-glide: play it back from where it is
    const running = glideRef.current;
    if (running) {
      if (running.target !== open) {
        running.target = open;
        running.animations.forEach((animation) => animation.reverse());
      }
      return;
    }
    if (shownRef.current === open) return;

    if (prefersReducedMotion() || typeof slot.animate !== "function") {
      setShown(open);
      return;
    }

    // Measure the page in both shapes within this frame, then hold it in
    // the open shape for the glide
    const { following, surfaces } = surroundings(slot);
    const measure = () => ({
      tops: following.map((el) => el.getBoundingClientRect().top),
      heights: surfaces.map((el) => el.offsetHeight),
      slot: slot.offsetHeight,
    });
    const before = measure();
    setShown(!shownRef.current);
    const after = measure();
    const openShape = open ? after : before;
    const closedShape = open ? before : after;
    setShown(true);

    // Each keyframe pair runs from the closed look to the open look; closing
    // plays it backward
    const timing: KeyframeAnimationOptions = open
      ? { duration: MOTION.gentle * 1000, easing: SPATIAL_EASE, fill: "both" }
      : { duration: MOTION.standard * 1000, easing: SPATIAL_EASE, fill: "both", direction: "reverse" };

    const animations: Animation[] = [];
    following.forEach((el, i) => {
      const moved = (open ? after.tops[i] - before.tops[i] : before.tops[i] - after.tops[i]);
      if (Math.abs(moved) < 0.5) return;
      animations.push(
        el.animate([{ transform: `translateY(${-moved}px)` }, { transform: "none" }], { ...timing, composite: "add" })
      );
    });
    surfaces.forEach((el, i) => {
      const grown = openShape.heights[i] - closedShape.heights[i];
      if (grown < 0.5) return;
      const radius = getComputedStyle(el).borderBottomLeftRadius;
      // A pixel of room at the edges keeps the glass card's lit border
      animations.push(
        el.animate(
          [
            { clipPath: `inset(-1px -1px ${grown - 1}px -1px round ${radius})` },
            { clipPath: `inset(-1px -1px -1px -1px round ${radius})` },
          ],
          timing
        )
      );
    });
    const m = CLIP_MARGIN;
    animations.push(
      slot.animate(
        [
          { clipPath: `inset(-${m}px -${m}px ${openShape.slot}px -${m}px)` },
          { clipPath: `inset(-${m}px)` },
        ],
        timing
      ),
      content.animate(
        [
          { opacity: 0, transform: "translateY(-4px)" },
          { opacity: 1, transform: "none" },
        ],
        open
          ? { duration: MOTION.gentle * 1000, delay: 60, easing: `cubic-bezier(${EASE.enter.join(", ")})`, fill: "both" }
          : { duration: MOTION.quick * 1000, easing: `cubic-bezier(${EASE.exit.join(", ")})`, fill: "both", direction: "reverse" }
      )
    );

    const glide: Glide = { animations, target: open };
    glideRef.current = glide;
    Promise.all(animations.map((animation) => animation.finished))
      .then(() => {
        if (glideRef.current !== glide) return;
        glideRef.current = null;
        // Change the page's shape and drop the held frames together, so
        // nothing moves when the glide hands over
        setShown(glide.target);
        animations.forEach((animation) => animation.cancel());
      })
      .catch(() => {});
  }, [open]);

  useLayoutEffect(
    () => () => {
      glideRef.current?.animations.forEach((animation) => animation.cancel());
      glideRef.current = null;
    },
    []
  );

  return (
    <div
      ref={slotRef}
      id={id}
      data-open={open}
      data-shown={initiallyShown ? "" : undefined}
      inert={!open}
      aria-hidden={!open}
      className="reveal"
    >
      <div ref={contentRef} className={`reveal-content ${className}`}>{children}</div>
    </div>
  );
}
