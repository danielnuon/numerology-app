# Brain Dump: Khmer Numerology Web Application

## Overview
19 user stories organized across 6 epics, covering the full scope of a portfolio-grade numerology web application — from core calculation engine to interactive visualization, compatibility features, and polish layers that demonstrate senior engineering sensibility.

---

## Epic: Foundation Infrastructure
Shared data, configuration, and tooling that multiple stories depend on. Must be completed before UI work begins.

### Margasir Month Mapping Data

**Story:** As a developer implementing the calculation engine, I want a verified mapping table from Gregorian months to Margasir-relative positions, so that the month row is computed correctly for any birth month.

**Priority:** High
**Effort:** S

**Acceptance Criteria:**
- [x] A static mapping defines each Gregorian month's Margasir-relative position (1–12)
- [x] The mapping is fixed (does not vary by year) — July is always position 8 per the system specification
- [x] All 12 months are mapped with no gaps or duplicates
- [x] The mapping is verified against the worked example: July → position 8, producing month row `8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7`
- [x] The mapping is exported as a typed constant, not buried inside a function

**Tasks:**
- [x] Define the complete Gregorian-to-Margasir mapping table as a TypeScript constant
- [x] Write unit tests verifying all 12 months produce correct month rows
- [x] Verify against the worked example in system-overview.md

**Notes:** Depends on nothing. Blocks Numerology Calculation Core and Birth Data Form. The mapping is fixed because the Margasir calendar month cycle has a fixed offset from Gregorian months — it does not shift year to year like lunar new year does.

---

### Chinese Lunar New Year Lookup Table

**Story:** As a developer implementing zodiac derivation, I want a lookup table of Chinese New Year dates for years 1900–2100, so that births in January/February are assigned to the correct zodiac animal.

**Priority:** High
**Effort:** S

**Acceptance Criteria:**
- [x] A static dataset maps each year (1900–2100) to its Chinese New Year date (month and day)
- [x] Given a birth date, the system determines whether it falls before or after Chinese New Year that year
- [x] Births before Chinese New Year are assigned the previous year's zodiac animal
- [x] Births on or after Chinese New Year are assigned the current year's zodiac animal
- [x] The dataset is verified against at least 10 known dates from an authoritative source (e.g., Hong Kong Observatory)
- [x] The dataset is exported as a typed constant (e.g., `Record<number, { month: number; day: number }>`)

**Tasks:**
- [x] Source Chinese New Year dates for 1900–2100 from an authoritative reference
- [x] Define the dataset as a TypeScript constant: `Record<number, { month: number; day: number }>`
- [x] Implement `getZodiacYear(birthDate: Date): number` using the lookup table
- [x] Write unit tests for: birth on CNY exactly, birth one day before CNY, birth one day after CNY, birth in March (unambiguous), births at year boundaries (Dec 31 / Jan 1)

**Notes:** Depends on nothing. Blocks Birth Data Form. This is a static dataset (~200 entries, ~4KB). A library like `chinese-year` could be used, but a static table avoids runtime dependencies and is easier to verify.

---

### Design Token Setup

**Story:** As a developer starting UI implementation, I want the design system tokens (colors, typography, spacing) configured in Tailwind, so that all components use consistent values from the design spec.

**Priority:** High
**Effort:** S

**Acceptance Criteria:**
- [x] Tailwind config extends `colors` with all design spec values: parchment, manuscript, ink, gold, border, and all 5 tier colors
- [x] Tailwind config extends `fontFamily` with Cormorant Garamond and Noto Serif Khmer
- [x] Google Fonts are loaded for Cormorant Garamond (weights 300, 400, 500, 600) and Noto Serif Khmer (weights 400, 600)
- [x] No FOUT (Flash of Unstyled Text) — fonts load via `next/font` or `font-display: swap` with a visually similar fallback
- [x] Paper texture background is implemented as a reusable CSS utility class
- [x] Section divider component (horizontal line with centered diamond) is implemented
- [x] Spacing scale matches the design spec: 4, 8, 16, 24, 32, 48, 64, 96, 128

