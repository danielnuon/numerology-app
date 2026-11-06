/**
 * Draws the drifting dust on an OffscreenCanvas, in a worker, so the page's
 * main thread does no work while the page is at rest (ADR-003, Phase 3
 * results). LanternSky hands over the canvas and tells the worker when the
 * page resizes, scrolls or is hidden.
 *
 * Workers that lack requestAnimationFrame draw on a timer instead.
 */

import { type DustMessage, type Mote, drawMotes, driftMotes, seedMotes, slideMotes } from "@/lib/dust";

/** The parts of a dedicated worker's global scope this uses. */
const scope = self as unknown as {
  requestAnimationFrame?: (draw: (now: number) => void) => number;
  cancelAnimationFrame?: (id: number) => void;
  onmessage: ((event: MessageEvent<DustMessage>) => void) | null;
};

let ctx: OffscreenCanvasRenderingContext2D | null = null;
let motes: Mote[] = [];
let dpr = 1;
let cssHeight = 1;
let still = false;
let visible = true;
let frame = 0;
let last = 0;

const { requestAnimationFrame: onFrame, cancelAnimationFrame: offFrame } = scope;
const nextFrame: (draw: (now: number) => void) => number = onFrame
  ? (draw) => onFrame.call(scope, draw)
  : (draw) => setTimeout(() => draw(performance.now()), 1000 / 60) as unknown as number;
const cancelFrame = (id: number) => (offFrame ? offFrame.call(scope, id) : clearTimeout(id));

function draw(now: number) {
  frame = 0;
  if (!ctx) return;
  const elapsed = Math.min(now - (last || now), 100);
  last = now;
  if (!still) driftMotes(motes, elapsed);
  drawMotes(ctx, motes, dpr, now, still);
  if (!still && visible) frame = nextFrame(draw);
}

function restart() {
  if (frame) cancelFrame(frame);
  frame = 0;
  // Back from a hidden tab: nothing to catch up on
  last = 0;
  draw(performance.now());
}

function size(width: number, height: number, scale: number) {
  if (!ctx) return;
  dpr = scale;
  cssHeight = height;
  ctx.canvas.width = Math.round(width * scale);
  ctx.canvas.height = Math.round(height * scale);
}

scope.onmessage = ({ data }: MessageEvent<DustMessage>) => {
  switch (data.type) {
    case "start":
      ctx = data.canvas.getContext("2d");
      motes = seedMotes();
      still = data.still;
      size(data.width, data.height, data.dpr);
      restart();
      break;
    case "resize":
      size(data.width, data.height, data.dpr);
      restart();
      break;
    case "scroll":
      slideMotes(motes, data.scrolled, cssHeight);
      break;
    case "visible":
      visible = data.visible;
      if (visible) restart();
      else if (frame) {
        cancelFrame(frame);
        frame = 0;
      }
      break;
  }
};
