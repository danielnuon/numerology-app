/**
 * Birth Day Data
 *
 * What the weekday of birth says about a person, for the birth day panel
 * beside the reading and the meaning page. Numbered as in the day row
 * (Sunday = 1 ... Saturday = 7). The planet and its strength live in
 * day-planet-data.ts; this module adds the Khmer day name, the character
 * the Khmer account gives those born on the day, and the day's color.
 * Kept apart from the logic for future i18n.
 *
 * Sources and labels are in docs/reading-model.md, "Birth weekday":
 * - Character: Radio Free Asia Khmer, 2014 (documented). It gives no
 *   character for Friday or Saturday births, and the text says so.
 * - Color: the seven colors Cambodians traditionally wear on each weekday
 *   (popular sources). Reading the birth day's color as a person's own is
 *   Solini's choice, and the meaning page says so.
 */

import type { Weekday } from "./calculate";

/** One weekday's birth reading. */
export interface BirthDay {
  /** The Khmer day name in Khmer script, e.g. "ថ្ងៃព្រហស្បតិ៍" */
  khmer: string;
  /** The Khmer day name romanized, e.g. "Thngai Prohoah" */
  romanized: string;
  /** What the Khmer account says of the day and those born on it, in the third person. */
  character: string;
  /** The color traditionally worn on this weekday, e.g. "dark green" */
  color: string;
  /** What that color stands for, e.g. "hope" */
  colorMeaning: string;
}

export const BIRTH_DAYS: Record<Weekday, BirthDay> = {
  1: {
    khmer: "ថ្ងៃអាទិត្យ",
    romanized: "Thngai Atit",
    character:
      "The Sun's day. The Khmer account says those born on it are often fine-looking, like the six sages the Sun was made from.",
    color: "red",
    colorMeaning: "courage",
  },
  2: {
    khmer: "ថ្ងៃច័ន្ទ",
    romanized: "Thngai Chan",
    character:
      "The Moon's day, which the Khmer account calls soft and gentle. Those born on it are said to be fair to look at.",
    color: "orange",
    colorMeaning: "equality",
  },
  3: {
    khmer: "ថ្ងៃអង្គារ",
    romanized: "Thngai Angkear",
    character:
      "Mars's day, which the Khmer account calls not a very good one. Those born on it are said to be short on patience and quick to fight, the makings of a warrior.",
    color: "purple",
    colorMeaning: "honesty",
  },
  4: {
    khmer: "ថ្ងៃពុធ",
    romanized: "Thngai Puth",
    character:
      "Mercury's day. The Khmer account says those born on it rarely rush, and do their work at an unhurried pace.",
    color: "light green",
    colorMeaning: "justice",
  },
  5: {
    khmer: "ថ្ងៃព្រហស្បតិ៍",
    romanized: "Thngai Prohoah",
    character:
      "Jupiter's day, the royal teacher's day, when children were sent to begin their studies. Those born on it are said to be gifted at teaching, the sacred arts and healing.",
    color: "dark green",
    colorMeaning: "hope",
  },
  6: {
    khmer: "ថ្ងៃសុក្រ",
    romanized: "Thngai Sok",
    character:
      "The day of Venus, the morning star. The Khmer account gives Venus the most strength of the seven, but says nothing of the character of those born on its day.",
    color: "blue",
    colorMeaning: "forgiveness",
  },
  7: {
    khmer: "ថ្ងៃសៅរ៍",
    romanized: "Thngai Sau",
    character:
      "Saturn's day. The Khmer account gives Saturn little strength, and says nothing of the character of those born on its day.",
    color: "dark purple",
    colorMeaning: "sorrow",
  },
};
