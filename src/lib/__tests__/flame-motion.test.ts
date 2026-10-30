import { FLAME_MOTION, flameLean, flameStretch, stepFlameSpring, SCROLL_WEIGHT } from "@/lib/motion";

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
