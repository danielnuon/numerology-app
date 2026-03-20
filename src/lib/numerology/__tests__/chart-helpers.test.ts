import {
  getTierSymbol,
  getTierColorClass,
  getYearsForColumn,
  getCurrentYearColumn,
} from "../chart-helpers";

// ---------------------------------------------------------------------------
// getTierSymbol
// ---------------------------------------------------------------------------

describe("getTierSymbol", () => {
  it("returns ● for very-strong", () => {
    expect(getTierSymbol("very-strong")).toBe("●");
  });

  it("returns ◕ for strong", () => {
    expect(getTierSymbol("strong")).toBe("◕");
  });

  it("returns ◑ for moderate", () => {
    expect(getTierSymbol("moderate")).toBe("◑");
  });

  it("returns ◔ for weak", () => {
    expect(getTierSymbol("weak")).toBe("◔");
  });

  it("returns ⊙ for zero", () => {
    expect(getTierSymbol("zero")).toBe("⊙");
  });

  it("returns ⊙ for an unknown tier (fallback)", () => {
    expect(getTierSymbol("unknown")).toBe("⊙");
  });
});

// ---------------------------------------------------------------------------
// getTierColorClass
// ---------------------------------------------------------------------------

describe("getTierColorClass", () => {
  it("returns bg-tier-very-strong/15 for very-strong", () => {
    expect(getTierColorClass("very-strong")).toBe("bg-tier-very-strong/15");
  });

  it("returns bg-tier-strong/15 for strong", () => {
    expect(getTierColorClass("strong")).toBe("bg-tier-strong/15");
  });

  it("returns bg-tier-moderate/15 for moderate", () => {
    expect(getTierColorClass("moderate")).toBe("bg-tier-moderate/15");
  });

  it("returns bg-tier-weak/15 for weak", () => {
    expect(getTierColorClass("weak")).toBe("bg-tier-weak/15");
  });

  it("returns bg-tier-zero (full opacity, no /15) for zero", () => {
    const cls = getTierColorClass("zero");
    expect(cls).toBe("bg-tier-zero");
    expect(cls).not.toContain("/15");
  });

  it("returns bg-tier-zero as fallback for unknown tier", () => {
    expect(getTierColorClass("unknown")).toBe("bg-tier-zero");
  });
});

// ---------------------------------------------------------------------------
// getYearsForColumn
// ---------------------------------------------------------------------------

describe("getYearsForColumn", () => {
  // birthYear=1997, currentYear=2026
  // getCycleIndex(1997, 1997) = 0 → years: 1997, 2009, 2021, 2033, …
  // getCycleIndex(1997, 2026) = (2026-1997) % 12 = 29 % 12 = 5 → column 5

  it("col 0 (birth year position): includes 2021 (past) and 2033 (future)", () => {
    const years = getYearsForColumn(1997, 0, 2026);
    expect(years).toContain(2021);
    expect(years).toContain(2033);
  });

  it("col 0: does not include years before birth year", () => {
    const years = getYearsForColumn(1997, 0, 2026);
    for (const y of years) {
      expect(y).toBeGreaterThanOrEqual(1997);
    }
  });

  it("col 5 (matches currentYear 2026): should include 2026", () => {
    // getCycleIndex(1997, 2026) = 29 % 12 = 5
    const years = getYearsForColumn(1997, 5, 2026);
    expect(years).toContain(2026);
  });

  it("returns at most 3 years", () => {
    for (let col = 0; col < 12; col++) {
      const years = getYearsForColumn(1997, col, 2026);
      expect(years.length).toBeLessThanOrEqual(3);
    }
  });

  it("returns at least 1 year", () => {
    for (let col = 0; col < 12; col++) {
      const years = getYearsForColumn(1997, col, 2026);
      expect(years.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("all returned years map back to the correct column index", () => {
    const birthYear = 1997;
    const currentYear = 2026;
    for (let col = 0; col < 12; col++) {
      const years = getYearsForColumn(birthYear, col, currentYear);
      for (const y of years) {
        const diff = ((y - birthYear) % 12 + 12) % 12;
        expect(diff).toBe(col);
      }
    }
  });

  it("years are in ascending order", () => {
    for (let col = 0; col < 12; col++) {
      const years = getYearsForColumn(1997, col, 2026);
      for (let i = 1; i < years.length; i++) {
        expect(years[i]).toBeGreaterThan(years[i - 1]);
      }
    }
  });

  it("birth year = current year: col 0 includes birthYear itself", () => {
    const years = getYearsForColumn(2026, 0, 2026);
    expect(years).toContain(2026);
  });

  it("col 11 (last column): returns correct years", () => {
    // getCycleIndex(1997, year) = 11 → year = 1997 + 11 + k*12 = 2008, 2020, 2032
    const years = getYearsForColumn(1997, 11, 2026);
    // 2020 is the most recent past, 2032 is the next upcoming
    expect(years).toContain(2020);
    expect(years).toContain(2032);
  });
});

// ---------------------------------------------------------------------------
// getCurrentYearColumn
// ---------------------------------------------------------------------------

describe("getCurrentYearColumn", () => {
  it("birthYear=1997, currentYear=2026 → column 5", () => {
    // (2026 - 1997) % 12 = 29 % 12 = 5
    expect(getCurrentYearColumn(1997, 2026)).toBe(5);
  });

  it("returns 0 when currentYear equals birthYear", () => {
    expect(getCurrentYearColumn(2000, 2000)).toBe(0);
  });

  it("returns 0 when currentYear is exactly 12 years after birthYear", () => {
    expect(getCurrentYearColumn(2000, 2012)).toBe(0);
  });

  it("returns a value between 0 and 11 inclusive", () => {
    for (let offset = 0; offset < 24; offset++) {
      const col = getCurrentYearColumn(2000, 2000 + offset);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThanOrEqual(11);
    }
  });

  it("handles a person born before current year with correct wrap", () => {
    // birthYear=1990, currentYear=2025 → (2025-1990) % 12 = 35 % 12 = 11
    expect(getCurrentYearColumn(1990, 2025)).toBe(11);
  });
});
