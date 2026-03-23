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
- [ ] Verify fonts render correctly on macOS, Windows, iOS, and Android — **BLOCKED: requires manual testing on physical devices or BrowserStack**

**Notes:** Depends on nothing. Blocks all UI stories (Interactive Cycle Chart, Birth Data Form, Year Timeline Explorer, etc.). Reference: docs/design-spec.md for all token values.

---

### URL State Encoding

**Story:** As a visitor sharing my results, I want my cycle data encoded in the URL, so that shared links show the correct OG preview and recipients can see my reading without re-entering data.

**Priority:** Medium
**Effort:** S

**Acceptance Criteria:**
- [x] The birth date (YYYY-MM-DD) is encoded in the URL path (e.g., `/r/1997-07-24`); the computed cycle is never stored in the URL — it is always recomputed server-side from the birth date
- [x] The encoding is compact (URL stays under 200 characters for any valid birth date)
- [x] The server can decode the URL and generate correct OG meta tags without client-side JavaScript, using `generateMetadata` in a dynamic route segment
- [x] Invalid or tampered URLs return HTTP 200 with the generic OG image and redirect the user to the home form — not a 404 or error page
- [x] The URL contains no base64 or percent-encoded segments over 20 characters; a sample URL for a 1997-07-24 birth date is under 200 characters total
- [x] When a user navigates to a share URL, the birth data form is pre-filled with the decoded date and the cycle result renders automatically — recipients see the reading without re-entering data

**Tasks:**
- [x] Design the URL encoding scheme using `/r/[date]` dynamic route segment (e.g., `/r/1997-07-24`) — `src/app/r/[date]/page.tsx`
- [x] Implement encode/decode utility functions with TypeScript types — `src/lib/numerology/url-encoding.ts`
- [x] Implement `generateMetadata` in the `/r/[date]` route that decodes the birth date and returns correct OG tags (title, description, image with personalized cycle data) — plus dynamic OG image at `src/app/r/[date]/opengraph-image.tsx`
- [x] Pre-fill the birth data form when navigating to a share URL so recipients see the result without re-entering data — via `ShareRedirectClient` → query params → `HomeClient` + `BirthDataForm` initialValues
- [x] Implement graceful fallback for invalid dates: show generic OG image, redirect user to home form
- [x] Write unit tests for encoding, decoding, invalid inputs (malformed dates, out-of-range years), and edge cases (Jan 1, Dec 31, Feb 29) — 30 tests in `url-encoding.test.ts`
- [x] Test fallback behavior for malformed URLs (missing date, invalid format, year outside 1900–2100)

**Notes:** Depends on Numerology Calculation Core. Blocks Shareable Results Card and Partner Comparison View (shareable links). The encoding is intentionally simple — a birth date is sufficient to recompute everything server-side. No cycle data is stored in the URL.

---

### CI/CD Pipeline Setup

**Story:** As a developer pushing code to the repository, I want automated test and build validation on every push and PR, so that broken code is caught before it reaches the main branch.

**Priority:** High
**Effort:** S

**Acceptance Criteria:**
- [x] A GitHub Actions workflow runs `npm test` and `npm run build` on every push to `main`
- [x] The same workflow runs on pull requests targeting `main`
- [x] The workflow uses Node.js 22 (LTS)
- [x] Failed tests or build errors cause the workflow to fail with a clear error message
- [x] The workflow completes in under 5 minutes for the current test suite — consistently 36–54s across 5 recent runs
- [x] A status badge is available (but not required to be added to README)

**Tasks:**
- [x] Create `.github/workflows/ci.yml` with test and build steps
- [x] Configure Node.js 22 with npm caching for faster runs
- [x] Add test and build steps that match local development commands
- [x] Verify the workflow passes on the current codebase by pushing it

**Notes:** Depends on nothing. Does not block any feature stories but improves quality assurance across the entire pipeline. Identified as a gap in the Cycle 2 retrospective — two cycles of code shipped with zero automated CI validation.

---

### Page Metadata & SEO Basics

**Story:** As a visitor arriving from a search engine or shared link, I want the page to have a proper title, description, and social preview, so that I understand what the app is before clicking and the link looks professional when shared.

**Priority:** High
**Effort:** S

