import { homeUrlFor } from "../share-redirect-client";

describe("homeUrlFor", () => {
  it("opens a shared reading with its New Year rule", () => {
    expect(homeUrlFor({ day: 24, month: 7, year: 1997, rule: "khmer" })).toBe(
      "/?day=24&month=7&year=1997&ny=khmer"
    );
  });

  it("adds the partner of a shared comparison, with the partner's own rule", () => {
    const partner = { day: 15, month: 3, year: 2000, rule: "chinese" as const };
    expect(homeUrlFor({ day: 24, month: 7, year: 1997, rule: "khmer", partner })).toBe(
      "/?day=24&month=7&year=1997&ny=khmer&pday=15&pmonth=3&pyear=2000&pny=chinese"
    );
  });
});
