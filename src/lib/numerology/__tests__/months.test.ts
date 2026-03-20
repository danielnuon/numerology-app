import { MARGASIR_MONTH_MAP, getMonthRow } from "../months";

describe("MARGASIR_MONTH_MAP", () => {
  it("maps all 12 Gregorian months", () => {
    for (let month = 1; month <= 12; month++) {
      expect(MARGASIR_MONTH_MAP[month]).toBeDefined();
    }
  });

  it("has no duplicate positions", () => {
    const positions = Object.values(MARGASIR_MONTH_MAP);
    const unique = new Set(positions);
    expect(unique.size).toBe(12);
  });

  it("contains all positions 1-12", () => {
    const positions = new Set(Object.values(MARGASIR_MONTH_MAP));
    for (let i = 1; i <= 12; i++) {
      expect(positions.has(i)).toBe(true);
    }
  });

  it("maps December to position 1 (Margasir start)", () => {
    expect(MARGASIR_MONTH_MAP[12]).toBe(1);
  });

  it("maps July to position 8", () => {
    expect(MARGASIR_MONTH_MAP[7]).toBe(8);
  });
});

describe("getMonthRow", () => {
  it("returns correct row for July (worked example)", () => {
    expect(getMonthRow(7)).toEqual([8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("returns correct row for December (Margasir start)", () => {
    expect(getMonthRow(12)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("returns correct row for January", () => {
    expect(getMonthRow(1)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1]);
  });

  it("always returns array of length 12", () => {
    for (let month = 1; month <= 12; month++) {
      expect(getMonthRow(month)).toHaveLength(12);
    }
  });

  it("always contains all values 1-12", () => {
    for (let month = 1; month <= 12; month++) {
      const row = getMonthRow(month);
      const sorted = [...row].sort((a, b) => a - b);
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    }
  });

  it("throws for invalid month 0", () => {
    expect(() => getMonthRow(0)).toThrow("Invalid Gregorian month");
  });

  it("throws for invalid month 13", () => {
    expect(() => getMonthRow(13)).toThrow("Invalid Gregorian month");
  });
});