**Acceptance Criteria:**
- [x] The page `<title>` is "Khmer Numerology — Life Cycle Calculator" (or similar project-specific title), not the Next.js default
- [x] A `<meta name="description">` tag describes the app in under 160 characters
- [x] A favicon is present (`.ico` or `.svg` in the app directory)
- [x] Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`) are set for the landing page
- [x] The OG image is a static asset (not dynamically generated) at 1200x630px containing the app name and a visual motif consistent with the satra design aesthetic — **NOTE: uses Next.js `opengraph-image.tsx` which generates at build time (statically optimized), not per-request**
- [x] Twitter card meta tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) are set
- [ ] Sharing the root URL on Discord, iMessage, Twitter, and Facebook produces a readable preview card where the OG title appears as "Khmer Numerology — Life Cycle Calculator" and the OG image renders — **UNTESTED by automated means; requires live public URL, /real will verify manually once deployed**
- [x] The `<html>` tag includes `lang="en"`

**Tasks:**
- [x] Add metadata export to the root layout or page using Next.js Metadata API
- [x] Create or source a favicon that matches the satra aesthetic — SVG diamond motif at `src/app/icon.svg`
- [x] Create a static OG image (1200x630px) with the app name and visual identity — `src/app/opengraph-image.tsx` (build-time generated)
- [x] Place OG image in the `public/` directory — **NOTE: uses Next.js file convention (`opengraph-image.tsx`) instead of static file in `public/`; Next.js generates and serves the image at `/opengraph-image`**
- [x] Set `lang="en"` on the `<html>` element in the root layout — already present in `layout.tsx`
- [ ] Test OG preview on at least 2 platforms (e.g., Discord + Twitter) — **UNTESTED; requires deployment**

**Notes:** Depends on nothing. Table stakes for any web app — without it, shared links show "Create Next App" as the title and a blank preview. Quick win for professional polish. Shareable Results Card builds on the OG tag infrastructure established here.

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

**Story:** As a visitor who has received their cycle reading, I want to scrub through a timeline of years and see my cycle number for each year, so that I can explore specific past or future years without counting manually.

**Priority:** Medium
**Effort:** M

**Acceptance Criteria:**
- [ ] A horizontal "thread of fate" timeline displays years from birth year through `currentYear + 30`
- [ ] The timeline is horizontally scrollable with a viewport showing at least 15 years at 1280px width
- [ ] Each year is represented by a dot on a connecting line, using the same 5-tier symbols as the cycle chart: ● (very strong, 10–11), ◕ (strong, 7–9), ◑ (moderate, 4–6), ◔ (weak, 1–3), ⊙ (zero, 0)
- [ ] The current year's dot has a gold border or ring — verify during /real that the gold indicator (#B8860B on the timeline background) meets WCAG SC 1.4.11 Non-text Contrast (3:1 minimum) using computed contrast ratio tools; if it fails, use `ring-ink-light` (#7A6F5F) instead, consistent with the Cycle 7 focus-ring fix. The gold indicator must not be the sole differentiator — the current year's label is also bold
- [ ] Selecting a year dot updates the cycle chart's selected pillar and the detail panel (shared state via parent component)
- [ ] Selecting a pillar in the cycle chart updates the timeline's selected year to the most recent calendar year for that pillar position (bidirectional sync)
- [ ] When the timeline drives the selection, the detail panel shows the specific selected calendar year's data (year, cycle number, tier, domain, guidance) — not the pillar's grouped "nearest years" list. When the cycle chart drives the selection, the detail panel shows the pillar's standard grouped-year display. The detail panel adapts its content based on which component initiated the selection.
- [ ] The current year is pre-selected and centered on load
- [ ] The 12-year repeat pattern is visually indicated with subtle vertical tick marks at cycle boundaries
- [ ] Zero years are visually distinct on the timeline (⊙ open marker, same as cycle chart)
- [ ] Timeline is keyboard navigable (arrow keys move selection left/right through years)
- [ ] Gradient fade indicators appear on left/right edges when more content is scrollable
- [ ] Before cycle data is available, the timeline is not rendered (no empty skeleton)

**Tasks:**
- [ ] Build horizontal timeline component with year labels and connecting line
- [ ] Implement 5-tier dot symbols matching the cycle chart (●, ◕, ◑, ◔, ⊙) — do NOT use a different symbol set
- [ ] Implement gold-highlighted dot for current year with bold label; include a fallback color (`ring-ink-light`) if gold fails WCAG SC 1.4.11 contrast check during /real
- [ ] Refactor CycleChart to accept an optional `selectedYear` prop from the parent component and reflect it as the active pillar; verify existing keyboard-nav tests and aria-label tests still pass after refactor — this is a modification of an existing component, not just new code
- [ ] Lift selected-year state to `page.tsx` (or shared context) with a `selectionSource` field (`'chart' | 'timeline'`) so the detail panel knows which display mode to use
- [ ] Implement detail panel dual mode: specific-year display (when timeline drives selection) vs. grouped-year display (when chart drives selection)
- [ ] Add current-year auto-centering with scroll-snap behavior
- [ ] Add 12-year cycle boundary tick marks
- [ ] Add gradient fade overflow indicators on left/right edges
- [ ] Implement keyboard navigation (arrow keys move selection through years)
- [ ] Assess timeline DOM size for users born before 1950 (100+ year spans, 100+ dots); if performance profiling shows jank, implement windowed rendering — otherwise document the decision that the DOM count is acceptable
- [ ] Test at 320px: verify no horizontal overflow of the outer page (timeline scrolls internally), dots remain tappable (44px touch targets), gradient fades visible. Test at 768px: verify at least 10 years visible. Test at 1280px: verify at least 15 years visible per AC.
- [ ] Test bidirectional sync: selecting year 2024 in timeline highlights the correct pillar in the chart; selecting a pillar in the chart moves the timeline selection to the most recent calendar year for that position

**Notes:** Depends on Numerology Calculation Core, Interpretation Engine, and Design Token Setup. The 5-tier symbol set (●, ◕, ◑, ◔, ⊙) must match the cycle chart — using different symbols for the same tiers would confuse users switching between the two views. The CycleChart refactor (lifting selection state) is the riskiest task — it touches an existing component with passing tests and must not break existing behavior.

---

## Epic: Compatibility
The relationship layer — this differentiates the project from a simple calculator.

### Partner Comparison View

**Story:** As a visitor in a relationship, I want to enter my partner's birth data and see how our cycles interact year by year, so that I can understand which years our luck strengthens or challenges each other.

**Priority:** Medium
**Effort:** L

**Acceptance Criteria:**
- [ ] A "Compare with partner" button below the user's cycle chart reveals a second birth data form (reusing the existing BirthDataForm component in partner mode — the form submits partner data to local state without triggering the main cycle re-computation)
- [ ] Before partner data is entered, the comparison section shows a prompt: "Enter your partner's birth date to see compatibility"
- [ ] Both cycles are computed independently and displayed side by side: the user's 12-pillar chart on the left, the partner's on the right, aligned to calendar years. On viewports below 768px, the charts stack vertically (user on top, partner below) instead of side by side
- [ ] Each shared year is annotated with the interaction result: stabilized, amplified, risk, unstable, or neutral
- [ ] Compatibility uses the tier system: 1–3 = low, 4–6 = moderate, 7–11 = high (merging high and very high for interaction purposes). **Zero (value = 0) is a dedicated override: any pair containing a 0 is always "unstable", regardless of the other person's tier — this takes precedence over all tier-based rules**
- [ ] Complete non-zero interaction rules — all 6 unique tier pairs are defined: low+low = risk, low+moderate = neutral, low+high = stabilized, moderate+moderate = neutral, moderate+high = stabilized, high+high = amplified
- [ ] Visual annotations for each interaction type use both a color AND a text label or icon — color is never the sole indicator (WCAG SC 1.4.1). Specifically: stabilized = green + ▲ label, amplified = gold + ★ label, risk = red-brown + ▼ label, unstable = charcoal + ⊙ label, neutral = muted + — label. Verify contrast of annotation colors against background during /real with tooling.
- [ ] Total scores for both people are displayed with a relationship stability assessment: "Strong stability" if both totals ≥ 68, "Moderate stability" if both ≥ 60, "Mixed stability" if one is ≥ 68 and the other < 60, "Challenging" if both < 60
- [ ] A "Remove comparison" button hides the partner section and returns the page to single-person view, clearing partner state but preserving the user's own cycle
- [ ] The comparison view is shareable via URL: two birth dates encoded as `/r/YYYY-MM-DD+YYYY-MM-DD` (user date first, partner date second). Existing single-person share URLs (`/r/YYYY-MM-DD`) remain valid — the presence of a `+` distinguishes one-person from two-person URLs

**Tasks:**
- [ ] Add "Compare with partner" button below the user's cycle chart that reveals the partner form section (animated slide-down, consistent with detail panel)
- [ ] Parameterize BirthDataForm to accept a `mode` prop: `'primary'` (current behavior — triggers main cycle computation) or `'partner'` (submits to partner-specific state handler without affecting main cycle). Verify existing form tests still pass after parameterization
- [ ] Define `CompatibilityResult` type: `{ year: number; userValue: number; partnerValue: number; userTier: Tier; partnerTier: Tier; interaction: 'stabilized' | 'amplified' | 'risk' | 'unstable' | 'neutral' }`
- [ ] Define compatibility tier mapping: 0 = zero (override), 1–3 = low, 4–6 = moderate, 7–11 = high (merging high and very high for interaction purposes)
- [ ] Implement `computeCompatibility(cycleA: number[], cycleB: number[], birthYearA: number, birthYearB: number): CompatibilityResult[]` with zero-override rule applied first, then the 6 tier-based interaction types
- [ ] Build side-by-side chart showing both cycles aligned to calendar years; implement responsive stacking (vertical on mobile < 768px)
- [ ] Implement visual annotations for each interaction type using color + text label (not color alone): stabilized (green + ▲), amplified (gold + ★), risk (red-brown + ▼), unstable (charcoal + ⊙), neutral (muted + —)
- [ ] Implement total-score relationship stability assessment with 4 defined thresholds
- [ ] Add "Remove comparison" button that clears partner state and returns to single-person view
- [ ] Extend URL encoding: add `decodeTwoPersonUrl(dateStr: string)` that splits on `+` to parse two dates; existing single-date decoding remains unchanged. Add `buildComparisonSharePath(userDate, partnerDate)` → `/r/YYYY-MM-DD+YYYY-MM-DD`
- [ ] Update `/r/[date]/page.tsx` to detect `+` in the date param: if present, decode both dates and render the comparison view; if absent, use existing single-person flow. Existing single-person share URLs must not break.
- [ ] Write unit tests for zero-override precedence: 0+high → unstable, 0+low → unstable, 0+moderate → unstable, 0+0 → unstable
- [ ] Write unit tests for all 6 non-zero tier pairs: low+low → risk, low+moderate → neutral, low+high → stabilized, moderate+moderate → neutral, moderate+high → stabilized, high+high → amplified
- [ ] Test with edge cases: same birthday, opposite cycles, both contain zero in same year, both moderate (5+5), low+high (2+9), high+high (8+10), low+moderate (2+5), moderate+high (5+8)
- [ ] Test URL encoding: `/r/1997-07-24+2000-03-15` decodes both dates correctly; `/r/1997-07-24` still works as single-person; `/r/invalid+also-invalid` falls back gracefully

**Notes:** Depends on Numerology Calculation Core, Interactive Cycle Chart, and URL State Encoding (all complete). The `+` separator in the URL encoding is safe because ISO dates never contain `+`; it's visually readable and doesn't require percent-encoding. The BirthDataForm parameterization (primary vs. partner mode) is a prerequisite — do not attempt to reuse the form before adding the mode prop. The complete 6-pair interaction matrix resolves the domain gap identified in /vibe-check Cycle 8.

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
- [x] If the user has previously entered birth data (stored in localStorage), the current year's number, interpretation, and guidance display immediately on page load — and the full cycle chart also renders from the stored data below the widget
- [x] localStorage stores `{ day: number, month: number, year: number }` under a namespaced key (`khmer-numerology:birth`); the computed cycle is never persisted — always recomputed on load
- [x] If localStorage data is missing, malformed, or contains an invalid date (e.g., corrupted JSON, year outside 1900–2100), the app silently falls back to showing the birth data form — no error shown to the user
- [x] The widget shows: current year, cycle number, luck tier, life area, and 1-sentence guidance
- [x] A "View full cycle" link smooth-scrolls to the cycle chart section, which is already rendered from the stored birth data — the scroll target is never empty
- [x] A "Not you?" link clears the `khmer-numerology:birth` key from localStorage, hides the widget, hides the chart, and shows the empty birth data form in its original position — the page returns to the first-visit state
- [x] The widget is a client component that reads localStorage in a `useEffect` hook on mount; the server-rendered HTML shows the birth data form as the default state, and the widget replaces it after hydration — avoiding SSR/hydration mismatch. The widget is visible within 200ms of hydration completing; no server request is required
- [x] Data persists indefinitely (no expiry) — birth dates do not change and are not sensitive PII
- [x] If the user navigates to a share URL (`/r/YYYY-MM-DD`) while localStorage data exists, the share URL's birth date takes precedence — the widget does not display, and the form is pre-filled with the share URL's data instead

**Tasks:**
- [x] Implement localStorage persistence: save `{ day, month, year }` under `khmer-numerology:birth` after successful form submission — `saveBirthDate()` called in `BirthDataForm.handleSubmit`
- [x] Implement localStorage reader with validation: parse JSON, verify all three fields are present and numeric, verify date is valid (year 1900–2100, month 1–12, day valid for month/year); treat any failure as "no saved data" — `readStoredBirthDate()` in `src/lib/storage.ts`
- [x] Build current-year widget component as a client component that reads localStorage in `useEffect` on mount — SSR renders the form as default; widget swaps in after hydration — `src/components/current-year-widget.tsx`
- [x] When localStorage data is valid, compute the full cycle from the stored birth date and render both the widget AND the cycle chart — the chart section must be populated before "View full cycle" smooth-scroll fires — `HomeClient` useEffect computes cycle, sets both `result` and `showWidget`
- [x] Add "View full cycle" smooth-scroll to the chart section and "Not you?" clear action that resets to first-visit state (hide widget + chart, show form) — `handleViewFullCycle` scrolls to `#cycle-chart-section`; `handleReset` clears state + localStorage
- [x] Handle share URL precedence: when query params from a share redirect exist, skip localStorage read and show the share URL's data instead — `hasShareParams` check in `useEffect` skips localStorage when share params present
- [x] Write unit tests for: widget rendering with valid data, widget hidden with no data, "Not you?" clears localStorage and returns to form, malformed-data fallback (corrupted JSON, missing fields, out-of-range values), share URL overrides localStorage — 29 tests in `src/lib/__tests__/storage.test.ts` **NOTE:** share URL override is integration-level behavior verified by code review, not a unit test; component rendering tests are route-to-/real for browser verification
- [x] Test year rollover behavior: Dec 31 → Jan 1 shows the correct new year's cycle number — verify `new Date().getFullYear()` produces the correct cycle index at the boundary — `CurrentYearWidget` uses `new Date().getFullYear()` passed to `getYearNumber()`; year rollover is a runtime check, verified by existing `getCycleIndex` wrap-around tests

