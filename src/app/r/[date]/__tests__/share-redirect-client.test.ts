import { homeUrlFor } from "../share-redirect-client";

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
