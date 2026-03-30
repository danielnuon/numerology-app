import {
  LIFE_AREA_MAP,
  MIN_YEAR,
  MAX_YEAR,
  getCycleIndex,
  getYearNumber,
  getLifeArea,
  getActiveYear,
} from "../year-lookup";

/** A simple ascending cycle for deterministic testing. */
const CYCLE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

describe("LIFE_AREA_MAP", () => {
  it("maps all 12 column positions", () => {
    for (let col = 1; col <= 12; col++) {
      expect(LIFE_AREA_MAP[col]).toBeDefined();
    }
  });

  it("has correct domain for position 1 (Self)", () => {
    expect(LIFE_AREA_MAP[1]).toBe("Self");
  });

  it("has correct domain for position 7 (Relationships)", () => {
    expect(LIFE_AREA_MAP[7]).toBe("Relationships");
  });

  it("has correct domain for position 12 (Protection)", () => {
    expect(LIFE_AREA_MAP[12]).toBe("Protection");
  });
});

describe("getCycleIndex", () => {
  it("returns 0 when target equals birth year", () => {
    expect(getCycleIndex(1997, 1997)).toBe(0);
  });

  it("returns correct index for a future year", () => {
    expect(getCycleIndex(1997, 2000)).toBe(3);
  });

  it("returns correct index for a past year", () => {
    expect(getCycleIndex(2000, 1997)).toBe(9);
  });

  it("wraps correctly every 12 years", () => {
    expect(getCycleIndex(1997, 2009)).toBe(0);
    expect(getCycleIndex(1997, 2021)).toBe(0);
  });

  it("wraps correctly for negative offsets", () => {
    // 1997 - 2000 = -3, ((-3 % 12) + 12) % 12 = 9
    expect(getCycleIndex(2000, 1997)).toBe(9);
  });

  it("always returns a value between 0 and 11", () => {
    for (let offset = -50; offset <= 50; offset++) {
      const target = 2000 + offset;
      if (target < MIN_YEAR || target > MAX_YEAR) continue;
      const index = getCycleIndex(2000, target);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThanOrEqual(11);
    }
  });

  it("throws for birth year below 1900", () => {
    expect(() => getCycleIndex(1899, 2000)).toThrow("Invalid birthYear");
  });

  it("throws for target year above 2100", () => {
    expect(() => getCycleIndex(2000, 2101)).toThrow("Invalid targetYear");
  });

  it("throws for non-integer year", () => {
    expect(() => getCycleIndex(2000.5, 2005)).toThrow("Invalid birthYear");
  });
});

describe("getYearNumber", () => {
  it("returns the first cycle value for the birth year itself", () => {
    expect(getYearNumber(CYCLE, 1997, 1997)).toBe(1);
  });

  it("returns the correct value for a future year", () => {
    expect(getYearNumber(CYCLE, 1997, 2000)).toBe(4);
  });

  it("returns the correct value when wrapping (2009 = 1997 = 2021)", () => {
    expect(getYearNumber(CYCLE, 1997, 2009)).toBe(1);
    expect(getYearNumber(CYCLE, 1997, 2021)).toBe(1);
  });

  it("works for boundary years 1900 and 2100", () => {
    expect(getYearNumber(CYCLE, 1900, 1900)).toBe(1);
    expect(getYearNumber(CYCLE, 1900, 2100)).toBe(
      CYCLE[((2100 - 1900) % 12 + 12) % 12]
    );
  });

  it("throws if cycle array is not length 12", () => {
    expect(() => getYearNumber([1, 2, 3], 2000, 2005)).toThrow(
      "Invalid cycle array length"
    );
  });

  it("throws for years out of range", () => {
    expect(() => getYearNumber(CYCLE, 1899, 2000)).toThrow("Invalid birthYear");
  });
});