**Tasks:**
- [x] Extend Tailwind config with design spec color tokens
- [x] Configure font loading via next/font for Cormorant Garamond and Noto Serif Khmer
- [x] Create paper texture CSS utility (inline SVG noise at 3–5% opacity)
- [x] Create section divider component
- [ ] Verify fonts render correctly on macOS, Windows, iOS, and Android

**Notes:** Depends on nothing. Blocks all UI stories (Interactive Cycle Chart, Birth Data Form, Year Timeline Explorer, etc.). Reference: docs/design-spec.md for all token values.

---

### URL State Encoding

**Story:** As a visitor sharing my results, I want my cycle data encoded in the URL, so that shared links show the correct OG preview and recipients can see my reading without re-entering data.

**Priority:** Medium
**Effort:** S

**Acceptance Criteria:**
- [ ] Cycle data (birth date or computed cycle array + birth year) is encoded in the URL path or query params
- [ ] The encoding is compact (URL stays under 200 characters)
- [ ] The server can decode the URL and generate correct OG meta tags without client-side JavaScript
- [ ] Invalid or tampered URLs produce a graceful fallback (generic OG image, not an error)
- [ ] The URL is human-readable enough that it doesn't look suspicious when shared (no long base64 blobs)

**Tasks:**
- [ ] Design the URL encoding scheme (e.g., `/r/1997-07-24` or `/r?d=1997-07-24`)
- [ ] Implement encode/decode utility functions with TypeScript types
- [ ] Implement server-side route that decodes the URL and returns correct OG tags
- [ ] Write unit tests for encoding, decoding, invalid inputs, and edge cases
- [ ] Test fallback behavior for malformed URLs

**Notes:** Depends on Numerology Calculation Core. Blocks Shareable Results Card and Partner Comparison View (shareable links). Keep the encoding simple — a birth date is sufficient to recompute everything server-side.

---

### CI/CD Pipeline Setup

**Story:** As a developer pushing code to the repository, I want automated test and build validation on every push and PR, so that broken code is caught before it reaches the main branch.

**Priority:** High
**Effort:** S

**Acceptance Criteria:**
- [x] A GitHub Actions workflow runs `npm test` and `npm run build` on every push to `main`
- [x] The same workflow runs on pull requests targeting `main`
- [ ] The workflow uses Node.js 20.x — **NOTE: currently uses Node 22 (newer LTS); update AC or workflow to align**
- [x] Failed tests or build errors cause the workflow to fail with a clear error message
- [ ] The workflow completes in under 5 minutes for the current test suite
- [x] A status badge is available (but not required to be added to README)

**Tasks:**
- [x] Create `.github/workflows/ci.yml` with test and build steps
- [ ] Configure Node.js 20.x with npm caching for faster runs — **NOTE: workflow uses Node 22; update task or align with AC**
- [x] Add test and build steps that match local development commands
- [x] Verify the workflow passes on the current codebase by pushing it

**Notes:** Depends on nothing. Does not block any feature stories but improves quality assurance across the entire pipeline. Identified as a gap in the Cycle 2 retrospective — two cycles of code shipped with zero automated CI validation.

---

## Epic: Calculation Engine
The pure logic layer — isolated from UI, fully typed, thoroughly tested. This is what proves domain modeling skill.

### Numerology Calculation Core

**Story:** As a visitor entering my birth data, I want the system to compute my 12-number life cycle accurately, so that I receive a correct and meaningful fortune reading.

**Priority:** High
**Effort:** M

**Acceptance Criteria:**
- [x] Given birth month, zodiac year, and weekday, the system produces a 12-number array
- [x] Month row starts at the correct Margasir-relative position for any of the 12 months
- [x] Zodiac row starts at the correct animal number (1–12) and cycles through all 12
- [x] Day row fills only columns 1–7; columns 8–12 receive no day value
- [x] Column sums are reduced via mod 12, where 12 mod 12 = 0 (not 12)
- [x] The worked example (July 24, 1997, Thursday, Ox) produces exactly `3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8`
- [x] Total cycle sum is computed correctly (e.g., 64 for the worked example)
- [x] Calculation logic is a pure function module with zero UI dependencies

