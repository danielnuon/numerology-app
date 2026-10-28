# Design Spec: Khmer Numerology App

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
| Breakpoint | Layout Change |
|------------|---------------|
| Desktop (1280px+) | Full-width sections, cycle chart spans 12 columns inline, generous margins (120px+) |
| Tablet (768–1279px) | Reduced margins, cycle chart stays inline but tighter, timeline becomes swipeable |
| Mobile (<768px) | Cycle chart wraps to 2 rows of 6 or becomes a vertical list. Timeline becomes a vertical scroll. Compatibility stacks vertically. |

---

## Visual System

### Color Palette — "Temple Lantern"
A night temple lit by lanterns. The token names in `globals.css` are kept from the earlier parchment palette, so "parchment" is the page and "ink" the text.

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Background | `parchment` | `#17131C` | Page — deep violet-black night, under a dusk gradient |
| Surface | `manuscript` | `#221C28` | Cards, at 72% over the sky with a 14px backdrop blur (`.glass`) |
| Surface Alt | `manuscript-alt` | `#2B2431` | Subtle separation |
| Text Primary | `ink` | `#F1E8D8` | Body text — warm candle white (15:1) |
| Text Secondary | `ink-light` | `#B4A894` | Labels, captions (7.8:1 on the page, 7.1:1 on cards) |
| Text Tertiary | `ink-faint` | `#85796B` | Placeholders and decoration only (4.3:1) |
| Accent Gold | `gold` | `#C99A3E` | Decorative gold — diamonds, hairlines |
| Accent Gold Deep | `gold-deep` | `#E2B65A` | Gold that carries meaning — focus ring, current year, primary button, total score (9.7:1) |
| Border | `border` | `#3B3242` | Card edges and dividers |

**Luck tier colors** are the color of each tier's lantern light. Wheel orbs, the wheel's center and reading, and timeline dots are lit by their tier (`data-tier` sets `--lamp`; `.wheel-orb`, `.wheel-hub`, `.wheel-reading`, `.lamp-orb` apply it), and tier symbols take the solid color:
| Tier | Value | Usage |
|------|-------|-------|
| Very Strong (10–11) | `#BFE0A5` | Pale sage light — brightest |
| Strong (7–9) | `#A9CC93` | Sage light |
| Moderate (4–6) | `#E2B65A` | Lamp gold |
| Weak (1–3) | `#D98A62` | Ember — also used for form errors (6.8:1) |
| Zero (reset) | `#0E0B11` | An unlit niche, darker than the page; its symbol stays faint |

**Atmosphere:** `LanternSky` draws 38 specks of dust drifting slowly upward through the light (20–60 s to cross the screen, with a slow flicker). It pauses while the tab is hidden and is drawn once, still, with Reduce Motion. Behind the dust, three soft lantern glows (`.sky-glow`) rise more slowly than the page as it scrolls: about 0.4× for the dusk and lantern glows and 0.15× for the ember glow, over the first 1300px. A CSS scroll-driven animation moves them with `transform` only, so the compositor does the work. They stay still with Reduce Motion or where scroll-driven animation is unsupported.

**Non-color indicators** (for accessibility):
- Very Strong: filled circle (●) + upward arrow
- Strong: three-quarter circle (◕)
- Moderate: half circle (◑)
- Weak: quarter circle (◔) + downward arrow
- Zero: empty circle with dot (⊙) — the reset symbol

### Typography — "Inscribed, Not Typed"

**Display font:** `Marcellus` — an inscriptional serif, like lettering cut into a temple lintel. Used for the title, cycle numbers, tier labels, the total score and form digits (`font-display`, also `font-serif`).

**Body font:** `Hanken Grotesk` — a calm grotesque that stays crisp as light text on a dark page, where a thin serif would shimmer.

**Khmer:** `Noto Serif Khmer` is in both stacks for Khmer script.

