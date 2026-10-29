import { describeYearPlanet, getYearPlanet, interpretAreaYear, interpretYear, interpretTotal } from "../interpretation";
import { DAY_PLANETS, NO_DAY_PLANET_NOTE } from "../day-planet-data";
import { YEAR_TIERS, TOTAL_TIERS } from "../interpretation-data";
import { AREA_READINGS } from "../life-area-data";
import { computeCycle } from "../calculate";

describe("interpretYear", () => {
  it('returns "zero" tier for cycle number 0', () => {
    const result = interpretYear(0);
    expect(result.tier).toBe("zero");
    expect(result.label).toBe("Reset / unstable");
    expect(result.description).toBeTruthy();
    expect(result.guidance).toBeTruthy();
  });

  it('returns "weak" tier for cycle number 1', () => {
    const result = interpretYear(1);
    expect(result.tier).toBe("weak");
    expect(result.label).toBe("Weak luck");
  });

  it('returns "weak" tier for cycle number 3 (upper boundary)', () => {
    const result = interpretYear(3);
    expect(result.tier).toBe("weak");
  });

  it('returns "moderate" tier for cycle number 4 (lower boundary)', () => {
    const result = interpretYear(4);
    expect(result.tier).toBe("moderate");
    expect(result.label).toBe("Moderate / neutral");
  });

  it('returns "moderate" tier for cycle number 6 (upper boundary)', () => {
    const result = interpretYear(6);
    expect(result.tier).toBe("moderate");
  });

  it('returns "strong" tier for cycle number 7 (lower boundary)', () => {
    const result = interpretYear(7);
    expect(result.tier).toBe("strong");
    expect(result.label).toBe("Strong luck");
  });

  it('returns "strong" tier for cycle number 9 (upper boundary)', () => {
    const result = interpretYear(9);
    expect(result.tier).toBe("strong");
  });

  it('returns "very-strong" tier for cycle number 10 (lower boundary)', () => {
    const result = interpretYear(10);
    expect(result.tier).toBe("very-strong");
    expect(result.label).toBe("Very strong luck");
    expect(result.guidance).toBeTruthy();
  });

  it('returns "very-strong" tier for cycle number 11 (upper boundary)', () => {
    const result = interpretYear(11);
    expect(result.tier).toBe("very-strong");
  });

  it("throws for a cycle number outside all tiers", () => {
    expect(() => interpretYear(-1)).toThrow("No year interpretation found");
    expect(() => interpretYear(12)).toThrow("No year interpretation found");
  });

  it("includes guidance text for zero tier", () => {
    const result = interpretYear(0);
    expect(result.guidance.length).toBeGreaterThan(0);
  });

  it("includes guidance text for very-strong tier", () => {
    const result = interpretYear(10);
    expect(result.guidance.length).toBeGreaterThan(0);
  });
});

describe("interpretTotal", () => {
  it('returns "weak" tier for total score 0 (minimum)', () => {
    const result = interpretTotal(0);
    expect(result.tier).toBe("weak");
    expect(result.label).toBe("Weak / difficult cycle");
    expect(result.description).toBeTruthy();
  });

  it('returns "weak" tier for total score 59 (upper boundary)', () => {
    const result = interpretTotal(59);
    expect(result.tier).toBe("weak");
  });

  it('returns "moderate" tier for total score 60 (lower boundary)', () => {
    const result = interpretTotal(60);
    expect(result.tier).toBe("moderate");
    expect(result.label).toBe("Balanced / moderate cycle");
  });

  it('returns "moderate" tier for total score 67 (upper boundary)', () => {
    const result = interpretTotal(67);
    expect(result.tier).toBe("moderate");
  });

  it('returns "strong" tier for total score 68 (lower boundary)', () => {
    const result = interpretTotal(68);
    expect(result.tier).toBe("strong");
    expect(result.label).toBe("Strong / favorable cycle");
  });

  it('returns "strong" tier for total score 132 (high value)', () => {
    const result = interpretTotal(132);
    expect(result.tier).toBe("strong");
  });

  it("throws for a negative total score", () => {
    expect(() => interpretTotal(-1)).toThrow("No total interpretation found");
  });
});