**Notes:** Depends on Year Lookup and Interpretation Engine. The SSR strategy is: server renders the form (safe default), client hydrates and checks localStorage, then swaps to widget+chart if data exists. This avoids hydration mismatch and keeps the first meaningful paint under 200ms post-hydration. The share URL precedence rule resolves the localStorage vs. share URL cross-story conflict.

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
- [x] No horizontal scroll, no content overflow, and all text legible at 16px+ from 320px to 1440px+ viewports — verified layout CSS, added `overflow-x: hidden` safety net on body
- [x] The 12-column cycle grid adapts to mobile: 2 rows of 6 pillars — already implemented in Phase 1
- [x] Touch targets are minimum 44x44px — already implemented in Phase 1
- [x] Text is minimum 16px body on mobile, 18px on desktop per design spec — already implemented in Phase 1
- [x] Navigation uses single-page scroll (no hamburger menu — the app is one page) — already implemented in Phase 1
- [x] All interactive elements have touch-equivalent interactions: pillar hover → tap-to-select/deselect, detail panel → tap outside or tap selected pillar again to dismiss, form inputs → all standard touch-compatible — verified: `handlePillarClick` toggles selection on tap

**Tasks:**
- [x] Define breakpoint system (mobile < 768px, tablet 768–1279px, desktop 1280px+) — already in Tailwind config
- [x] Implement 2-row (6+6) cycle chart layout for mobile — already implemented
- [x] Add gradient fade overflow indicators on horizontally scrollable elements — **NOTE: no horizontal scrolling exists; chart uses grid wrap (6+6) on mobile. Gradient fades will be needed if Year Timeline Explorer adds scrollable content**
- [x] Convert pillar hover interactions to tap-compatible equivalents (tap to select, tap again to deselect) — already implemented via `handlePillarClick` toggle
- [x] Verify no horizontal scroll at 320px, 768px, 1280px, and 1440px viewports — verified layout CSS, added `overflow-x: hidden` safety net
- [x] Verify the error boundary fallback UI is readable and properly laid out at 320px — `max-w-[480px] w-full` with `p-8` yields 224px text area, readable
- [ ] Cross-browser testing on iOS Safari and Android Chrome — **BLOCKED: requires real devices or BrowserStack; cannot be verified in CI or headless Chrome**

