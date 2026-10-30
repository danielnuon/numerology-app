import {
  assessStability,
  compareCycles,
  compatibilityTier,
  comparisonCycleStarts,
  cycleStartYear,
  INTERACTION_ORDER,
  INTERACTION_TEXT,
  householdInteraction,
  pairInteractions,
  STABILITY_TEXT,
  stabilityText,
  summarizeComparison,
  yearInteraction,
  type ComparedYear,
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
    expect(assessStability([a, b])).toBe(result);
  });

  it("reads one total from 60 to 67 with the other under 60 as mixed", () => {
    expect(assessStability([64, 56])).toBe("mixed");
    expect(assessStability([59, 67])).toBe("mixed");
  });

  it("reads both as all for three or more", () => {
    expect(assessStability([76, 76, 76])).toBe("strong");
    expect(assessStability([76, 64, 64, 76])).toBe("moderate");
    expect(assessStability([76, 64, 52])).toBe("mixed");
    expect(assessStability([64, 52, 52])).toBe("mixed");
    expect(assessStability([52, 52, 52, 52, 52, 52])).toBe("challenging");
  });
});

describe("householdInteraction", () => {
  it("gives exactly the pair rule for every two numbers", () => {
    for (let a = 0; a <= 11; a++) {
      for (let b = 0; b <= 11; b++) {
        expect(householdInteraction([a, b])).toBe(yearInteraction(a, b));
      }
    }
  });

  it.each([
    [[9, 10, 0, 2], "unstable"],
    [[8, 10, 11], "amplified"],
    [[3, 6, 10, 8], "stabilized"],
    [[9, 2, 5], "stabilized"],
    [[5, 3, 7, 1], "neutral"],
    [[2, 1, 5], "risk"],
    [[2, 1, 3, 9], "risk"],
    [[5, 5, 2], "neutral"],
    [[5, 5, 5], "neutral"],
  ] as const)("reads %j as %s", (numbers, result) => {
    expect(householdInteraction(numbers)).toBe(result);
  });

  it("doesn't depend on the order of the people", () => {
    expect(householdInteraction([1, 7, 3, 5])).toBe(householdInteraction([5, 3, 7, 1]));
  });
});

describe("pairInteractions", () => {
  it("reads every pair once by the pair rule", () => {
    expect(pairInteractions([11, 9, 1])).toEqual([
      { first: 0, second: 1, interaction: "amplified" },
      { first: 0, second: 2, interaction: "stabilized" },
      { first: 1, second: 2, interaction: "stabilized" },
    ]);
  });

  it("leaves out anyone not born yet", () => {
    expect(pairInteractions([11, null, 1])).toEqual([{ first: 0, second: 2, interaction: "stabilized" }]);
  });
});

describe("stabilityText", () => {
  it("keeps the pair wording for two people", () => {
    expect(stabilityText("mixed", 2)).toBe(STABILITY_TEXT.mixed);
  });

  it("words the same assessment for a group, under the same label", () => {
    const group = stabilityText("mixed", 4);
    expect(group.label).toBe(STABILITY_TEXT.mixed.label);
    expect(group.description).not.toMatch(/\b(both|other)\b/i);
  });
});

describe("compareCycles", () => {
  const first = computeCycleFromBirthDate(1997, 7, 24, "khmer");
  const second = computeCycleFromBirthDate(2000, 3, 15, "khmer");

  it("compares twelve consecutive calendar years by default", () => {
    const years = compareCycles([first, second], 2026);
    expect(years.map((y) => y.year)).toEqual([
      2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037,
    ]);
  });

  it("uses each person's own number for the calendar year", () => {
    const [year2026] = compareCycles([first, second], 2026, 1);
    // 1997 worked example: 2026 is column 6 of [3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8].
    expect(year2026.numbers).toEqual([11, second.cycle[(2026 - 2000) % 12]]);
    expect(year2026.interaction).toBe(yearInteraction(11, year2026.numbers[1] as number));
  });

  it("gives the same numbers on both sides for the same birthday", () => {
    for (const year of compareCycles([first, first], 2026)) {
      expect(year.numbers[0]).toBe(year.numbers[1]);
    }
  });

  it("reads a household's year and names whose reset unsettles it", () => {
    const household = [
      first,
      computeCycleFromBirthDate(1996, 2, 10),
      computeCycleFromBirthDate(2021, 5, 3),
      computeCycleFromBirthDate(1968, 11, 12),
    ];
    const years = compareCycles(household, 2021);
    expect(years.map((y) => y.interaction)).toEqual([
      "stabilized", "stabilized", "unstable", "neutral", "stabilized", "stabilized",
      "stabilized", "unstable", "unstable", "stabilized", "stabilized", "unstable",
    ]);
    // 2028: the 1997 and 1968 cycles are both at 0
    expect(years[7].resetting).toEqual([0, 3]);
    expect(years[0].resetting).toEqual([]);
  });
});