describe("data integrity", () => {
  it("YEAR_TIERS covers cycle numbers 0 through 11 without gaps", () => {
    for (let n = 0; n <= 11; n++) {
      const match = YEAR_TIERS.find((t) => n >= t.min && n <= t.max);
      expect(match).toBeDefined();
    }
  });

  it("TOTAL_TIERS covers scores 0 through 132 without gaps", () => {
    for (const score of [0, 30, 59, 60, 65, 67, 68, 100, 132]) {
      const match = TOTAL_TIERS.find((t) => score >= t.min && score <= t.max);
      expect(match).toBeDefined();
    }
  });

  it("every year tier has a non-empty tier, label, description, and guidance", () => {
    for (const entry of YEAR_TIERS) {
      expect(entry.tier).toBeTruthy();
      expect(entry.label).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect(entry.guidance).toBeTruthy();
    }
  });

  it("every total tier has a non-empty tier, label, and description", () => {
    for (const entry of TOTAL_TIERS) {
      expect(entry.tier).toBeTruthy();
      expect(entry.label).toBeTruthy();
      expect(entry.description).toBeTruthy();
    }
  });
});

describe("interpretAreaYear", () => {
  it("reads the same number differently in different life areas", () => {
    const money = interpretAreaYear(5, 9);
    const health = interpretAreaYear(8, 9);
    expect(money.tier).toBe(health.tier);
    expect(money.area).toBe("Money");
    expect(health.area).toBe("Health");
    expect(money.reading).not.toBe(health.reading);
  });

  it("reads different tiers differently within one life area", () => {
    const readings = [0, 2, 5, 8, 11].map((n) => interpretAreaYear(5, n).reading);
    expect(new Set(readings).size).toBe(5);
  });

  it("keeps the tier label, description and guidance from interpretYear", () => {
    const { area, reading, ...tier } = interpretAreaYear(1, 10);
    expect(area).toBe("Self");
    expect(reading).toBe(AREA_READINGS[1]["very-strong"]);
    expect(tier).toEqual(interpretYear(10));
  });

  it("reads the 1997-07-24 worked example year by year", () => {
    const { cycle } = computeCycle(7, 2, 5);
    // Column 8 (Health) is the cycle's zero; column 6 (Allies) is its 11
    expect(interpretAreaYear(8, cycle[7]).reading).toBe(AREA_READINGS[8].zero);
    expect(interpretAreaYear(6, cycle[5]).reading).toBe(AREA_READINGS[6]["very-strong"]);
  });

  it("has a distinct, non-empty reading for every area and tier", () => {
    const all: string[] = [];
    for (let column = 1; column <= 12; column++) {
      for (const { tier } of YEAR_TIERS) {
        const reading = AREA_READINGS[column]?.[tier];
        expect(reading).toBeTruthy();
        all.push(reading);
      }
    }
    expect(new Set(all).size).toBe(12 * YEAR_TIERS.length);
  });

  it("throws for a column outside 1-12 or a number outside 0-11", () => {
    expect(() => interpretAreaYear(0, 5)).toThrow();
    expect(() => interpretAreaYear(13, 5)).toThrow();
    expect(() => interpretAreaYear(5, 12)).toThrow();
  });
});

describe("getYearPlanet", () => {
  it("puts the birth day's planet over the year of birth and counts on through the week", () => {
    // 1997-07-24 is a Thursday: day row 5, 6, 7, 1, 2, 3, 4
    expect([1, 2, 3, 4, 5, 6, 7].map((col) => getYearPlanet(5, col)?.planet)).toEqual([
      "Jupiter", "Venus", "Saturn", "the Sun", "the Moon", "Mars", "Mercury",
    ]);
  });

  it("has no planet for columns 8-12", () => {
    for (let col = 8; col <= 12; col++) expect(getYearPlanet(3, col)).toBeNull();
  });

  it("throws for a column outside 1-12", () => {
    expect(() => getYearPlanet(1, 0)).toThrow();
    expect(() => getYearPlanet(1, 13)).toThrow();
  });

  it("uses the Khmer strengths, Venus highest and the Sun lowest", () => {
    const strengths = Object.values(DAY_PLANETS).map((p) => [p.day, p.strength]);
    expect(Object.fromEntries(strengths)).toEqual({
      Sunday: 6, Monday: 15, Tuesday: 8, Wednesday: 17, Thursday: 19, Friday: 21, Saturday: 10,
    });
  });
});

describe("describeYearPlanet", () => {
  it("names the planet as the birth day's own in the year of birth", () => {
    expect(describeYearPlanet(3, 1)).toBe(`Your birth day's planet, Mars, stands over this year. ${DAY_PLANETS[3].note}`);
  });

  it("names the planet plainly in later years", () => {
    expect(describeYearPlanet(3, 2)).toBe(`Mercury stands over this year. ${DAY_PLANETS[4].note}`);
    expect(describeYearPlanet(1, 1)).toMatch(/^Your birth day's planet, the Sun,/);
    expect(describeYearPlanet(7, 2)).toMatch(/^The Sun stands over this year\./);
  });

  it("says no planet stands over columns 8-12", () => {
    expect(describeYearPlanet(5, 8)).toBe(NO_DAY_PLANET_NOTE);
  });
});
