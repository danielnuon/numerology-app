import { interpretYear, interpretTotal } from "../interpretation";
import { YEAR_TIERS, TOTAL_TIERS } from "../interpretation-data";

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
    expect(result.label).toBe("Strong / favourable cycle");
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