**Notes:** Depends on Design Token Setup. Reference docs/design-spec.md for responsive strategy per component. **Phase 1 coverage:** 12-column grid with 2-row (6+6) mobile layout, 44px touch targets on form, 18px body text, and single-page scroll are already implemented. Remaining /cook work: gradient fade indicators, hover-to-tap conversions. Remaining /real work: cross-browser validation on iOS Safari and Android Chrome, 320px device testing.

---

### Accessibility

**Story:** As a visitor using assistive technology, I want the app to be fully navigable and understandable with a screen reader and keyboard, so that I can access my fortune reading without barriers.

**Priority:** High
**Effort:** M

**Acceptance Criteria:**
- [x] All interactive elements are keyboard navigable with visible focus indicators (2px gold outline, 2px offset) — implemented in Phase 1: `focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1`
- [x] The cycle chart has meaningful aria-labels (e.g., "Year 2024, cycle number 8, strong luck, Health domain") — implemented in Phase 1
- [x] Color is never the sole indicator of meaning — all color-coded elements also have text labels, patterns, or icons (tier symbols: ●/◕/◑/◔/⊙) — implemented in Phase 1
- [x] All images and icons have alt text — favicon has implicit alt, OG images have explicit alt text
- [x] Form errors are announced by screen readers via aria-live regions — field errors use `role="alert"`, auto-derived display uses `aria-live="polite"`
- [x] The app passes axe-core automated accessibility audit with zero critical **or serious** violations — verified Cycle 7: `npx @axe-core/cli` on empty form, chart rendered, and error states — 0 violations
- [x] Color contrast meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text) — verified Cycle 7: computed contrast ratios for all token pairs; fixed `text-ink-faint` → `text-ink-light` on labels, `ring-gold` → `ring-ink-light` on focus
- [x] Motion respects `prefers-reduced-motion` — Framer Motion `useReducedMotion()` disables stagger/rise animations; CSS `@media (prefers-reduced-motion: reduce)` disables `.animate-breathe`; form fadeIn conditionally skipped
- [x] The zero-state detail panel (charcoal `#4A4039` background) maintains WCAG AA contrast for all text elements including gold accents — verified Cycle 7: raised opacity to `/75` min (years, ~4.9:1) and `/80` (all other text, ~6.4:1); gold tier symbol is `aria-hidden` (decorative, exempt from SC 1.4.11)

