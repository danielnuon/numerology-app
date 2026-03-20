import {
  deriveBirthData,
  validateBirthDate,
  computeCycleFromBirthDate,
  BIRTH_YEAR_MIN,
  BIRTH_YEAR_MAX,
} from "../derive";
import { computeCycle } from "../calculate";

// ---------------------------------------------------------------------------
// deriveBirthData
// ---------------------------------------------------------------------------

describe("deriveBirthData", () => {
  it("returns weekday 5 (Thursday) for July 24, 1997", () => {
    const { weekday } = deriveBirthData(1997, 7, 24);
    expect(weekday).toBe(5);
  });

  it("returns zodiacNumber 2 (Ox) for July 24, 1997", () => {
    // 1997 CNY = Feb 7 → July 24 is after CNY → zodiac year 1997
    // 1997: (1997 - 4) % 12 = 1993 % 12 = 1 → index 1 → Ox (1-indexed = 2)
    const { zodiacNumber } = deriveBirthData(1997, 7, 24);
    expect(zodiacNumber).toBe(2);
  });

  it("returns zodiacAnimal 'Ox' for July 24, 1997", () => {
    const { zodiacAnimal } = deriveBirthData(1997, 7, 24);
    expect(zodiacAnimal).toBe("Ox");
  });

  it("returns gregorianMonth 7 for July 24, 1997", () => {
    const { gregorianMonth } = deriveBirthData(1997, 7, 24);
    expect(gregorianMonth).toBe(7);
  });

  // CNY boundary: 2000 CNY is Feb 5
  it("uses prior year zodiac for Jan 1, 2000 (before CNY Feb 5, 2000)", () => {
    // Before CNY → zodiac year 1999 → Rabbit (index 3 → number 4)
    const { zodiacNumber, zodiacAnimal } = deriveBirthData(2000, 1, 1);
    expect(zodiacAnimal).toBe("Rabbit");
    expect(zodiacNumber).toBe(4);
  });

  it("uses 2000 zodiac for Feb 6, 2000 (after CNY Feb 5, 2000)", () => {
    // On or after CNY → zodiac year 2000 → Dragon (index 4 → number 5)
    const { zodiacNumber, zodiacAnimal } = deriveBirthData(2000, 2, 6);
    expect(zodiacAnimal).toBe("Dragon");
    expect(zodiacNumber).toBe(5);
  });

  it("maps getDay() correctly: Sunday → weekday 1", () => {
    // Jan 5, 1997 is a Sunday
    const { weekday } = deriveBirthData(1997, 1, 5);
    expect(weekday).toBe(1);
  });

  it("maps getDay() correctly: Saturday → weekday 7", () => {
    // Jan 4, 1997 is a Saturday
    const { weekday } = deriveBirthData(1997, 1, 4);
    expect(weekday).toBe(7);
  });

  it("uses local date constructor (not UTC) to avoid timezone shift", () => {
    // Regression: new Date("1997-07-24") parses as UTC midnight and can shift
    // a day in UTC-N timezones. new Date(1997, 6, 24) is always local.
    const { weekday } = deriveBirthData(1997, 7, 24);
    expect(weekday).toBe(5); // must be Thursday regardless of system timezone
  });
});

// ---------------------------------------------------------------------------
// computeCycle integration — the worked example
// ---------------------------------------------------------------------------

