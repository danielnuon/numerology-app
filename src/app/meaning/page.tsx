import type { Metadata } from "next";
import { SectionDivider } from "@/components/ui/section-divider";
import { InfoPage, MorePages, PillLink, Section } from "@/components/ui/page-parts";
import { TOTAL_SCALE, YEAR_TIERS } from "@/lib/numerology/interpretation-data";
import { interpretTotal } from "@/lib/numerology/interpretation";
import type { Weekday } from "@/lib/numerology/calculate";
import { BIRTH_DAYS } from "@/lib/numerology/birth-day-data";
import { DAY_PLANETS } from "@/lib/numerology/day-planet-data";
import { ZODIAC_ANIMALS } from "@/lib/numerology/zodiac";
import { ZODIAC_READINGS } from "@/lib/numerology/zodiac-data";
import { LIFE_AREA_DESCRIPTIONS } from "@/lib/numerology/life-area-data";
import { LIFE_AREA_MAP } from "@/lib/numerology/year-lookup";
import { MEANING_DESCRIPTION, MEANING_TITLE, SITE_NAME } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: MEANING_TITLE,
  description: MEANING_DESCRIPTION,
  alternates: { canonical: "/meaning" },
  openGraph: { title: MEANING_TITLE, description: MEANING_DESCRIPTION, url: "/meaning", siteName: SITE_NAME },
  twitter: { title: MEANING_TITLE, description: MEANING_DESCRIPTION },
};

/** The seven weekdays, ordered by their planet's strength in the Khmer count, strongest first. */
const WEEKDAYS = ([1, 2, 3, 4, 5, 6, 7] as Weekday[]).sort(
  (a, b) => DAY_PLANETS[b].strength - DAY_PLANETS[a].strength,
);