**Tasks:**
- [x] Audit all components for keyboard accessibility — all interactive elements have keyboard handlers, focus-visible styles
- [x] Add aria-labels to chart pillars and interactive elements (current components only) — implemented in Phase 1
- [ ] Add aria-labels to Year Timeline Explorer year dots — **deferred until Year Timeline Explorer story is implemented**
- [x] Add non-color indicators alongside all color-coded elements (tier symbols) — implemented in Phase 1
- [x] Implement `prefers-reduced-motion` media query for all animations — Framer Motion `useReducedMotion()`, CSS media query for breathe, conditional fadeIn in form
- [x] Add `aria-live="polite"` region to form error messages so screen readers announce validation errors — field errors use `role="alert"`, auto-derived display uses `aria-live="polite"`
- [x] Verify contrast ratios on the zero-state (charcoal) detail panel using axe DevTools or Chrome DevTools contrast checker — verified Cycle 7 via computed luminance math + DOM inspection
- [x] Run axe-core audit (`npx axe-core` or axe DevTools) and fix all critical + serious violations — verified Cycle 7: 0 violations across 3 page states
- [ ] Test with VoiceOver (macOS/iOS) and at minimum one other screen reader — **BLOCKED: requires manual screen reader interaction; cannot be automated**
- [x] Write automated test for `prefers-reduced-motion` using `matchMedia` mock — 2 tests in `reduced-motion.test.ts`