**Tasks:**
- [x] Define TypeScript types: `ZodiacAnimal`, `Weekday`, `MonthPosition`, `LifeCycle`, `CycleResult`
- [x] Implement `buildMonthRow(monthPosition: number): number[]`
- [x] Implement `buildZodiacRow(animal: ZodiacAnimal): number[]`
- [x] Implement `buildDayRow(weekday: Weekday): number[]` (7 values only)
- [x] Implement `computeCycle(month, zodiac, day): CycleResult` with column summation + mod 12
- [x] Implement `computeTotalScore(cycle: number[]): number`
- [x] Write unit tests covering all 12 months, all 12 animals, all 7 weekdays, and the zero edge case

**Notes:** This module must be importable by both server and client. No framework dependencies. Depends on Margasir Month Mapping Data.

---

### Year Lookup

**Story:** As a visitor viewing my cycle, I want to see which number corresponds to any given year, so that I can check my luck for past, present, or future years.

**Priority:** High
**Effort:** S

**Acceptance Criteria:**
- [x] Given a birth year and a target year, the system returns the correct cycle number
- [x] The mapping wraps correctly every 12 years (e.g., 2009 = 1997 = 2021)
- [x] Works for any year from 1900 to 2100
- [x] Returns the correct life area domain (1=Self, 2=Family, etc.) for the column position

**Tasks:**
- [x] Implement `getYearNumber(birthYear: number, targetYear: number, cycle: number[]): number`
- [x] Implement `getLifeArea(columnIndex: number): string`
- [x] Write unit tests for wrap-around, past years, future years, and boundary years

**Notes:** Depends on Numerology Calculation Core.

---

### Interpretation Engine

**Story:** As a visitor viewing my cycle number for a year, I want to see a human-readable interpretation of what that number means, so that I understand the guidance without needing to memorize the scale.

**Priority:** High
**Effort:** S

**Acceptance Criteria:**
- [x] Numbers 10–11 display as "Very strong luck" with corresponding guidance
- [x] Numbers 7–9 display as "Strong luck"
- [x] Numbers 4–6 display as "Moderate / neutral"
- [x] Numbers 1–3 display as "Weak luck"
- [x] Number 0 displays as "Reset / unstable" with specific zero-year guidance
- [x] Total score ranges: 0–59 = weak/difficult cycle, 60–67 = balanced/moderate cycle, 68+ = strong/favorable cycle
- [x] Interpretation text is data-driven (not hardcoded inline), allowing future i18n

**Tasks:**
- [x] Define interpretation data structure with number ranges, labels, descriptions, and guidance text
- [x] Implement `interpretYear(number: number): YearInterpretation`
- [x] Implement `interpretTotal(total: number): TotalInterpretation`
- [x] Write unit tests for each tier boundary (0, 1, 3, 4, 6, 7, 9, 10, 11) and total score boundaries (59, 60, 67, 68)

**Notes:** Interpretation text should be stored in a separate data file for easy editing and future Khmer translation.

---

## Epic: Birth Data Input
The entry point. Clean form design, solid validation, and smart defaults.

### Birth Data Form

**Story:** As a first-time visitor, I want to enter my birth date and see my fortune calculated, so that I can explore my life cycle without needing to understand the underlying system.

**Priority:** High
**Effort:** M

**Acceptance Criteria:**
- [x] Form collects: birth date (day, month, year) via a date picker or structured inputs
- [x] System derives the weekday from the date automatically (user does not need to know their birth weekday)
- [x] System derives the Chinese zodiac animal from the birth year using the Chinese Lunar New Year Lookup Table, correctly handling Jan/Feb births
- [x] System maps the Gregorian birth month to the correct Margasir-relative position using the Margasir Month Mapping Data
- [x] Form validates all inputs before submission (no future dates, year range 1900–2100)
- [x] Validation errors appear inline with specific messages (not a generic "invalid" alert)
- [x] On valid submission, the cycle result renders in under 500ms
- [x] Form is usable on mobile (minimum 44px touch targets, no horizontal scrolling)
- [x] The computed cycle is verified against the worked example: July 24, 1997 → `3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8`

