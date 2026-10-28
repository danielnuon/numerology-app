import type { Metadata } from "next";
import Link from "next/link";
import { SectionDivider } from "@/components/ui/section-divider";
import { computeCycleFromBirthDate } from "@/lib/numerology/derive";
import { YEAR_TIERS } from "@/lib/numerology/interpretation-data";
import { LIFE_AREA_MAP } from "@/lib/numerology/year-lookup";
import { ABOUT_DESCRIPTION, ABOUT_TITLE, SITE_NAME } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { title: ABOUT_TITLE, description: ABOUT_DESCRIPTION, url: "/about", siteName: SITE_NAME },
  twitter: { title: ABOUT_TITLE, description: ABOUT_DESCRIPTION },
};

/** The worked example from the system spec: born Thursday 24 July 1997, Year of the Ox. */
const EXAMPLE = computeCycleFromBirthDate(1997, 7, 24);

const EXAMPLE_ROWS: { label: string; values: (number | null)[] }[] = [
  { label: "Month, counted from Mikasar", values: EXAMPLE.rows.month },
  { label: "Animal (Ox)", values: EXAMPLE.rows.zodiac },
  {
    label: "Weekday (Thursday), first seven columns only",
    values: Array.from({ length: 12 }, (_, i) => EXAMPLE.rows.day[i] ?? null),
  },
];

/** One row of the worked example: a caption, then twelve small cells. */
function NumberRow({
  label,
  values,
  highlight = false,
}: {
  label: string;
  values: (number | null)[];
  highlight?: boolean;
}) {
  return (
    <div className="mt-4">
      <p className="text-xs uppercase tracking-[0.12em] text-ink-light">{label}</p>
      <div className="mt-1.5 grid grid-cols-12 gap-0.5 sm:gap-1">
        {values.map((value, i) => (
          <span
            key={i}
            className={[
              "flex h-8 items-center justify-center rounded-md border text-xs tabular-nums sm:h-10 sm:text-sm",
              highlight
                ? "border-gold-deep text-gold-deep font-display text-sm sm:text-base"
                : "border-border text-ink",
            ].join(" ")}
          >
            {value ?? "·"}
          </span>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="w-full max-w-[640px]">
      <h2 className="font-display text-2xl text-gold-deep tracking-[0.04em] sm:text-3xl">{title}</h2>
      <div className="mt-4 space-y-4 text-ink-light leading-relaxed">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="safe-gutter flex flex-1 flex-col items-center pt-9 sm:pt-16 pb-[max(4rem,calc(env(safe-area-inset-bottom)+2rem))]">
      <p className="text-xs uppercase text-ink-light tracking-[0.18em]">
        <Link href="/" className="hover:text-gold-deep">
          Solini
        </Link>
      </p>
      <h1 className="title-glow mt-3 text-center font-display text-4xl leading-tight text-ink tracking-[0.08em] sm:text-6xl">
        A lantern for your twelve years
      </h1>

      <SectionDivider compact />

      <Section title="The tradition">
        <p>
          Across Cambodia, people have long turned to a <em>krou</em> (a
          fortune teller) or an <em>achar</em> (a lay ceremony leader) to
          read the years: to choose a wedding date, to know when to wait and
          when to begin. One of their tools is numerology, prized because its
          working is plain to see.
        </p>
        <p>
          Much of this knowledge was lost in the Khmer Rouge years. What
          survived was passed on by older generations, often by word of mouth
          rather than in books.
        </p>
        <p>
          Solini follows one such method. It isn&apos;t a prediction.
          It&apos;s a lantern: a way to look at your twelve years with a
          little more light.
        </p>
      </Section>

      <SectionDivider />

      <Section title="How a cycle is made">
        <p>
          Three things from your birth date each become a row of numbers that
          counts up one step per column:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Your birth month, counted from <em>Mikasar</em>, the lunar month
            around December, which old calendars treated as the start of the
            year.
          </li>
          <li>
            Your zodiac animal, from the Rat as 1 to the Pig as 12. The animal
            year turns at Khmer New Year in mid-April. You can choose Chinese
            New Year instead on the form.
          </li>
          <li>The weekday you were born, from Sunday as 1 to Saturday as 7.</li>
        </ul>
        <p>
          Each column is added up and divided by 12. The remainder, from 0
          to 11, is that year&apos;s number. For someone born on Thursday 24
          July 1997:
        </p>

        <div className="glass rounded-2xl p-3 min-[360px]:p-4 sm:p-6" aria-label="Worked example for 24 July 1997">
          {EXAMPLE_ROWS.map((row) => (
            <NumberRow key={row.label} label={row.label} values={row.values} />
          ))}
          <NumberRow label="The cycle: each column's sum, divided by 12" values={EXAMPLE.cycle} highlight />
          <p className="mt-4 text-sm text-ink">
            Total score {EXAMPLE.totalScore}, the sum of all twelve numbers.
          </p>
        </div>

        <p>
          The first number is for the year you were born, the second for the
          year after, and so on. Each year runs from one birthday to the next,
          and after twelve years the cycle starts again.
        </p>
      </Section>

      <SectionDivider />

      <Section title="Reading the numbers">
        <p>Tradition groups the numbers into five kinds of year:</p>
        <dl className="space-y-3">
          {YEAR_TIERS.map((tier) => (
            <div key={tier.tier}>
              <dt className="text-ink">
                <span className="font-display text-gold-deep tabular-nums">
                  {tier.min === tier.max ? tier.min : `${tier.min}–${tier.max}`}
                </span>{" "}
                · {tier.label}
              </dt>
              <dd className="text-sm">{tier.description}</dd>
            </div>
          ))}
        </dl>
        <p>
          Each year of the cycle also belongs to a life area:{" "}
          {Object.values(LIFE_AREA_MAP).join(", ")}.
        </p>
      </Section>

      <SectionDivider />

      <Section title="What Solini promises">
        <ul className="list-disc space-y-2 pl-5">
          <li>It shows its working. Every number can be checked by hand.</li>
          <li>Low years come with patience, never fear. There is nothing to buy and no amulet to sell.</li>
          <li>It&apos;s free, with no sign-up. Your birth date stays in your browser.</li>
          <li>A reading is for reflection. It isn&apos;t a prediction or advice.</li>
        </ul>
      </Section>

      <Link
        href="/"
        className="pressable mt-16 inline-flex min-h-[48px] items-center rounded-full border border-gold-deep px-8 text-sm font-medium uppercase tracking-[0.14em] text-gold-deep hover:bg-gold-deep hover:text-parchment"
      >
        See your cycle
      </Link>
    </main>
  );
}