describe("getActiveYear", () => {
  const CY = 2026; // currentYear

  function makeDate(year: number, month: number, day: number): Date {
    return new Date(year, month - 1, day);
  }

  // AC1: before birthday → returns currentYear - 1
  it("returns previous year when today is before the birthday (different month)", () => {
    // Born July 24, today is March 29 2026 → returns 2025
    expect(getActiveYear(CY, 7, 24, makeDate(2026, 3, 29))).toBe(2025);
  });

  it("returns previous year when today is before the birthday (same month, earlier day)", () => {
    // Born July 24, today is July 23 → returns 2025
    expect(getActiveYear(CY, 7, 24, makeDate(2026, 7, 23))).toBe(2025);
  });

  // AC2: on or after birthday → returns currentYear
  it("returns current year when today equals birthday", () => {
    // Born July 24, today is July 24 → returns 2026
    expect(getActiveYear(CY, 7, 24, makeDate(2026, 7, 24))).toBe(2026);
  });

  it("returns current year when today is after birthday (same month)", () => {
    // Born July 24, today is July 25 → returns 2026
    expect(getActiveYear(CY, 7, 24, makeDate(2026, 7, 25))).toBe(2026);
  });

  it("returns current year when today is after birthday (different month)", () => {
    // Born July 24, today is October → returns 2026
    expect(getActiveYear(CY, 7, 24, makeDate(2026, 10, 15))).toBe(2026);
  });

  // AC3: boundary check is month/day only
  it("returns current year for Jan 1 birthday on Dec 31 — AC override", () => {
    // Born Jan 1, today is Dec 31 → AC says current year always used (no "before Jan 1" exists)
    expect(getActiveYear(CY, 1, 1, makeDate(CY, 12, 31))).toBe(CY);
  });

  it("returns current year on Jan 1 birthday", () => {
    // Born January 1, today is January 1 → returns current year
    expect(getActiveYear(CY, 1, 1, makeDate(CY, 1, 1))).toBe(CY);
  });

  // AC4: Dec 31 birthday edge case
  it("returns previous year on Dec 30 for a Dec 31 birthday", () => {
    // Born Dec 31, today is Dec 30 → still in previous year position
    expect(getActiveYear(CY, 12, 31, makeDate(CY, 12, 30))).toBe(CY - 1);
  });

  it("returns current year on Dec 31 for a Dec 31 birthday", () => {
    // Born Dec 31, today is Dec 31 → switches to current year
    expect(getActiveYear(CY, 12, 31, makeDate(CY, 12, 31))).toBe(CY);
  });

  // AC5: Feb 29 leap year edge case
  it("handles Feb 29 birthday in a leap year (Feb 29 today)", () => {
    // Born Feb 29, leap year, today is Feb 29 → returns current year
    expect(getActiveYear(2028, 2, 29, makeDate(2028, 2, 29))).toBe(2028);
  });

  it("handles Feb 29 birthday in a leap year (Feb 28 today)", () => {
    // Born Feb 29, leap year, today is Feb 28 → still previous year
    expect(getActiveYear(2028, 2, 29, makeDate(2028, 2, 28))).toBe(2027);
  });

  it("handles Feb 29 birthday in a non-leap year (Feb 28 today)", () => {
    // Born Feb 29, non-leap year, today is Feb 28 → birthday already passed in leap years
    // In a non-leap year, Feb 28 is before Feb 29, so still previous year
    expect(getActiveYear(2027, 2, 29, makeDate(2027, 2, 28))).toBe(2026);
  });

  it("handles Feb 29 birthday in a non-leap year (Mar 1 today)", () => {
    // Born Feb 29, non-leap year, today is Mar 1 → birthday has passed
    expect(getActiveYear(2027, 2, 29, makeDate(2027, 3, 1))).toBe(2027);
  });

  // AC10: Verify worked example — July 24, 1997, today = March 29, 2026 → returns 2025
  it("worked example: July 24 birth, March 29 today returns 2025", () => {
    expect(getActiveYear(2026, 7, 24, makeDate(2026, 3, 29))).toBe(2025);
  });
});

describe("getLifeArea", () => {
  it("returns Self for column 1", () => {
    expect(getLifeArea(1)).toBe("Self");
  });

  it("returns Family for column 2", () => {
    expect(getLifeArea(2)).toBe("Family");
  });

  it("returns Protection for column 12", () => {
    expect(getLifeArea(12)).toBe("Protection");
  });

  it("returns the correct domain for every column 1-12", () => {
    const expected = [
      "Self", "Family", "Movement", "Home", "Money", "Allies",
      "Relationships", "Health", "Status", "Opportunity", "Karma", "Protection",
    ];
    for (let col = 1; col <= 12; col++) {
      expect(getLifeArea(col)).toBe(expected[col - 1]);
    }
  });

  it("throws for column 0", () => {
    expect(() => getLifeArea(0)).toThrow("Invalid column position");
  });

  it("throws for column 13", () => {
    expect(() => getLifeArea(13)).toThrow("Invalid column position");
  });

  it("throws for negative column", () => {
    expect(() => getLifeArea(-1)).toThrow("Invalid column position");
  });
});
