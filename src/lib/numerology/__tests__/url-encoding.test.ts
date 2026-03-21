import {
  encodeBirthDate,
  decodeBirthDate,
  buildSharePath,
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
