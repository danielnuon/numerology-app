import type { Metadata } from "next";
import { SectionDivider } from "@/components/ui/section-divider";
import { InfoPage, MORE_LINK, MorePages, PillLink, Section } from "@/components/ui/page-parts";
import { HERITAGE_DESCRIPTION, HERITAGE_TITLE, SITE_NAME } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: HERITAGE_TITLE,
  description: HERITAGE_DESCRIPTION,
  alternates: { canonical: "/heritage" },
  openGraph: { title: HERITAGE_TITLE, description: HERITAGE_DESCRIPTION, url: "/heritage", siteName: SITE_NAME },
  twitter: { title: HERITAGE_TITLE, description: HERITAGE_DESCRIPTION },
};

/** Where each claim on the page comes from, listed under Sources. */
const SOURCES = [
  {
    href: "https://whc.unesco.org/en/list/668",
    label: "UNESCO World Heritage List, Angkor",
  },
  {
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1964867",
    label: "Evans and others, a map of greater Angkor (PNAS, 2007)",
  },
  {
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2872380",
    label: "Buckley and others, climate and the decline of Angkor (PNAS, 2010)",
  },
  {
    href: "https://ich.unesco.org/en/RL/royal-ballet-of-cambodia-00060",
    label: "UNESCO Intangible Cultural Heritage, the Royal Ballet of Cambodia",
  },
  {
    href: "https://dccam.org",
    label: "Documentation Center of Cambodia",
  },
  {
    href: "https://eccc.gov.kh/en",
    label: "Extraordinary Chambers in the Courts of Cambodia",
  },
  {
    href: "https://data.opendevelopmentmekong.net/library_record/general-population-census-of-the-kingdom-of-cambodia-2019-national-report-on-final-census-results",
    label: "General Population Census of Cambodia 2019, final results",
  },
] as const;

/**
 * Our heritage: who the Khmer are, a short history of Cambodia from its first
 * kingdoms to today, the Khmer Rouge years, and the family story behind
 * Solini. Contested points are named as contested where they come up.
 */
