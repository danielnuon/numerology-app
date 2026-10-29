/**
 * Data checks for the birth day and zodiac animal readings: every weekday
 * and animal has complete text, and the sentences read the way the panels
 * and the meaning page use them.
 */
import { BIRTH_DAYS } from "../birth-day-data";
import { ZODIAC_READINGS } from "../zodiac-data";
import { ZODIAC_ANIMALS } from "../zodiac";
import type { Weekday } from "../calculate";

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

describe("BIRTH_DAYS", () => {
  it("covers all seven weekdays with complete text", () => {
    for (const weekday of WEEKDAYS) {
      const day = BIRTH_DAYS[weekday];
      expect(day.khmer).toMatch(/^ថ្ងៃ/);
      expect(day.romanized).toMatch(/^Thngai /);
      expect(day.character).toMatch(/\.$/);
      expect(day.color).toMatch(/^[a-z ]+$/);
      expect(day.colorMeaning).toMatch(/^[a-z]+$/);
    }
  });

  it("names the royal teacher's day for Thursday (Jupiter)", () => {
    expect(BIRTH_DAYS[5].character).toMatch(/royal teacher/);
  });

  it("says the Khmer account gives no character for Friday and Saturday births", () => {
    expect(BIRTH_DAYS[6].character).toMatch(/says nothing of the character/);
    expect(BIRTH_DAYS[7].character).toMatch(/says nothing of the character/);
  });

  it("gives each weekday its own color", () => {
    expect(new Set(WEEKDAYS.map((w) => BIRTH_DAYS[w].color)).size).toBe(7);
  });
});

describe("ZODIAC_READINGS", () => {
  it("covers all twelve animals with a Khmer name and traits", () => {
    for (const animal of ZODIAC_ANIMALS) {
      const reading = ZODIAC_READINGS[animal];
      expect(reading.khmer).toMatch(/^[ក-៿]+$/);
      expect(reading.romanized).toMatch(/^[A-Z][a-z]+$/);
      // Follows "read as", so it starts lowercase and ends a sentence
      expect(reading.traits).toMatch(/^[a-z].*\.$/);
    }
  });

  it("uses the Khmer year name for the worked example's Ox", () => {
    expect(ZODIAC_READINGS.Ox).toMatchObject({ khmer: "ឆ្លូវ", romanized: "Chhlov" });
  });
});
