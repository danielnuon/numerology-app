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
│     ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐             │
│     │3│6│9│5│8│⑪│2│○│2│4│6│8│             │ ← cycle chart (12 columns)
│     └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘             │    like a row of temple pillars
│                                             │
│     ╔═══════════════════════════╗            │
│     ║  Year Detail Panel        ║            │ ← interpretation card
│     ║  Number · Tier · Guidance ║            │
│     ╚═══════════════════════════╝            │
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

**Luck tier colors** are the colour of each tier's lantern light. Pillars, timeline dots and the detail panel are lit from below by their tier (`data-tier` sets `--lamp`; `.lamp`, `.lamp-orb`, `.lamp-panel` apply it), and tier symbols take the solid colour:
| Tier | Value | Usage |
|------|-------|-------|
| Very Strong (10–11) | `#BFE0A5` | Pale sage light — brightest |
| Strong (7–9) | `#A9CC93` | Sage light |
| Moderate (4–6) | `#E2B65A` | Lamp gold |
| Weak (1–3) | `#D98A62` | Ember — also used for form errors (6.8:1) |
| Zero (reset) | `#0E0B11` | An unlit niche, darker than the page; its symbol stays faint |

**Atmosphere:** `LanternSky` draws 38 specks of dust drifting slowly upward through the light (20–60 s to cross the screen, with a slow flicker). It pauses while the tab is hidden and is drawn once, still, with Reduce Motion.

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
**Type:** Horizontal 12-column grid
**Purpose:** Display the 12-number life cycle — the core output

**Design:** 12 vertical "pillars" arranged in a row, reminiscent of a temple colonnade. Each pillar:
- Contains the cycle number at center (large, bold, `Cormorant Garamond` 32px)
- Background subtly tinted by luck tier color at 15–20% opacity (the pillar "glows")
- Base shows the life area label in small caps
- Top shows the tier symbol (●, ◕, ◑, ◔, ⊙)

```
  ●     ◕     ●     ◑     ◕     ●     ◔     ⊙     ◔     ◑     ◕     ◕
┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│   │ │   │ │   │ │   │ │   │ │   │ │   │ │   │ │   │ │   │ │   │ │   │
│ 3 │ │ 6 │ │ 9 │ │ 5 │ │ 8 │ │11 │ │ 2 │ │ 0 │ │ 2 │ │ 4 │ │ 6 │ │ 8 │
│   │ │   │ │   │ │   │ │   │ │   │ │   │ │   │ │   │ │   │ │   │ │   │
└───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘
Self  Fam   Move  Home  Money Ally  Rel   Health Stat  Opp   Karma Prot
```

**Current year pillar:** 2px gold-deep border and a gold-deep corner dot. Not raised: raising reads as pressed or selected.

**States:**
| State | Description |
|-------|-------------|
| Default | Pillar with tinted background, number, tier symbol, area label |
| Hover | Pillar lifts 2px with a raised shadow (mouse only), cursor pointer |
| Pressed | Settles back and scales to 0.97 on a no-bounce spring |
| Selected | 2px ink outline that glides between pillars (view transition); detail panel content crossfades |
| Zero | Pillar background is charcoal (`#4A4039`), number rendered in light text. No looping animation |

**Interaction:** Pillars behave like tabs. One is always selected (the current year on load), tapping the selected pillar again does nothing, and the detail panel beneath is its tab panel.

**Mobile (< 768px):** Two rows of 6 pillars, or a horizontally scrollable single row with snap points.

**Accessibility:**
- Each pillar is a `<button>` with `role="tab"` in a `tablist`
- `aria-label`: "Year 2024, cycle number 8, strong luck, Health domain"
- Keyboard: arrow keys navigate between pillars, Enter/Space selects
- One Tab stop for the group (roving tabindex); arrows move focus and selection together, Home/End jump to the ends
- Focus ring: 2px gold-deep outline with 2px offset

**Implementation hint:** CSS Grid for the 12-column layout. Each pillar is a flex-column. Tier colors via CSS custom properties. Selection outline glides via React `<ViewTransition>`; entrance stagger via Motion; hover/press via CSS transitions.

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
3. The form card gently fades back (opacity 0.6) and the cycle chart section fades in below
4. Cycle pillars animate in one by one, left to right, with 40ms stagger — each pillar rises 8px and fades in (400ms, `--ease-enter`)
5. After all 12 pillars render, the current year pillar glows gold (border + shadow animate in)
6. The total score fades in below the chart: "Your life pattern: Balanced (64)"

**Loading state:** Not needed — calculation is instant (client-side). If there's any delay, the button shows a subtle pulse.

**Error state:** Inline validation. The date input underline turns sienna (`#A0522D`), error text fades in below in the same color. No modals, no toasts.

### Pillar Selection
**Trigger:** User clicks/taps a cycle pillar
**Steps:**
1. Previously selected pillar loses gold border (200ms fade)
2. Newly selected pillar gains gold border (200ms fade) and lifts 2px
3. Detail panel content crossfades (old fades out in 150ms, new settles in over 250ms)
4. If timeline is visible, the corresponding year dot scrolls into view

### Timeline Scrubbing
**Trigger:** User clicks a year dot on the timeline or drags/scrolls
**Steps:**
1. Selected dot gains gold fill
2. Corresponding cycle pillar gains selection state
3. Detail panel updates
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
| `--shadow-card` / `--shadow-raised` | see globals.css | Resting card / hovered pillar |

**Rules**
- Looks interactive if and only if it is: every control has a pointer cursor, hover (mouse only), a gold-deep focus ring and a pressed state. Static cards have none of these.
- One meaning per visual: gold-deep = now, ink outline = selected, focus ring = keyboard.
- Interface motion explains a change; movement stays at 10px or less. The only continuous motion is the ambient dust, which is decorative, slow, and stops with Reduce Motion.
- Entrance: the title "kindles" out of the dark (blur and letter-spacing settle, 1.6s), then the subtitle and first card follow (`.rise` with `--rise-delay`).
- Selection changes run inside `startTransition`, so React `<ViewTransition>` animates the selection outline (shared element) and panel crossfade natively.
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
| Mobile overflow (12 pillars) | Horizontally scrollable with gradient fade on edges indicating more content. Snap scroll to pillar boundaries. |

---

## Implementation Guidance for /cook

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
- **Pillar grid:** `display: grid; grid-template-columns: repeat(12, 1fr); gap: 8px;` — simple and responsive.
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
- [ ] Cycle pillars keyboard navigable as tablist
- [ ] Timeline scrollable via keyboard (arrow keys)
