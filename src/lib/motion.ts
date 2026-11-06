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

/**
 * Springs for interactive motion (see "Physics" in the design language).
 * Each is a mass on a spring with a damper, F = -kx - cv: `stiffness` is k,
 * `damping` is c and `mass` is m, in the units Motion uses. CSS plays the
 * same spring through `springCurve()`, so a control feels the same whether
 * CSS or Motion moves it.
 */
export interface Spring {
  stiffness: number;
  damping: number;
  mass: number;
}

export const SPRING = {
  /**
   * Press and release. Porcelain-stiff and critically damped: it reaches 95%
   * of the way in about 120ms and never overshoots, as Apple's buttons don't.
   */
  press: { stiffness: 1600, damping: 80, mass: 1 },
  /**
   * Moves that open or grow: a Reveal opening, the view switch growing, the
   * menu panel unfolding. Halfway in 84ms, 95% by 240ms and at rest by about
   * 500ms, the shape 400ms of `--ease-standard` had, with no curve's tail.
   */
  glide: { stiffness: 400, damping: 40, mass: 1 },
  /**
   * Short moves and things that close or shrink: the selection outline, a
   * Reveal closing, the view switch shrinking. Halfway in 56ms, 95% by 160ms
   * and at rest by about 350ms, the shape 250ms of `--ease-standard` had.
   */
  swift: { stiffness: 900, damping: 60, mass: 1 },
} as const satisfies Record<string, Spring>;

/** How damped a spring is: 1 settles fastest without overshoot, below 1 overshoots. */
export function dampingRatio({ stiffness, damping, mass }: Spring): number {
  return damping / (2 * Math.sqrt(stiffness * mass));
}

/**
 * A spring's move from 0 to 1 as a CSS `linear()` easing and the duration it
 * takes to settle, so a CSS transition follows the same physics as Motion.
 * Integrated with semi-implicit Euler in 1ms steps until the spring is within
 * 0.1% of rest, then sampled at `points` evenly spaced times.
 *
 * `backward` gives the curve for an animation played with `direction:
 * "reverse"`, so that played backward it still moves as the spring does:
 * quick away from where it starts, easing into where it lands.
 */
export function springCurve(spring: Spring, points = 24, backward = false): { easing: string; durationMs: number } {
  const { stiffness, damping, mass } = spring;
  const step = 0.001;
  const positions = [0];
  let x = 0;
  let v = 0;
  while (positions.length < 10_000 && (Math.abs(1 - x) > 0.001 || Math.abs(v) > 0.01)) {
    const acceleration = (-stiffness * (x - 1) - damping * v) / mass;
    v += acceleration * step;
    x += v * step;
    positions.push(x);
  }
  const last = positions.length - 1;
  const samples = Array.from({ length: points + 1 }, (_, k) => {
    if (k === points) return 1;
    const value = positions[Math.round((k / points) * last)];
    return Math.round(value * 1000) / 1000;
  });
  const values = backward ? samples.map((_, k) => Math.round((1 - samples[points - k]) * 1000) / 1000) : samples;
  return { easing: `linear(${values.join(", ")})`, durationMs: last };
}

/** Whether this browser plays `linear()` easing (Safari 17.2 and later, Chrome 113 and later). */
export function supportsLinearEasing(): boolean {
  return typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("transition-timing-function", "linear(0, 1)");
}

/**
 * Web Animation timing that plays `spring`. Browsers without `linear()`
 * easing keep the timed curve the move had before it became a spring:
 * `fallbackMs` on `--ease-standard`.
 */
export function springTiming(
  spring: Spring,
  fallbackMs: number,
  backward = false
): { duration: number; easing: string } {
  if (!supportsLinearEasing()) return { duration: fallbackMs, easing: cssEase(EASE.standard) };
  const { easing, durationMs } = springCurve(spring, 24, backward);
  return { duration: durationMs, easing };
}

/** Press feedback: the press spring, the same one CSS's `.pressable` plays. */
export const PRESS = {
  scale: 0.97,
  spring: { type: "spring", ...SPRING.press },
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

/**
 * The woven flame manifesting a reading. A spark rises from the button the
 * visitor pressed into the flame's base (`sparkMs`), the threads light one
 * after another up the flame, counting the years from the year of birth
 * (`stepMs` apart, each glowing for `flashMs`), and the year now kindles
 * with a flare (`flareMs`). Times are in milliseconds.
 */
export const MANIFEST = {
  sparkMs: 1100,
  stepMs: 130,
  flashMs: 640,
  flareMs: 1600,
} as const;

/** A point on the page, in CSS pixels from the viewport's top left. */
export type PagePoint = { x: number; y: number };

/**
 * The spark's path as `steps + 1` points: it rises straight from the button
 * and bends into the flame, a quadratic curve whose control point sits
 * level with the flame, directly above the button.
 */
export function sparkArc(from: PagePoint, to: PagePoint, steps = 16): PagePoint[] {
  const control = { x: from.x, y: to.y };
  return Array.from({ length: steps + 1 }, (_, k) => {
    const t = k / steps;
    const a = (1 - t) ** 2;
    const b = 2 * (1 - t) * t;
    const c = t ** 2;
    return { x: a * from.x + b * control.x + c * to.x, y: a * from.y + b * control.y + c * to.y };
  });
}

/** A Motion curve as a CSS timing function, for Web Animations. */
export function cssEase(curve: readonly number[]): string {
  return `cubic-bezier(${curve.join(", ")})`;
}