/** The numbers a tier covers, e.g. [1, 2, 3]. */
function numbersIn(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

/**
 * Each number is a small threaded orb, as on the cycle wheel, its backlight
 * breathing at its own pace so a row never pulses in unison.
 */
function orbBreath(n: number): React.CSSProperties {
  return {
    "--breathe-duration": `${(5 + ((n * 7) % 5) * 0.9).toFixed(1)}s`,
    "--breathe-delay": `${(-n * 1.3).toFixed(1)}s`,
  } as React.CSSProperties;
}

export default function MeaningPage() {
  return (
    <InfoPage title="What the numbers mean">
      <p className="mt-4 max-w-[480px] text-center text-ink-light leading-relaxed">
        Each year of your cycle has a number from 0 to 11 and a life area,
        and your birth day and zodiac animal each have a reading of their own.
        Here is how they are read, and where each reading comes from.
      </p>

      <SectionDivider compact />

      <Section title="The year numbers" id="numbers">
        <p>
          Twelve numbers, in five kinds of year. Higher numbers are read as
          stronger luck, and zero stands on its own as a turning point.
        </p>
        <p>
          The center of your wheel follows the same order: the luckier the
          year you choose, the brighter and further its light glows. We found
          no source that ranks the numbers by luck, so this order, and the
          light that shows it, is Solini&apos;s reading of the method rather
          than a rule of Khmer numerology.
        </p>
        <div className="space-y-4">
          {YEAR_TIERS.map((tier) => (
            <article
              key={tier.tier}
              id={`tier-${tier.tier}`}
              className="glass scroll-mt-8 rounded-2xl p-4 sm:p-6"
            >
              <div className="flex flex-wrap gap-2.5 p-0.5" aria-hidden="true">
                {numbersIn(tier.min, tier.max).map((n) => (
                  <span
                    key={n}
                    id={`number-${n}`}
                    data-tier={tier.tier}
                    className={`wheel-orb relative flex size-10 scroll-mt-8 items-center justify-center rounded-full pb-1.5 font-sans text-lg font-medium tabular-nums ${tier.tier === "zero" ? "text-ink-light" : "text-ink"}`}
                    style={orbBreath(n)}
                  >
                    {n}
                    {/* The tier's thread, as on the cycle wheel */}
                    <span className="wheel-thread" />
                  </span>
                ))}
              </div>
              <h3 className="mt-3 font-display text-xl text-ink">
                <span className="sr-only">
                  {tier.min === tier.max ? `${tier.min}: ` : `${tier.min} to ${tier.max}: `}
                </span>
                {tier.label}
              </h3>
              <p className="mt-2 text-ink-light">{tier.description}</p>
              <p className="mt-2 text-sm text-ink">
                <span className="text-gold-deep">Tradition suggests: </span>
                {tier.guidance}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <SectionDivider />

      <Section title="The twelve life areas" id="life-areas">
        <p>
          Each year of the cycle speaks to one part of life. The year you were
          born is Self, the next is Family, and so on around the cycle.
        </p>
        <p>
          A year is read as its number and its area together. The number says
          how strong the year is, and the area says what that strength
          applies to. So a 9 in your Money year is read as a good year for
          earning, while the same 9 in your Health year is read as a year of
          good energy. This follows the Khmer and Thai seven-number charts,
          where each number is read in light of the place it falls.
        </p>
        <ol className="space-y-3">
          {Object.entries(LIFE_AREA_MAP).map(([column, area]) => (
            <li key={column} id={`area-${area.toLowerCase()}`} className="flex scroll-mt-8 gap-3">
              <span className="w-6 shrink-0 text-right font-medium text-gold-deep tabular-nums">{column}</span>
              <span>
                <span className="text-ink">{area}.</span>{" "}
                {LIFE_AREA_DESCRIPTIONS[Number(column)]}
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <SectionDivider />

      <Section title="Your birth day" id="birth-day">
        <p>
          Each weekday has its planet, and in Khmer the days are named for
          them: Thursday is <span lang="km">ថ្ងៃព្រហស្បតិ៍</span>, Jupiter&apos;s
          day. In the Khmer telling, each day&apos;s deity was made from a
          number of beings, from 6 for the Sun to 21 for Venus, and that
          number is the planet&apos;s strength.
        </p>
        <p>
          Your birth day&apos;s planet stands over the year you were born, the
          next day&apos;s planet over the year after, and so on through your
          first seven years of the cycle. A strong planet lends its year
          support, and a weaker one asks for patience. The last five years have
          no day planet. The planet adds to the reading but never changes the
          number.
        </p>
        <p>
          The same Khmer account says what those born on some of the days are
          like. It gives nothing for Friday or Saturday, so Solini doesn&apos;t
          either. Beside it, the reading shows the color Cambodians
          traditionally wear on that weekday. The colors are a custom for
          dressing day by day, not a rule about birth, so reading your birth
          day&apos;s color as your own is Solini&apos;s choice.
        </p>
        <dl className="space-y-4">
          {WEEKDAYS.map((weekday) => {
            const p = DAY_PLANETS[weekday];
            const day = BIRTH_DAYS[weekday];
            return (
              <div key={p.day} className="flex gap-3">
                <dt className="w-8 shrink-0 text-right font-medium text-gold-deep tabular-nums">
                  <span className="sr-only">Strength </span>
                  {p.strength}
                </dt>
                <dd>
                  <span className="text-ink">{p.day}</span>, {p.planet} ·{" "}
                  <span lang="km">{day.khmer}</span>
                  <span className="mt-1 block text-sm">{day.character}</span>
                  <span className="mt-1 block text-sm">
                    Worn on this day: {day.color}, for {day.colorMeaning}.
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
      </Section>

      <SectionDivider />

      <Section title="Your zodiac animal" id="zodiac-animal">
        <p>
          Your animal is the one that rules the year you were born, counted
          from Khmer New Year in mid-April unless you choose Chinese New Year.
          It sets one row of your cycle, so it shapes every number.
        </p>
        <p>
          In Cambodia the animal is read mostly in two ways. Each Khmer New
          Year, the almanac from the Ministry of Cults and Religion gives every
          animal a forecast for the year ahead. And older Khmer manuscripts
          match the animals of a couple before a marriage, though the
          manuscripts disagree with each other. Those texts read character from
          the animal and the birth month together, not the animal alone, and
          their full tables aren&apos;t published in a form Solini can use.
        </p>
        <p>
          So the traits Solini shows for each animal are the popular reading,
          the same one Chinese astrology gives and the one Khmer horoscope
          columns repeat. We found no Khmer text behind them. Take them as a
          familiar picture, not as Khmer tradition.
        </p>
        <dl className="space-y-3">
          {ZODIAC_ANIMALS.map((animal) => {
            const z = ZODIAC_READINGS[animal];
            return (
              <div key={animal} className="flex gap-3">
                <dt className="w-24 shrink-0 text-ink">
                  {animal}
                  <span className="block text-sm text-gold-deep">
                    <span lang="km">{z.khmer}</span> · {z.romanized}
                  </span>
                </dt>
                <dd className="text-sm">
                  Read as {z.traits}
                </dd>
              </div>
            );
          })}
        </dl>
      </Section>

      <SectionDivider />

      <Section title="The total score" id="total-score">
        <p>
          Adding all twelve numbers gives the total score, a reading of the
          cycle as a whole. Every cycle totals exactly 52, 64 or 76, never
          anything in between. Before each year drops its full twelves, the
          twelve columns always add up to 184, and a whole cycle always drops
          9, 10 or 11 twelves, which leaves 76, 64 or 52.
        </p>
        <dl className="space-y-3">
          {TOTAL_SCALE.map((stop) => {
            const reading = interpretTotal(stop.total);
            return (
              <div key={stop.total}>
                <dt className="text-ink">
                  <span className="font-medium text-gold-deep tabular-nums">{stop.total}</span> ·{" "}
                  {reading.label}
                </dt>
                <dd className="text-sm">
                  {reading.description} {stop.share} cycles total {stop.total}.
                </dd>
              </div>
            );
          })}
        </dl>
      </Section>

      <SectionDivider />

      <Section title="Holding it lightly">
        <p>
          A number describes the weather of a year, not what you will do in
          it. A low year asks for patience and care, never fear. A reading is
          for reflection. It isn&apos;t a prediction or advice.
        </p>
      </Section>

      <div className="mt-16">
        <PillLink href="/">See your cycle</PillLink>
      </div>
      <MorePages current="/meaning" />
    </InfoPage>
  );
}
