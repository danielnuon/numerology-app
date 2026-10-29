# Design Spec: Khmer Numerology App

> This file specifies Solini's components: their layout, states and behavior. The rules every component follows (palette, type, spacing, iconography, interaction states, motion and its approved exceptions, accessibility) are defined in [the design language](./standards/design-language.md), which wins if the two disagree. Token values live in `src/app/globals.css` and `src/lib/motion.ts`.

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
│  ◇  Site Title (Khmer script optional)   ◇  │ ← minimal header, centered
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
│          8           9                      │ ← cycle wheel: 12 lantern orbs,
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

**Background:** The dusk sky (`.dusk-sky`): soft lantern glows that rise slowly as the page scrolls, with drifting dust (`LanternSky`) above them. See the approved exceptions in the design language.

**Gold accents:** `gold-deep` marks the current year, the primary action, the total score and headings on companion pages; decorative `gold` is for the ◇ diamond and hairlines. Never for "selected" (that is the ink outline) or large surfaces. Gold is sacred — overuse cheapens it.

---

## Components

### Cycle Chart (The Centerpiece)
**Type:** Cycle wheel ("Bloom")
**Purpose:** Display the 12-number life cycle — the core output

**Design:** The 12 numbers sit on a ring as lantern orbs, starting at the top with the birth year and running clockwise, like a zodiac dial. Each orb:
- Shows its cycle number in the sans face (Hanken Grotesk, medium, tabular). Marcellus draws 0 like a letter O and 11 like "ll", so it is not used for numbers on the wheel
- Is lit from within by its tier's lantern light (`.wheel-orb`, `data-tier` sets `--lamp`); zero is an unlit niche
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

**Center (the preview):** The selected year's year, life area, number, tier label and animal, with "Read more". It shows on load for the current year, so the reading is visible without a tap.

**Bloom (the full reading):** Tapping the center, or the selected orb again, opens the full reading over the wheel: number, tier, animal, description, guidance and the other years that share the number. It grows out of the center with a shared-element view transition and folds back the same way. On narrow screens it grows taller than the wheel instead of scrolling inside it.

**Current year:** Gold-deep edge, a warmer glow, a gold-deep corner dot and a soft gold halo that breathes (the current-year pulse, an approved exception in the design language). After 9s idle the selection returns here.

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

**Button:** The primary button: a `gold-deep` outline pill, uppercase, `tracking-[0.14em]`, at least 48px tall. On hover (mouse only) it fills with `gold-deep`, text turns `parchment` and it gains `--shadow-glow`; pressed scales to 0.97. Transition: `--duration-quick` with `--ease-standard`. The button should feel like pressing a seal, not clicking a web button.

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

**Interaction:** The timeline and the wheel share one selected year. Tapping a year selects it and recenters the track (instant on load, smooth afterwards unless Reduce Motion is on). It is a single Tab stop: arrow keys move focus and selection together, Home and End jump to the birth year and the last year, and Enter or Space select. Each year's accessible name reads "Year 2026, cycle number 11, Very strong luck, current year". On phones the timeline folds away with the wheel behind "See all 12 years". It isn't rendered until there is a reading.

**Size budget:** a 1900 birth renders about 157 buttons. That is well within what the browser handles without windowing, so the track renders every year.

### Section Dividers
**Type:** Decorative horizontal rule
**Purpose:** Separate manuscript "pages"

`SectionDivider` (`src/components/ui/section-divider.tsx`): a hairline that fades out at both ends, in the `border` color, with a small `gold` ◇ at its center. `compact` tightens its margins on the landing page.

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
6. The total score fades in below the chart: "Your life pattern: Balanced (64)"

**Reading summary:** The top of the reading card names whose reading it is: the birth date ("July 24, 1997") and "Year of the Ox · Born on a Thursday". A share link adds "A reading shared with you" above them.

**Read for someone else:** A quiet underlined text link on the date's line, top right ("Someone else?", or "Read your own" on a share link; the accessible name is "Read for someone else"), styled like "Back to the reading". A restored saved date adds "Not you?" beside it; on phones the two links stack. It folds the reading back into an empty form with the same transition, faster on the way out. The intro reads "Enter another birth date to read that person's 12-year cycle." A "Back to the reading" link returns to the previous reading without re-entering it.

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

Motion tokens, the motion rules, the approved exceptions (the drifting dust and rising glows, the living wheel, return to now) and the shared interaction states are defined in [the design language](./standards/design-language.md#motion). The interaction patterns above describe how they apply to each component.

---

## Empty and Edge States

| State | Design |
|-------|--------|
| First visit (no data) | The title kindles out of the dark over the dusk sky, with the form card centered beneath it; the whole form fits on the first screen of a phone. The card asks one question, "When were you born?", with large fields and one solid gold button. The intro waits behind "What will I see?" and the New Year choice rests as one line ("Counted from Khmer New Year", with Change) that opens by itself when the choice changes the animal. Text on the form is 14px or larger. |
| Any reading (submitted, saved or shared) | The form blooms into the reading card, which opens on this year's reading: number, tier, life area, description and guidance. On phones the wheel and timeline wait behind "See all 12 years"; on tablet they show below it and from `lg` beside it. A restored saved date also offers "Not you?". |
| Zero year selected | The orb is an unlit niche (`tier-zero`) with its number in `ink-light`, and the ⊙ symbol marks it. Guidance text emphasizes transition and preparation. |
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