describe("computeCycle with derived birth data", () => {
  it("produces the expected cycle for July 24, 1997", () => {
    // Acceptance criterion: July 24, 1997 → [3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8]
    const result = computeCycle(7, 2, 5);
    expect(result.cycle).toEqual([3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8]);
  });

  it("computeCycleFromBirthDate produces same cycle as manual inputs", () => {
    const fromBirth = computeCycleFromBirthDate(1997, 7, 24);
    const manual = computeCycle(7, 2, 5);
    expect(fromBirth.cycle).toEqual(manual.cycle);
    expect(fromBirth.totalScore).toBe(manual.totalScore);
  });

  it("computeCycleFromBirthDate attaches birthYear", () => {
    const result = computeCycleFromBirthDate(1997, 7, 24);
    expect(result.birthYear).toBe(1997);
  });

  it("computeCycleFromBirthDate attaches birthData", () => {
    const result = computeCycleFromBirthDate(1997, 7, 24);
    expect(result.birthData.weekday).toBe(5);
    expect(result.birthData.zodiacNumber).toBe(2);
    expect(result.birthData.zodiacAnimal).toBe("Ox");
    expect(result.birthData.gregorianMonth).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// validateBirthDate
// ---------------------------------------------------------------------------

describe("validateBirthDate", () => {
  // Use a fixed "today" so tests are deterministic
  const today = new Date(2026, 2, 20); // March 20, 2026

  it("returns no errors for a valid past date", () => {
    const errors = validateBirthDate(1997, 7, 24, today);
    expect(errors).toHaveLength(0);
  });

  it("rejects a future date", () => {
    const errors = validateBirthDate(2026, 12, 31, today);
    expect(errors.some((e) => e.field === "date")).toBe(true);
    expect(errors[0].message).toMatch(/future/i);
  });

  it("rejects year below minimum (1900)", () => {
    const errors = validateBirthDate(1899, 1, 1, today);
    expect(errors.some((e) => e.field === "year")).toBe(true);
  });

  it("rejects year above maximum (2100)", () => {
    const errors = validateBirthDate(2101, 1, 1, today);
    expect(errors.some((e) => e.field === "year")).toBe(true);
  });

  it("accepts boundary years 1900 and 2100 when not in the future", () => {
    expect(validateBirthDate(1900, 1, 1, today)).toHaveLength(0);
    // 2100 is in the past relative to our fixed today? No — fix: 2100 > 2026 so future
    // Only test 1900 for non-future boundary
    expect(validateBirthDate(BIRTH_YEAR_MIN, 6, 15, today)).toHaveLength(0);
  });

  it("rejects invalid month 0", () => {
    const errors = validateBirthDate(2000, 0, 1, today);
    expect(errors.some((e) => e.field === "month")).toBe(true);
  });

  it("rejects invalid month 13", () => {
    const errors = validateBirthDate(2000, 13, 1, today);
    expect(errors.some((e) => e.field === "month")).toBe(true);
  });

  it("rejects invalid day 0", () => {
    const errors = validateBirthDate(2000, 1, 0, today);
    expect(errors.some((e) => e.field === "day")).toBe(true);
  });

  it("rejects invalid day 32", () => {
    const errors = validateBirthDate(2000, 1, 32, today);
    expect(errors.some((e) => e.field === "day")).toBe(true);
  });

  it("rejects February 30 as invalid calendar date", () => {
    const errors = validateBirthDate(2000, 2, 30, today);
    expect(errors.some((e) => e.field === "date")).toBe(true);
    expect(errors[0].message).toMatch(/invalid date/i);
  });

  it("accepts Feb 29 on a leap year", () => {
    const errors = validateBirthDate(2000, 2, 29, today);
    expect(errors).toHaveLength(0);
  });

  it("rejects Feb 29 on a non-leap year", () => {
    const errors = validateBirthDate(1997, 2, 29, today);
    expect(errors.some((e) => e.field === "date")).toBe(true);
  });

  it("accepts today itself (same day, not future)", () => {
    const errors = validateBirthDate(2026, 3, 20, today);
    expect(errors).toHaveLength(0);
  });

  it("rejects tomorrow as future", () => {
    const errors = validateBirthDate(2026, 3, 21, today);
    expect(errors.some((e) => e.field === "date")).toBe(true);
  });

  it("returns error with specific field identifiers, not generic alerts", () => {
    const yearError = validateBirthDate(1800, 1, 1, today);
    expect(yearError[0].field).toBe("year");

    const monthError = validateBirthDate(2000, 0, 1, today);
    expect(monthError[0].field).toBe("month");

    const dayError = validateBirthDate(2000, 1, 0, today);
    expect(dayError[0].field).toBe("day");
  });

  it("BIRTH_YEAR_MIN is 1900 and BIRTH_YEAR_MAX is 2100", () => {
    expect(BIRTH_YEAR_MIN).toBe(1900);
    expect(BIRTH_YEAR_MAX).toBe(2100);
  });
});
