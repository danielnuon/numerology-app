import {
  comparisonFromSearchParams,
  homeUrlFor,
  readHomeSearchParams,
  type HomeLink,
} from "../home-params";
import { decodeReadingQuery } from "../numerology/url-encoding";

/** The home page's values for a URL, as the server page reads them. */
function paramsOf(url: string) {
  const query = new URL(url, "https://solini.example").searchParams;
  const raw: Record<string, string | string[]> = {};
  for (const key of new Set(query.keys())) {
    const values = query.getAll(key);
    raw[key] = values.length === 1 ? values[0] : values;
  }
  return readHomeSearchParams(raw);
}

describe("homeUrlFor", () => {
  it("opens a shared reading with its New Year rule", () => {
    expect(homeUrlFor({ day: 24, month: 7, year: 1997, rule: "khmer" })).toBe(
      "/?day=24&month=7&year=1997&ny=khmer"
    );
  });

  it("adds everyone else in a shared comparison, each with their own rule", () => {
    const others = [
      { day: 15, month: 3, year: 2000, rule: "chinese" as const },
      { day: 3, month: 5, year: 2021, rule: "khmer" as const },
    ];
    expect(homeUrlFor({ day: 24, month: 7, year: 1997, rule: "khmer", others })).toBe(
      "/?day=24&month=7&year=1997&ny=khmer&p=2000-03-15-cny&p=2021-05-03"
    );
  });

  it("passes names on only when someone has one", () => {
    const others = [{ day: 15, month: 3, year: 2000, rule: "khmer" as const }];
    expect(homeUrlFor({ day: 24, month: 7, year: 1997, rule: "khmer", others, names: [null, null] })).toBe(
      "/?day=24&month=7&year=1997&ny=khmer&p=2000-03-15"
    );
    expect(homeUrlFor({ day: 24, month: 7, year: 1997, rule: "khmer", others, names: [null, "Sam Lee"] })).toBe(
      "/?day=24&month=7&year=1997&ny=khmer&p=2000-03-15&n=&n=Sam+Lee"
    );
  });
});

describe("readHomeSearchParams", () => {
  it("takes the first value of a repeated single parameter and every value of p and n", () => {
    expect(readHomeSearchParams({ day: ["24", "1"], month: "7", p: "2000-03-15", n: ["", "Sam"] })).toEqual({
      day: "24",
      month: "7",
      p: ["2000-03-15"],
      n: ["", "Sam"],
    });
  });
});

describe("the share link round trip", () => {
  it("reads back the reading a link was built from", () => {
    const reading = { day: 10, month: 2, year: 1997, rule: "chinese" as const };
    expect(decodeReadingQuery(paramsOf(homeUrlFor(reading)))).toEqual(reading);
  });

  it("reads back everyone in a comparison, with their names in order", () => {
    const link: HomeLink = {
      day: 24,
      month: 7,
      year: 1997,
      rule: "khmer",
      others: [
        { day: 15, month: 3, year: 2000, rule: "chinese" },
        { day: 3, month: 5, year: 2021, rule: "khmer" },
      ],
      names: ["Dara", null, "Sam Lee"],
    };
    expect(comparisonFromSearchParams(paramsOf(homeUrlFor(link)))).toEqual({
      readingName: "Dara",
      others: [
        { share: link.others![0], name: null },
        { share: link.others![1], name: "Sam Lee" },
      ],
    });
  });
});

describe("comparisonFromSearchParams", () => {
  it("has nobody when the link is a single reading", () => {
    expect(comparisonFromSearchParams({ day: "24", month: "7", year: "1997" })).toEqual({
      readingName: null,
      others: [],
    });
  });

  it("leaves out a reading that doesn't decode, with its name", () => {
    const { others } = comparisonFromSearchParams({
      p: ["2001-02-30", "2000-03-15"],
      n: ["", "Nobody", "Sam"],
    });
    expect(others).toEqual([{ share: { day: 15, month: 3, year: 2000, rule: "khmer" }, name: "Sam" }]);
  });

  it("keeps at most five other people", () => {
    const p = Array.from({ length: 8 }, (_, i) => `200${i}-01-01`);
    expect(comparisonFromSearchParams({ p }).others).toHaveLength(5);
  });

  it("still opens a single partner from a link made before households", () => {
    expect(comparisonFromSearchParams({ pday: "15", pmonth: "3", pyear: "2000", pny: "chinese" }).others).toEqual([
      { share: { day: 15, month: 3, year: 2000, rule: "chinese" }, name: null },
    ]);
  });

  it("ignores an older link's partner when its date is not valid", () => {
    expect(comparisonFromSearchParams({ pday: "31", pmonth: "4", pyear: "2000" }).others).toEqual([]);
  });
});