**Tasks:**
- [x] Build date input component with day/month/year fields or a date picker
- [x] Implement weekday derivation from date using `new Date(year, month - 1, day)` (local date constructor) — do NOT parse from a date string, which uses UTC and returns the wrong weekday in UTC+ timezones
- [x] Integrate Chinese Lunar New Year Lookup Table for zodiac derivation
- [x] Integrate Margasir Month Mapping Data for month position derivation
- [ ] Add form validation with Zod schema — **NOTE: implemented with custom validation instead of Zod; all ACs are met but library choice deviated from task spec**
- [x] Build inline error display per field
- [x] Connect form submission to the calculation engine
- [x] Add end-to-end validation test: input July 24, 1997 → verify output matches worked example
- [x] Test with edge-case dates: Jan 1, Feb boundary (before/after CNY), Dec 31, leap years

**Notes:** Depends on Margasir Month Mapping Data, Chinese Lunar New Year Lookup Table, and Numerology Calculation Core. The zodiac derivation and Margasir mapping are now separate stories with their own data sources, so this story focuses on the form UI and integration.

---

## Epic: Cycle Visualization
The centerpiece. This is what makes a recruiter stop scrolling.

### Interactive Cycle Chart

**Story:** As a visitor viewing my results, I want to see my 12-number life cycle as an interactive 12-column pillar grid, so that I can immediately grasp the pattern of highs, lows, and resets across my life.

**Priority:** High
**Effort:** L

**Acceptance Criteria:**
- [x] The cycle displays as a horizontal 12-column pillar grid (per design spec), with each pillar representing one cycle position
- [x] Each pillar shows: the cycle number (Cormorant Garamond 32px), the tier symbol (●/◕/◑/◔/⊙), and the life area label in small caps
- [x] Each pillar's background is tinted by its luck tier color at 15–20% opacity: sage green (`#5B7744`/`#7A9B6B`), amber/gold (`#B8860B`), sienna (`#A0522D`), or charcoal (`#4A4039`)
- [x] Color is not the only indicator — each position also shows the numeric value and a tier symbol
- [x] Hovering or tapping a pillar reveals: the nearest calendar years it maps to (most recent past year and next 1–2 upcoming years from today), the luck interpretation, the life area domain, and guidance text via a detail panel below the chart
- [x] The current year's pillar has a gold border (`#B8860B`), subtle gold glow shadow, and is slightly elevated
- [x] Zero-value pillars have a charcoal (`#4A4039`) background, light text, and a subtle breathing pulse animation
- [x] The chart animates on first render: pillars rise from below with 80ms stagger, left to right
- [x] The chart is responsive: 12 columns on desktop, 2 rows of 6 on mobile (<768px), or horizontally scrollable with snap points
- [x] Paper texture background is applied to the chart section
- [x] Contrast passes WCAG 2.1 AA: ink on parchment (~11:1), tier colors on parchment (verify each), gold on parchment (4.8:1, large text only)

**Tasks:**
- [x] Implement 12-column CSS Grid pillar layout
- [x] Implement tier color mapping using design spec values via Tailwind tokens
- [x] Add tier symbols (●/◕/◑/◔/⊙) above each pillar
- [x] Add life area labels in small caps below each pillar
- [x] Build detail panel that slides down (300ms ease-out) on pillar selection
- [x] Compute current-year pillar position using `getCycleIndex(birthYear, new Date().getFullYear())` to identify which column to highlight
- [x] For each pillar, compute the list of nearest calendar years it maps to: `[birthYear + colIndex, birthYear + colIndex + 12, ...]` filtered to a readable range (most recent past + next 1–2 upcoming) for display in the detail panel
- [x] Implement gold border + glow for current year pillar
- [x] Implement zero-state pillar treatment: charcoal background, light text, breathing pulse
- [x] Apply paper texture background to chart section
- [x] Add entry animation with Framer Motion stagger (80ms per pillar)
- [x] Implement responsive 2-row layout for mobile with gradient fade on scroll edges
- [x] Test with screen reader: verify each pillar has aria-label (e.g., "Year 2024, cycle number 8, strong luck, Health domain")
- [x] Test with all possible cycle shapes (all high, all low, contains zero, alternating)

