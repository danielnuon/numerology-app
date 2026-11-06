import { PRESS, SPRING, dampingRatio, springCurve } from "@/lib/motion";

/** The values of a `linear()` easing, in order. */
const stops = (easing: string) => easing.slice("linear(".length, -1).split(", ").map(Number);

describe("interaction springs", () => {
  it("are critically damped or stiffer, so nothing overshoots", () => {
    for (const spring of Object.values(SPRING)) {
      expect(dampingRatio(spring)).toBeGreaterThanOrEqual(1);
    }
  });

  it("acknowledge a press at once and settle within the micro-feedback range", () => {
    const values = stops(springCurve(SPRING.press).easing);
    const { durationMs } = springCurve(SPRING.press);
    // Halfway within the first 60ms, 95% by about 130ms
    const at = (ms: number) => values[Math.round((ms / durationMs) * (values.length - 1))];
    expect(at(60)).toBeGreaterThanOrEqual(0.5);
    expect(at(130)).toBeGreaterThanOrEqual(0.95);
    expect(durationMs).toBeLessThan(320);
  });

  it("produces a curve that starts at rest, rises steadily and never passes its target", () => {
    const values = stops(springCurve(SPRING.press).easing);
    expect(values[0]).toBe(0);
    expect(values.at(-1)).toBe(1);
    values.forEach((value, k) => {
      expect(value).toBeLessThanOrEqual(1);
      if (k > 0) expect(value).toBeGreaterThanOrEqual(values[k - 1]);
    });
  });

  it("overshoots when underdamped, which is why the springs above are not", () => {
    const loose = { stiffness: 400, damping: 10, mass: 1 };
    expect(dampingRatio(loose)).toBeLessThan(1);
    expect(Math.max(...stops(springCurve(loose, 200).easing))).toBeGreaterThan(1);
  });

  it("is the same spring in Motion as in CSS", () => {
    expect(PRESS.spring).toMatchObject(SPRING.press);
  });
});
