# Design Spec: Khmer Numerology App

> This file specifies Solini's components: their layout, states and behavior. The rules every component follows (palette, type, spacing, iconography, interaction states, motion (living surfaces and transitions), accessibility) are defined in [the design language](./standards/design-language.md), which wins if the two disagree. Token values live in `src/app/globals.css` and `src/lib/motion.ts`.

## Design Brief
- **Feature:** Full application visual identity and component system
- **User:** Visitors exploring their Khmer numerology life cycle
- **Goal:** Evoke the feeling of reading a sacred manuscript — calm, ancient, reverent — while remaining modern and usable
- **Tone:** Serene and contemplative. Like unrolling a palm-leaf manuscript under temple light. Paper texture, ink-like type, gold accents for sacred elements, generous whitespace as breathing room.

---

## Cultural References

The visual language draws from:
- **Khmer Satra (palm-leaf manuscripts):** Horizontal format, incised text on dried palm leaves, dark ink on warm natural fiber
- **Angkor Wat bas-reliefs:** Geometric precision, repeating motifs, narrative flow left-to-right
- **Khmer temple ornamentation:** Naga serpent curves, lotus borders, flame-point arches (kbach patterns)
- **Sanskrit/Pali manuscript tradition:** Devanagari-adjacent letterforms, structured grids, sacred geometry

The design should feel like a digitized sacred text — not a theme park replica. Restraint is key. One or two cultural motifs used consistently beat ten used haphazardly.

---

## Layout

### Structure — Single-Page Scroll
```
┌─────────────────────────────────────────────┐
│      flame │ Solini / KHMER NUMEROLOGY      │ ← signature: flame beside the name
│  — A lantern for every year in your cycle — │    brand line in italic below
├─────────────────────────────────────────────┤
│                                             │
│           ╔═══════════════════╗              │
│           ║   Birth Data      ║              │ ← parchment card, centered
│           ║   Form Inputs     ║              │    like a manuscript page
│           ╚═══════════════════╝              │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│              3   6                          │
│          8           9                      │ ← cycle wheel: 12 threaded orbs,
│        6    ( 11 )     5                    │    this year's preview in the
│          4  Allies   8                      │    center; tap it to bloom the
│            2  0  2⑪                         │    full reading over the wheel
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│     ──●──●──●──●──●──●──●──●──●──           │ ← year timeline (horizontal)
│     '97 '98 '99 '00 '01 '02 ...            │    like a thread of fate
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│     ╔════════════╦════════════╗              │
│     ║  Your      ║  Partner   ║              │ ← compatibility (Phase 2)
│     ║  Cycle     ║  Cycle     ║              │
│     ╚════════════╩════════════╝              │
│                                             │
├─────────────────────────────────────────────┤
│  ◇  Footer — cultural attribution        ◇  │
└─────────────────────────────────────────────┘
```

**Key principle:** No sidebar. Content flows vertically like a scroll. Each section is a "page" of the manuscript separated by generous whitespace and subtle ornamental dividers (lotus line or kbach border).

### Responsive Strategy
| Width | Layout |
|-------|--------|
| Desktop (1280px+) | The cycle card widens to 1200px; generous margins around every section |
| Tablet (768–1279px) | The cycle card stays centered at up to 900px; the timeline scrolls sideways with snap |
| Mobile (320–767px) | 16px gutters; the wheel scales with its container (`cqw`) and orbs never drop below 44px; the reading grows taller than the wheel instead of scrolling inside it |