**Notes:** Depends on Numerology Calculation Core, Interpretation Engine, and Design Token Setup. Design decisions are resolved — see docs/design-spec.md for complete visual specification. The chart accepts `birthYear` as a required prop from the Birth Data Form — without it, the current-year pillar cannot be identified. Before cycle data is available, the chart renders an empty/skeleton state (no pillars, just the grid outline with life area labels).

---

### Year Timeline Explorer

**Story:** As a visitor, I want to scrub through a timeline of years and see my cycle number for each year, so that I can explore specific past or future years without counting manually.

**Priority:** Medium
**Effort:** M

**Acceptance Criteria:**
- [ ] A horizontal "thread of fate" timeline displays years from birth year to 30 years in the future (~60 years total)
- [ ] The timeline is horizontally scrollable with a viewport showing ~15–20 years at a time
- [ ] Each year is represented by a dot on a connecting line, with dot size varying by luck tier: large (●) for strong/very strong, medium (○) for moderate, small (◔) for weak, open (◌) for zero
- [ ] The current year's dot is gold-filled
- [ ] Selecting a year dot updates the cycle chart's selected pillar and the detail panel
- [ ] The current year is pre-selected and centered on load
- [ ] The 12-year repeat pattern is visually indicated with subtle vertical tick marks at cycle boundaries
- [ ] Zero years are visually distinct on the timeline (open dot marker)
- [ ] Timeline is keyboard navigable (arrow keys move selection)
- [ ] Gradient fade indicators appear on left/right edges when more content is scrollable

**Tasks:**
- [ ] Build horizontal timeline component with year labels and connecting line
- [ ] Implement dot-size variation by luck tier (large/medium/small/open per design spec)
- [ ] Implement gold-filled dot for current year
- [ ] Build connection between timeline selection and cycle chart pillar selection
- [ ] Add current-year auto-centering with scroll-snap behavior
- [ ] Add 12-year cycle boundary tick marks
- [ ] Add gradient fade overflow indicators on left/right edges
- [ ] Implement keyboard navigation (arrow keys)
- [ ] Test across breakpoints (scrollable on all sizes)

**Notes:** Depends on Numerology Calculation Core, Interpretation Engine, and Design Token Setup.

---

## Epic: Compatibility
The relationship layer — this differentiates the project from a simple calculator.

### Partner Comparison View

**Story:** As a visitor in a relationship, I want to enter my partner's birth data and see how our cycles interact year by year, so that I can understand which years our luck strengthens or challenges each other.

**Priority:** Medium
**Effort:** L

**Acceptance Criteria:**
- [ ] A second birth data form allows entering a partner's birth date (reusing the existing form component)
- [ ] Both cycles are computed independently and displayed side by side (per design spec)
- [ ] Each shared year is annotated with the interaction result: stabilized, amplified, risk, or unstable
- [ ] Compatibility uses the tier system for threshold classification: "low" = weak (0–3) or moderate (4–6), "high" = strong (7–9) or very strong (10–11)
- [ ] Interaction rules: low+high = stabilized, high+high = amplified, low+low = risk, any+0 = unstable
- [ ] When both values are moderate (4–6), the result is "neutral" (a fifth interaction type distinct from the others)
- [ ] Total scores for both people are displayed with a relationship stability assessment
- [ ] The comparison view is shareable via URL state encoding

**Tasks:**
- [ ] Add partner birth data form (reuse existing form component)
- [ ] Define compatibility threshold mapping: 0 = zero, 1–3 = low, 4–6 = moderate, 7–9 = high, 10–11 = very high
- [ ] Implement `computeCompatibility(cycleA, cycleB): CompatibilityResult[]` with all 5 interaction types (stabilized, amplified, risk, unstable, neutral)
- [ ] Build side-by-side chart showing both cycles aligned to calendar years
- [ ] Design and implement visual annotations for each interaction type (color, icon, or label per year)
- [ ] Implement total-score relationship assessment
- [ ] Integrate URL state encoding for shareable comparisons
- [ ] Test with edge cases: same birthday, opposite cycles, both contain zero in same year, both moderate (5+5), low+high (2+9), high+high (8+10)

