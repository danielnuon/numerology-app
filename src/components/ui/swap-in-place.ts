/**
 * swapInPlace
 *
 * Replaces one view with another in the same place without animating layout
 * or snapshotting the page, the way `<Reveal>` opens a disclosure:
 *
 * 1. The outgoing content fades out quickly.
 * 2. The page takes its new shape in a single layout (the `swap` callback,
 *    which must render synchronously, as `flushSync` does).
 * 3. Content after the slot, on every level up to the page, glides from
 *    where it was to where it now sits with `transform`, and every card
 *    around the slot sweeps its bottom edge with a rounded `clip-path`, so
 *    the card appears to grow (400ms) or shrink (250ms). A card that shrinks
 *    keeps its old height until the glide ends, so nothing below jumps.
 * 4. The incoming content rises a few pixels as it fades in.
 *
 * Everything moves live, on real elements, so it doesn't depend on how a
 * browser snapshots a view transition (a tall card, taller than the screen,
 * is the case that goes wrong). With Reduce Motion, or where Web
 * Animations are missing, the swap is instant.
 */

import { EASE, MOTION } from "@/lib/motion";
import { prefersReducedMotion, surroundings } from "@/components/ui/reveal";

const ease = (curve: readonly number[]) => `cubic-bezier(${curve.join(", ")})`;

interface Options {
  /** The element whose content changes; what follows it glides. */
  slot: HTMLElement;
  /** Elements on screen now that the swap removes. */
  outgoing: HTMLElement[];
  /** Lays out the new view, synchronously. */
  swap: () => void;
  /** Elements the swap brings in, read after it runs. */
  incoming: () => HTMLElement[];
}

/** A swap in progress, which can be finished at once. */
export interface Swap {
  finish: () => void;
}

export function swapInPlace({ slot, outgoing, swap, incoming }: Options): Swap {
  if (prefersReducedMotion() || typeof slot.animate !== "function") {
    swap();
    return { finish: () => {} };
  }

  const animations: Animation[] = [];
  const held: { el: HTMLElement; minHeight: string }[] = [];
  let swapped = false;
  let done = false;

  // Drop every held frame and height together, so the page lands in its
  // new shape without a jump
  const finish = () => {
    if (done) return;
    done = true;
    if (!swapped) {
      swapped = true;
      swap();
    }
    held.forEach(({ el, minHeight }) => {
      el.style.minHeight = minHeight;
    });
    animations.forEach((animation) => animation.cancel());
  };

  const fadeOut = outgoing.map((el) =>
    el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: MOTION.quick * 1000,
      easing: ease(EASE.exit),
      fill: "forwards",
    })
  );
  animations.push(...fadeOut);

  Promise.all(fadeOut.map((animation) => animation.finished))
    .then(() => {
      if (done) return;
      const { following, surfaces } = surroundings(slot);
      const measure = () => ({
        tops: following.map((el) => el.getBoundingClientRect().top),
        shown: following.map((el) => el.getClientRects().length > 0),
        heights: surfaces.map((el) => el.offsetHeight),
      });
      const before = measure();
      swapped = true;
      swap();
      const after = measure();

      // A card that shrinks holds its height for the glide, so the blocks
      // below stay put in the layout and slide up by transform instead
      const shrinking = surfaces.map((el, i) => after.heights[i] < before.heights[i] - 0.5);
      // Growing takes 400ms like an opening Reveal; shrinking takes 250ms,
      // like a closing one, so the emptied part of the card goes quickly
      const timing: KeyframeAnimationOptions = {
        duration: (shrinking.some(Boolean) ? MOTION.standard : MOTION.gentle) * 1000,
        easing: ease(EASE.standard),
        fill: "both",
      };
      surfaces.forEach((el, i) => {
        if (!shrinking[i]) return;
        held.push({ el, minHeight: el.style.minHeight });
        el.style.minHeight = `${before.heights[i]}px`;
      });
      const laidOut = measure();

      following.forEach((el, i) => {
        // Content that only one view has fades instead of gliding
        if (!before.shown[i] || !after.shown[i]) return;
        const from = before.tops[i] - laidOut.tops[i];
        const to = after.tops[i] - laidOut.tops[i];
        if (Math.abs(from - to) < 0.5) return;
        animations.push(
          el.animate(
            [{ transform: `translateY(${from}px)` }, { transform: `translateY(${to}px)` }],
            { ...timing, composite: "add" }
          )
        );
      });

      surfaces.forEach((el, i) => {
        const from = laidOut.heights[i] - before.heights[i];
        const to = laidOut.heights[i] - after.heights[i];
        if (Math.abs(from - to) < 0.5) return;
        const radius = getComputedStyle(el).borderBottomLeftRadius;
        // A pixel of room at the edges keeps the glass card's lit border
        const inset = (bottom: number) => `inset(-1px -1px ${bottom - 1}px -1px round ${radius})`;
        animations.push(el.animate([{ clipPath: inset(from) }, { clipPath: inset(to) }], timing));
      });

      animations.push(
        ...incoming().map((el) =>
          el.animate(
            [
              { opacity: 0, transform: "translateY(4px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: MOTION.gentle * 1000, delay: 60, easing: ease(EASE.enter), fill: "both" }
          )
        )
      );

      return Promise.all(animations.map((animation) => animation.finished)).then(finish);
    })
    // An animation canceled from outside rejects. Land the swap anyway, so
    // no fade, clip or held height is left behind
    .catch(finish);

  return { finish };
}