Every screen is checked at 320, 768 and 1280px (see [the shipping checklist](./standards/shipping.md#definition-of-done)).

---

## Visual System

Color (the "Temple Lantern" palette and tier light), typography, spacing, shape and iconography are defined in [the design language](./standards/design-language.md). The sections below cover only what is specific to this layout.

### Decorative Elements (Minimal, Purposeful)

**Section dividers:** A single horizontal line with a small lotus/diamond motif centered. CSS-achievable with `border` + `::after` pseudo-element. Not an image — a shape.

```
──────────── ◇ ────────────
```

**Cards:** Frosted glass (`.glass`): the manuscript color at 72% over the sky, a 14px backdrop blur, a 1px `border` edge and `--shadow-card`, with `rounded-2xl` corners. As a card scrolls through the viewport, a faint gold glint slides along its rim from right to left and a barely visible glow crosses its face; both rest when the page does. With Reduce Motion the glint is hidden; with Reduce Transparency the card is solid.

**Background:** The dusk sky (`.dusk-sky`): soft lantern glows that breathe and rise slowly as the page scrolls, trailing a fast scroll a little before they settle, with drifting dust (`LanternSky`) above them. Glass cards carry the same weight, drifting up to 3px. See Living surfaces in the design language.

**Gold accents:** `gold-deep` marks the current year, the primary action, the total score and headings on companion pages; decorative `gold` is for the ◇ diamond and hairlines. Never for "selected" (that is the ink outline) or large surfaces. Gold is sacred — overuse cheapens it.

---

## Components

### Cycle Chart (The Centerpiece)
**Type:** Cycle wheel ("Bloom")
**Purpose:** Display the 12-number life cycle — the core output

**Design:** The 12 numbers sit on a ring as threaded orbs, starting at the top with the birth year and running clockwise, like a zodiac dial. Each orb:
- Shows its cycle number in the sans face (Hanken Grotesk, medium, tabular). Marcellus draws 0 like a letter O and 11 like "ll", so it is not used for numbers on the wheel
- Is an opaque, matte dark sphere, softly shaded from above, that lets no light through. It is backlit by its tier's lantern light, which glows close around its edge and breathes and swells gently (`.wheel-orb`, `data-tier` sets `--lamp`). A warm gold hairline marks its edge. Under the number runs one hand-dyed thread in its tier's color (`.wheel-thread`), echoing the twelve threads of the woven flame: it fades at both ends, and neighboring threads differ a little in length and place. Zero is an unlit niche with a short, faint thread
- Has its zodiac animal just outside it (`ZodiacIcon`, read from `getZodiacAnimalForYear`), gold for the selected year

A thin gold arc traces the ring from the birth year to this year.

```
              🐂
          8   3   6
      🐀              🐅
     6     2026 · NOW     9
          ALLIES
    4      11           5
       Very strong luck
     2      🐎 Horse     8
          READ MORE
          0   2  (11)
```

**Center (the preview):** An opaque, matte disc like the orbs, with a warm gold hairline, backlit by the selected year's tier light, which breathes behind it; no light shows through it. The full reading that blooms from it is opaque too, with the same breathing backlight around its edge. The selected year's year, life area, number, tier label and animal, with "Read more". It shows on load for the current year, so the reading is visible without a tap.

**Bloom (the full reading):** Tapping the center, or the selected orb again, opens the full reading over the wheel: number, tier, animal, description, guidance and the other years that share the number. It grows out of the center with a shared-element view transition and folds back the same way. On narrow screens it grows taller than the wheel instead of scrolling inside it.

**Current year:** A gold edge, a lit `gold-light` thread whose light breathes like the woven flame's lit thread, a small gold halo that breathes (the current-year pulse) and the month dial: twelve short arcs around the orb, one per month of the year counted from the birthday (`getMonthOfActiveYear()`). Months behind are lit `gold`, this month is `gold-light` and breathes (a living surface in the design language), and months ahead stay faint. The orb's accessible name ends "current year, month 4 of 12", and the line under the wheel says "The ring around 2026 shows month 4 of 12, counted from the birthday." while the current cycle is on the wheel. After 9s idle the selection returns here.

**States:**
| State | Description |
|-------|-------------|
| Default | Orb lit by its tier, number at center |
| Hover | Glow brightens (mouse only), cursor pointer |
| Pressed | Scales to 0.97 on a no-bounce spring |
| Selected | 2px ink ring that glides between orbs (view transition); the center crossfades |
| Zero | Charcoal orb, number in light text |

**Accessibility:**
- Each orb is a `<button>` with `role="tab"` in a `tablist`; the center is the tab panel
- `aria-label`: "2026, Allies, cycle number 11, Very strong luck, Year of the Horse, current year"
- One Tab stop for the group (roving tabindex); arrows move focus and selection together around the wheel, Home/End jump to the ends
- Enter or Space on the selected orb, or on the center, opens the reading; focus moves to its close button, and Escape or Close returns focus to the center
- While the reading is open the ring behind it is `inert`
- Orbs are at least 44px; focus ring is a 2px gold-deep outline

**Implementation hint:** Orbs are absolutely placed on a square that is a size container, so sizes use `cqw`. The ring and the tab panel share one grid cell. Selection ring and bloom use React `<ViewTransition>`; entrance stagger via Motion; Reduce Motion turns both off.

### Birth Data Form
**Type:** Centered parchment card
**Purpose:** Collect birth date to compute the cycle

**Design:** A manuscript-like card centered on the page. Feels like filling in a page of a personal record.

```
╔══════════════════════════════════════╗
║                                      ║
║     Discover Your Life Cycle         ║  ← H1, centered
║                                      ║
║     ┌─────────────────────────┐      ║
║     │  Date of Birth          │      ║  ← date input, full width
║     │  July 24, 1997          │      ║
║     └─────────────────────────┘      ║
║                                      ║
║     Your zodiac: Ox                  ║  ← auto-derived, shown after input
║     Born on: Thursday                ║
║                                      ║
║     ┌─────────────────────────┐      ║
║     │    REVEAL MY CYCLE      │      ║  ← button, uppercase, letter-spaced
║     └─────────────────────────┘      ║
║                                      ║
╚══════════════════════════════════════╝
```

**Input styling:** Lit wells (`.lantern-input`): a solid dark field with a 1px `border` edge, centered tabular figures, at least 56px tall. Day, month and year fields move on when filled and overwrite when typed into again. On focus the edge turns `gold-deep` with a soft glow; on error it turns ember (`tier-weak`). Placeholders use `ink-faint`. Browser autofill is repainted to match.

**Button:** The primary button: a `gold-deep` outline pill, uppercase, `tracking-[0.14em]`, at least 48px tall. On hover (mouse only) it fills with `gold-deep`, text turns `parchment` and it gains `--shadow-glow` (a hover glow holds steady); pressed scales to 0.97. Transition: `--duration-quick` with `--ease-standard`. The button should feel like pressing a seal, not clicking a web button.

**Card:** A `.glass` card, `rounded-2xl`, at most 480px wide.

### Year Detail Panel
**Type:** Expandable card below cycle chart
**Purpose:** Show interpretation for selected year

**Design:**
```
┌─────────────────────────────────────────┐
│                                         │
│  2024 — Year of Health                  │  ← year + life area
│                                         │
│  ◕ Strong Luck (8)                      │  ← tier symbol + label + number
│                                         │
│  "A year to take action and expand.     │  ← guidance text, italic
│   Pursue opportunities with             │
│   confidence."                          │
│                                         │
│  This year repeats: 2012, 2036          │  ← cycle echo years
│                                         │
└─────────────────────────────────────────┘
```

**Guidance text** in italic body text with a faint gold rule at its left edge — like an annotation in the margin of a manuscript.

### Birth Day and Animal Panels

Under this year's reading, in the same column, two lit panels read the person rather than a year (`BirthReading`). They use `ThisYearCard`'s surface (a `border` hairline over a faint `gold-deep` wash) and stack at every width, so on desktop they sit under this year's card beside the wheel.

- **Birth day.** A small uppercase label, "Born on a Thursday" in display type, then the Khmer day name in Khmer script with its romanization in `gold-deep`. One or two sentences of character from the Khmer account, then the planet with its strength out of 21 and the day's traditional color as a 12px swatch beside its name. The swatch is decorative (`aria-hidden`); the color's name carries the meaning. Swatches use the `day-*` tokens.
- **Zodiac animal.** "Year of the Ox", the Khmer year name (ឆ្នាំឆ្លូវ · Chhnam Chhlov) and the animal's engraved icon. The traits follow a "Popular reading:" label, with a line saying they are shared with Chinese astrology, not drawn from a Khmer text.

Each panel ends with a gold text link to its section of the meaning page, where what is documented, what is popular and what is Solini's choice is explained.

### Total Score Card

Below the wheel, the total score sits in a quiet card: the number in `gold-deep` display type, its band ("Balanced / moderate cycle") and one line of description. The whole card is a button (`aria-expanded`): a chevron and "See the scale" show it opens, the border turns `gold` on hover, and the card presses to 0.97.

Every cycle totals exactly 52, 64 or 76, so the scale is three stops, not a range. Opened, the card settles in a row of three lantern stops on a hairline rail:

| Stop | Band | How common |
|------|------|------------|
| 52 | Weak | About 1 in 7 |
| 64 | Balanced | About 1 in 2 |
| 76 | Strong | About 1 in 3 |

The visitor's stop is labeled "Yours", ringed in ink and lit with its tier's light (`tier-weak`, `tier-moderate`, `tier-strong`). The others stay unlit. A short note explains why there are only three: before the mod-12 step the twelve columns always add up to 184, and a whole cycle sheds 9, 10 or 11 full twelves. The shares come from every birth date from 1900 to 2099 (`TOTAL_SCALE` in `interpretation-data.ts`). "Hide scale" folds it back.

### Year Timeline
**Type:** Horizontal scrollable listbox (`src/components/year-timeline.tsx`)
**Purpose:** Pick any year from the birth year to 30 years past this year, and see the 12-year pattern repeat

**Design:** A hairline "thread of fate" runs through one orb per year. Every orb is the same 40px size, filled with its tier color and lit like the wheel's orbs, with the tier symbol (●, ◕, ◑, ◔, ⊙) at its center. Zero years are the unlit `tier-zero` niche with ⊙. The year sits below each orb in `ink`, or `ink-light` for past years.

```
 ◑    ◕    ●   (◑)   ◔    ⊙    ◔
2024 2025 2026 2027 2028 2029 2030
          now
```

- **Now:** the active year (see `getActiveYear()`) gets a 2px `gold-deep` outline (9.7:1 on the page) and a bold `gold-deep` label, so gold is never the only cue.
- **Selected:** an inset `ink` ring that glides between years (`<ViewTransition name="timeline-selection">`).
- **Cycle boundaries:** a faint vertical `border` tick behind the first year of each new 12-year cycle.
- **Edges:** the track fades out over 48px only on a side where more years are scrolled out of view (`data-more-before` / `data-more-after` on `.timeline-fade`).
- **Size:** each year is a 44px-wide button around its orb, 4px apart. At 1280px about 27 years are visible, at 768px about 15, and at 320px about 5.

**Interaction:** The timeline and the wheel share one selected year. Tapping a year selects it and recenters the track (instant on load, smooth afterwards unless Reduce Motion is on). It is a single Tab stop: arrow keys move focus and selection together, Home and End jump to the birth year and the last year, and Enter or Space select. Each year's accessible name reads "Year 2026, cycle number 11, Very strong luck, current year". Below `lg` the timeline belongs to the "Cycle" view, with the wheel. It isn't rendered until there is a reading.

**Size budget:** a 1900 birth renders about 157 buttons. That is well within what the browser handles without windowing, so the track renders every year.

### Partner Comparison
**Type:** Section under the reading (`src/components/partner-comparison.tsx`)
**Purpose:** See how the reading on the page meets someone else's (a partner, parent, child or friend), year by year, using Khmer numerology's compatibility rules (docs/system-overview.md, "Compatibility")

**States:**
- **Resting:** one full-width outlined "Compare with someone close" button, with "A partner, parent, child or friend: see how your cycles meet, year by year." under it. On a reading opened from a share link it reads "Compare it with yours" and "See how this cycle meets your own, year by year."
- **Entering a date:** a glass card with the same heading as the button, the prompt "Enter their birth date to see how your cycles meet." (on a shared reading, "Enter your birth date to see how the two cycles meet."), the birth date form in partner mode (its own New Year toggle, a "Compare" button, and "This birth date isn't saved anywhere.") and a Cancel link.
- **Comparing:** a glass card, up to 640px wide, headed "Your cycles together" ("Two cycles together" for a shared comparison link):
  - **The summary** (`CompatibilitySummary`), straight on the card with no panel of its own:
    - The two people side by side, named You and Them (on a shared reading compared with the visitor's own date, Them and You; on a shared comparison link, First and Second), each with the birth date, then the animal and total score ("Ox · Total 64") with the total in `gold-deep` display type.
    - The overall assessment (Strong, Moderate, Mixed or Low stability) in display type, run into one calm sentence.
    - "Now, 2026" in bold `gold-deep` on a faint gold band, with that year's interaction at the other end. It always reads from the current cycle, whichever cycle the table shows.
  - **Cycle stepper:** "Cycle 2021–2032" between a back and a forward chevron ("Earlier cycle", "Later cycle"). Cycles follow the visitor's birth year: the current one first, then up to two before it. It offers only cycles that start on or after the visitor's birth and that the partner was alive for at least partly; with one cycle the label shows alone. When the partner was born partway through, the label adds "· 9 years together". The table below crossfades (`panel-swap`).
  - A table of the chosen cycle's 12 years: Year, the two people by the same names, Together. The current year's row is `gold-deep`, with "Now" under the year. Numbers are plain; the wheel and the reading carry each year's tier. A year before someone's birth shows "—" for their number and "Not born yet" under Together.
  - "Share this comparison" (gold outline, like Share), then "Download image" and "Remove" as quiet text links on the same row.
  - **How to read this**, closed by default at the end of the card: what each interaction word means, and a "How the totals are read" link to the total score section of How your cycle is made (`/how-it-works#total-score`). That section gives the three totals a cycle can have (52, 64 or 76) and why, which pairs of totals make each assessment, and that reading 64 with 52 as mixed is Solini's choice, not a rule of Khmer numerology. Explanations sit together here, where readers look for them, rather than in the middle of the result.

**Summary card image:** the comparison link's preview image (`/r/A+B/opengraph-image`, 1200×630) draws a fuller summary for the visitor's current cycle: both animals, dates and totals, the assessment, the current year's interaction and five count tiles, with the cycle's years in the footer. "Download image" saves it as `solini-comparison-A-B.png`. Satori may lack the Unicode symbols, so the image draws them as SVG shapes in the same colors.

A table, not two charts side by side: the comparison is about the same calendar year for two people, and a row per year reads the same at 320px and 1920px with no stacking.

**Interactions:** each is a symbol and a word, so color is never the only signal (all at least 5.5:1 on cards):

| Interaction | Symbol | Color |
|---|---|---|
| Amplified | ★ | `gold-deep` |
| Stabilized | ▲ | `tier-strong` |
| Neutral | — | `ink-light` |
| Low together | ▼ | `tier-weak` |
| Unstable | ⊙ | `ink-light` |

**Privacy:** the partner's date is never saved to the browser. The comparison link `/r/A+B` shows both dates to anyone who opens it, and the copied message says so.

### Section Dividers
**Type:** Decorative horizontal rule
**Purpose:** Separate manuscript "pages"

`SectionDivider compact` (`src/components/ui/section-divider.tsx`): a hairline that fades out at both ends, in the `border` color, with a small `gold` ◇ at its center, at the top of a page.

Between the sections of a long page, `SectionDivider` is woven (`WovenDivider` in `src/components/ui/woven-flame-parts.tsx`): the flame's twelve threads, `gold` with the base thread in `gold-deep`, lie end to end as one line that fades toward its ends. Below the middle of the screen the threads are folded into a small flame, and they unweave into the line, base first, as the divider scrolls up. On the same pages each section heading has a short `gold` thread under it that draws itself as it scrolls in, and a follow flame rests in the bottom right corner on a disc of glass, lighting a thread for each stretch of the page read (see Living surfaces in the design language).

---

## Interaction Patterns

### Birth Data → Cycle Reveal
**Trigger:** User enters birth date and clicks "Reveal My Cycle"
**Steps:**
1. User types or selects birth date → zodiac and weekday auto-derive and fade in below
2. User clicks "Reveal My Cycle" → button text fades, a subtle ripple expands from the button
3. The form card blooms into the reading in the same place. A shared-element view transition (`reading-card`, class `reading-bloom`) grows the card to the reading's size over 520ms while the form fades out in 320ms and the reading scales up from 0.96. A soft gold glow (`.reading-bloom-glow`) swells and fades inside the card over 900ms. The page does not scroll to the result; it only scrolls if the card's top would sit above the viewport.
4. Cycle orbs swell in one by one, clockwise from the birth year, with 40ms stagger (400ms, `--ease-enter`)
5. The gold arc traces the ring from the birth year to this year, and the center shows this year's preview
6. The total score card fades in below the chart: "Total score 64 · Balanced / moderate cycle". Tapping it opens the scale of totals (see Total Score Card).

**Reading summary:** The top of the reading card names whose reading it is: the birth date ("July 24, 1997") and "Year of the Ox · Born on a Thursday". A share link adds "A reading shared with you" above them.

**Read for someone else:** A quiet underlined text link on the date's line, top right ("Someone else?", or "Read your own" on a share link; the accessible name is "Read for someone else"), styled like "Back to the reading". It is the card's only link, so the header stays one quiet line. It folds the reading back into an empty form with the same transition, faster on the way out. The intro reads "Enter another birth date to read that person's 12-year cycle." A "Back to the reading" link returns to the previous reading without re-entering it. For a restored saved date, "Forget my date" sits beside it: it clears the saved date and returns to the first-visit form. (Entering a new date replaces the saved one anyway, so this is only for forgetting without reading again.)

**A shared reading:** A share link opens someone else's reading, so nothing on it says "your". This year's panel reads "Their 2026 reading" and "Their 2027 reading begins on…", the share section is "Share this reading", and the comparison offers "Compare it with yours". Under the reading card (and the timeline, when it shows) sits the screen's one primary button, "See your own cycle", with "Free, no sign-up. It takes a few seconds." beneath it; it opens the form like "Read your own". Once the visitor reads their own date, the page speaks to them as "you" again.

**Reading card image:** a reading link's preview image (`/r/[date]/opengraph-image`, 1200×630), also saved by "Download image", shows the birth animal, "Solini", the twelve numbers as threaded orbs, each backlit by its tier with its tier's thread, with this year's orb ringed in gold and its thread lit, this year's reading, the total score and the birth date. The site's own preview image shows the worked example's cycle the same way.

**Loading state:** Not needed — calculation is instant (client-side). If there's any delay, the button shows a subtle pulse.

**Error state:** Inline validation. The field's edge turns ember (`tier-weak`) and the error text appears below it in the same color, announced with `role="alert"`. No modals, no toasts.

### Year Selection on the Wheel
**Trigger:** User clicks/taps an orb
**Steps:**
1. The selection ring glides to the new orb and its animal turns gold
2. The center preview crossfades (old fades out in 150ms, new settles in over 250ms)
3. The timeline selects the same year
4. Tapping the center (or the selected orb again) blooms the full reading over the wheel

### Timeline Scrubbing
**Trigger:** User clicks a year dot on the timeline or drags/scrolls
**Steps:**
1. The selected year gains the inset ink ring and the track recenters on it
2. Corresponding orb on the wheel gains the selection ring
3. The wheel's center updates
4. 12-year cycle boundaries shown with subtle vertical tick marks

---

## Motion and Interaction

Motion tokens, the motion rules, the living surfaces (breathing glows, scroll weight, the drifting dust and rising glows, the living wheel, return to now), the shared transitions and the shared interaction states are defined in [the design language](./standards/design-language.md#motion). The interaction patterns above describe how they apply to each component.

---

## Empty and Edge States

| State | Design |
|-------|--------|
| First visit (no data) | The title is a signature: the woven flame and "Solini" side by side, a fading gold hairline between them, and "Khmer Numerology" in gold label type under the name. The flame weaves itself in, thread by thread from the bottom, and its bottom thread, the first year, lights as the name kindles (once there is a reading, the visitor's year now lights instead, counted up from the base; when the visitor asks for a reading, a spark rises from the button into the flame, the threads light one by one up to this year, and this year flares) out of the dark over the dusk sky; afterward the flame never quite stops: it drifts and sways gently, leans toward the pointer, stays upright as the phone tilts (after one tap on the flame where the browser asks), and stretches with the scroll, with the form card centered beneath it; the whole form fits on the first screen of a phone. The brand line "A lantern for every year in your cycle" sits centered under the signature in Cormorant Garamond italic, between two fading hairlines from 640px (phones have no room for them); it takes the place of the ◇ divider. The card asks one question, "When were you born?", with one line under it saying what the visitor gets ("See a luck number for every year of your 12-year cycle, from Khmer numerology."), large fields and one solid gold button. The New Year choice rests as one line ("Counted from Khmer New Year", with Change) that opens by itself when the choice changes the animal. Text on the form is 14px or larger. |
| Any reading (submitted, saved or shared) | The form blooms into the reading card, which opens on this year's reading: number, tier, life area, description and guidance, then the day the next year's reading begins ("Your 2027 reading begins on July 24.") with that year's number, tier and life area, so the visitor knows when to come back. A February 29 birthday turns on March 1 in common years. Below `lg` a "Year / Cycle" switch at the top of the card swaps it for the wheel and timeline in the same place with the view switch transition (see the design language); from `lg` the wheel sits beside it. |
| Returning visitor, date saved before the 2026 changes | A `glass` note sits above the reading card: "Your reading has changed a little". It says each cycle year now begins on the birthday. If Khmer New Year changes this date's animal and the visitor never chose a rule, it also names both animals. "Got it" (44px, the shared pressed state) dismisses it for good and moves focus to the reading card. It is in the page flow, never an overlay, and is announced through a polite live region. Dates saved through the form after the change never get it (`UpdateNotice`, `khmer-numerology:update-2026-notice-seen`). |
| Zero year selected | The orb is an unlit niche (`tier-zero`) with its number in `ink-light`, and the ⊙ symbol marks it. Guidance text emphasizes transition and preparation. |
| Unknown address | `not-found.tsx`: the companion-page shell titled "No lantern here", one line saying the page doesn't exist or its link was cut short, a "See your cycle" pill and the links to the companion pages. |
| Error (invalid date) | The field edge turns ember and the error text appears. Form does not shake or flash — calm even in error. |
| Narrow screens (12 orbs) | The wheel scales with its container (`cqw`); orbs never go below 44px, and the bloomed reading grows taller than the wheel rather than scrolling inside it. |

---

## Implementation Guidance

### Stack
| Concern | Choice | Why |
|---------|--------|-----|
| Framework | Next.js 16 (App Router), React 19 | Server rendering for search engines and share previews; file-based routing |
| Styling | Tailwind CSS 4 with tokens in `globals.css` | Utilities over tokens keep every component on the same palette and scale |
| Fonts | `next/font/google`: Marcellus, Hanken Grotesk, Noto Serif Khmer | Self-hosted, no layout shift |
| Animation | Motion (`motion/react`), React `<ViewTransition>` and CSS | Stagger and press springs (Motion); selection glide and the bloom (native view transitions); hover, ambient and scroll-driven motion (CSS) |
| Icons | `ZodiacIcon` and small inline SVGs | Custom line art in one weight; no icon library |
| Charts | Custom elements and CSS | The cycle wheel is too bespoke for a chart library |

### Key Patterns
- **Cycle wheel:** orbs absolutely placed on a square size container (`@container`), positions from a polar helper, so the wheel scales with no media queries.
- **Stagger animation:** Motion `variants` with `staggerChildren: 0.04` on the parent.
- **Scroll snap timeline:** `overflow-x: auto; scroll-snap-type: x mandatory;` with each year dot as `scroll-snap-align: center`.
- **Reduced motion:** `<MotionConfig reducedMotion="user">` at the root, plus one global CSS rule that collapses animations, transitions, smooth scrolling and view transitions.

Accessibility requirements are part of [the design language](./standards/design-language.md#accessibility) and the [shipping checklist](./standards/shipping.md#definition-of-done).
