import type { Metadata } from "next";
import { SectionDivider } from "@/components/ui/section-divider";
import { InfoPage, MorePages, PillLink, Section } from "@/components/ui/page-parts";
import { TOTAL_TIERS, YEAR_TIERS, type YearTier } from "@/lib/numerology/interpretation-data";
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

/** The numbers a tier covers, e.g. [1, 2, 3]. */
function numbersIn(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

/**
 * Number chips take their tier's color as text and border. Zero's color is
 * an unlit niche, darker than the page, so its chip keeps the default ink.
 */
function tierStyle(tier: YearTier): React.CSSProperties | undefined {
  if (tier === "zero") return undefined;
  return { color: `var(--color-tier-${tier})`, borderColor: `var(--color-tier-${tier})` };
}

/** Total score range as text, e.g. "60–67" or "68 and above". */
function scoreRange(min: number, max: number): string {
  if (max === Infinity) return `${min} and above`;
  if (min === 0) return `Below ${max + 1}`;
  return `${min}–${max}`;
}

export default function MeaningPage() {
  return (
    <InfoPage title="What the numbers mean">
      <p className="mt-4 max-w-[480px] text-center text-ink-light leading-relaxed">
        Each year of your cycle has a number from 0 to 11 and a life area. Here
        is how the tradition reads them.
      </p>

      <SectionDivider compact />

      <Section title="The year numbers" id="numbers">
        <p>
          Twelve numbers, in five kinds of year. Higher numbers are read as
          stronger luck, and zero stands on its own as a turning point.
        </p>
        <div className="space-y-4">
          {YEAR_TIERS.map((tier) => (
            <article
              key={tier.tier}
              id={`tier-${tier.tier}`}
              className="glass scroll-mt-8 rounded-2xl p-4 sm:p-6"
            >
              <div className="flex flex-wrap gap-1.5" aria-hidden="true">
                {numbersIn(tier.min, tier.max).map((n) => (
                  <span
                    key={n}
                    id={`number-${n}`}
                    className="flex size-9 scroll-mt-8 items-center justify-center rounded-lg border border-border font-display text-lg text-ink tabular-nums"
                    style={tierStyle(tier.tier)}
                  >
                    {n}
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
          good energy. This follows the seven-number charts of Cambodia and
          Thailand, where each number is read in light of the place it falls.
        </p>
        <ol className="space-y-3">
          {Object.entries(LIFE_AREA_MAP).map(([column, area]) => (
            <li key={column} id={`area-${area.toLowerCase()}`} className="flex scroll-mt-8 gap-3">
              <span className="w-6 shrink-0 text-right font-display text-gold-deep tabular-nums">{column}</span>
              <span>
                <span className="text-ink">{area}.</span>{" "}
                {LIFE_AREA_DESCRIPTIONS[Number(column)]}
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <SectionDivider />

      <Section title="The total score" id="total-score">
        <p>
          Adding all twelve numbers gives the total score, a reading of the
          cycle as a whole. Because of the way the three rows line up, every
          cycle totals 52, 64 or 76, one in each of these bands.
        </p>
        <dl className="space-y-3">
          {TOTAL_TIERS.map((tier) => (
            <div key={tier.tier}>
              <dt className="text-ink">
                <span className="font-display text-gold-deep tabular-nums">
                  {scoreRange(tier.min, tier.max)}
                </span>{" "}
                · {tier.label}
              </dt>
              <dd className="text-sm">{tier.description}</dd>
            </div>
          ))}
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
