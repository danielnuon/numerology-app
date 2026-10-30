import {
  encodeBirthDate,
  decodeBirthDate,
  buildSharePath,
  encodeShareSegment,
  decodeShareSegment,
  decodeComparisonSegment,
  buildComparisonSharePath,
  cleanPersonName,
  decodeComparisonNames,
} from "../url-encoding";

describe("encodeBirthDate", () => {
  it("formats a standard date as YYYY-MM-DD", () => {
    expect(encodeBirthDate(1997, 7, 24)).toBe("1997-07-24");
  });

  it("pads single-digit month and day", () => {
    expect(encodeBirthDate(2000, 1, 5)).toBe("2000-01-05");
  });

  it("handles December 31", () => {
    expect(encodeBirthDate(1999, 12, 31)).toBe("1999-12-31");
  });

  it("handles January 1", () => {
    expect(encodeBirthDate(2100, 1, 1)).toBe("2100-01-01");
  });

  it("handles the min year 1900", () => {
    expect(encodeBirthDate(1900, 6, 15)).toBe("1900-06-15");
  });
});

describe("decodeBirthDate", () => {
  it("decodes a valid YYYY-MM-DD string", () => {
    expect(decodeBirthDate("1997-07-24")).toEqual({
      year: 1997,
      month: 7,
      day: 24,
    });
  });

  it("decodes January 1", () => {
    expect(decodeBirthDate("2000-01-01")).toEqual({
      year: 2000,
      month: 1,
      day: 1,
    });
  });

  it("decodes December 31", () => {
    expect(decodeBirthDate("1999-12-31")).toEqual({
      year: 1999,
      month: 12,
      day: 31,
    });
  });

  it("decodes Feb 29 on a leap year", () => {
    expect(decodeBirthDate("2000-02-29")).toEqual({
      year: 2000,
      month: 2,
      day: 29,
    });
  });

  // Invalid inputs
  it("returns null for empty string", () => {
    expect(decodeBirthDate("")).toBeNull();
  });

  it("returns null for malformed format (no hyphens)", () => {
    expect(decodeBirthDate("19970724")).toBeNull();
  });

  it("returns null for partial date", () => {
    expect(decodeBirthDate("1997-07")).toBeNull();
  });

  it("returns null for non-numeric input", () => {
    expect(decodeBirthDate("abcd-ef-gh")).toBeNull();
  });

  it("returns null for year below 1900", () => {
    expect(decodeBirthDate("1899-01-01")).toBeNull();
  });

  it("returns null for year above 2100", () => {
    expect(decodeBirthDate("2101-01-01")).toBeNull();
  });

  it("returns null for month 0", () => {
    expect(decodeBirthDate("2000-00-15")).toBeNull();
  });

  it("returns null for month 13", () => {
    expect(decodeBirthDate("2000-13-15")).toBeNull();
  });

  it("returns null for day 0", () => {
    expect(decodeBirthDate("2000-06-00")).toBeNull();
  });

  it("returns null for day 32", () => {
    expect(decodeBirthDate("2000-06-32")).toBeNull();
  });

  it("returns null for Feb 29 on a non-leap year", () => {
    expect(decodeBirthDate("2001-02-29")).toBeNull();
  });

  it("returns null for Feb 30 (never valid)", () => {
    expect(decodeBirthDate("2000-02-30")).toBeNull();
  });

  it("returns null for Apr 31 (April has 30 days)", () => {
    expect(decodeBirthDate("2000-04-31")).toBeNull();
  });

  it("returns null for random garbage", () => {
    expect(decodeBirthDate("hello-world")).toBeNull();
  });

  it("returns null for extra characters after date", () => {
    expect(decodeBirthDate("1997-07-24-extra")).toBeNull();
  });
});

describe("buildSharePath", () => {
  it("builds the correct share URL path", () => {
    expect(buildSharePath(1997, 7, 24)).toBe("/r/1997-07-24");
  });

  it("builds path for boundary dates", () => {
    expect(buildSharePath(1900, 1, 1)).toBe("/r/1900-01-01");
    expect(buildSharePath(2100, 12, 31)).toBe("/r/2100-12-31");
  });
});

describe("roundtrip encode/decode", () => {
  it("roundtrips a standard date", () => {
    const encoded = encodeBirthDate(1997, 7, 24);
    const decoded = decodeBirthDate(encoded);
    expect(decoded).toEqual({ year: 1997, month: 7, day: 24 });
  });

  it("roundtrips boundary dates", () => {
    for (const [y, m, d] of [
      [1900, 1, 1],
      [2100, 12, 31],
      [2000, 2, 29],
      [1997, 7, 24],
    ] as [number, number, number][]) {
      const encoded = encodeBirthDate(y, m, d);
      const decoded = decodeBirthDate(encoded);
      expect(decoded).toEqual({ year: y, month: m, day: d });
    }
  });

  it("URL stays well under 200 characters", () => {
    const path = buildSharePath(1997, 7, 24);
    const fullUrl = `https://khmer-numerology.vercel.app${path}`;
    expect(fullUrl.length).toBeLessThan(200);
  });

  it("URL contains no base64 or percent-encoded segments over 20 characters", () => {
    const path = buildSharePath(1997, 7, 24);
    // No percent-encoded segments at all (pure ASCII date format)
    expect(path).not.toMatch(/%[0-9A-Fa-f]{2}/);
    // No segment longer than 20 chars
    const segments = path.split("/").filter(Boolean);
    for (const segment of segments) {
      expect(segment.length).toBeLessThanOrEqual(20);
    }
  });
});