describe("summarizeComparison", () => {
  const year = (y: number, interaction: ComparedYear["interaction"]): ComparedYear => ({
    year: y,
    numbers: [0, 0],
    interaction,
    resetting: [],
  });
  const years = [year(2026, "amplified"), year(2027, "risk"), year(2028, "amplified"), year(2029, "unstable")];

  it("counts every interaction, including the ones that never occur", () => {
    expect(summarizeComparison(years, 2026).counts).toEqual({
      amplified: 2,
      stabilized: 0,
      neutral: 0,
      risk: 1,
      unstable: 1,
    });
  });

  it("picks out the current year", () => {
    expect(summarizeComparison(years, 2027).current?.interaction).toBe("risk");
  });

  it("has no current year when it isn't among the compared years", () => {
    expect(summarizeComparison(years, 2040).current).toBeNull();
  });

  it("counts add up to the years compared", () => {
    const real = compareCycles([computeCycleFromBirthDate(1997, 7, 24), computeCycleFromBirthDate(2000, 3, 15)], 2026);
    const { counts } = summarizeComparison(real, 2026);
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(12);
  });
});

describe("INTERACTION_TEXT", () => {
  it("names every interaction in INTERACTION_ORDER exactly once", () => {
    expect([...INTERACTION_ORDER].sort()).toEqual(Object.keys(INTERACTION_TEXT).sort());
  });
});

describe("compareCycles before a birth year", () => {
  const first = computeCycleFromBirthDate(1997, 7, 24);
  const second = computeCycleFromBirthDate(2000, 3, 15);

  it("has no number or interaction for a person before their birth year", () => {
    const years = compareCycles([first, second], 1997);
    expect(years.slice(0, 3).map((y) => [y.numbers[1], y.interaction])).toEqual([
      [null, null],
      [null, null],
      [null, null],
    ]);
    expect(years[3].numbers[1]).not.toBeNull();
    expect(years[3].interaction).not.toBeNull();
    expect(years.every((y) => y.numbers[0] !== null)).toBe(true);
  });

  it("reads a group's year among the people born by then", () => {
    const third = computeCycleFromBirthDate(2005, 6, 1);
    const [y1997] = compareCycles([first, second, third], 1997, 1);
    expect(y1997.interaction).toBeNull();
    const [y2002] = compareCycles([first, second, third], 2002, 1);
    expect(y2002.numbers[2]).toBeNull();
    expect(y2002.interaction).toBe(householdInteraction(y2002.numbers.slice(0, 2) as number[]));
  });

  it("leaves those years out of the counts", () => {
    const summary = summarizeComparison(compareCycles([first, second], 1997), 2026);
    expect(summary.sharedYears).toBe(9);
    expect(Object.values(summary.counts).reduce((a, b) => a + b, 0)).toBe(9);
    expect(summary.current).toBeNull();
  });
});

describe("cycleStartYear", () => {
  it("counts cycles from the birth year", () => {
    expect(cycleStartYear(1997, 1997)).toBe(1997);
    expect(cycleStartYear(1997, 2008)).toBe(1997);
    expect(cycleStartYear(1997, 2009)).toBe(2009);
    expect(cycleStartYear(1997, 2026)).toBe(2021);
  });
});

describe("comparisonCycleStarts", () => {
  it("offers the current cycle and the two before it, newest first", () => {
    expect(comparisonCycleStarts(1997, [2000], 2026)).toEqual([2021, 2009, 1997]);
  });

  it("never starts a cycle before the first person was born", () => {
    expect(comparisonCycleStarts(2010, [1990], 2026)).toEqual([2022, 2010]);
  });

  it("leaves out a cycle that ends before the second person was born", () => {
    expect(comparisonCycleStarts(1990, [2005], 2026)).toEqual([2026, 2014, 2002]);
    expect(comparisonCycleStarts(1990, [2015], 2026)).toEqual([2026, 2014]);
  });

  it("keeps a cycle anyone else shares", () => {
    expect(comparisonCycleStarts(1990, [2015, 2005], 2026)).toEqual([2026, 2014, 2002]);
  });
});