**Notes:** Depends on Numerology Calculation Core, Interactive Cycle Chart, and URL State Encoding. The "neutral" interaction type (moderate+moderate) resolves the ambiguity flagged during validation — it is neither risk nor stabilized, but a distinct middle ground.

---

### Compatibility Summary Card

**Story:** As a visitor comparing with my partner, I want a summary card showing our overall compatibility, so that I get a quick read without studying the full chart.

**Priority:** Low
**Effort:** S

**Acceptance Criteria:**
- [ ] Card displays both people's total scores and the combined assessment
- [ ] Card shows the count of stabilized, amplified, risk, unstable, and neutral years
- [ ] Card highlights the current year's interaction
- [ ] Card renders correctly when isolated from the page context (no external layout dependencies)
- [ ] Card is exportable as a PNG image at 1200x628px (optimized for social sharing)

**Tasks:**
- [ ] Build summary card component as a self-contained React component with fixed dimensions
- [ ] Implement year-type counting from compatibility results (all 5 types)
- [ ] Add current-year highlight
- [ ] Implement PNG export at 1200x628px via html-to-canvas or Satori

**Notes:** Depends on Partner Comparison View.

---

## Epic: Results & Sharing
Make the output memorable and shareable.

### Current Year Widget

**Story:** As a returning visitor, I want to instantly see my number and guidance for the current year on the landing page, so that I get immediate value without re-entering my data.

**Priority:** Medium
**Effort:** S

**Acceptance Criteria:**
- [ ] If the user has previously entered birth data (stored in localStorage), the current year's number, interpretation, and guidance display immediately on page load
- [ ] The widget shows: current year, cycle number, luck tier, life area, and 1-sentence guidance
- [ ] A "View full cycle" link navigates to the detailed chart
- [ ] A "Not you?" link clears saved data and shows the birth data form
- [ ] Widget loads in under 200ms (no server round-trip for returning users)

**Tasks:**
- [ ] Implement localStorage persistence for birth data
- [ ] Build current-year widget component
- [ ] Add "View full cycle" and "Not you?" actions
- [ ] Test with cleared storage, expired data, and year rollover (Dec 31 → Jan 1)

**Notes:** This is the "hook" for returning visitors. Keep it minimal and fast. Birth date in localStorage is low-risk data (not sensitive PII).

---

### Shareable Results Card

**Story:** As a visitor who has received my reading, I want to share my cycle as a visual card on social media, so that I can show friends and invite them to try the app.

**Priority:** Low
**Effort:** M

**Acceptance Criteria:**
- [ ] A "Share" button generates a visual card image containing: the 12-number cycle, the current year highlight, and the total score interpretation
- [ ] The card includes the app URL as a subtle watermark or footer
- [ ] Cycle data is encoded in the URL so the server can generate correct OG meta tags without client-side JavaScript
- [ ] OG meta tags produce a correct preview card on Twitter, Facebook, iMessage, and Discord
- [ ] The share flow supports: copy link, download image, native share (on mobile)
- [ ] Generated image is under 500KB for a standard 12-number cycle in English (baseline scenario)

**Tasks:**
- [ ] Integrate URL State Encoding to produce shareable links with embedded cycle data
- [ ] Implement server-side OG image generation using the encoded URL data (Satori / @vercel/og)
- [ ] Set dynamic OG meta tags (`og:image`, `og:title`, `og:description`) on the share route
- [ ] Build share button with copy-link, download, and native share options
- [ ] Implement fallback OG image for invalid/missing URL data
- [ ] Test OG preview on Twitter, Facebook, iMessage, Discord
- [ ] Optimize generated image size

**Notes:** Depends on Interactive Cycle Chart and URL State Encoding. OG image generation requires server-side rendering — the URL must contain enough data for the server to recompute the cycle.

---

## Epic: Polish & Accessibility
The details that signal professional-grade work.

### Responsive Layout System

**Story:** As a visitor on any device, I want the entire app to be fully usable across screen sizes, so that I can check my fortune anywhere without needing a specific device.

**Priority:** High
**Effort:** M