describe("share segments with a New Year rule", () => {
  it("leaves Khmer New Year readings unmarked", () => {
    expect(encodeShareSegment(1997, 7, 24, "khmer")).toBe("1997-07-24");
    expect(buildSharePath(1997, 7, 24, "khmer")).toBe("/r/1997-07-24");
  });

  it("marks Chinese New Year readings with -cny", () => {
    expect(encodeShareSegment(1997, 2, 10, "chinese")).toBe("1997-02-10-cny");
    expect(buildSharePath(1997, 2, 10, "chinese")).toBe("/r/1997-02-10-cny");
  });

  it("decodes both forms", () => {
    expect(decodeShareSegment("1997-07-24")).toEqual({ year: 1997, month: 7, day: 24, rule: "khmer" });
    expect(decodeShareSegment("1997-02-10-cny")).toEqual({ year: 1997, month: 2, day: 10, rule: "chinese" });
  });

  it("rejects unknown suffixes and bad dates", () => {
    expect(decodeShareSegment("1997-02-10-xyz")).toBeNull();
    expect(decodeShareSegment("1997-02-30-cny")).toBeNull();
    expect(decodeShareSegment("-cny")).toBeNull();
  });
});

describe("comparison share segments", () => {
  it("decodes two dates joined by +", () => {
    expect(decodeComparisonSegment("1997-07-24+2000-03-15")).toEqual({
      people: [
        { year: 1997, month: 7, day: 24, rule: "khmer" },
        { year: 2000, month: 3, day: 15, rule: "khmer" },
      ],
    });
  });

  it("keeps each person's New Year rule", () => {
    const decoded = decodeComparisonSegment("1997-02-10-cny+2000-03-15");
    expect(decoded?.people.map((person) => person.rule)).toEqual(["chinese", "khmer"]);
  });

  it("accepts a percent-encoded +", () => {
    expect(decodeComparisonSegment("1997-07-24%2B2000-03-15")?.people[1].year).toBe(2000);
  });

  it("returns null for a single date, so it stays a one-person link", () => {
    expect(decodeComparisonSegment("1997-07-24")).toBeNull();
  });

  it("decodes up to six people", () => {
    const six = "1997-07-24+2000-03-15+2001-01-01+1968-11-12+2018-09-01+1970-04-20";
    expect(decodeComparisonSegment(six)?.people).toHaveLength(6);
    expect(decodeComparisonSegment(`${six}+2020-01-01`)).toBeNull();
  });

  it("returns null when any date is invalid", () => {
    expect(decodeComparisonSegment("invalid+also-invalid")).toBeNull();
    expect(decodeComparisonSegment("1997-07-24+2000-02-30")).toBeNull();
    expect(decodeComparisonSegment("1997-07-24+2000-03-15+")).toBeNull();
  });

  it("builds a path that decodes back to the same readings", () => {
    const people = [
      { year: 1997, month: 7, day: 24, rule: "khmer" as const },
      { year: 2000, month: 3, day: 5, rule: "chinese" as const },
      { year: 2021, month: 5, day: 3, rule: "khmer" as const },
    ];
    const path = buildComparisonSharePath(people);
    expect(path).toBe("/r/1997-07-24+2000-03-05-cny+2021-05-03");
    expect(decodeComparisonSegment(path.slice(3))).toEqual({ people });
  });

  it("builds a two-person path exactly as before", () => {
    const people = [
      { year: 1997, month: 7, day: 24, rule: "khmer" as const },
      { year: 2000, month: 3, day: 15, rule: "khmer" as const },
    ];
    expect(buildComparisonSharePath(people, [null, null])).toBe("/r/1997-07-24+2000-03-15");
  });

  it("adds names in the query string only when someone has one", () => {
    const people = [
      { year: 1997, month: 7, day: 24, rule: "khmer" as const },
      { year: 2000, month: 3, day: 15, rule: "khmer" as const },
    ];
    expect(buildComparisonSharePath(people, [null, "Sam & Jo"])).toBe(
      "/r/1997-07-24+2000-03-15?n=&n=Sam+%26+Jo"
    );
  });

  it("leaves single-person decoding unchanged", () => {
    expect(decodeShareSegment("1997-07-24+2000-03-15")).toBeNull();
    expect(decodeShareSegment("1997-07-24")).not.toBeNull();
  });
});

describe("comparison names", () => {
  it("trims, collapses spaces and drops control characters", () => {
    expect(cleanPersonName("  Mom \n  Lee ")).toBe("Mom Lee");
    expect(cleanPersonName("Sam\u0000")).toBe("Sam");
  });

  it("returns null for a missing or blank name", () => {
    expect(cleanPersonName(undefined)).toBeNull();
    expect(cleanPersonName("   ")).toBeNull();
  });

  it("keeps at most 16 characters", () => {
    expect(cleanPersonName("Grandmother Sophea")).toBe("Grandmother Soph");
  });

  it("gives one name or null per person, ignoring extras", () => {
    expect(decodeComparisonNames(["", "Sam", "Mai", "Extra"], 3)).toEqual([null, "Sam", "Mai"]);
    expect(decodeComparisonNames(undefined, 2)).toEqual([null, null]);
  });
});
