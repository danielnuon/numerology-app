/**
 * Motion tokens for JavaScript-driven animation (Motion library).
 *
 * Mirrors the CSS tokens in globals.css so CSS and JS motion feel the same.
 * Curves are Material 3's; durations are in seconds as Motion expects.
 */

export const MOTION = {
  press: 0.1,
  quick: 0.15,
  standard: 0.25,
  gentle: 0.4,
} as const;

export const EASE = {
  enter: [0.05, 0.7, 0.1, 1],
  standard: [0.2, 0, 0, 1],
  exit: [0.3, 0, 0.8, 0.15],
} as const;

/** Press feedback: a quick, critically damped spring with no bounce. */
export const PRESS = {
  scale: 0.97,
  spring: { type: "spring", visualDuration: MOTION.quick, bounce: 0 },
} as const;