| Element | Font | Size | Letter Spacing |
|---------|------|------|----------------|
| Site Title | Marcellus | 48–72px | 0.14em, with a soft gold glow |
| Subtitle | Marcellus, gold-deep | 18px | 0.12em |
| Body | Hanken Grotesk | 17px / 1.65 | 0 |
| Caption/Label | Hanken Grotesk, uppercase | 12–14px | 0.08–0.18em |
| Cycle Number | Marcellus | 32px, tabular | 0 |
| Button | Hanken Grotesk 500, uppercase | 14px | 0.14em |

**Key rule:** All text should feel like it was written with intention, not generated. High line-height (1.7 for body) gives breathing room — like text on a palm-leaf page with generous spacing between lines.

### Spacing — "Temple Proportions"
**Base unit:** 8px
**Scale:** 4, 8, 16, 24, 32, 48, 64, 96, 128

Generous spacing everywhere. Sections separated by 96–128px. Cards have 32–48px padding. The design should breathe. Cramped = anxious. Spacious = serene.

### Decorative Elements (Minimal, Purposeful)

**Section dividers:** A single horizontal line with a small lotus/diamond motif centered. CSS-achievable with `border` + `::after` pseudo-element. Not an image — a shape.

```
──────────── ◇ ────────────
```

**Card borders:** Thin `1px` border in `#D5CBBA` with `2px` rounded corners (barely rounded — like hand-cut paper, not bubble UI). Optional: a subtle double-line border for primary cards (like a manuscript frame).

**Background texture:** A very subtle paper grain using CSS — `background-image` with a noise SVG at 3–5% opacity. Should feel like paper when you look closely, invisible when you don't. Alternatively, a single repeating `<svg>` pattern of tiny dots at 2% opacity.

**Gold accents:** Used ONLY for:
- The current year highlight in the cycle chart
- The total score display
- Section heading ornaments
- Active/selected states

Never for buttons, links, or large surfaces. Gold is sacred — overuse cheapens it.

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

**Current year:** Gold-deep edge, a warmer glow and a gold-deep corner dot. No looping animation.

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

**Input styling:** Underline-only input (no box border). Text appears to be written onto the page. On focus, the underline transitions to gold. Placeholder text in `#A89F8F`.

**Button:** Outlined (not filled). Border in `#2C2417`, text in `#2C2417`, uppercase, 0.08em letter-spacing. On hover (mouse only), fills with `#2C2417` and text turns `#FFFDF7`; pressed scales to 0.98. Transition: `--duration-quick` with `--ease-standard`. The button should feel like pressing a seal, not clicking a web button.

**Card:** `#FFFDF7` background, `1px` border `#D5CBBA`, subtle `box-shadow: 0 1px 3px rgba(44, 36, 23, 0.08)`. Max-width: 480px.

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

**Guidance text** in italic Cormorant Garamond — like a handwritten annotation in the margin of a manuscript.

### Year Timeline
**Type:** Horizontal scrollable track
**Purpose:** Navigate years with visual cycle pattern

**Design:** A horizontal line (the "thread of fate") with dots at each year. Dot size varies by luck tier. Current year is a gold-filled circle.

```
──○──○──○──○──○──●──○──◌──○──○──○──○──●──○──
 '97 '98 '99 '00 '01 '02 '03 '04 '05 '06 '07 '08 '09 '10
  3   6   9   5   8  11   2   0   2   4   6   8   3   6
```

- Large dot (●): strong/very strong years
- Medium dot (○): moderate years
- Small dot (◔): weak years
- Open dot (◌): zero/reset years
- Gold filled dot: current year

**Interaction:** Click a dot to scroll the cycle chart and update the detail panel. Horizontal scroll with snap-to-year on mobile.

### Section Dividers
**Type:** Decorative horizontal rule
**Purpose:** Separate manuscript "pages"

```css
/* CSS approach */
.divider {
  border: none;
  border-top: 1px solid #D5CBBA;
  position: relative;
  margin: 96px auto;
  max-width: 600px;
}
.divider::after {
  content: '◇';
  position: absolute;
  top: -0.6em;
  left: 50%;
  transform: translateX(-50%);
  background: #F5F0E8;
  padding: 0 16px;
  color: #B8860B;
  font-size: 14px;
}
```

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

