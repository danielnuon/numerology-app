/**
 * BirthReading
 *
 * Two quiet panels under this year's reading that read the person, not a
 * year: the weekday they were born on (its Khmer name, planet, character
 * and color) and their zodiac animal (its Khmer name and the popular traits
 * of its year). Neither changes a cycle number.
 *
 * Each panel says where its words come from and links to the meaning page,
 * which explains what is documented Khmer tradition and what is a popular
 * reading or Solini's own choice (see docs/reading-model.md).
 */

import Link from "next/link";
import type { Weekday } from "@/lib/numerology/calculate";
import type { ZodiacAnimal } from "@/lib/numerology/zodiac";
import { BIRTH_DAYS } from "@/lib/numerology/birth-day-data";
import { DAY_PLANETS } from "@/lib/numerology/day-planet-data";
import { ZODIAC_READINGS } from "@/lib/numerology/zodiac-data";
import { MORE_LINK } from "@/components/ui/page-parts";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";

/** Swatch class for each weekday's color token (full names, so Tailwind finds them). */
const DAY_SWATCH: Record<Weekday, string> = {
  1: "bg-day-sunday",
  2: "bg-day-monday",
  3: "bg-day-tuesday",
  4: "bg-day-wednesday",
  5: "bg-day-thursday",
  6: "bg-day-friday",
  7: "bg-day-saturday",
};

/** The strongest planet's strength in the Khmer count, the top of the scale. */
const MAX_STRENGTH = Math.max(...Object.values(DAY_PLANETS).map((p) => p.strength));

/** A lit panel inside the reading card, matching ThisYearCard's surface. */
const PANEL = "rounded-2xl border border-border bg-gold-deep/[0.04] px-5 py-5 sm:px-6 text-left";

interface Props {
  /** Birth weekday (1–7, Sunday=1). */
  weekday: Weekday;
  /** The zodiac animal of the birth year, under the reading's New Year rule. */
  animal: ZodiacAnimal;
}

export function BirthReading({ weekday, animal }: Props) {
  const day = BIRTH_DAYS[weekday];
  const planet = DAY_PLANETS[weekday];
  const zodiac = ZODIAC_READINGS[animal];

  return (
    <div className="mt-4 space-y-4">
      <section className={PANEL} aria-labelledby="birth-day-heading">
        <p className="text-sm uppercase tracking-[0.12em] text-ink-light">Birth day</p>
        <h2 id="birth-day-heading" className="mt-1 font-display text-xl text-ink tracking-[0.03em]">
          Born on a {planet.day}
        </h2>
        <p className="mt-0.5 text-sm text-gold-deep">
          <span lang="km">{day.khmer}</span> · {day.romanized}
        </p>
        <p className="mt-3 text-base leading-relaxed text-ink-light">{day.character}</p>
        <dl className="mt-3 space-y-1 text-sm text-ink-light">
          <div>
            <dt className="inline text-ink">Planet: </dt>
            <dd className="inline">
              {planet.planet.charAt(0).toUpperCase() + planet.planet.slice(1)}, strength{" "}
              <span className="tabular-nums">{planet.strength}</span> of{" "}
              <span className="tabular-nums">{MAX_STRENGTH}</span> in the Khmer count
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-ink">Color:</dt>
            <dd className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-block size-3 shrink-0 rounded-full ring-1 ring-ink/25 ${DAY_SWATCH[weekday]}`}
              />
              {day.color.charAt(0).toUpperCase() + day.color.slice(1)}, worn for {day.colorMeaning}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-sm">
          <Link href="/meaning#birth-day" className={MORE_LINK}>
            Where this comes from
          </Link>
        </p>
      </section>

      <section className={PANEL} aria-labelledby="birth-animal-heading">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.12em] text-ink-light">Zodiac animal</p>
            <h2 id="birth-animal-heading" className="mt-1 font-display text-xl text-ink tracking-[0.03em]">
              Year of the {animal}
            </h2>
            <p className="mt-0.5 text-sm text-gold-deep">
              <span lang="km">ឆ្នាំ{zodiac.khmer}</span> · Chhnam {zodiac.romanized}
            </p>
          </div>
          <ZodiacIcon animal={animal} className="size-9 shrink-0 text-gold-deep" />
        </div>
        <p className="mt-3 text-base leading-relaxed text-ink-light">
          <span className="text-ink">Popular reading: </span>
          read as {zodiac.traits}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-light">
          These traits are shared with Chinese astrology, not drawn from a Khmer text.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/meaning#zodiac-animal" className={MORE_LINK}>
            How Cambodians read the animal
          </Link>
        </p>
      </section>
    </div>
  );
}
