import { KHMER_NEW_YEAR_APRIL_DAY } from "../khmer-new-year";
import {
  CNY_DATES,
  DEFAULT_NEW_YEAR_RULE,
  isNewYearRule,
  ZODIAC_ANIMALS,
  getZodiacYear,
  getZodiacAnimal,
  getZodiacAnimalForYear,
  getZodiacNumber,
  getZodiacRow,
} from "../zodiac";

describe("CNY_DATES", () => {
  it("covers years 1900-2100", () => {
    for (let year = 1900; year <= 2100; year++) {
      expect(CNY_DATES[year]).toBeDefined();
      expect(CNY_DATES[year].month).toBeGreaterThanOrEqual(1);
      expect(CNY_DATES[year].month).toBeLessThanOrEqual(2);
      expect(CNY_DATES[year].day).toBeGreaterThanOrEqual(1);
      expect(CNY_DATES[year].day).toBeLessThanOrEqual(31);
    }
  });

  it("has correct CNY date for 10+ well-known years", () => {
    // Authoritative dates from Hong Kong Observatory / verified sources
    expect(CNY_DATES[1900]).toEqual({ month: 1, day: 31 }); // Rat
    expect(CNY_DATES[1912]).toEqual({ month: 2, day: 18 }); // Rat
    expect(CNY_DATES[1950]).toEqual({ month: 2, day: 17 }); // Tiger
    expect(CNY_DATES[1964]).toEqual({ month: 2, day: 13 }); // Dragon
    expect(CNY_DATES[1976]).toEqual({ month: 1, day: 31 }); // Dragon
    expect(CNY_DATES[1985]).toEqual({ month: 2, day: 20 }); // Ox
    expect(CNY_DATES[1997]).toEqual({ month: 2, day: 7 });  // Ox
    expect(CNY_DATES[2000]).toEqual({ month: 2, day: 5 });  // Dragon
    expect(CNY_DATES[2008]).toEqual({ month: 2, day: 7 });  // Rat
    expect(CNY_DATES[2020]).toEqual({ month: 1, day: 25 }); // Rat
    expect(CNY_DATES[2024]).toEqual({ month: 2, day: 10 }); // Dragon
    expect(CNY_DATES[2025]).toEqual({ month: 1, day: 29 }); // Snake
  });
});

describe("ZODIAC_ANIMALS", () => {
  it("has exactly 12 animals", () => {
    expect(ZODIAC_ANIMALS).toHaveLength(12);
  });

  it("starts with Rat and ends with Pig", () => {
    expect(ZODIAC_ANIMALS[0]).toBe("Rat");
    expect(ZODIAC_ANIMALS[11]).toBe("Pig");
  });
});

describe("getZodiacYear (Chinese New Year)", () => {
  it("returns current year for July 24, 1997 (after CNY Feb 7)", () => {
    expect(getZodiacYear(new Date(1997, 6, 24), "chinese")).toBe(1997);
  });

  it("returns previous year for birth before CNY", () => {
    // CNY 1997 is Feb 7. Birth on Feb 6 → zodiac year 1996
    expect(getZodiacYear(new Date(1997, 1, 6), "chinese")).toBe(1996);
  });

  it("returns current year for birth on CNY day", () => {
    // CNY 1997 is Feb 7. Birth on Feb 7 → zodiac year 1997
    expect(getZodiacYear(new Date(1997, 1, 7), "chinese")).toBe(1997);
  });

  it("returns current year for birth after CNY", () => {
    // CNY 1997 is Feb 7. Birth on Feb 8 → zodiac year 1997
    expect(getZodiacYear(new Date(1997, 1, 8), "chinese")).toBe(1997);
  });

  it("handles January births before CNY correctly", () => {
    // CNY 2025 is Jan 29. Birth on Jan 15 → zodiac year 2024
    expect(getZodiacYear(new Date(2025, 0, 15), "chinese")).toBe(2024);
  });

  it("handles March births (always after CNY)", () => {
    // Any March birth is always after CNY
    expect(getZodiacYear(new Date(2000, 2, 15), "chinese")).toBe(2000);
  });

  it("handles year 1900 (start of range)", () => {
    // Jan 1, 1900 is before CNY Jan 31 → zodiac year 1899
    expect(getZodiacYear(new Date(1900, 0, 1), "chinese")).toBe(1899);
  });

  it("handles year 2100 (end of range)", () => {
    // June 1, 2100 is after CNY → zodiac year 2100
    expect(getZodiacYear(new Date(2100, 5, 1), "chinese")).toBe(2100);
  });

  it("throws for year outside supported range", () => {
    expect(() => getZodiacYear(new Date(1899, 5, 1), "chinese")).toThrow(
      "outside the supported range"
    );
    expect(() => getZodiacYear(new Date(2101, 5, 1), "chinese")).toThrow(
      "outside the supported range"
    );
  });
});

describe("getZodiacAnimalForYear", () => {
  it("returns the animal that rules each calendar year", () => {
    expect(getZodiacAnimalForYear(1997)).toBe("Ox");
    expect(getZodiacAnimalForYear(2000)).toBe("Dragon");
    expect(getZodiacAnimalForYear(2026)).toBe("Horse");
  });

  it("repeats every 12 years", () => {
    expect(getZodiacAnimalForYear(1924)).toBe(getZodiacAnimalForYear(2020));
  });
});

