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

/**
 * The woven flame's response to movement (see "Living surfaces" in the
 * design language). The flame leans toward the pointer, by at most
 * `maxLean` degrees when the pointer is half a screen away, and stretches up
 * or squats a little as the page scrolls, as a candle's flame does when it is
 * carried. Both follow a critically damped spring with a `lag` time constant,
 * slower than scroll weight, so the flame drifts rather than snaps.
 */
export const FLAME_MOTION = {
  lag: 0.28,
  maxLean: 10,
  maxStretch: 0.12,
} as const;

/** One axis of the flame's motion: where it is, and how fast it moves. */
export interface FlameSpring {
  value: number;
  velocity: number;
}

/** Advances a flame spring by `dt` seconds toward `target`, never overshooting it. */
export function stepFlameSpring(spring: FlameSpring, target: number, dt: number): number {
  const omega = 1 / FLAME_MOTION.lag;
  let remaining = Math.min(dt, 0.1);
  while (remaining > 0) {
    const step = Math.min(remaining, 1 / 120);
    const acceleration = omega * omega * (target - spring.value) - 2 * omega * spring.velocity;
    spring.velocity += acceleration * step;
    spring.value += spring.velocity * step;
    remaining -= step;
  }
  return spring.value;
}

/**
 * How far the flame leans toward a pointer at `pointerX`, in degrees of skew:
 * positive leans right. `centerX` is the mark's center; the lean reaches its
 * limit half a viewport away.
 */
export function flameLean(pointerX: number, centerX: number, viewportWidth: number): number {
  const reach = Math.max(viewportWidth / 2, 1);
  const share = Math.max(-1, Math.min(1, (pointerX - centerX) / reach));
  return share * FLAME_MOTION.maxLean;
}

/**
 * How much the flame stretches for a scroll trail (from stepScrollSpring), as
 * a scale offset: scrolling down carries the page up, and the flame squats;
 * scrolling up stretches it.
 */
export function flameStretch(trail: number): number {
  const share = Math.max(-1, Math.min(1, trail / SCROLL_WEIGHT.maxLag));
  return -share * FLAME_MOTION.maxStretch;
}

/** Degrees of side-to-side phone tilt at which the flame reaches its full lean. */
export const FLAME_TILT_REACH = 30;

/**
 * How far the flame leans when the phone tilts, in the same degrees as
 * flameLean. A real flame stays upright as the phone turns, so on screen it
 * leans the opposite way: tilt the phone's right edge down and the flame
 * leans left. `angle` is the screen orientation angle (0, 90, 180 or 270),
 * which decides whether side-to-side tilt is the sensor's gamma or beta.
 */
export function flameTilt(beta: number | null, gamma: number | null, angle: number): number {
  const turn = ((angle % 360) + 360) % 360;
  const side = turn === 90 ? beta : turn === 270 ? (beta == null ? null : -beta) : turn === 180 ? (gamma == null ? null : -gamma) : gamma;
  if (side == null || Number.isNaN(side)) return 0;
  const share = Math.max(-1, Math.min(1, side / FLAME_TILT_REACH));
  return -share * FLAME_MOTION.maxLean;
}
