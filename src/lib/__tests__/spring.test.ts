import { EASE, PRESS, SPRING, cssEase, dampingRatio, springCurve, springTiming } from "@/lib/motion";

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

  it.each([
    ["glide", 400],
    ["swift", 250],
  ] as const)("moves the %s spring as briskly as the %ims timed curve it replaced", (name, ms) => {
    const values = stops(springCurve(SPRING[name]).easing);
    const { durationMs } = springCurve(SPRING[name]);
    const at = (t: number) => values[Math.round((t / durationMs) * (values.length - 1))];
    // --ease-standard over `ms` is halfway within a quarter of it and at 95% by two thirds
    expect(at(ms * 0.25)).toBeGreaterThanOrEqual(0.5);
    expect(at(ms * 0.66)).toBeGreaterThanOrEqual(0.95);
  });

  it("gives a backward curve that, played in reverse, moves as the spring does", () => {
    const forward = stops(springCurve(SPRING.swift).easing);
    const backward = stops(springCurve(SPRING.swift, 24, true).easing);
    // Played in reverse, progress at time k is backward[n - k]; it must leave
    // the open look as the spring leaves its start
    const n = forward.length - 1;
    forward.forEach((value, k) => expect(1 - backward[n - k]).toBeCloseTo(value, 3));
  });

  it("keeps the timed curve where the browser can't play linear() easing", () => {
    // Node has no CSS.supports, like a browser older than Safari 17.2
    expect(springTiming(SPRING.glide, 400)).toEqual({ duration: 400, easing: cssEase(EASE.standard) });
  });

  it("times a Web Animation by the spring where linear() plays", () => {
    const original = globalThis.CSS;
    globalThis.CSS = { supports: () => true } as unknown as typeof CSS;
    try {
      expect(springTiming(SPRING.glide, 400)).toEqual({
        duration: springCurve(SPRING.glide).durationMs,
        easing: springCurve(SPRING.glide).easing,
      });
    } finally {
      globalThis.CSS = original;
    }
  });
});
