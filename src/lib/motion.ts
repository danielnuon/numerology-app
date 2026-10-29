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

/**
 * Scroll weight (see "Living surfaces" in the design language). A critically
 * damped spring trails the scroll position, so things that look like they
 * float, the sky's glows and the glass cards, lag a moment behind a fast
 * scroll and then settle, with no overshoot. `lag` is the spring's time
 * constant in seconds; distances are in CSS pixels.
 */
export const SCROLL_WEIGHT = {
  lag: 0.09,
  /** The furthest the spring may trail, so a long fling never swings far. */
  maxLag: 120,
  /** A jump this far (an anchor link, a route change) snaps instead of trailing. */
  snapDistance: 600,
  /** The most a glass card drifts from its place. */
  cardDrift: 3,
  /** Card drift per pixel of lag, before the cap. */
  cardDriftPerPx: 0.03,
} as const;

export interface ScrollSpring {
  /** Where the spring is, in page pixels. */
  position: number;
  /** How fast it is moving, in pixels per second. */
  velocity: number;
}

/**
 * Advances the scroll spring by `dt` seconds toward `target` (the current
 * scroll position) and returns how far it trails, capped to `maxLag`.
 * Positive means the spring is behind a downward scroll.
 */
export function stepScrollSpring(spring: ScrollSpring, target: number, dt: number): number {
  const { lag, maxLag, snapDistance } = SCROLL_WEIGHT;
  if (Math.abs(target - spring.position) > snapDistance) {
    spring.position = target;
    spring.velocity = 0;
    return 0;
  }
  const omega = 1 / lag;
  // Semi-implicit Euler in small steps, stable at any frame rate
  let remaining = Math.min(dt, 0.1);
  while (remaining > 0) {
    const step = Math.min(remaining, 1 / 120);
    const acceleration = omega * omega * (target - spring.position) - 2 * omega * spring.velocity;
    spring.velocity += acceleration * step;
    spring.position += spring.velocity * step;
    remaining -= step;
  }
  const trail = target - spring.position;
  if (Math.abs(trail) > maxLag) spring.position = target - Math.sign(trail) * maxLag;
  return target - spring.position;
}