**Read for someone else:** A button beside the summary ("Read your own" on a share link) folds the reading back into an empty form with the same transition, faster on the way out. The intro reads "Enter another birth date to read that person's 12-year cycle." A "Back to the reading" link returns to the previous reading without re-entering it.

**Loading state:** Not needed — calculation is instant (client-side). If there's any delay, the button shows a subtle pulse.

**Error state:** Inline validation. The date input underline turns sienna (`#A0522D`), error text fades in below in the same color. No modals, no toasts.

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
1. Selected dot gains gold fill
2. Corresponding orb on the wheel gains the selection ring
3. The wheel's center updates
4. 12-year cycle boundaries shown with subtle vertical tick marks

---

## Motion and Interaction Tokens

Defined in `src/app/globals.css` (CSS) and `src/lib/motion.ts` (Motion). Curves are Material 3's; Apple publishes no numeric curves, and these sit close to its no-overshoot springs.

| Token | Value | Use |
|-------|-------|-----|
| `--duration-press` | 100ms | Pressed feedback |
| `--duration-quick` | 150ms | Hover, focus, color changes |
| `--duration-standard` | 250ms | Selection change, panel content swap |
| `--duration-gentle` | 400ms | Entrances (cycle reveal) |
| `--ease-enter` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Things arriving |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Things changing in place |
| `--ease-exit` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Things leaving |
| `--shadow-card` / `--shadow-raised` | see globals.css | Resting card / raised surfaces |

**Rules**
- Looks interactive if and only if it is: every control has a pointer cursor, hover (mouse only), a gold-deep focus ring and a pressed state. Static cards have none of these.
- One meaning per visual: gold-deep = now, ink outline = selected, focus ring = keyboard.
- Interface motion explains a change; movement stays at 10px or less. Continuous motion is limited to two ambient places, both slow, opacity- and transform-only, and stopped by Reduce Motion:
  - the dust and lantern glows in the sky;
  - the living wheel. The current year's number pulses with a soft gold halo (1.8s each way). Every number's light breathes at its own pace (5–8.6s) while the numbers float about 1px. A glint travels the ring every 14s, and a fine tick ring turns once every 3 minutes. A tapped number sends out one ring. When scrolling, a scroll-driven `view()` timeline shifts the ring and the center up to 6px apart for depth.
- Return to now: when the wheel rests on another year, it glides back to the current year after 9s without any tap, key, scroll or wheel anywhere on the page (`RETURN_TO_CURRENT_MS`). It never does so while a reading is open, while a mouse hovers the wheel, or while keyboard focus is inside it.
- Entrance: the title "kindles" out of the dark (blur and letter-spacing settle, 1.6s), then the subtitle and first card follow (`.rise` with `--rise-delay`).
- Selection changes run inside `startTransition`, so React `<ViewTransition>` animates the selection outline (shared element) and panel crossfade natively. This covers the wheel, the timeline and the New Year toggle; each marks its choice with an ink outline that glides to the new option.
- Pressed state: every pill, button and orb scales to 0.97 (`PRESS.scale` in Motion, `active:scale-[0.97]` in CSS). Inline text links dim instead.
- Sections marked `.scroll-settle` settle in on scroll via CSS scroll-driven animation where supported; elsewhere they simply appear.
- Reduce Motion: nothing moves or scales; changes are instant.

---

## Empty and Edge States

| State | Design |
|-------|--------|
| First visit (no data) | Full-width hero with form card centered. Subtle background: a faded kbach pattern at 3% opacity. Tagline: "Uncover the rhythm of your years" in italic Cormorant. |
| Returning visitor (saved data) | Current year widget shows at top before form. Minimal: just the number, tier, and guidance. "View full cycle" link below. "Not you?" in text-secondary. |
| Zero year selected | Detail panel background shifts to charcoal (`#4A4039`), text inverts to light. The panel feels like a void. Guidance text emphasizes transition and preparation. |
| Error (invalid date) | Underline turns sienna, error text fades in. Form does not shake or flash — calm even in error. |
| Narrow screens (12 orbs) | The wheel scales with its container (`cqw`); orbs never go below 44px, and the bloomed reading grows taller than the wheel rather than scrolling inside it. |

