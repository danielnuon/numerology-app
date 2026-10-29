import {
  assessStability,
  compareCycles,
  compatibilityTier,
  yearInteraction,
} from "../compatibility";
import { computeCycleFromBirthDate } from "../derive";

describe("compatibilityTier", () => {
  it.each([
    [0, "zero"],
    [1, "low"],
    [3, "low"],
    [4, "moderate"],
    [6, "moderate"],
    [7, "high"],
    [9, "high"],
    [10, "high"],
    [11, "high"],
  ])("maps %i to %s", (value, tier) => {
    expect(compatibilityTier(value)).toBe(tier);
  });
});

describe("yearInteraction", () => {
  describe("zero overrides every pairing", () => {
    it.each([
      [0, 9],
      [0, 2],
      [0, 5],
      [0, 0],
      [11, 0],
    ])("%i with %i is unstable", (a, b) => {
      expect(yearInteraction(a, b)).toBe("unstable");
    });
  });

  describe("the six non-zero pairings", () => {
    it.each([
      [2, 3, "risk"],
      [2, 5, "neutral"],
      [2, 9, "stabilized"],
      [5, 5, "neutral"],
      [5, 8, "stabilized"],
      [8, 10, "amplified"],
    ])("%i with %i is %s", (a, b, result) => {
      expect(yearInteraction(a, b)).toBe(result);
    });
  });

  it("is symmetric", () => {
    for (let a = 0; a <= 11; a++) {
      for (let b = 0; b <= 11; b++) {
        expect(yearInteraction(a, b)).toBe(yearInteraction(b, a));
      }
    }
  });
});

describe("assessStability", () => {
  it.each([
    [70, 68, "strong"],
    [68, 75, "strong"],
    [64, 60, "moderate"],
    [72, 61, "moderate"],
    [70, 56, "mixed"],
    [52, 68, "mixed"],
    [56, 58, "challenging"],
    [59, 40, "challenging"],
  ])("totals %i and %i read as %s", (a, b, result) => {
    expect(assessStability(a, b)).toBe(result);
  });

  it("reads one total from 60 to 67 with the other under 60 as mixed", () => {
    expect(assessStability(64, 56)).toBe("mixed");
    expect(assessStability(59, 67)).toBe("mixed");
  });
});

describe("compareCycles", () => {
  const first = computeCycleFromBirthDate(1997, 7, 24, "khmer");
  const second = computeCycleFromBirthDate(2000, 3, 15, "khmer");

  it("compares twelve consecutive calendar years by default", () => {
    const years = compareCycles(first.cycle, 1997, second.cycle, 2000, 2026);
    expect(years.map((y) => y.year)).toEqual([
      2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037,
    ]);
  });

  it("uses each person's own number for the calendar year", () => {
    const [year2026] = compareCycles(first.cycle, 1997, second.cycle, 2000, 2026, 1);
    // 1997 worked example: 2026 is column 6 of [3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8].
    expect(year2026.firstNumber).toBe(11);
    expect(year2026.secondNumber).toBe(second.cycle[(2026 - 2000) % 12]);
    expect(year2026.interaction).toBe(yearInteraction(11, year2026.secondNumber));
  });

  it("gives the same numbers on both sides for the same birthday", () => {
    for (const year of compareCycles(first.cycle, 1997, first.cycle, 1997, 2026)) {
      expect(year.firstNumber).toBe(year.secondNumber);
    }
  });
});
