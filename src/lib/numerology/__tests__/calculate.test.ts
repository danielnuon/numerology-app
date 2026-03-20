import {
  buildDayRow,
  computeCycle,
  computeTotalScore,
  type Weekday,
} from "../calculate";

describe("buildDayRow", () => {
  it("returns correct row for Thursday (5)", () => {
    expect(buildDayRow(5)).toEqual([5, 6, 7, 1, 2, 3, 4]);
  });

  it("returns correct row for Sunday (1)", () => {
    expect(buildDayRow(1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("returns correct row for Saturday (7)", () => {
    expect(buildDayRow(7)).toEqual([7, 1, 2, 3, 4, 5, 6]);
  });

  it("always returns exactly 7 values", () => {
    for (let d = 1; d <= 7; d++) {
      expect(buildDayRow(d as Weekday)).toHaveLength(7);
    }
  });

  it("always contains all values 1-7", () => {
    for (let d = 1; d <= 7; d++) {
      const row = buildDayRow(d as Weekday);
      const sorted = [...row].sort((a, b) => a - b);
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7]);
    }
  });
});

describe("computeCycle", () => {
  it("produces exact worked example: July 24, 1997 (Thursday, Ox)", () => {
    // July = month 7, Ox = zodiac 2, Thursday = weekday 5
    const result = computeCycle(7, 2, 5);
    expect(result.cycle).toEqual([3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8]);
  });

  it("computes correct total for worked example (64)", () => {
    const result = computeCycle(7, 2, 5);
    expect(result.totalScore).toBe(64);
  });

  it("returns month row starting at Margasir position 8 for July", () => {
    const result = computeCycle(7, 2, 5);
    expect(result.rows.month).toEqual([8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("returns zodiac row starting at 2 for Ox", () => {
    const result = computeCycle(7, 2, 5);
    expect(result.rows.zodiac).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1]);
  });

  it("returns day row of length 7 for Thursday", () => {
    const result = computeCycle(7, 2, 5);
    expect(result.rows.day).toEqual([5, 6, 7, 1, 2, 3, 4]);
    expect(result.rows.day).toHaveLength(7);
  });

  it("always returns a 12-number array", () => {
    const result = computeCycle(1, 1, 1);
    expect(result.cycle).toHaveLength(12);
  });

  it("all cycle values are 0-11 (valid mod 12 range)", () => {
    // Test across a variety of inputs
    for (let month = 1; month <= 12; month++) {
      const result = computeCycle(month, 1, 1);
      for (const val of result.cycle) {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(11);
      }
    }
  });

  it("columns 8-12 use only month + zodiac (no day contribution)", () => {
    // For July (8) + Ox (2): col 8 = month[7] + zodiac[7] = 3 + 9 = 12 → 0
    const result = computeCycle(7, 2, 5);
    // Manually verify columns 8-12 (0-indexed 7-11)
    expect(result.rows.month[7] + result.rows.zodiac[7]).toBe(12); // 3 + 9 = 12
    expect(result.cycle[7]).toBe(0); // 12 mod 12 = 0

    expect(result.rows.month[8] + result.rows.zodiac[8]).toBe(14); // 4 + 10
    expect(result.cycle[8]).toBe(2); // 14 mod 12 = 2

    expect(result.rows.month[9] + result.rows.zodiac[9]).toBe(16); // 5 + 11
    expect(result.cycle[9]).toBe(4); // 16 mod 12 = 4

    expect(result.rows.month[10] + result.rows.zodiac[10]).toBe(18); // 6 + 12
    expect(result.cycle[10]).toBe(6); // 18 mod 12 = 6

    expect(result.rows.month[11] + result.rows.zodiac[11]).toBe(8); // 7 + 1
    expect(result.cycle[11]).toBe(8); // 8 mod 12 = 8
  });

  it("produces zero when column sum is exact multiple of 12", () => {
    // From worked example, column 8 (0-indexed 7) = 3 + 9 = 12 → 0
    const result = computeCycle(7, 2, 5);
    expect(result.cycle[7]).toBe(0);
  });

  it("handles all 12 months correctly", () => {
    for (let month = 1; month <= 12; month++) {
      const result = computeCycle(month, 1, 1);
      expect(result.cycle).toHaveLength(12);
      expect(result.cycle.every((v) => v >= 0 && v <= 11)).toBe(true);
    }
  });

  it("handles all 12 zodiac animals correctly", () => {
    for (let zodiac = 1; zodiac <= 12; zodiac++) {
      const result = computeCycle(1, zodiac, 1);
      expect(result.cycle).toHaveLength(12);
      expect(result.cycle.every((v) => v >= 0 && v <= 11)).toBe(true);
    }
  });

  it("handles all 7 weekdays correctly", () => {
    for (let day = 1; day <= 7; day++) {
      const result = computeCycle(1, 1, day as Weekday);
      expect(result.cycle).toHaveLength(12);
      expect(result.cycle.every((v) => v >= 0 && v <= 11)).toBe(true);
    }
  });
});

describe("computeTotalScore", () => {
  it("returns 64 for the worked example cycle", () => {
    expect(computeTotalScore([3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8])).toBe(64);
  });

  it("returns 0 for an all-zeros cycle", () => {
    expect(computeTotalScore([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(0);
  });

  it("returns correct sum for arbitrary cycle", () => {
    expect(computeTotalScore([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0])).toBe(66);
  });
});