**Acceptance Criteria:**
- [ ] All pages are usable from 320px to 1440px+ without horizontal scrolling
- [ ] The 12-column cycle grid adapts meaningfully to mobile: 2 rows of 6 pillars or horizontally scrollable with snap points
- [ ] Touch targets are minimum 44x44px
- [ ] Text remains readable without zooming (minimum 16px body text on mobile, 18px on desktop per design spec)
- [ ] Navigation uses single-page scroll (no hamburger menu — the app is one page)
- [ ] All interactive elements (tooltips, hovers) have touch-equivalent interactions (tap to expand)

**Tasks:**
- [ ] Define breakpoint system (mobile < 768px, tablet 768–1279px, desktop 1280px+)
- [ ] Implement 2-row (6+6) cycle chart layout for mobile
- [ ] Add gradient fade overflow indicators on horizontally scrollable elements
- [ ] Convert hover-dependent interactions to tap-compatible equivalents
- [ ] Implement responsive layout for each page section
- [ ] Test on iOS Safari, Android Chrome, and at least one small-screen device (320px)

**Notes:** Depends on Design Token Setup. Reference docs/design-spec.md for responsive strategy per component.

---

### Accessibility

**Story:** As a visitor using assistive technology, I want the app to be fully navigable and understandable with a screen reader and keyboard, so that I can access my fortune reading without barriers.

**Priority:** High
**Effort:** M

**Acceptance Criteria:**
- [ ] All interactive elements are keyboard navigable with visible focus indicators (2px gold outline, 2px offset)
- [ ] The cycle chart has meaningful aria-labels (e.g., "Year 2024, cycle number 8, strong luck, Health domain")
- [ ] Color is never the sole indicator of meaning — all color-coded elements also have text labels, patterns, or icons (tier symbols: ●/◕/◑/◔/⊙)
- [ ] All images and icons have alt text
- [ ] Form errors are announced by screen readers via aria-live regions
- [ ] The app passes axe-core automated accessibility audit with zero critical violations
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)
- [ ] Motion respects `prefers-reduced-motion` — animations are disabled or reduced
- [ ] The zero-state detail panel (charcoal `#4A4039` background) maintains WCAG AA contrast for all text elements including gold accents

**Tasks:**
- [ ] Audit all components for keyboard accessibility
- [ ] Add aria-labels to chart positions, timeline years, and interactive elements
- [ ] Add non-color indicators alongside all color-coded elements (tier symbols)
- [ ] Implement `prefers-reduced-motion` media query for all animations
- [ ] Verify contrast ratios on the zero-state (charcoal) detail panel for all text colors
- [ ] Run axe-core audit and fix violations
- [ ] Test with VoiceOver (macOS/iOS) and at minimum one other screen reader

**Notes:** This should be addressed incrementally during development, not as a separate phase.

---

### Khmer Language Toggle

**Story:** As a Khmer-speaking visitor, I want to view the app in Khmer script, so that the cultural context of the system is preserved in its original language.

**Priority:** Low
**Effort:** M

**Acceptance Criteria:**
- [ ] A language toggle switches between English and Khmer
- [ ] All interpretation text, labels, navigation, and guidance display in Khmer when selected
- [ ] Cycle numbers display in Western Arabic numerals (0–9) in both languages, not Khmer numerals — this keeps the numerology system consistent and avoids confusion
- [ ] Khmer typography uses Noto Serif Khmer (not Noto Sans Khmer) to match the serif aesthetic of Cormorant Garamond
- [ ] When Khmer is selected, any text rendered in Cormorant Garamond that contains Khmer script switches to Noto Serif Khmer automatically via CSS font-stack fallback
- [ ] Line height and spacing are adjusted for Khmer script (Khmer glyphs are taller — requires increased line-height)
- [ ] Language preference persists across sessions via localStorage
- [ ] The toggle is accessible and discoverable (header area)
- [ ] Zodiac animal names display in Khmer

**Tasks:**
- [ ] Set up i18n framework (next-intl or react-i18next)
- [ ] Extract all user-facing strings into translation files (English as default)
- [ ] Add Khmer web font (Noto Serif Khmer) via next/font with correct weight matching
- [ ] Implement CSS font-stack so Khmer script falls through from Cormorant Garamond to Noto Serif Khmer
- [ ] Adjust line-height and vertical spacing when Khmer locale is active
- [ ] Build language toggle component
- [ ] Implement localStorage persistence for language preference
- [ ] Test Khmer rendering across all pages and components

