/**
 * Day Planet Data
 *
 * The seven weekday planets, numbered as in the day row (Sunday = 1 ...
 * Saturday = 7), with their strength in the Khmer count and what each lends
 * a year it stands over. Kept apart from the logic for future i18n.
 *
 * The strengths are the number of beings each day's deity was made from in
 * the Khmer account (Radio Free Asia Khmer, 2014), the same values Thai
 * astrology uses. See docs/reading-model.md, "Birth weekday".
 */

import type { Weekday } from "./calculate";

/** One weekday's planet and what it lends a year. */
export interface DayPlanet {
  /** Weekday name, e.g. "Thursday" */
  day: string;
  /** Planet name, e.g. "Jupiter" */
  planet: string;
  /** Strength in the Khmer count (6-21); higher lends a year more support */
  strength: number;
  /** What the planet lends a year it stands over; follows "<Planet> stands over this year." */
  note: string;
}

export const DAY_PLANETS: Record<Weekday, DayPlanet> = {
  1: {
    day: "Sunday",
    planet: "the Sun",
    strength: 6,
    note: "It carries the least strength of the seven in the Khmer count, so this year asks for steady effort more than force.",
  },
  2: {
    day: "Monday",
    planet: "the Moon",
    strength: 15,
    note: "A soft, gentle planet of middle strength, it favors care, patience and kindness close to home.",
  },
  3: {
    day: "Tuesday",
    planet: "Mars",
    strength: 8,
    note: "Low in the Khmer count and quick to heat, it can bring haste or quarrels, so patience serves you.",
  },
  4: {
    day: "Wednesday",
    planet: "Mercury",
    strength: 17,
    note: "One of the stronger planets in the Khmer count, it lends support to unhurried, careful work.",
  },
  5: {
    day: "Thursday",
    planet: "Jupiter",
    strength: 19,
    note: "The planet of the royal teacher and among the strongest in the Khmer count, it lends support, above all to study, teaching and healing.",
  },
  6: {
    day: "Friday",
    planet: "Venus",
    strength: 21,
    note: "The strongest planet in the Khmer count, it lends a year more support than any other.",
  },
  7: {
    day: "Saturday",
    planet: "Saturn",
    strength: 10,
    note: "Low in the Khmer count and read as a hard planet, it asks for patience and steady duty.",
  },
};

/** Shown for the five years (columns 8-12) the day row doesn't reach. */
export const NO_DAY_PLANET_NOTE =
  "No day planet stands over this year. Its number comes from your birth month and animal alone.";
