/**
 * Zodiac Animal Data
 *
 * The Khmer name of each of the twelve animals and the traits the popular
 * reading gives those born in its year, for the animal panel beside the
 * reading and the meaning page. Which animal a birth date belongs to lives
 * in zodiac.ts. Kept apart from the logic for future i18n.
 *
 * The Khmer names are documented (Radio Free Asia Khmer, 2011). The traits
 * are not: they are the popular reading that Khmer horoscope sites share
 * with Chinese astrology, with no Khmer text behind them, and the page
 * labels them that way. See docs/reading-model.md, "The zodiac animal".
 */

import type { ZodiacAnimal } from "./zodiac";

/** One animal's Khmer name and popular traits. */
export interface ZodiacAnimalReading {
  /** The year name in Khmer script, e.g. "ឆ្លូវ" */
  khmer: string;
  /** The year name romanized, e.g. "Chhlov" */
  romanized: string;
  /** The popular traits, as a sentence that follows "Read as", e.g. "patient and hardworking..." */
  traits: string;
}

export const ZODIAC_READINGS: Record<ZodiacAnimal, ZodiacAnimalReading> = {
  Rat: { khmer: "ជូត", romanized: "Chhut", traits: "quick-witted and resourceful, with a sharp eye for an opening." },
  Ox: { khmer: "ឆ្លូវ", romanized: "Chhlov", traits: "patient and hardworking, steady under a heavy load, and at times stubborn." },
  Tiger: { khmer: "ខាល", romanized: "Khal", traits: "brave and strong-willed, with a temper worth minding." },
  Rabbit: { khmer: "ថោះ", romanized: "Thos", traits: "gentle, careful and kind, most at ease where things are calm." },
  Dragon: { khmer: "រោង", romanized: "Rong", traits: "confident and full of energy, drawn to lead." },
  Snake: { khmer: "ម្សាញ់", romanized: "Msanh", traits: "thoughtful and private, with sound judgment." },
  Horse: { khmer: "មមី", romanized: "Momee", traits: "lively and independent, always ready to move." },
  Goat: { khmer: "មមែ", romanized: "Momae", traits: "gentle and creative, warm with the people close to them." },
  Monkey: { khmer: "វក", romanized: "Vok", traits: "clever and playful, quick to find a way through a problem." },
  Rooster: { khmer: "រកា", romanized: "Roka", traits: "observant and hardworking, frank in what they say." },
  Dog: { khmer: "ច", romanized: "Cho", traits: "loyal and honest, protective of the people they love." },
  Pig: { khmer: "កុរ", romanized: "Kor", traits: "generous and good-natured, easy to be around." },
};