export default function HeritagePage() {
  return (
    <InfoPage title="Our heritage">
      <SectionDivider compact />

      <p className="w-full max-w-[640px] text-ink-light leading-relaxed">
        Solini was made to honor where we come from. This page is a short
        introduction to Cambodia and the Khmer people, written by the family
        behind Solini. It isn&apos;t a history book; the{" "}
        <a href="#sources" className={MORE_LINK}>sources</a> at the end go
        much further.
      </p>

      <SectionDivider />

      <Section title="Khmer or Cambodian?" id="khmer-or-cambodian">
        <p>The two words overlap, but they don&apos;t mean the same thing.</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-ink">Cambodian</strong> is a
            nationality. It describes the country and everyone who is from it,
            whatever their background.
          </li>
          <li>
            <strong className="font-medium text-ink">Khmer</strong> names a
            people, their language and their culture. In Khmer the word
            sounds close to &ldquo;kmai&rdquo;.
          </li>
        </ul>
        <p>
          Most Cambodians are Khmer: more than nine in ten people counted in
          the 2019 census. But Cambodia is also home to the Cham, Chinese and
          Vietnamese communities and to around twenty indigenous peoples of
          the highlands. And not every Khmer person is Cambodian. Khmer
          communities have lived for centuries in what is now southern
          Vietnam, where they are called the Khmer Krom, and in northeastern
          Thailand.
        </p>
        <p>
          Khmer is Cambodia&apos;s official language, and the country&apos;s
          own name for itself is Kampuchea. &ldquo;Cambodia&rdquo; reached
          English through the French <em>Cambodge</em>. Solini calls its
          method Khmer numerology because it belongs to Khmer culture, which
          reaches beyond Cambodia&apos;s borders.
        </p>
      </Section>

      <SectionDivider />

      <Section title="The first kingdoms" id="origins">
        <p>
          People have farmed and fished along the Mekong River and the Tonle
          Sap lake for thousands of years. Khmer is one of the oldest written
          languages of mainland Southeast Asia: the earliest dated stone
          inscription in Khmer was carved in the early 600s at Angkor Borei,
          in the south of today&apos;s Cambodia.
        </p>
        <p>
          The first kingdom in the region that history records is the one
          Chinese envoys called Funan. From about the 1st to the 6th century
          it was a trading power on the Mekong delta, its ports linked to
          India, China and beyond. It was followed by Chenla, in the 7th and
          8th centuries. How far Funan was a Khmer kingdom is still debated,
          because most of what is known about it comes from Chinese records.
        </p>
        <p>
          A Khmer founding legend tells it another way. Preah Thong, a prince
          from across the sea, married Neang Neak, daughter of the Naga, the
          serpent king of the waters. As a wedding gift the Naga drank the
          sea that covered the land, and gave the couple the kingdom that
          became Cambodia. Khmer weddings still honor the two of them today.
        </p>
      </Section>

      <SectionDivider />

      <Section title="Angkor" id="angkor">
        <p>
          In 802, a king named Jayavarman II declared himself universal
          monarch on the sacred hill of Phnom Kulen. Historians use that year
          to mark the start of the Khmer Empire. From its capital at Angkor,
          the empire grew over the next six centuries to rule much of
          mainland Southeast Asia.
        </p>
        <p>
          Its builders were engineers as much as artists. A web of
          reservoirs and canals watered the rice fields of greater Angkor,
          which archaeologists now count among the largest cities of the
          world before the industrial age. Angkor Wat, built for King
          Suryavarman II in the early 1100s, is the largest religious
          monument on earth, and it stands on Cambodia&apos;s flag. King
          Jayavarman VII, who came to the throne in 1181, built the walled
          city of Angkor Thom and the Bayon temple with its calm stone faces,
          and inscriptions credit him with founding more than a hundred
          hospitals across the empire.
        </p>
        <p>
          In 1431 the Siamese kingdom of Ayutthaya sacked Angkor, the date
          traditionally given for the empire&apos;s end. Historians now see a
          slower decline with several causes, likely including droughts and
          floods that overwhelmed the water system and trade moving toward
          the coast. How much each mattered is still debated. Angkor was
          never fully empty: Angkor Wat remained a Buddhist temple, and in
          1992 it became a UNESCO World Heritage site.
        </p>
      </Section>

      <SectionDivider />

      <Section title="A kingdom between neighbors" id="independence">
        <p>
          After Angkor, the kings moved their capitals south, to Longvek,
          Oudong and Phnom Penh. For centuries Cambodia was pressed between
          Siam and Vietnam and lost land to both, including the Mekong delta
          where the Khmer Krom live. In 1863 King Norodom accepted the
          protection of France, and Cambodia became part of French Indochina.
        </p>
        <p>
          Cambodia won its independence on November 9, 1953, under King
          Norodom Sihanouk, and still celebrates the day. The peace did not
          last. The war in neighboring Vietnam spilled across the border,
          bringing years of American bombing. In 1970 a coup removed Sihanouk,
          and a civil war followed that the Khmer Rouge won in 1975.
        </p>
      </Section>

      <SectionDivider />

      <Section title="The Khmer Rouge years" id="khmer-rouge">
        <p>
          From April 1975 to January 1979, the Khmer Rouge, led by Pol Pot,
          ruled Cambodia. They emptied the cities and forced people into
          labor camps in the countryside. They abolished money, schools and
          religion, and split families apart. Teachers, doctors, monks and
          anyone seen as educated were singled out, as were ethnic minorities
          such as the Cham and the Vietnamese.
        </p>
        <p>
          An estimated 1.5 to 2 million people died, close to a quarter of
          the country, from execution, starvation, overwork and disease.
          Estimates differ because so few records survived. In 2018 a
          UN-backed court in Phnom Penh found two of the regime&apos;s
          surviving leaders guilty of genocide.
        </p>
        <p>
          Vietnamese forces took Phnom Penh on January 7, 1979, and a decade
          of occupation and fighting followed. Peace agreements were signed
          in Paris in 1991, Cambodians voted in UN-run elections in 1993, and
          the monarchy was restored that year.
        </p>
        <p>
          Almost every Cambodian family lost someone. Many survivors fled as
          refugees and rebuilt their lives far from home.{" "}
          <a href="https://dccam.org" className={MORE_LINK}>
            The Documentation Center of Cambodia
          </a>{" "}
          keeps the record of these years.
        </p>
      </Section>

      <SectionDivider />

      <Section title="Our family's story" id="our-family">
        <p>
          My family carries these years with it, like so many others. My
          father watched the Khmer Rouge execute both of his parents. My
          mother lost two of her sisters to illness during those years.
        </p>
        <p>
          My mother and Solini, her childhood best friend, were separated in
          the chaos, as so many families and friends were. For years, neither
          knew whether the other had survived. That separation, and not
          knowing the fate of the people you love, is something countless
          Cambodians lived through.
        </p>
        <p>
          Through social media, my mother and Solini found each other again
          and reconnected after so many years. This app carries Solini&apos;s
          name for that reason.
        </p>
      </Section>

      <SectionDivider />

      <Section title="What endured" id="what-endured">
        <p>
          The Khmer Rouge tried to erase the past, and nearly did. The Royal
          Ballet of Cambodia lost almost all of its master dancers and
          musicians. The survivors began teaching again soon after 1979, and
          in 2003 UNESCO named the ballet a masterpiece of the world&apos;s
          intangible heritage.
        </p>
        <p>
          Today Cambodians live and keep their culture all over the world,
          from Phnom Penh and Battambang to Long Beach, Lowell, Paris and
          Melbourne. They celebrate Khmer New Year, cook the food, speak the
          language and pass on what they were taught. Solini is one small
          part of that: a piece of Khmer knowledge, kept and handed on.
        </p>
      </Section>

      <SectionDivider />

      <Section title="Sources" id="sources">
        <p>
          The history here follows the standard accounts, such as David
          Chandler&apos;s <em>A History of Cambodia</em>, and these sources:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          {SOURCES.map((source) => (
            <li key={source.href}>
              <a href={source.href} className={MORE_LINK}>
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <div className="mt-16">
        <PillLink href="/">See your cycle</PillLink>
      </div>
      <MorePages current="/heritage" />
    </InfoPage>
  );
}
