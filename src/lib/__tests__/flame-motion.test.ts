import { EASE, FLAME_MOTION, cssEase, flameLean, sparkArc, flameStretch, flameTilt, stepFlameSpring, SCROLL_WEIGHT } from "@/lib/motion";

describe("flame motion", () => {
  it("leans toward the pointer, up to the limit half a screen away", () => {
    expect(flameLean(500, 500, 1000)).toBe(0);
    expect(flameLean(750, 500, 1000)).toBeCloseTo(FLAME_MOTION.maxLean / 2);
    expect(flameLean(0, 500, 1000)).toBe(-FLAME_MOTION.maxLean);
    expect(flameLean(5000, 500, 1000)).toBe(FLAME_MOTION.maxLean);
  });

  it("squats while the page scrolls down and stretches while it scrolls up, within limits", () => {
    expect(flameStretch(0)).toBe(-0);
    expect(flameStretch(SCROLL_WEIGHT.maxLag)).toBe(-FLAME_MOTION.maxStretch);
    expect(flameStretch(-10 * SCROLL_WEIGHT.maxLag)).toBe(FLAME_MOTION.maxStretch);
  });

  it("drifts to its target without overshooting, and settles", () => {
    const spring = { value: 0, velocity: 0 };
    for (let t = 0; t < 3; t += 1 / 60) {
      stepFlameSpring(spring, 5, 1 / 60);
      expect(spring.value).toBeLessThanOrEqual(5 + 1e-6);
    }
    expect(spring.value).toBeCloseTo(5, 1);
  });
});

describe("flameTilt", () => {
  it("keeps the flame upright: tilting the phone right leans it left on screen", () => {
    expect(flameTilt(0, 15, 0)).toBeCloseTo(-FLAME_MOTION.maxLean / 2);
    expect(flameTilt(0, -90, 0)).toBe(FLAME_MOTION.maxLean);
    expect(flameTilt(0, 0, 0)).toBe(-0);
  });

  it("reads side-to-side tilt from beta when the phone is held sideways", () => {
    expect(flameTilt(15, 80, 90)).toBeCloseTo(-FLAME_MOTION.maxLean / 2);
    expect(flameTilt(15, 80, 270)).toBeCloseTo(FLAME_MOTION.maxLean / 2);
  });

  it("holds still when the sensor gives no reading", () => {
    expect(flameTilt(null, null, 0)).toBe(0);
  });

  it("carries the spark up from the button and bends it into the flame", () => {
    const path = sparkArc({ x: 200, y: 700 }, { x: 60, y: 90 });
    expect(path[0]).toEqual({ x: 200, y: 700 });
    expect(path[path.length - 1]).toEqual({ x: 60, y: 90 });
    // It rises before it turns: halfway up, it has moved less than halfway across
    const middle = path[(path.length - 1) / 2];
    expect(middle.y).toBeLessThan(400);
    expect(middle.x).toBeGreaterThan(130);
  });

  it("writes Motion curves as CSS timing functions", () => {
    expect(cssEase(EASE.standard)).toBe("cubic-bezier(0.2, 0, 0, 1)");
  });
});
