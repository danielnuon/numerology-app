# How a year is read

This explains how Solini turns a year's number, life area and day planet into a reading, what Khmer numerology sources support, and what is still open. Read it before changing the readings in `src/lib/numerology/life-area-data.ts`, the day planets in `day-planet-data.ts`, the birth day and animal readings in `birth-day-data.ts` and `zodiac-data.ts`, or the tiers in `interpretation-data.ts`.

Labels used below: **Documented** means a cited source says it. **Popular** means horoscope columns or general sites say it, with no source of their own. **Inference** means it's our reasoning from sources, not stated by them. **System rule** means it comes from the method as specified in `docs/system-overview.md`, with no outside source found yet.

## The rule

A year is read as its life area and its number together, with the day planet that stands over it.

- The **number** (0 to 11) sets how strong the year is, on the five tiers in `interpretation-data.ts`. Higher is luckier, and zero is a turning point.
- The **life area** (the year's position in the cycle, Self through Protection) says what that strength applies to.
- The **reading** is the text for that pair: `AREA_READINGS[column][tier]`, 12 areas by 5 tiers, 60 readings in all. A 9 in Money reads "A year read as favorable for earning"; a 9 in Health reads "A year of good energy".
- The **day planet** comes from the birth weekday. The day row starts at the birth day and counts on through the week, so the birth day's planet stands over the year of birth (Self), the next day's planet over Family, and so on to column 7. Each planet adds one sentence on what it lends the year, set by its strength in the Khmer count (`DAY_PLANETS`, see "Birth weekday" below). Columns 8 to 12 have no day value, so the reading says no day planet stands over them.

The day planet never changes the number or the tier, which stay as the method gives them. Before this change, every reading came from the tier alone. The area was a label above five shared texts, so a 9 in Money and a 9 in Health read the same.

## What the tradition supports

### The chart is a seven-number chart, widened to twelve columns

**Documented.** Cambodian fortune-tellers use a numerology called *lekh prampir tua* (លេខប្រាំពីរតួ, "seven numbers"), taken from the Thai *lek chet tua* (เลข ๗ ตัว), which numbers the seven planets Sun 1, Moon 2, Mars 3, Mercury 4, Jupiter 5, Venus 6 and Saturn 7 [1]. The Thai chart is built from three rows: the birth weekday (Sunday = 1), the lunar birth month (month 1 = 1) and the birth year's animal (Rat = 1). Each row starts at the person's own value and counts on around its cycle, and the rows are added column by column [2][3][4].

**Documented.** Month 1 in this count, *duean ai*, is the lunar month called *Margasira* in astrological usage, falling mostly in December [5]. One practitioner's guide states the chart's month count directly: December is month 1 [4].

**Inference.** Solini's chart is the same construction: weekday row from Sunday = 1, month row from Margasir = 1, animal row from Rat = 1, each rotated to start at the person's value, summed by column. The differences are that Solini runs the month and animal rows the full 12 columns and reduces by 12 rather than 7, while the weekday row stays 7 wide. That the weekday row stops at 7 is what you'd expect if the columns came from a chart where the day row has seven houses of its own. So the Margasir start, which `system-overview.md` calls non-standard, is the standard month count for this kind of chart. It differs from the civil Khmer calendar, which starts in April.

### Every reading is for a value in a place

**Documented.** In an undated seven-number manuscript from Wat Tha Phut, Nakhon Pathom, published in the manuscripts database of the Sirindhorn anthropology research institute in Bangkok (SAC, ศูนย์มานุษยวิทยาสิรินธร), predictions are given for each planet in each house ("if [planet] is [house]…"). None are given for a number alone, and the text doesn't read sums as strength [2]. A practitioner's guide reads a number by the houses it falls in across the rows: "good meeting good is read as good; two bad and one good is read as bad" [4]. Another practitioner describes a reading as combining the meanings of the houses into one story [6].

**Inference.** Reading area and number together is the documented practice, and reading the number alone is not. That is the main reason for this change.

### What the numbers mean is the system's own scale

**System rule.** In the seven-number chart the values 1 to 7 are planets with characters, not a strength scale [1][3]. Solini reduces by 12, so its values aren't planets, and it reads them as a luck scale: higher is stronger, zero is a reset. We found no outside source for a mod-12 luck scale, so the tiers stay as the method gives them, and the copy says "read as" rather than presenting them as documented tradition.

### Counting years around the chart

**Documented, weakly.** Thai practitioners read a given year of life by counting the person's age around the chart's houses, so each year of age lands on one house [2][7]. The manuscript's "three-tier umbrella" section counts age around its chart to choose which verses apply [2].

**Inference.** Solini's rule, where the year of birth is position 1 and each later year moves one position and wraps every 12, is an age count of this kind.

## The life areas: an open question

**Documented.** The houses that a seven-number chart's month and year rows carry are, in order: Tanu (self, body), Kadumpha (wealth, income), Sahatcha (friends, siblings, helpers), Phanthu (relatives, home), Putta (children), Ari (rivals, obstacles), Patni (spouse), Marana (loss, illness, separation), Subha (honor, good name), Kamma (work, position), Labha (gains, profit) and Phayaya (sickness, loss), then two servant houses [2][4][8]. The first twelve are the same twelve houses as Indian astrology's *bhavas*, where 6, 8 and 12 are the unfortunate houses [9].

**Inference.** If Solini's twelve columns are these twelve houses, its labels line up like this:

| Column | Solini | Traditional house | Match |
|---|---|---|---|
| 1 | Self | Tanu: self, body | Yes |
| 2 | Family | Kadumpha: wealth, household | Partly |
| 3 | Movement | Sahatcha: friends, siblings, short trips | Partly |
| 4 | Home | Phanthu: relatives, home | Yes |
| 5 | Money | Putta: children | No |
| 6 | Allies | Ari: rivals, obstacles | Opposite |
| 7 | Relationships | Patni: spouse | Yes |
| 8 | Health | Marana: loss, illness | Partly |
| 9 | Status | Subha: honor, good name | Yes |
| 10 | Opportunity | Kamma: work, position | No |
| 11 | Karma | Labha: gains | No |
| 12 | Protection | Phayaya: loss, sickness | Opposite |

The labels date from the first version of `system-overview.md` (March 2026), and the repo doesn't say where they came from. They may come from a Khmer source not yet found, or be a later relabeling. **A Khmer numerology practitioner (*kru teay*, a fortune teller) or a written chart would settle this**, so the readings are written for the current labels.

If the columns move to the traditional houses, the readings for the hard houses (Ari, Marana, Phayaya) have to run the other way: a high number there reads as weathering rivals, loss or illness well, not as more of them. Every current label names something people hope goes well, so for now a higher tier always reads better.

## Birth weekday: is one day luckier?

In Khmer numerology as Solini follows it, birth weekday matters to luck: Tuesday leans unfavorable and Thursday favorable, though neither is the extreme. Three candidate scales, with how each fits:

| Day | Planet [1] | Thai benefic or malefic [10] | Planet strength [10] | Chart number [3] |
|---|---|---|---|---|
| Sunday | Sun | Malefic | 6 | 1 |
| Monday | Moon | Benefic | 15 | 2 |
| Tuesday | Mars | Malefic | 8 | 3 |
| Wednesday | Mercury | Benefic | 17 | 4 |
| Thursday | Jupiter | Benefic | 19 | 5 |
| Friday | Venus | Benefic | 21 | 6 |
| Saturday | Saturn | Malefic | 10 | 7 |

- **Benefic or malefic (documented).** Thai astrology counts Mars as malefic and Jupiter as benefic, which fits in direction. But it is a two-way split with no middle, so it can't say that neither day is the extreme.
- **Planet strength (documented).** Thai astrology gives each planet a strength: Sun 6, Mars 8, Saturn 10, Moon 15, Mercury 17, Jupiter 19, Venus 21. Ranked this way, Tuesday is second from the bottom and Thursday second from the top, which fits both points exactly.
- **Chart number (inference).** Ranked by the day's own number, Tuesday (3) sits below the middle and Thursday (5) above it, which fits in direction. This ranking would also make Saturday the luckiest day, while Thai sources treat Saturn as the hardest planet [11] and a Cambodian color tradition gives Saturday the color of sadness [12].

**Inference.** Solini's arithmetic doesn't favor any weekday. Across all 144 month and animal combinations, every weekday averages the same total (66), the same number of 10s and 11s (2) and the same number of zeros (1). The weekday only changes which years get which numbers, and how widely totals spread. Wednesday births never total 52, and Friday and Saturday births swing the most. So any ranking of weekdays as luckier is a separate layer on top of the chart, not something the chart computes.

**The Khmer account (documented).** In a 2014 Radio Free Asia Khmer feature, Khmer cultural researcher Vay Vibol retells how each day's deity was made: the Sun from 6 sages, the Moon from 15 goddesses, Mars from 8 buffalo heads, Mercury from 17 elephant heads, Jupiter from 19 sages, Venus from 21 cow heads and Saturn from 10 tiger heads [13]. These counts are the planet strengths in the table above, so the strength scale is Khmer tradition as well as Thai. The same feature calls Tuesday "not very good", calls Monday a soft, gentle day, and calls Thursday the royal teacher's day, good for work, with those born on it suited to study, teaching and medicine. It gives no overall luck ranking.

**Decision.** Solini follows the Khmer account and ranks the day planets by these strengths: Sunday 6, Tuesday 8, Saturday 10, Monday 15, Wednesday 17, Thursday 19, Friday 21. This places Tuesday near the bottom and Thursday near the top, with neither at the extreme. The RFA feature's own notes agree: Tuesday "not very good", Thursday the royal teacher's day.

**How the planets enter a reading (inference).** In the seven-number chart the day row's values are planets, and predictions are made for a planet in a house [1][2]. Solini's day row is the same row, so each of the first seven years has a planet in it. The reading adds one sentence for that planet: the stronger planets (Venus, Jupiter, Mercury) lend support, the Moon is gentle, and the weaker ones (Saturn, Mars, the Sun) ask for patience. The traits come from the RFA feature where it gives one (Mars quick to heat, the Moon soft, Jupiter the teacher, Mercury unhurried) and from the strength alone otherwise.

**Character.** People born on Tuesday are also said to be stubborn. The RFA feature says people born on Tuesday are impatient and quick to fight [13], and popular Khmer horoscope columns call Tuesday births "a little stubborn" [14]. Those columns cite no tradition and disagree with each other elsewhere (one gives stubbornness to Saturday instead [15]), so they count only as support for the RFA account.

### Reading the birth day itself

Beside the year readings, the birth day panel reads the weekday on its own. Its parts:

- **Khmer day name (documented).** The Khmer days are named for their planets: ថ្ងៃអាទិត្យ (Atit, Sun), ថ្ងៃច័ន្ទ (Chan, Moon), ថ្ងៃអង្គារ (Angkear, Mars), ថ្ងៃពុធ (Puth, Mercury), ថ្ងៃព្រហស្បតិ៍ (Prohoah, Jupiter), ថ្ងៃសុក្រ (Sok, Venus), ថ្ងៃសៅរ៍ (Sau, Saturn) [13].
- **Character (documented).** From the RFA feature [13]: Sunday births are often fine-looking, like the sages the Sun was made from; Monday is a soft, gentle day and those born on it fair to look at; Tuesday is not a very good day, and those born on it are short on patience, quick to fight, warriors; Wednesday births do nothing in haste; Thursday is the royal teacher's day, when children were sent to begin their studies, and those born on it are gifted at teaching, sacred arts (*mon akum*) and medicine. The feature gives no character for Friday or Saturday births, and the panel says so rather than filling the gap.
- **Color (popular, and Solini's choice to apply it).** Cambodians traditionally wear a set color each weekday: Sunday red (courage), Monday orange or yellow (equality), Tuesday purple (honesty), Wednesday light green (justice), Thursday dark green (hope), Friday blue (forgiveness), Saturday dark purple or brown (sadness) [12][16]. A Khmer language course confirms the custom but not the list [17]. These are colors for dressing day by day, not colors of a birth day, so showing the birth day's color as the visitor's own is our choice, and the meaning page says so.

**Not used: a manuscript's weekday lines.** Porée-Maspero quotes a Khmer manuscript (her ms. B, the *Prohmoçàt*) saying that those born on Sunday, Monday or Tuesday "will amuse themselves" and cannot keep the goods they seek, while those born on Wednesday, Thursday or Friday "will have goods" [18, p. 318]. It agrees in direction with the planet strengths, but the passage sits in the manuscript's section on the Rat year, and the author says the pattern is repeated for each animal with different content. It isn't a general weekday reading, so Solini doesn't present it as one.

## The zodiac animal

**Khmer names (documented).** ជូត Chhut (Rat), ឆ្លូវ Chhlov (Ox), ខាល Khal (Tiger), ថោះ Thos (Rabbit), រោង Rong (Dragon, often drawn as a naga), ម្សាញ់ Msanh (Snake), មមី Momee (Horse), មមែ Momae (Goat), វក Vok (Monkey), រកា Roka (Rooster), ច Cho (Dog), កុរ Kor (Pig). The year is ឆ្នាំ (chhnam), so the Ox year is ឆ្នាំឆ្លូវ. The same RFA feature notes that the cycle's origin is unsettled: some trace it to China, others to India or Brahmanism [19]. Romanizations vary; Solini uses common ones.

**How Cambodians use the animal (documented).** Three ways, and none is a fixed personality profile:

- *The yearly forecast.* Each Khmer New Year, the Ministry of Cults and Religion's *Moha Sangkran* almanac gives a forecast for every birth animal, by gender [20]. This is the most common living use. Solini doesn't reproduce it: the text is the ministry's and changes every year.
- *Marriage matching.* Khmer manuscripts sort the animals into three races (deities, humans and *yak*) and rate each pairing, but the tables disagree with each other and the author suspects copying errors [18, pp. 315, 321, 327]. Solini's comparison view uses its own rules (`docs/system-overview.md`), not these tables.
- *Character with the birth month.* Porée-Maspero: the animal's variety, set by the part of the year one is born in, "determines character and destiny". For example, a Rat born in some months is intelligent and supple, and in others badly placed [18, pp. 314, 319]. The full tables for all twelve animals aren't available in a form we could use.

**Traits (popular).** Khmer horoscope sites give each animal a set of traits (Rat quick and clever, Ox patient and stubborn, Tiger brave) without citing a source, and they match the Chinese zodiac's stock traits [21]. **Decision:** the animal panel shows these traits because they are what visitors expect from a zodiac reading, labeled "Popular reading" with a line saying they are shared with Chinese astrology, not drawn from a Khmer text. The meaning page explains the Khmer uses above. If a Khmer source gives the animals' character, it replaces these traits.

## Open questions

These need a Khmer numerology practitioner (*kru teay*, a fortune teller) or a written source to settle.

1. Where did the twelve life-area labels come from, and does a Khmer chart name the columns differently?
2. Is "higher number, better year" how Khmer numerology reads a mod-12 value? The outside sources read numbers as planets, not as a scale.
3. Should the chart use the lunar birth month rather than the Gregorian one? Solini approximates the lunar month with the Gregorian month (`months.ts`), so a birth in late November or early December can land a month off.
4. Do the five columns with no weekday value (8 to 12) get read any differently?
5. Does Khmer numerology read character from the animal, and if so, from the animal alone or with the birth month, as the manuscripts do?
6. Is Friday the luckiest birth day and Sunday the least lucky, as the Khmer planet strengths predict? See "Birth weekday" above.

## Sources

1. Poonnatree Jiaviriyaboonya, "The influences of Thai divination on Cambodian fortune-telling practice", *Diogenes* 65(4), 2024. https://www.cambridge.org/core/journals/diogenes/article/influences-of-thai-divination-on-cambodian-fortunetelling-practice/BE787C048BF52C17B31B3F096D16598A
2. Dokrak Payakasri (transcription and editing), สมุดไทยเรื่อง พระตำรับเลขเจ็ดตัว (Thai manuscript on the seven-number method), Wat Tha Phut, Nakhon Pathom; SAC manuscripts database. https://manuscripts.sac.or.th/article-download.php?id=28
3. "การตั้งดวง เลข 7 ตัว 9 ฐาน" (setting up a seven-number, nine-base chart), practitioner blog, 2010. http://7dara.blogspot.com/2010/08/7-9.html
4. "หลักการพยากรณ์แบบเลข 7 ตัว" (principles of seven-number prediction), practitioner blog, 2009. http://seehorasat.blogspot.com/2009/06/7.html
5. "Thai lunar calendar", Wikipedia. https://en.wikipedia.org/wiki/Thai_lunar_calendar
6. Subin Chinpat, post on the seven-number method, Blockdit. https://www.blockdit.com/posts/5fd9ff64565f920cce59f4cc
7. "การทายปีจรของ เลข7ตัว9ฐาน" (reading the passing year in the seven-number chart), Pantip forum question. https://pantip.com/topic/40959823
8. "ความหมายของภพต่างๆ" (meanings of the houses), practitioner blog, 2020. http://horodigital.blogspot.com/2020/05/blog-post_6.html
9. "Bhāva", Wikipedia. https://en.wikipedia.org/wiki/Bh%C4%81va
10. "เทวดานพเคราะห์ประจำวันเกิด" (the planetary deities of the birth days), Thairath. https://www.thairath.co.th/horoscope/belief/2581801
11. "เลข 7" (the number 7 in Thai astrology), Thairath. https://www.thairath.co.th/horoscope/belief/2944519
12. "The Seven Colors of Cambodian Tradition", The Better Cambodia. https://thebettercambodia.com/the-seven-colors-of-cambodian-tradition
13. Kaev Pech Metta, "អត្ថន័យនៃឈ្មោះថ្ងៃទាំង៧" (the meaning of the names of the seven days), Radio Free Asia Khmer, April 22, 2014. https://www.rfa.org/khmer/news/meaning-of-7days-name-04222014050015.html
14. San Sarin, "តើអ្នកកើតថ្ងៃណាចូលមើលលក្ខណៈពិតរបស់អ្នកត្រឹមត្រូវឬទេ ?" (which day were you born?), Koh Santepheap Daily, March 18, 2020. https://kohsantepheapdaily.com.kh/article/1050964.html
15. San Sarin, "ចរិតនិស្ស័យនិងជោគវាសនានៃអ្នកកើតថ្ងៃទាំង៧" (character and fate of those born on the seven days), Koh Santepheap Daily, August 28, 2018. https://kohsantepheapdaily.com.kh/article/694314.html

16. "The 7 Traditional Colors of Clothes and Uniforms in Cambodia", Phoenix Voyages. https://phoenixvoyages.com/?p=1136
17. "Do You Know?", *Intermediate Khmer*, Michigan State University Open Books. https://openbooks.lib.msu.edu/intkhmer/chapter/7-2-do-you-know/
18. Éveline Porée-Maspero, "Le cycle des douze animaux dans la vie des Cambodgiens", *Bulletin de l'École française d'Extrême-Orient* 50(2), 1962, pp. 311–365. https://angkordatabase.asia/publications/le-cycle-des-douze-animaux-dans-la-vie-des-cambodgiens-the-12-animals-cycle-and-cambodian-daily-life
19. Kaev Pech Metta, "Story of the 12 animals in the Khmer year" (Khmer-language article), Radio Free Asia Khmer, April 13, 2011. https://www.rfa.org/khmer/event/story_of_12_animals_in_khmer_year-04132011102651.html
20. Khuon Narim, "At Their Peril, Some Blasé About Year of Monkey", *The Cambodia Daily*, April 7, 2016. https://english.cambodiadaily.com/?p=110944
21. "Khmer Zodiac: A Thousand-Year Tradition in Today's World", Astroreka (Metfone). https://astroreka.metfone.com.kh/language/en/bai-viet/khmer-zodiac-a-thousand-year-tradition-in-todays-world-2875.html

Sources 3, 4, 6, 7 and 8 are practitioners, not scholars. They're cited for how the method is done in practice, and the main claims rest on sources 1, 2, 5 and 13. Sources 14, 15 and 21 are popular horoscope columns, and 12 and 16 are general sites, cited only to show what they say. Source 18 was read through quoted passages, not cover to cover. We found no published Khmer-language description of the twelve-column variant Solini uses.