---

## Implementation Guidance

### Recommended Stack
| Concern | Recommendation | Why |
|---------|---------------|-----|
| Framework | Next.js (App Router) | SSR for OG images, file-based routing, React Server Components for performance |
| Components | shadcn/ui (modified) | Accessible primitives, easy to reskin with the manuscript aesthetic |
| Styling | Tailwind CSS | Utility-first pairs well with design tokens; easy to enforce spacing scale |
| Fonts | Google Fonts: Cormorant Garamond + Noto Serif Khmer | Free, high-quality, variable weight support |
| Animation | Motion (`motion/react`) + React `<ViewTransition>` + CSS | Stagger for cycle reveal and press springs (Motion); selection glide and panel crossfade (native view transitions); hover and scroll-driven reveals (CSS) |
| Icons | Lucide (minimal usage) | Only for UI chrome (language toggle, share button). Cultural symbols should be Unicode/SVG, not icon library. |
| Charts | Custom SVG/CSS (no chart library) | The cycle chart is too bespoke for Recharts/D3. CSS Grid + styled divs is simpler and more controllable. |

### Key Patterns
- **Paper texture:** CSS `background-image` with inline SVG noise pattern at low opacity, or a single small PNG texture repeated. Keep file size under 5KB.
- **Gold glow:** `box-shadow: 0 0 12px rgba(184, 134, 11, 0.25)` — subtle, never garish.
- **Cycle wheel:** orbs absolutely placed on a square size container (`@container`), positions from a polar helper, so the wheel scales with no media queries.
- **Stagger animation:** Motion (`motion/react`) `variants` with `staggerChildren: 0.04` on the parent.
- **Underline inputs:** `border: none; border-bottom: 1px solid #D5CBBA; background: transparent;` with `focus:border-color: #B8860B` transition.
- **Scroll snap timeline:** `overflow-x: auto; scroll-snap-type: x mandatory;` with each year dot as `scroll-snap-align: center`.
- **Dark inversion for zero state:** CSS class toggle that swaps `background` and `color` on the detail panel. Use CSS transitions, not conditional rendering.
- **prefers-reduced-motion:** `<MotionConfig reducedMotion="user">` at the root, plus one global CSS rule that collapses animations, transitions, smooth scrolling and view transitions.

### Tailwind Config Extensions
```js
colors: {
  parchment: '#F5F0E8',
  manuscript: '#FFFDF7',
  'manuscript-alt': '#EDE7DB',
  ink: '#2C2417',
  'ink-light': '#7A6F5F',
  'ink-faint': '#A89F8F',
  gold: '#B8860B',
  'gold-light': '#D4A843',
  border: '#D5CBBA',
  'border-light': '#E8E0D2',
  'tier-very-strong': '#5B7744',
  'tier-strong': '#7A9B6B',
  'tier-moderate': '#B8860B',
  'tier-weak': '#A0522D',
  'tier-zero': '#4A4039',
},
fontFamily: {
  serif: ['Cormorant Garamond', 'Noto Serif Khmer', 'Georgia', 'serif'],
}
```

### Accessibility Checklist
- [ ] All tier colors pass WCAG AA against parchment background (verify `#5B7744`, `#7A9B6B`, `#A0522D` on `#F5F0E8`)
- [ ] Ink text (`#2C2417`) on parchment (`#F5F0E8`): contrast ratio ~11:1 (passes AAA)
- [x] Gold accent (`#B8860B`) on parchment is 2.87:1, so it is decorative only; meaning uses gold-deep `#86620A` (4.92:1)
- [ ] Gold text on charcoal (`#4A4039`): verify contrast for zero-state panel
- [ ] Every tier has a non-color symbol (●, ◕, ◑, ◔, ⊙)
- [x] Focus ring: 2px solid gold-deep with 2px offset (4.9:1 on parchment)
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Cycle wheel orbs keyboard navigable as tablist
- [ ] Timeline scrollable via keyboard (arrow keys)
