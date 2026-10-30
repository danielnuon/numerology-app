import type { Metadata } from "next";
import { SectionDivider } from "@/components/ui/section-divider";
import { InfoPage, MORE_LINK, MorePages, PillLink, PullQuote, Section } from "@/components/ui/page-parts";
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
    href: "https://arxiv.org/abs/1604.05674",
    label: "Giulio Magli, Archaeoastronomy in the Khmer heartland (2016)",
  },
  {
    href: "https://english.cambodiadaily.com/brief/national-museum-to-show-first-zero-inscription-122866/",
    label: "The Cambodia Daily, the K-127 zero inscription",
  },
  {
    href: "https://angkordatabase.asia/publications/the-lost-horoscope-of-cambodia-s-astrologers",
    label: "François Bizot, The lost horoscope of Cambodia's astrologers (2013, in French)",
  },
  {
    href: "https://khmer-manuscripts.bdrc.io/scripts/static//aboutkm.en.html",
    label: "Khmer Manuscript Heritage Project",
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
 * Our heritage: who the Khmer are, and Cambodia's history told through the
 * Khmer tradition of reading time (inscriptions, the zero, Angkor's
 * alignments, the calendar), then the Khmer Rouge years, the family story
 * behind Solini and where its method comes from. Contested points, and what
 * isn't known about the method's age, are named where they come up.
 */
export default function HeritagePage() {
  return (
    <InfoPage title="Our heritage">
      <SectionDivider compact />

      <p className="w-full max-w-[640px] text-ink-light leading-relaxed">
        For as long as there are records, the Khmer have read the sky to keep
        time: to date the reigns of kings, to set the New Year and to choose
        the right day to build, marry or plant. Solini&apos;s numerology comes
        from that tradition. This page tells its story, and the story of the
        people who carried it, as told by the family behind Solini. Where
        historians disagree, or where nobody knows, it says so, and the{" "}
        <a href="#sources" className={MORE_LINK}>sources</a> at the end go
        further.
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

      <Section title="The first kingdoms" id="origins" era="1st to 8th centuries">
        <p>
          People have farmed and fished along the Mekong River and the Tonle
          Sap lake for thousands of years. The first kingdom in the region
          that history records is the one Chinese envoys called Funan. From
          about the 1st to the 6th century it was a trading power on the
          Mekong delta, its ports linked to India, China and beyond. It was
          followed by Chenla, in the 7th and 8th centuries. How far Funan was
          a Khmer kingdom is still debated, because most of what is known
          about it comes from Chinese records.
        </p>
        <p>
          With Indian trade came Sanskrit, Hindu and Buddhist ideas, and
          India&apos;s science of the stars. Over the centuries Khmer scholars
          blended that knowledge with older beliefs of their own into an
          elaborate system of calendars, astrology and prediction.
        </p>
        <p>
          A Khmer founding legend tells the beginning another way. Preah
          Thong, a prince from across the sea, married Neang Neak, daughter
          of the Naga, the serpent king of the waters. As a wedding gift the
          Naga drank the sea that covered the land, and gave the couple the
          kingdom that became Cambodia. Khmer weddings still honor the two of
          them today.
        </p>
      </Section>

      <SectionDivider />

      <Section title="Masters of number and time" id="number-and-time" era="The 600s">
        <p>
          Khmer is one of the oldest written languages of mainland Southeast
          Asia, and its earliest stone inscriptions, from the 600s, already
          keep time with care. They count years in the Saka era, which began
          in the year 78, and name the phase of the moon on the day.
        </p>
        <p>
          One of them holds one of the oldest dated zeros written as a
          numeral anywhere in the world. A stone known as K-127 gives its
          date as the fifth day of the waning moon in the year 605, which is
          683, with the zero written as a dot. The zero is what lets a few
          digits stand for any number, and the Khmer were writing it more
          than a thousand years ago. Whether K-127 holds the very oldest
          zero depends on how other early examples are dated, which scholars
          still debate. The stone was lost during the Khmer Rouge years and
          found again in 2013, and it is now kept at the National Museum in
          Phnom Penh.
        </p>
        <PullQuote cite="Stone K-127, 683">
          The Khmer were writing zero more than a thousand years ago.
        </PullQuote>
      </Section>

      <SectionDivider />

      <Section title="Angkor, built to the sky" id="angkor" era="802 to 1431">
        <p>
          In 802, a king named Jayavarman II declared himself universal
          monarch on the sacred hill of Phnom Kulen. Historians use that year
          to mark the start of the Khmer Empire. From its capital at Angkor,
          the empire grew over the next six centuries to rule much of
          mainland Southeast Asia.
        </p>
        <p>
          Its temples were built as models of the universe. Their towers
          stand for Mount Meru, the mountain at the center of the cosmos, and
          their moats for the ocean that surrounds it. Almost every temple in
          the Angkor heartland faces east, toward the rising sun, to within a
          few degrees.
        </p>
        <PullQuote>
          On the spring equinox, the sun rises directly over Angkor Wat&apos;s
          central tower.
        </PullQuote>
        <p>
          Angkor Wat, built for King Suryavarman II in the early 1100s, is
          the largest religious monument on earth, and it stands on
          Cambodia&apos;s flag. On the spring equinox, seen from its western
          entrance, the sun rises directly over its central tower, and
          thousands of people gather each March to watch. Some researchers
          go further and argue that the temple&apos;s measurements encode
          calendar cycles and the lengths of cosmic ages. Others, including
          the archaeoastronomer Giulio Magli, find that reading unconvincing,
          so it remains an open question.
        </p>
        <p>
          Angkor&apos;s builders were engineers as much as astronomers and
          artists. A web of reservoirs and canals watered the rice fields of
          greater Angkor, which archaeologists now count among the largest
          cities of the world before the industrial age. King Jayavarman VII,
          who came to the throne in 1181, built the walled city of Angkor
          Thom and the Bayon temple with its calm stone faces, and
          inscriptions credit him with founding more than a hundred hospitals
          across the empire.
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

      <Section title="A kingdom between neighbors" id="independence" era="1431 to 1975">
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

      <Section title="The Khmer Rouge years" id="khmer-rouge" era="1975 to 1979">
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
          The Khmer Rouge tried to erase the past, and nearly did. An
          estimated 95 to 98 percent of Cambodia&apos;s traditional
          manuscripts were destroyed in the 1970s and 1980s, among them the
          handwritten manuals of astrology and divination. Some survived only
          because someone hid or carried them: in 1975 the scholar François
          Bizot saved five such manuals from the Khmer Rouge. The Royal
          Ballet lost almost all of its master dancers and musicians, but the
          survivors began teaching again soon after 1979, and in 2003 UNESCO
          named the ballet a masterpiece of the world&apos;s intangible
          heritage.
        </p>
        <p>
          The reading of time endured too. The Khmer calendar still follows
          the moon. The moment Khmer New Year begins each April is still
          worked out from an old astronomical text, the Moha Sangkran. Each
          spring, at the Royal Ploughing Ceremony, a Brahmin reads the coming
          harvest from what the royal oxen choose to eat. And families still
          ask a <em>kru teay</em> or an <em>achar</em> to choose a good day for a
          wedding, a new house or a journey.
        </p>
        <p>
          Today Cambodians live and keep their culture all over the world,
          from Phnom Penh and Battambang to Long Beach, Lowell, Paris and
          Melbourne. They celebrate Khmer New Year, cook the food, speak the
          language and pass on what they were taught.
        </p>
      </Section>

      <SectionDivider />

      <Section title="Where Solini's method comes from" id="solini-method">
        <p>
          Solini&apos;s numerology belongs to this tradition. It works with
          the tools of Khmer time-keeping: the lunar months, counted from{" "}
          <em>Mikasar</em>; the twelve animals of the zodiac, whose year
          turns at Khmer New Year; and the seven planets that give the days
          of the week their names.
        </p>
        <p>
          We want to be honest about what we know. This method came to us by
          word of mouth, from Solini to my mother. We haven&apos;t found it
          written in an inscription or an old manuscript, so we can&apos;t
          say how far back this particular method goes. Its building blocks
          are centuries old; how and when they were put together this way,
          nobody has recorded. And like any reading, it is for reflection,
          not a promise about what will happen.
        </p>
      </Section>

      <SectionDivider />

      <Section title="Sources" id="sources">
        <p>
          The history here follows the standard accounts, such as David
          Chandler&apos;s <em>A History of Cambodia</em>. The idea that Angkor
          Wat&apos;s measurements encode time comes from Robert Stencel, Fred
          Gifford and Eleanor Morón (<em>Science</em>, 1976) and Eleanor
          Mannikka&apos;s <em>Angkor Wat: Time, Space, and Kingship</em>
          (1996). The other sources:
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
