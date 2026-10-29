import type { Metadata } from "next";
import Link from "next/link";
import { SectionDivider } from "@/components/ui/section-divider";
import { InfoPage, MORE_LINK, MorePages, PillLink, Section } from "@/components/ui/page-parts";
import { YEAR_TIERS } from "@/lib/numerology/interpretation-data";
import { ABOUT_DESCRIPTION, ABOUT_TITLE, SITE_NAME, SITE_TAGLINE } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { title: ABOUT_TITLE, description: ABOUT_DESCRIPTION, url: "/about", siteName: SITE_NAME },
  twitter: { title: ABOUT_TITLE, description: ABOUT_DESCRIPTION },
};

export default function AboutPage() {
  return (
    <InfoPage title={SITE_TAGLINE}>
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

      <Section title="Why it's called Solini">
        <p>
          Solini is named for my mother&apos;s childhood best friend, who
          taught her this numerology. In Khmer belief, some people have a
          special connection to the spirits, who guide them to read the
          numbers truly. Solini was one of them.
        </p>
        <p>
          During the Khmer Rouge genocide, my mother lost touch with her. This
          app carries her name and the method she passed on.
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
          to 11, is that year&apos;s number.{" "}
          <Link href="/how-it-works" className={MORE_LINK}>
            See it worked through, step by step
          </Link>
          .
        </p>
      </Section>

      <SectionDivider />

      <Section title="Reading the numbers">
        <p>Tradition groups the numbers into five kinds of year:</p>
        <ul className="space-y-1">
          {YEAR_TIERS.map((tier) => (
            <li key={tier.tier} className="text-ink">
              <span className="font-display text-gold-deep tabular-nums">
                {tier.min === tier.max ? tier.min : `${tier.min}–${tier.max}`}
              </span>{" "}
              · {tier.label}
            </li>
          ))}
        </ul>
        <p>
          Each year of the cycle also belongs to one of twelve life areas,
          from Self to Protection.{" "}
          <Link href="/meaning" className={MORE_LINK}>
            What each number and life area means
          </Link>
          .
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

      <div className="mt-16">
        <PillLink href="/">See your cycle</PillLink>
      </div>
      <MorePages current="/about" />
    </InfoPage>
  );
}
