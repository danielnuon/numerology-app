/**
 * The drifting dust behind every page (see "Living surfaces" in the design
 * language): a few dozen specks rising slowly through the lantern light with
 * a slow flicker, sliding a little with the scroll.
 *
 * Pure drawing logic shared by the dust worker (`dust.worker.ts`), which
 * draws on an OffscreenCanvas off the main thread, and by `LanternSky`, which
 * draws on the page's canvas where workers can't draw.
 */

export const MOTE_COUNT = 38;

export interface Mote {
  x: number;
  y: number;
  radius: number;
  driftX: number;
  driftY: number;
  alpha: number;
  phase: number;
}

export function seedMotes(random: () => number = Math.random): Mote[] {
  return Array.from({ length: MOTE_COUNT }, () => ({
    x: random(),
    y: random(),
    radius: 0.6 + random() * 1.6,
    // Fractions of the viewport per millisecond: rising across the screen
    // takes 20 to 60 seconds.
    driftX: (random() - 0.5) * 0.00003,
    driftY: -0.000017 - random() * 0.000033,
    alpha: 0.15 + random() * 0.35,
    phase: random() * Math.PI * 2,
  }));
}

/** Moves the dust on by `elapsed` milliseconds; specks that leave re-enter on the other side. */
export function driftMotes(motes: Mote[], elapsed: number, random: () => number = Math.random) {
  for (const mote of motes) {
    mote.x += mote.driftX * elapsed;
    mote.y += mote.driftY * elapsed;
    if (mote.y < -0.02) {
      mote.y = 1.02;
      mote.x = random();
    } else if (mote.y > 1.02) {
      mote.y = -0.02;
      mote.x = random();
    }
  }
}

/**
 * The dust is nearer than the sky's glows, so it slides a little with the
 * page: `scrolled` CSS pixels on a canvas `height` CSS pixels tall, larger
 * specks more.
 */
export function slideMotes(motes: Mote[], scrolled: number, height: number) {
  const share = scrolled / Math.max(height, 1);
  for (const mote of motes) mote.y -= share * 0.08 * (mote.radius / 2.2);
}

type DrawingContext = Pick<CanvasRenderingContext2D, "clearRect" | "beginPath" | "arc" | "fill"> & {
  fillStyle: CanvasRenderingContext2D["fillStyle"];
  canvas: { width: number; height: number };
};

/** Draws the dust at time `now`; `still` draws it without the flicker (Reduce Motion). */
export function drawMotes(ctx: DrawingContext, motes: Mote[], dpr: number, now: number, still: boolean) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  for (const mote of motes) {
    // A slow flicker, as if passing in and out of the light
    const flicker = still ? 1 : 0.75 + 0.25 * Math.sin(now / 2400 + mote.phase);
    ctx.beginPath();
    ctx.arc(mote.x * width, mote.y * height, mote.radius * dpr, 0, Math.PI * 2);
    // The warm gold-light of the lanterns (#F0CD8C), as a canvas color
    ctx.fillStyle = `rgba(240, 205, 140, ${mote.alpha * flicker})`;
    ctx.fill();
  }
}

/** Messages from the page to the dust worker. */
export type DustMessage =
  | { type: "start"; canvas: OffscreenCanvas; width: number; height: number; dpr: number; still: boolean }
  | { type: "resize"; width: number; height: number; dpr: number }
  | { type: "scroll"; scrolled: number }
  | { type: "visible"; visible: boolean };
