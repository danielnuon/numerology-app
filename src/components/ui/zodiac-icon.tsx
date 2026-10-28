/**
 * ZodiacIcon
 *
 * The twelve zodiac animals drawn as engraved line marks for Temple Lantern:
 * a 32-unit grid, 1.5 strokes with round ends, colored by currentColor
 * (gold on the dark page). Decorative by default, because the animal's name
 * is always written next to it.
 *
 * Which animal rules a year lives in lib/numerology/zodiac.ts, not here, so
 * a change to the New Year boundary never touches the artwork.
 */

import type { ZodiacAnimal } from "@/lib/numerology/zodiac";

/**
 * Path data for each animal on a 32×32 viewBox, stroked rather than filled.
 * Exported as plain data so non-React renderers (e.g. next/og share cards)
 * can draw the same marks.
 */
export const ZODIAC_ICON_PATHS: Record<ZodiacAnimal, readonly string[]> = {
  Rat: [
    "M6 21c0-5 4-9 9.5-9 4 0 7 2 8.5 5l2.5 1.5-2.5 1.5c-1 2.5-4 4-8 4H9c-1.8 0-3-1.2-3-3z",
    "M14 12.5a3.2 3.2 0 1 1 5.5-2.2",
    "M6.5 22.5C4 23 3 25 4.5 26.5S9 27 10 25",
    "M22 18.6h.01",
  ],
  Ox: [
    "M10 13c0 7 2.5 13 6 13s6-6 6-13",
    "M10 13c-3-1-5.5-3.5-5.5-7 2 2 4 3 7 3",
    "M22 13c3-1 5.5-3.5 5.5-7-2 2-4 3-7 3",
    "M11.5 9.5c3-1.3 6-1.3 9 0",
    "M13 22.5c1.8 1 4.2 1 6 0",
    "M13.5 15.5h.01M18.5 15.5h.01",
  ],
  Tiger: [
    "M8 15c0-5 3.6-8.5 8-8.5S24 10 24 15c0 6-3.6 10.5-8 10.5S8 21 8 15z",
    "M9.5 10L7.5 6.5l4.5 1.5M22.5 10l2-3.5-4.5 1.5",
    "M16 8.5v3M13 9.5l1 2.5M19 9.5l-1 2.5",
    "M12.5 16h.01M19.5 16h.01",
    "M14.5 20l1.5 1.2 1.5-1.2",
    "M5 19.5l5 .5M5.5 23l4.8-1.3M27 19.5l-5 .5M26.5 23l-4.8-1.3",
  ],
  Rabbit: [
    "M9.5 21c0-4 2.9-7 6.5-7s6.5 3 6.5 7-2.9 6-6.5 6-6.5-2-6.5-6z",
    "M13.5 14.5C11.5 11 11 6 12.8 4.5c2 1.5 2.5 6.5 2 9.6",
    "M18.5 14.5C20.5 11 21 6 19.2 4.5c-2 1.5-2.5 6.5-2 9.6",
    "M13.5 20h.01M18.5 20h.01",
    "M15 23.3l1 .7 1-.7",
  ],
  Dragon: [
    "M4 25c4 0 5-6 9-6s5 5 9 3.5 2.5-7.5-1.5-9.5",
    "M20.5 13c0-3 2-5.5 5-5.5l3 1.5-2.5 1.5c-1.5 2-3 2.8-5.5 2.5",
    "M23 7.7l-1-3M25.5 7.5l1-3",
    "M28.5 9c1 1 1 2.5 0 3.5",
    "M24.8 9.3h.01",
    "M8 22l-1.5-2M12 19.2l-.5-2.5M17 20.5l1-2",
    "M4 25c-1.5.5-1.5 2.5 0 2.5",
  ],
  Snake: [
    "M9 9.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4c0 3.5-9 4-9 9.5 0 3.5 3.5 6 8 6s7.5-1.5 9-4",
    "M18 9.5c0 1.5-.8 2.6-2 3.4",
    "M9 9.5c-1.5 0-3-1-3.5-2.5",
    "M5.5 7L3.5 6M5.5 7l-1.5 1.5",
    "M12.3 7.8h.01",
  ],
  Horse: [
    "M10 27c0-6-1-11 1-15 2-4 5-6 8-6l1-2.5 1.5 3c2.5 1.5 4.5 4.5 5.5 8.5.5 2-.5 3.5-2 3.5s-2.5-1-4-1.5c-1.5 2-3 5-3 10",
    "M11 12c-2 1-3 3-2.5 5M12.5 9.5c-2 .5-3 2-3 3.5",
    "M21.5 10.5h.01",
    "M25.3 16h.01",
  ],
  Goat: [
    "M12 13c0 6 1.8 10 4 10s4-4 4-10",
    "M12 13c-2.8 0-5-2.2-5-5s2.2-4 4.2-3c1.2.6 1.6 2 .9 3",
    "M20 13c2.8 0 5-2.2 5-5s-2.2-4-4.2-3c-1.2.6-1.6 2-.9 3",
    "M14.5 23l1.5 4 1.5-4",
    "M14 16.5h.01M18 16.5h.01",
    "M12 13c2.5-1.2 5.5-1.2 8 0",
  ],
  Monkey: [
    "M8.5 15a7.5 8 0 1 0 15 0 7.5 8 0 1 0-15 0z",
    "M8.6 13a2.6 2.6 0 1 0 0 4.6M23.4 13a2.6 2.6 0 1 1 0 4.6",
    "M12 13.5c1.5-2 3-2 4-.8 1-1.2 2.5-1.2 4 .8.5 3-.5 7.5-4 7.5s-4.5-4.5-4-7.5z",
    "M14.3 14.8h.01M17.7 14.8h.01",
    "M14.5 19c1 .7 2 .7 3 0",
    "M14 8c1.2-1.3 2.8-1.3 4 0",
  ],
  Rooster: [
    "M11 9c0 4-2 6-2 10 0 4.5 3.5 7.5 8 7.5s8-3 9-9c-2.5 1.5-5 1.5-7 0",
    "M11 9c0-2.5 1.8-4 4-4 1.6 0 3 1 3.5 2.5L21 9l-2.8.8",
    "M11.5 5.5c-.5-1.8.8-3 2-2.2.6-1.2 2.4-1.2 2.6.6",
    "M18.2 9.8c.2 1.8-.6 3-1.8 3.4",
    "M26 17.5c.5-3-.8-6-3-7.5M24 18.5c0-2.5-1-4.5-2.5-5.5",
    "M14.8 7.6h.01",
  ],
  Dog: [
    "M8 20c0-7 4-11 9-11 2 0 4 1 5 3l5 2c1 .5 1 3-.5 3.5L21 18c-1 4-4 7-8 7-3 0-5-2-5-5z",
    "M13 10c-3 1-4 5-3 8 2-.5 3.5-3 4-6",
    "M19.5 13h.01",
    "M27.2 15.2h.01",
    "M21 18l2 1.5",
  ],
  Pig: [
    "M7 17c0-5.5 4-9.5 9-9.5s9 4 9 9.5-4 9-9 9-9-3.5-9-9z",
    "M9 10.5L8 5.5l4.5 2.5M23 10.5l1-5-4.5 2.5",
    "M12.5 20c0-1.7 1.6-3 3.5-3s3.5 1.3 3.5 3-1.6 2.8-3.5 2.8-3.5-1.1-3.5-2.8z",
    "M14.8 20h.01M17.2 20h.01",
    "M12 14.5h.01M20 14.5h.01",
  ],};

interface ZodiacIconProps {
  animal: ZodiacAnimal;
  /** Sizing and color classes; defaults to 24px in the current text color. */
  className?: string;
  /** Accessible name. Leave unset when the animal's name is shown beside it. */
  title?: string;
}

export function ZodiacIcon({ animal, className = "size-6", title }: ZodiacIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {ZODIAC_ICON_PATHS[animal].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
