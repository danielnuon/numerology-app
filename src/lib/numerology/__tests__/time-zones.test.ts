/**
 * Dates must read the same in every time zone. Jest runs in one zone, so the
 * skipped-day check runs calendar.ts in a child process set to Samoa's.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { isAfterDay, isRealCalendarDate, latestDayAnywhere } from "../calendar";
import { deriveBirthData } from "../derive";
import { decodeReadingQuery, decodeShareSegment } from "../url-encoding";
import { activeYearOn } from "../year-lookup";

describe("a calendar day a time zone skipped", () => {
  // Samoa crossed the date line by skipping December 30, 2011
  it("is still a real date there", () => {
    const calendar = path.resolve(__dirname, "../calendar.ts");
    const script = `
      import { isRealCalendarDate } from ${JSON.stringify(calendar)};
      console.log(JSON.stringify({
        localDay: new Date(2011, 11, 30).getDate(),
        skippedDay: isRealCalendarDate(2011, 12, 30),
        february30: isRealCalendarDate(2011, 2, 30),
      }));`;
    const output = execFileSync(
      process.execPath,
      ["--experimental-strip-types", "--input-type=module", "-e", script],
      { env: { ...process.env, TZ: "Pacific/Apia" }, stdio: ["ignore", "pipe", "ignore"] }
    );
    expect(JSON.parse(output.toString())).toEqual({
      // The premise: a local date for that day rolls on to the 31st
      localDay: 31,
      skippedDay: true,
      february30: false,
    });
  });

  it("reads the weekday without the local calendar", () => {
    const getDay = jest.spyOn(Date.prototype, "getDay");
    const friday = 6;
    expect(deriveBirthData(2011, 12, 30).weekday).toBe(friday);
    expect(getDay).not.toHaveBeenCalled();
    getDay.mockRestore();
  });

  it("still rejects dates no calendar has", () => {
    expect(isRealCalendarDate(2011, 2, 30)).toBe(false);
    expect(isRealCalendarDate(2001, 2, 29)).toBe(false);
    expect(isRealCalendarDate(2000, 2, 29)).toBe(true);
  });
});

describe("isAfterDay", () => {
  it("compares calendar days", () => {
    expect(isAfterDay({ year: 2026, month: 11, day: 16 }, { year: 2026, month: 11, day: 15 })).toBe(true);
    expect(isAfterDay({ year: 2026, month: 11, day: 15 }, { year: 2026, month: 11, day: 15 })).toBe(false);
    expect(isAfterDay({ year: 2025, month: 12, day: 31 }, { year: 2026, month: 1, day: 1 })).toBe(false);
  });
});

describe("a link to someone born today, opened a day behind", () => {
  // 13:30 UTC on November 15 is already November 16 in Kiritimati (UTC+14)
  const now = new Date(Date.UTC(2026, 10, 15, 13, 30));

  it("takes the latest date anywhere on Earth as the limit", () => {
    const latest = latestDayAnywhere(now);
    expect([latest.getFullYear(), latest.getMonth() + 1, latest.getDate()]).toEqual([2026, 11, 16]);
    // Ten hours into the UTC day, UTC+14 turns to the next date
    expect(latestDayAnywhere(new Date(Date.UTC(2026, 10, 15, 9, 59))).getDate()).toBe(15);
    expect(latestDayAnywhere(new Date(Date.UTC(2026, 10, 15, 10, 0))).getDate()).toBe(16);
  });

  it("opens the link from the moment the server rendered, not from each side's own clock", () => {
    const query = { day: "16", month: "11", year: "2026" };
    expect(decodeReadingQuery(query, now)).toEqual({ year: 2026, month: 11, day: 16, rule: "khmer" });
    expect(decodeShareSegment("2026-11-16", now)).not.toBeNull();
    expect(decodeReadingQuery({ ...query, day: "17" }, now)).toBeNull();
    expect(decodeShareSegment("2026-11-17", now)).toBeNull();
  });
});

describe("activeYearOn", () => {
  const birth = { year: 1997, month: 7, day: 24 };

  it("waits for the birthday, like getActiveYear", () => {
    expect(activeYearOn(new Date(2026, 6, 23), birth)).toBe(2025);
    expect(activeYearOn(new Date(2026, 6, 24), birth)).toBe(2026);
  });

  it("never falls before the birth year for a birth date that is still tomorrow here", () => {
    expect(activeYearOn(new Date(2026, 10, 15), { year: 2026, month: 11, day: 16 })).toBe(2026);
  });
});