**Tasks (blocked — require external input):**
- [ ] **DEPENDENCY:** Acquire Khmer translation from a native Khmer speaker — this is a blocker for shipping this story
- [ ] **DEPENDENCY:** Cultural review of translated interpretation text by a native speaker to ensure meaning is preserved, not just literally translated

**Notes:** The translation dependency is a hard blocker, not a nice-to-have. The i18n infrastructure can be built and tested with placeholder Khmer text, but the story cannot be marked complete until real translations are reviewed and integrated.

---

## Product Roadmap

### Phase 1: Core Engine + First Render — "It works and it's correct" ✅ COMPLETE
| Story | Priority | Effort | Rationale |
|-------|----------|--------|-----------|
| Margasir Month Mapping Data | High | S | Foundation data — blocks calculation core |
| Chinese Lunar New Year Lookup Table | High | S | Foundation data — blocks zodiac derivation |
| Design Token Setup | High | S | Foundation UI — blocks all visual components |
| Numerology Calculation Core | High | M | Core logic — everything depends on this |
| Year Lookup | High | S | Required for any year-based display |
| Interpretation Engine | High | S | Required for meaningful output |
| Birth Data Form | High | M | Entry point — without input there's no output |
| Interactive Cycle Chart | High | L | The centerpiece — this IS the product |

### Phase 2: Depth + Relationships — "It's useful and engaging"
| Story | Priority | Effort | Rationale |
|-------|----------|--------|-----------|
| URL State Encoding | Medium | S | Shared infrastructure for sharing + compatibility |
| Year Timeline Explorer | Medium | M | Adds exploratory depth to the core experience |
| Partner Comparison View | Medium | L | Differentiating feature — most calculators don't do this |
| Current Year Widget | Medium | S | Retention hook for returning visitors |
| Responsive Layout System | High | M | Mobile is mandatory for a personal-use app |
| Accessibility | High | M | Non-negotiable for professional quality |

### Phase 3: Polish + Share — "It's impressive and shareable"
| Story | Priority | Effort | Rationale |
|-------|----------|--------|-----------|
| Compatibility Summary Card | Low | S | Quick-read layer on top of comparison |
| Shareable Results Card | Low | M | Growth mechanism + portfolio demo value |
| Khmer Language Toggle | Low | M | Cultural authenticity + i18n skill demo (blocked by translation dependency) |

### Dependencies
- Numerology Calculation Core depends on Margasir Month Mapping Data
- Birth Data Form depends on Margasir Month Mapping Data, Chinese Lunar New Year Lookup Table, and Numerology Calculation Core
- Year Lookup depends on Numerology Calculation Core
- Interpretation Engine depends on Numerology Calculation Core
- Interactive Cycle Chart depends on Numerology Calculation Core, Interpretation Engine, and Design Token Setup
- Year Timeline Explorer depends on Numerology Calculation Core, Interpretation Engine, and Design Token Setup
- Birth Data Form UI depends on Design Token Setup
- Partner Comparison View depends on Numerology Calculation Core, Interactive Cycle Chart, and URL State Encoding
- Compatibility Summary Card depends on Partner Comparison View
- Shareable Results Card depends on Interactive Cycle Chart and URL State Encoding
- Current Year Widget depends on Year Lookup and Interpretation Engine
- Khmer Language Toggle is blocked by external translation dependency

### Quick Wins
- Margasir Month Mapping Data — High value, S effort, unblocks the entire calculation pipeline
- Chinese Lunar New Year Lookup Table — High value, S effort, unblocks zodiac derivation
- Design Token Setup — High value, S effort, unblocks all UI work
- Year Lookup — High value, S effort, unlocks timeline and current-year features
- Interpretation Engine — High value, S effort, makes raw numbers meaningful
- URL State Encoding — Medium value, S effort, unblocks sharing and compatibility sharing

### Needs Further Discovery
- Khmer Language Toggle — blocked by native Khmer speaker for culturally accurate translation and cultural review of interpretation text