describe("getZodiacAnimal", () => {
  it("returns Ox for July 24, 1997 (worked example)", () => {
    expect(getZodiacAnimal(new Date(1997, 6, 24), "chinese")).toBe("Ox");
  });

  it("returns Rat for 1900 (after CNY Jan 31)", () => {
    expect(getZodiacAnimal(new Date(1900, 5, 1), "chinese")).toBe("Rat");
  });

  it("returns Rat for 1924 (after CNY)", () => {
    expect(getZodiacAnimal(new Date(1924, 5, 1), "chinese")).toBe("Rat");
  });

  it("returns Dragon for 2000 (after CNY)", () => {
    expect(getZodiacAnimal(new Date(2000, 5, 1), "chinese")).toBe("Dragon");
  });

  it("returns Snake for 2025 (after CNY Jan 29)", () => {
    expect(getZodiacAnimal(new Date(2025, 1, 1), "chinese")).toBe("Snake");
  });

  it("returns Dragon for Jan 15, 2025 (before CNY Jan 29)", () => {
    expect(getZodiacAnimal(new Date(2025, 0, 15), "chinese")).toBe("Dragon");
  });
});

describe("getZodiacNumber", () => {
  it("returns 2 (Ox) for July 24, 1997 (worked example)", () => {
    expect(getZodiacNumber(new Date(1997, 6, 24), "chinese")).toBe(2);
  });

  it("returns 1 for Rat year", () => {
    expect(getZodiacNumber(new Date(2020, 5, 1), "chinese")).toBe(1);
  });

  it("returns 12 for Pig year", () => {
    expect(getZodiacNumber(new Date(2019, 5, 1), "chinese")).toBe(12);
  });
});

describe("getZodiacRow", () => {
  it("returns correct row for Ox (2) per worked example", () => {
    expect(getZodiacRow(2)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1]);
  });

  it("returns correct row for Rat (1)", () => {
    expect(getZodiacRow(1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("returns correct row for Pig (12)", () => {
    expect(getZodiacRow(12)).toEqual([12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("always returns array of length 12 containing all values 1-12", () => {
    for (let n = 1; n <= 12; n++) {
      const row = getZodiacRow(n);
      expect(row).toHaveLength(12);
      const sorted = [...row].sort((a, b) => a - b);
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    }
  });

  it("throws for invalid zodiac number 0", () => {
    expect(() => getZodiacRow(0)).toThrow("Invalid zodiac number");
  });

  it("throws for invalid zodiac number 13", () => {
    expect(() => getZodiacRow(13)).toThrow("Invalid zodiac number");
  });
});

describe("KHMER_NEW_YEAR_APRIL_DAY", () => {
  it("covers years 1900-2100", () => {
    for (let year = 1900; year <= 2100; year++) {
      expect(KHMER_NEW_YEAR_APRIL_DAY[year]).toBeDefined();
    }
  });

  it("always falls between 12 and 15 April", () => {
    for (const day of Object.values(KHMER_NEW_YEAR_APRIL_DAY)) {
      expect(day).toBeGreaterThanOrEqual(12);
      expect(day).toBeLessThanOrEqual(15);
    }
  });

  it("matches published Moha Sangkran dates", () => {
    expect(KHMER_NEW_YEAR_APRIL_DAY[2024]).toBe(13);
    expect(KHMER_NEW_YEAR_APRIL_DAY[2025]).toBe(14);
  });
});

describe("getZodiacYear (Khmer New Year)", () => {
  it("is the default rule", () => {
    expect(DEFAULT_NEW_YEAR_RULE).toBe("khmer");
  });

  it("keeps the previous animal until Moha Sangkran in April", () => {
    // 1997: Chinese New Year Feb 7, Khmer New Year Apr 13
    expect(getZodiacYear(new Date(1997, 1, 10), "khmer")).toBe(1996);
    expect(getZodiacYear(new Date(1997, 3, 12), "khmer")).toBe(1996);
  });

  it("turns the animal on Moha Sangkran day", () => {
    expect(getZodiacYear(new Date(1997, 3, 13), "khmer")).toBe(1997);
    expect(getZodiacYear(new Date(2025, 3, 14), "khmer")).toBe(2025);
    expect(getZodiacYear(new Date(2025, 3, 13), "khmer")).toBe(2024);
  });

  it("agrees with Chinese New Year outside the gap between them", () => {
    expect(getZodiacYear(new Date(1997, 0, 20), "khmer")).toBe(1996);
    expect(getZodiacYear(new Date(1997, 6, 24), "khmer")).toBe(1997);
  });

  it("gives a different animal inside the gap", () => {
    // 10 Feb 1997: Ox by Chinese New Year, still Rat by Khmer New Year
    expect(getZodiacAnimal(new Date(1997, 1, 10), "chinese")).toBe("Ox");
    expect(getZodiacAnimal(new Date(1997, 1, 10), "khmer")).toBe("Rat");
    expect(getZodiacNumber(new Date(1997, 1, 10), "khmer")).toBe(1);
  });

  it("throws for year outside supported range", () => {
    expect(() => getZodiacYear(new Date(1899, 5, 1), "khmer")).toThrow(
      "outside the supported range"
    );
  });
});

describe("isNewYearRule", () => {
  it("accepts only the two rule names", () => {
    expect(isNewYearRule("khmer")).toBe(true);
    expect(isNewYearRule("chinese")).toBe(true);
    expect(isNewYearRule("lunar")).toBe(false);
    expect(isNewYearRule(null)).toBe(false);
  });
});