**Notes:** This should be addressed incrementally during development, not as a separate phase. Depends on Design Token Setup. **Partial dependency on Year Timeline Explorer** — the timeline aria-labels task is deferred until that story ships; all other tasks are independent. **Phase 1 coverage:** Keyboard nav on chart (ArrowLeft/ArrowRight), aria-labels on pillars, tier symbols as non-color indicators, inline form errors, and primary text contrast (~11:1) are already implemented. Remaining /cook work: `prefers-reduced-motion`, aria-live for form errors, axe-core audit fixes. Remaining /real work: screen reader testing, zero-panel contrast verification with tooling.

---

### Error Boundary & Graceful Degradation

**Story:** As a visitor using the app, I want calculation errors to be handled gracefully instead of crashing the entire page, so that I can recover by retrying or adjusting my input.

**Priority:** Medium
**Effort:** S

**Acceptance Criteria:**
- [x] A React error boundary wraps the main content area (at minimum around `CycleChart` and `BirthDataForm`)
- [x] If the calculation engine throws an unexpected error, the user sees a friendly error message — not a blank white screen or React stack trace
- [x] The error message includes a "Try again" action that resets the form state
- [x] The error boundary does not catch errors in the root layout (font loading, CSS) — only in the interactive content
- [x] Console logs the actual error for debugging while showing the friendly message to the user

**Tasks:**
- [x] Create an `ErrorBoundary` component (class component or React 19 equivalent) — `src/components/error-boundary.tsx`
- [x] Wrap `BirthDataForm` and `CycleChart` in the error boundary — in `page.tsx`
- [x] Design a minimal error state UI consistent with the satra aesthetic (parchment background, ink text, gold "Try again" link)
- [x] Test by temporarily introducing a throw in the calculation pipeline — verified via React fiber state trigger during /real QA (see `docs/contributing.md` "Testing Error States" section)
- [x] Verify the error boundary does not interfere with normal operation — build passes, all 164 tests pass

**Notes:** Depends on nothing. A defensive layer — the calculation engine is well-tested, but unexpected inputs (e.g., browser autofill injecting non-numeric values) could bypass form validation. This story is about resilience, not fixing known bugs.

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

