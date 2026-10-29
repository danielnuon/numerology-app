import { TOTAL_SCALE } from "../interpretation-data";
import { interpretTotal } from "../interpretation";
import { computeCycleFromBirthDate } from "../derive";

describe("TOTAL_SCALE", () => {
  it("has one stop in each total tier, lowest first", () => {
    expect(TOTAL_SCALE.map((s) => s.total)).toEqual([52, 64, 76]);
    expect(TOTAL_SCALE.map((s) => interpretTotal(s.total).tier)).toEqual(["weak", "moderate", "strong"]);
  });

  it("covers every total a cycle can have", () => {
    const stops = new Set(TOTAL_SCALE.map((s) => s.total));
    const seen = new Set<number>();
    // Every 5th day of every month, 1900 to 2099, under both New Year rules
    for (let year = 1900; year <= 2099; year++) {
      for (let month = 1; month <= 12; month++) {
        for (let day = 1; day <= 28; day += 5) {
          for (const rule of ["khmer", "chinese"] as const) {
            seen.add(computeCycleFromBirthDate(year, month, day, rule).totalScore);
          }
        }
      }
    }
    expect([...seen].sort()).toEqual([...stops]);
  });
});
