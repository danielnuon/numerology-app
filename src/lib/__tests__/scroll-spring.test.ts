import { SCROLL_WEIGHT, stepScrollSpring, type ScrollSpring } from "@/lib/motion";

function run(spring: ScrollSpring, target: number, seconds: number) {
  let trail = 0;
  for (let t = 0; t < seconds; t += 1 / 60) trail = stepScrollSpring(spring, target, 1 / 60);
  return trail;
}

describe("stepScrollSpring", () => {
  it("trails a scroll, then settles on it", () => {
    const spring = { position: 0, velocity: 0 };
    const first = stepScrollSpring(spring, 200, 1 / 60);
    expect(first).toBeGreaterThan(0);
    expect(run(spring, 200, 1)).toBeCloseTo(0, 1);
  });

  it("never overshoots the scroll position", () => {
    const spring = { position: 0, velocity: 0 };
    for (let t = 0; t < 2; t += 1 / 60) {
      stepScrollSpring(spring, 300, 1 / 60);
      expect(spring.position).toBeLessThanOrEqual(300 + 1e-6);
    }
  });

  it("trails no further than maxLag", () => {
    const spring = { position: 0, velocity: 0 };
    expect(Math.abs(stepScrollSpring(spring, 500, 1 / 60))).toBeLessThanOrEqual(SCROLL_WEIGHT.maxLag);
  });

  it("snaps on a long jump instead of swinging", () => {
    const spring = { position: 0, velocity: 0 };
    expect(stepScrollSpring(spring, 5000, 1 / 60)).toBe(0);
    expect(spring.position).toBe(5000);
  });

  it("stays stable after a long pause between frames", () => {
    const spring = { position: 0, velocity: 0 };
    const trail = stepScrollSpring(spring, 100, 3);
    expect(Number.isFinite(trail)).toBe(true);
    expect(Math.abs(trail)).toBeLessThan(100);
  });
});