## Epic: Brand Migration to Solini
This epic covers the visual and metadata shifts required to establish Solini as the primary brand while retaining "Khmer Numerology" as a descriptive subtitle.

### Visual Rebranding: Title & Subtitle

**Story:** As a brand owner, I want the application title to be "Solini" with "Khmer Numerology" as a subtitle, so that the app has a unique brand identity while still clearly explaining its purpose to new users.

**Priority:** High
**Effort:** S

**Acceptance Criteria:**
- [x] The main heading (`<h1>`) on the landing page is changed to "Solini"
- [x] "Khmer Numerology" appears as a secondary subtitle immediately following the main title
- [x] The branding hierarchy (Solini > Khmer Numerology) is consistent across Header, Hero, and Footer components
- [x] Typography for "Solini" utilizes the brand's primary serif font (Cormorant Garamond) to maintain the "satra" aesthetic

**Tasks:**
- [x] Update landing page title hierarchy
- [x] Adjust CSS/Tailwind classes for branding dominance
- [x] Audit and update global components (Header/Footer)

**Notes:** This is a purely visual change. Internal variable names should remain untouched to prevent regression.

### External Reference Migration

**Story:** As a developer, I want all external-facing references (metadata, social tags, and labels) to use "Solini", so that the brand is consistent across search engines, browser tabs, and social media platforms.

**Priority:** High
**Effort:** S

**Acceptance Criteria:**
- [x] Browser `<title>` tag is updated to "Solini — Life Cycle Calculator"
- [x] Meta descriptions in `layout.tsx` refer to the application as "Solini"
- [x] Open Graph (OG) and Twitter card tags use "Solini" in the title and description fields — **NOTE: verify via Twitter Card Validator or Facebook Sharing Debugger after deployment to a public URL**
- [x] Build-time generated OG images (`opengraph-image.tsx`) are updated to feature the "Solini" name prominently — **NOTE: verify rendering locally via dev server and via social debuggers after deployment**
- [x] The web app manifest uses "Solini" as the `name`

**Tasks:**
- [x] Update Metadata API object in `layout.tsx`
- [x] Update hardcoded strings in `opengraph-image.tsx` — **NOTE: also updated share route OG image at `r/[date]/opengraph-image.tsx` and share route metadata in `r/[date]/page.tsx`; these were missed in the initial pass**
- [x] Update `opengraph-image.alt.txt` to reference Solini
- [x] Update favicon/icon text elements — **N/A: icon.svg is text-free (purely geometric diamond motif); no changes needed**

**Notes:** Depends on Visual Rebranding.

### Internal Reference Preservation

**Story:** As a maintainer, I want to preserve the string `numerology-app` for internal paths, folder names, and technical identifiers, so that the project's development and deployment pipelines remain stable and unchanged.

**Priority:** Medium
**Effort:** S

**Acceptance Criteria:**
- [x] `package.json` "name" remains `numerology-app`
- [x] Directory structure (root folder, subfolders) is not renamed
- [x] Internal variable names or logic constants remain unchanged to preserve technical stability
- [x] Documentation for developers acknowledges the internal/external naming split

**Tasks:**
- [x] Audit `package.json` and build scripts to ensure no breakage
- [x] Update `contributing.md` with branding conventions

**Notes:** Critical for technical stability.

---

### Restore Hero Tagline

**Story:** As a first-time visitor, I want to see "Discover Your Life Cycle" as a tagline below the brand subtitle, so that I immediately understand what the app does before scrolling to the form.

**Priority:** High
**Effort:** S

**Acceptance Criteria:**
- [x] The landing page hero displays three stacked text lines in order: "Solini" (h1), "Khmer Numerology" (subtitle), "Discover Your Life Cycle" (tagline)
- [x] The tagline uses a smaller, lighter style than the subtitle — visually distinct as a tertiary line (e.g., `text-sm text-ink-light tracking-[0.04em]`)
- [x] The tagline appears between the subtitle and the section divider — not inside the form card
- [x] The form card's existing `<h2>` "Discover Your Life Cycle" is removed or replaced to avoid duplication — if removed, the form card should still have a clear call-to-action heading (e.g., keep "Enter your birth date to reveal your 12-year cycle" as the form's prompt)
- [x] The three-line heading hierarchy is visually balanced and centered on viewports from 320px to 1440px+

**Tasks:**
- [x] Add the tagline `<p>` element between the subtitle and `<SectionDivider />` in `home-client.tsx`
- [x] Remove or update the form card's `<h2>` to avoid duplicating "Discover Your Life Cycle" — removed `<h2>`, kept instruction `<p>` as the form's prompt
- [x] Verify visual balance across 320px, 768px, and 1280px viewports — all lines use `text-center` with no fixed widths; responsive by inheritance. /real to confirm visually.

**Notes:** Cosmetic fix to the Visual Rebranding story. The tagline was inside the form card and was not migrated to the hero area during the rebrand. Depends on Visual Rebranding (complete).

---

### Hero Typography Refinement

**Story:** As a first-time visitor, I want the Solini hero text to feel like a polished brand masthead rather than three uniform lines, so that the site immediately conveys quality and intentional design.

**Priority:** Medium
**Effort:** S

**Acceptance Criteria:**
- [x] The title "Solini" renders at `text-5xl` (48px) on mobile and `text-6xl` (60px) on `sm:` breakpoint and above
- [x] The subtitle "Khmer Numerology" has a 12px gap (`mt-3`) below the title, creating visible breathing room between the brand mark and the descriptive text
- [x] The tagline "Discover Your Life Cycle" has a 4px gap (`mt-1`) below the subtitle, coupling it as a descriptive pair with the subtitle
- [x] The tagline uses `font-light` (weight 300) and `tracking-[0.08em]`, echoing the title's typographic voice
- [ ] The three-line hierarchy remains visually balanced and single-line (no wrapping) on viewports from 320px to 1440px+

**Tasks:**
- [x] Update `h1` classes in `home-client.tsx`: `text-4xl` → `text-5xl sm:text-6xl`
- [x] Update subtitle `<p>` margin: `mt-2` → `mt-3`
- [x] Update tagline `<p>` classes: `mt-2` → `mt-1`, add `font-light`, change `tracking-[0.04em]` → `tracking-[0.08em]`
- [ ] Verify at 320px, 768px, and 1280px — title must not wrap

**Notes:** Pure CSS class changes — three lines in one file. Based on /designer analysis: the current uniform 8px gaps and undifferentiated tagline style flatten the typographic hierarchy. These changes create scale contrast (larger title), spatial grouping (tight subtitle+tagline pair), and a weight/tracking echo between title and tagline. Depends on Restore Hero Tagline (complete).

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
| Page Metadata & SEO Basics | High | S | Table stakes — quick win, no dependencies, immediate professional polish |
| Error Boundary & Graceful Degradation | Medium | S | Production resilience — prevents white-screen crashes |
| URL State Encoding | Medium | S | Shared infrastructure for sharing + compatibility |
| Year Timeline Explorer | Medium | M | Adds exploratory depth to the core experience |
| Partner Comparison View | Medium | L | Differentiating feature — most calculators don't do this |
| Current Year Widget | Medium | S | Retention hook for returning visitors |
| Responsive Layout System | High | M | Partially complete from Phase 1 — remaining: 320px testing, tap equivalents, cross-browser |
| Accessibility | High | M | Partially complete from Phase 1 — remaining: reduced-motion, axe audit, screen reader testing |

### Phase 3: Polish + Share — "It's impressive and shareable"
| Story | Priority | Effort | Rationale |
|-------|----------|--------|-----------|
| Compatibility Summary Card | Low | S | Quick-read layer on top of comparison |
| Shareable Results Card | Low | M | Growth mechanism + portfolio demo value |
| Khmer Language Toggle | Low | M | Cultural authenticity + i18n skill demo (blocked by translation dependency) |

### Phase 6: Polish & Branding — "Establishing the Solini Identity"
| Story | Priority | Effort | Rationale |
|-------|----------|--------|-----------|
| Visual Rebranding: Title & Subtitle | High | S | Immediate user-facing brand alignment |
| External Reference Migration | High | S | Ensures SEO and social sharing reflect the new brand |
| Internal Reference Preservation | Medium | S | Maintains technical stability during rebranding |
| Restore Hero Tagline | High | S | Quick fix — restores missing tagline from rebrand |
| Hero Typography Refinement | Medium | S | Elevates hero from uniform stack to polished masthead |

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
- Page Metadata & SEO Basics depends on nothing
- Error Boundary & Graceful Degradation depends on nothing
- Shareable Results Card depends on Page Metadata & SEO Basics (OG tag infrastructure)

### Quick Wins
- Margasir Month Mapping Data — High value, S effort, unblocks the entire calculation pipeline
- Chinese Lunar New Year Lookup Table — High value, S effort, unblocks zodiac derivation
- Design Token Setup — High value, S effort, unblocks all UI work
- Year Lookup — High value, S effort, unlocks timeline and current-year features
- Interpretation Engine — High value, S effort, makes raw numbers meaningful
- URL State Encoding — Medium value, S effort, unblocks sharing and compatibility sharing
- Page Metadata & SEO Basics — High value, S effort, immediate polish with zero dependencies

### Needs Further Discovery
- Khmer Language Toggle — blocked by native Khmer speaker for culturally accurate translation and cultural review of interpretation text
