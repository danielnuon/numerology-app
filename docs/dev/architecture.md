# Architecture

Technical architecture of the Khmer Numerology Next.js application.

## Module Structure & Data Flow

```
--- Direct entry (home page) ---

BirthDataForm (input)
  |
  |- On field change: deriveBirthData() [derive.ts]
  |    -> auto-derive zodiac animal + weekday preview (via useMemo)
  |
  +- On submit: computeCycleFromBirthDate() [derive.ts]
      -> deriveBirthData() [derive.ts]
      -> computeCycle() [calculate.ts]
          |- getMonthRow() [months.ts]       -- Margasir-relative month position
          |- getZodiacRow() [zodiac.ts]      -- New-Year-adjusted zodiac animal number
          +- buildDayRow() [calculate.ts]    -- weekday value for columns 1-7 only
      -> CycleResultWithYear -> HomeClient state
          -> CycleChart (display)
              |- getTierTextClass/getCurrentYearColumn() [chart-helpers.ts]
              |- interpretYear() [interpretation.ts]
              |- interpretTotal() [interpretation.ts]
              |- getLifeArea() [year-lookup.ts]
              +- DetailPanel (reading that blooms from the wheel center)
                  |- getYearsForColumn() [chart-helpers.ts]
                  |- TierIcon [components/ui/tier-icon.tsx]
                  |- interpretAreaYear() [interpretation.ts] -- life area x tier reading
                  +- describeYearPlanet() [interpretation.ts] -- day planet over the year

--- Returning visitor entry (localStorage) ---

HomeClient (useEffect on mount)
  |- hasShareParams? → skip localStorage, use share URL path
  +- readStoredBirthDate() [storage.ts]
      |- validates JSON, field types, ranges, calendar validity
      +- returns StoredBirthDate | null
          |- null → show BirthDataForm (first-visit state)
          +- valid → computeCycleFromBirthDate() [derive.ts]
              -> reading, with the form folded into a one-line summary
                 |- UpdateNotice, once, unless readUpdateNoticeSeen() [storage.ts]
                 |    +- "Got it" → markUpdateNoticeSeen(), focus the reading card
                 |- "Change date" → clearStoredBirthDate(), reset to first-visit
                 |- ThisYearCard (display)
                 |    |- getYearNumber() [year-lookup.ts]
                 |    |- interpretAreaYear() [interpretation.ts]
                 |    +- describeYearPlanet() [interpretation.ts]
                 +- ReadingViewTabs (below lg) → swaps this year for the 12-year wheel
                 +- CycleChart (display) — same as form-submission path

BirthDataForm (on successful submit)
  |- saveBirthDate(day, month, year) [storage.ts]
  |   -> localStorage.setItem("khmer-numerology:birth", JSON.stringify({day, month, year}))
  +- markUpdateNoticeSeen() [storage.ts] -- a date saved now needs no note about the 2026 changes

--- Share URL entry (/r/[date]) ---

/r/[date]/page.tsx (server component)
  |- generateMetadata(): decodeBirthDate() [url-encoding.ts]
  |    -> computeCycleFromBirthDate() [derive.ts]
  |    -> interpretTotal() [interpretation.ts]
  |    -> returns Metadata with OG title, description, opengraph-image
  |
  |- opengraph-image.tsx (server): decodeBirthDate() -> computeCycleFromBirthDate()
  |    -> renders 1200x630 OG image with the cycle as lantern orbs and total score
  |
  +- ShareRedirectClient (client): redirects to /?day=D&month=M&year=Y
      -> HomeClient reads searchParams, passes initialValues to BirthDataForm
      -> auto-computes cycle via useEffect

--- Partner comparison (under any reading) ---

PartnerComparison (client), partner date held in HomeClient state, never saved
  |- BirthDataForm mode="partner" -> onPartnerChange({ year, month, day, rule })
  |- computeCycleFromBirthDate() for the partner [derive.ts]
  |- comparisonCycleStarts() [compatibility.ts] -- current cycle + up to 2 before, for the Cycle switch
  |- compareCycles() [compatibility.ts] -- the chosen cycle's 12 years; null before a birth year
  |    +- getYearNumber() per person, yearInteraction() per year
  |- assessStability() [compatibility.ts] -- from both total scores
  |- summarizeComparison() [compatibility.ts] -> CompatibilitySummary (counts, this year)
  +- "Share this comparison" -> buildComparisonSharePath() [url-encoding.ts] -> shareLink() [share.ts]

/r/A+B (comparison link): decodeComparisonSegment() [url-encoding.ts]
  |- generateMetadata(): both totals -> "<assessment>: see how these two cycles meet"
  |- opengraph-image.tsx -> comparisonImage() [comparison-image.tsx]: the summary as a 1200x630 card
  +- ShareRedirectClient: /?day=&month=&year=&ny=&pday=&pmonth=&pyear=&pny=
      -> HomeClient opens the first reading with the comparison already showing
```

`deriveBirthData()` and `computeCycleFromBirthDate()` are separate entry points from the form. The form calls `deriveBirthData()` reactively via `useMemo` whenever field values change (for the zodiac/weekday preview), and calls `computeCycleFromBirthDate()` imperatively on submit. They are not a linear chain -- `computeCycleFromBirthDate` internally calls `deriveBirthData` then feeds the result into `computeCycle`.

## Key Type Contracts

### `Weekday` (calculate.ts)

```ts
type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;
```

Union literal type. Sunday=1 through Saturday=7.

### `BirthData` (derive.ts)

```ts
interface BirthData {
  gregorianMonth: number;   // 1-12, passed through unchanged
  weekday: Weekday;         // 1-7, Sunday=1 ... Saturday=7
  zodiacNumber: number;     // 1-12, Rat=1 ... Pig=12, New Year boundary adjusted
  zodiacAnimal: ZodiacAnimal; // "Rat" | "Ox" | ... | "Pig"
}
```

### `CycleResult` (calculate.ts)

```ts
interface CycleResult {
  cycle: number[];     // 12-element array, each value 0-11
  totalScore: number;  // sum of all 12 cycle values
  rows: {
    month: number[];   // 12-element month row
    zodiac: number[];  // 12-element zodiac row
    day: number[];     // 7-element day row
  };
}
```

### `CycleResultWithYear` (derive.ts)

```ts
interface CycleResultWithYear extends CycleResult {
  birthYear: number;
  birthData: BirthData;
}
```

Extends `CycleResult` with the birth year and full derived birth data. This is the type that flows from the form to the page state and into `CycleChart`.

### `YearInterpretation` (interpretation.ts)

```ts
interface YearInterpretation {
  tier: string;         // "very-strong" | "strong" | "moderate" | "weak" | "zero"
  label: string;        // e.g. "Very strong luck"
  description: string;  // longer tier description
  guidance: string;     // actionable guidance text
}
```

### `AreaYearInterpretation` (interpretation.ts)

```ts
interface AreaYearInterpretation extends YearInterpretation {
  area: string;         // life area for the year's column, e.g. "Money"
  reading: string;      // what this tier means for this life area
}
```

Returned by `interpretAreaYear(column, cycleNumber)`, with `column` 1-indexed like `getLifeArea()`. The detail panel and this year's card show `reading`, so the same number reads differently in different life areas. `describeYearPlanet(weekday, column)` adds the day planet sentence: `getYearPlanet()` reads the day row's value for the column (null for columns 8–12) and looks it up in `DAY_PLANETS` (`day-planet-data.ts`). `CycleChart` and `ThisYearCard` take the birth `weekday` for this. Why the reading works this way, and its sources, are in [docs/reading-model.md](../reading-model.md).

### `TotalInterpretation` (interpretation.ts)

```ts
interface TotalInterpretation {
  tier: string;         // "strong" | "moderate" | "weak"
  label: string;
  description: string;
}
```

### `ZodiacAnimal` (zodiac.ts)

```ts
type ZodiacAnimal = "Rat" | "Ox" | "Tiger" | "Rabbit" | "Dragon" | "Snake"
  | "Horse" | "Goat" | "Monkey" | "Rooster" | "Dog" | "Pig";
```

Derived from the `ZODIAC_ANIMALS` const array via indexed access type.

### `DecodedBirthDate` (url-encoding.ts)

```ts
interface DecodedBirthDate {
  year: number;   // 1900-2100
  month: number;  // 1-12
  day: number;    // 1-31 (calendar-validated)
}
```

Returned by `decodeBirthDate()` when parsing a share URL date string. Returns `null` for invalid inputs. Calendar-validated: rejects Feb 29 on non-leap years, Apr 31, etc.

### `StoredBirthDate` (storage.ts)

```ts
interface StoredBirthDate {
  day: number;    // 1-31 (calendar-validated)
  month: number;  // 1-12
  year: number;   // 1900-2100
}
```

The shape persisted to localStorage under the `khmer-numerology:birth` key. `readStoredBirthDate()` validates all fields on read: type checks, integer checks, range checks, and calendar validity. Returns `null` for any failure — never throws.

## Design Decisions

### Weekday indexing: 1-indexed, Sunday-start

JavaScript `Date.getDay()` returns 0=Sunday through 6=Saturday. The codebase converts this to 1=Sunday through 7=Saturday via `date.getDay() + 1`, then casts to the `Weekday` union type. This 1-indexed scheme matches the numerology tradition where weekday values are always 1-7.

### Modulo-12 semantics: zero is valid

`sum % 12` produces values 0-11. Zero IS a valid cycle value representing "Reset / unstable" -- it is not treated as an error or sentinel. The interpretation engine has an explicit `zero` tier (min: 0, max: 0) with its own label, description, and guidance. The wheel renders zero-tier orbs as unlit charcoal niches (`--color-tier-zero`).

### Column indexing: mixed 0-indexed and 1-indexed

Cycle arrays and component state use 0-indexed columns (0-11). However, `LIFE_AREA_MAP` in `year-lookup.ts` is keyed 1-12 (column 1 = "Self", column 12 = "Protection"). The `getLifeArea()` function accepts 1-indexed input. Components bridge this gap by calling `getLifeArea(index + 1)`.

### New Year boundary: which animal a birth before New Year gets

Births before New Year in a given Gregorian year belong to the previous zodiac year. Two rules are supported (`NewYearRule` in `zodiac.ts`):

- `"khmer"` (default): Khmer New Year, Moha Sangkran, 12–15 April. Days come from `KHMER_NEW_YEAR_APRIL_DAY` in `khmer-new-year.ts` (1900–2100), generated from the momentkh library's traditional Khmer astronomical calculation.
- `"chinese"`: Chinese New Year, from `CNY_DATES` (1900–2100).

`getZodiacYear(date, rule)` returns `year - 1` when the birth falls before that year's New Year. A birth on New Year's day counts as the new year. The rule flows through `deriveBirthData` and `computeCycleFromBirthDate` (default `"khmer"`), is remembered in localStorage (`khmer-numerology:new-year`), and travels in share links as a `-cny` suffix (`/r/1997-02-10-cny`); no suffix means Khmer.

### Calculation engine isolation

All modules in `src/lib/numerology/` are pure functions with zero React or framework imports. They depend only on each other (e.g., `calculate.ts` imports from `months.ts` and `zodiac.ts`). This isolation enables direct unit testing under Node without any DOM or component rendering.

### Client-only rendering (with share route exception)

The home page and all interactive components use `"use client"`. There are no API routes or server actions. The root layout (`layout.tsx`) serves as the server-rendered shell that loads fonts and CSS.

**Exception:** The share route (`/r/[date]/page.tsx`) is a server component. It uses `generateMetadata()` to produce personalized OG tags and a dynamic OG image on the server, then immediately redirects to the client-rendered home page via `ShareRedirectClient`. This hybrid approach provides social media preview cards without duplicating the interactive UI at the share URL.

### Share URL architecture: server metadata + client redirect

Share URLs follow the pattern `/r/YYYY-MM-DD`. The server component decodes the date, computes metadata (OG title, description, image), and renders a client component that redirects to `/?day=D&month=M&year=Y`. The home page reads these search params via `useSearchParams()` (wrapped in `<Suspense>`) and auto-computes the cycle. This avoids duplicating the form+chart rendering at the share route while still providing rich link previews.

### URL encoding: plain ISO dates, no obfuscation

Share URLs use `YYYY-MM-DD` format (e.g., `/r/1997-07-24`) rather than base64 or hashed encodings. A comparison joins two of them with `+` (`/r/1997-07-24+2000-03-15`); each part keeps its own `-cny` suffix, and `%2B` decodes the same as `+`. This keeps URLs human-readable, short (under 200 characters total), and free of percent-encoded characters. The `url-encoding.ts` module provides `encodeBirthDate()`, `decodeBirthDate()`, and `buildSharePath()` as pure functions with full calendar validation.

### Analytics: Vercel, cookieless, with redacted URLs

`SiteAnalytics` (`src/components/site-analytics.tsx`, rendered once in the root layout) loads Vercel Web Analytics and Speed Insights. Neither sets cookies, so there is no consent banner. Both report the page URL, and a birth date can appear in it twice (`/r/YYYY-MM-DD` and `?day=&month=&year=`), so both use `redactEvent()` from `src/lib/analytics.ts` as `beforeSend`: it drops the query and hash and rewrites any share path to `/r/[date]`, or drops the event if the URL can't be parsed. It is a client component because a server component can't pass the `beforeSend` function down. Collection also has to be enabled per project in the Vercel dashboard (Analytics and Speed Insights tabs); on Hobby both are free and pause at their limits instead of billing.

`trackEvent()` (`src/lib/track.ts`) sends four product events through the same script: "Reading revealed", "Reading shared", "Comparison made" and "Comparison shared". Each carries one property, `fromSharedLink`, and never a date, and its URL goes through the same `beforeSend` redaction. "Reading revealed" with `fromSharedLink: true` counts people who opened someone's link and then read their own. Vercel records custom events only on plans that include them; otherwise they are dropped.

### Interpretation data is separated from logic

`interpretation-data.ts` holds all tier definitions (labels, descriptions, guidance text, score ranges) as exported const arrays, and `life-area-data.ts` holds what each life area covers and its reading at each tier (`AREA_READINGS`, 12 areas x 5 tiers). `interpretation.ts` contains the lookup logic. This separation enables future i18n by swapping the data module without touching the lookup functions.

### Day row is 7 elements, not 12

`buildDayRow()` produces only 7 values. In `computeCycle()`, the day row contributes to columns 0-6 only. Columns 7-11 are computed from just the month and zodiac rows (two-component sum mod 12).

## Component Hierarchy

```
RootLayout (layout.tsx) .............. server shell, loads fonts/CSS
  |
  |- Home (page.tsx) ................. server component, Suspense wrapper
  |   +- <Suspense>
  |       +- HomeClient .............. "use client", manages CycleResultWithYear state
  |           |- reads searchParams for pre-fill (?day=&month=&year=)
  |           |- <h1> "Khmer Numerology"
  |           |- SectionDivider
  |           +- ErrorBoundary ....... "use client", class component
  |               |- (first visit, "Forget my date" or "Read for someone else")
  |               |   +- BirthDataForm "use client", day/month/year inputs
  |               |       |- deriveBirthData() via useMemo (zodiac + weekday preview)
  |               |       |- validateBirthDate() on submit
  |               |       |- saveBirthDate() on successful submit [storage.ts]
  |               |       +- computeCycleFromBirthDate() -> onResult callback
  |               |
  |               +- (replaces the form in place, after submit OR localStorage load)
  |                   |- reading summary: birth date, animal, weekday, "Read for someone else"
  |                   |- ThisYearCard  this year's number, tier, life area, guidance
  |                   |- ReadingViewTabs  "Year / Cycle" switch, below lg
  |                   +- CycleChart .. "use client", cycle wheel of 12 orbs
  |                       |- 12x motion.button (orbs, respects reduced motion)
  |                       |- DetailPanel "use client", AnimatePresence slide-down
  |                       +- TotalScoreCard  total score, opens onto the 52/64/76 scale
  |
  +- /r/[date]/page.tsx .............. server component, share route
      |- generateMetadata() .......... dynamic OG tags from decoded date
      |- opengraph-image.tsx ......... dynamic 1200x630 OG image
      +- ShareRedirectClient ......... "use client", redirects to /?day=&month=&year=
```

### Component responsibilities

- **RootLayout**: Loads Cormorant Garamond and Noto Serif Khmer fonts via `next/font/google`. Sets CSS variables `--font-cormorant` and `--font-noto-serif-khmer`. Applies `paper-texture` class to `<body>`. Exports Metadata with OG tags, Twitter card, and `metadataBase`.
- **ErrorBoundary**: Class component wrapping interactive content. Catches render errors from BirthDataForm and CycleChart without affecting the root layout. Shows a satra-styled error message with a "Try again" reset action. Logs errors to console for debugging.
- **Home**: Server component wrapping `HomeClient` in `<Suspense>` (required for `useSearchParams()`).
- **HomeClient**: Client component holding the birth date, New Year rule, selected year and the `formOpen` and `bloomed` flags and `readingView`. Share URL params take precedence over the date saved in localStorage. The first visit asks one question, "When were you born?", with one line under it saying what the reading gives. A share link sets `isShared` until the visitor reads their own date: `ThisYearCard`, `ShareReading` and `PartnerComparison` then say "their" or "this" instead of "your", and a primary "See your own cycle" button sits under the reading card. The form card and the reading card share one place on the page: on submit, `startTransition` swaps the form for the reading inside a `<ViewTransition name="reading-card">`, so the card blooms in place instead of scrolling down to a separate result. "Read for someone else" swaps back to an empty form (`formOpen` state), "Back to the reading" returns without re-entering the date, and "Forget my date", beside it, forgets a restored saved date. The reading card opens on `ThisYearCard`. Below `lg`, `ReadingViewTabs` switches the card between it and the wheel plus timeline in the same place (a `reading-view` transition type crossfades the swap); from `lg` the wheel sits beside it.
- **ThisYearCard**: The active year's cycle number, luck tier, life area, tier description and guidance, as a lit panel inside the reading card. Used for every reading: a fresh submission, a saved date and a shared link. Uses `getYearNumber()`, `interpretYear()`, and `getLifeArea()` from the numerology library.
- **ReadingViewTabs**: A two-way tabs switch ("Year" for this year's reading, "Cycle" for the 12-year wheel and timeline) at the top of the reading card below `lg`. Switching swaps the view in place instead of opening a section below it; the ink outline glides between the tabs, and arrow keys move the choice and focus together.
- **ShareRedirectClient**: Client component at `/r/[date]`. Receives decoded day/month/year as props, redirects to `/?day=D&month=M&year=Y` via `router.replace()`. Shows "Loading your reading..." during the redirect.
- **BirthDataForm**: Three number inputs (day, month, year). Accepts optional `initialValues` for pre-fill. Auto-derives zodiac/weekday via `useMemo`. Re-validates on change after first submission attempt. Respects `prefers-reduced-motion` for fade-in animation. Emits `CycleResultWithYear` via `onResult` prop.
- **CycleChart**: Renders the cycle as a wheel of 12 orbs, clockwise from the birth year, each a `<motion.button>` with role="tab" and its zodiac animal outside it. Arrow keys move around the wheel. The center is the tab panel: a preview of the selected year (the current year on load). Tapping the center or the selected orb again blooms `DetailPanel` over the wheel via a shared `<ViewTransition name="wheel-bloom">`; Escape or Close folds it back. A gold arc traces the cycle to this year. Ends with `TotalScoreCard`, which shows the total with `interpretTotal()` and opens in place onto the three possible totals from `TOTAL_SCALE`.
- **DetailPanel**: The full reading for one year: year, life area, number, tier symbol and label, zodiac animal, description, italic guidance and the other years that share the number. Rendered inside the wheel's reading dialog.
- **PartnerComparison**: Rests as a "Compare with a partner" button under the reading. Opens `BirthDataForm` in partner mode, then shows a Cycle switch (current cycle and up to two before it), `CompatibilitySummary` (both totals, the stability assessment with a link to how the totals are read, the current year's interaction and a count of each) and the chosen cycle's 12-year table of each person's number and the interaction (`compatibility.ts`), with share and remove actions. HomeClient owns the partner's date, so a comparison link opens straight onto it.
- **SectionDivider**: Horizontal rule with a centered diamond glyph on a parchment background.

## Styling Architecture

Tailwind CSS v4, imported via `@import "tailwindcss"` in `src/app/globals.css`. Color, font, shadow and easing tokens are declared in its `@theme inline` block, durations in `:root`, and reusable effects (the glass card, lantern glows, wheel orbs, form fields, entrance and view-transition animations) as named classes below it. JavaScript animation reads the matching tokens from `src/lib/motion.ts`.

The palette, type, spacing, motion rules, living surfaces and transitions are defined in [the design language](../standards/design-language.md); this file does not repeat them.

### Reduced motion support

The app respects `prefers-reduced-motion` at two levels:
- **CSS**: a global `@media (prefers-reduced-motion: reduce)` rule in `globals.css` collapses animations, transitions, smooth scrolling and view transitions. Ambient and scroll-driven animations are declared only inside `@media (prefers-reduced-motion: no-preference)`.
- **JavaScript**: `HomeClient` wraps the app in Motion's `<MotionConfig reducedMotion="user">`, which disables transform animations (stagger rise, press scale) app-wide. `YearTimeline` uses `useReducedMotion()` to center the selected year without smooth scrolling, and `LanternSky` draws its dust once, still.

## Testing Conventions

### Framework

Jest with `ts-jest` preset, running in a Node environment by default, which works because the calculation engine has no DOM dependencies. Component tests in `src/components/__tests__/` opt into jsdom with a `/** @jest-environment jsdom */` docblock.

### Configuration (jest.config.ts)

- Preset: `ts-jest`
- Test environment: `node`
- Root: `<rootDir>/src`
- Module alias: `@/*` maps to `<rootDir>/src/*` (matches tsconfig paths)

### Test file locations

Calculation tests live in `src/lib/numerology/__tests__/`. Component tests live in `src/components/__tests__/` (currently `year-timeline.test.tsx`).

| Test file | Module under test |
|---|---|
| `months.test.ts` | `months.ts` -- Margasir month mapping |
| `zodiac.test.ts` | `zodiac.ts` -- Khmer and Chinese New Year lookups and zodiac resolution |
| `calculate.test.ts` | `calculate.ts` -- `buildDayRow`, `computeCycle`, `computeTotalScore` |
| `derive.test.ts` | `derive.ts` -- `deriveBirthData`, `validateBirthDate`, `computeCycleFromBirthDate` |
| `interpretation.test.ts` | `interpretation.ts` -- `interpretYear`, `interpretAreaYear`, `getYearPlanet`, `describeYearPlanet`, `interpretTotal` |
| `year-lookup.test.ts` | `year-lookup.ts` -- `getCycleIndex`, `getYearNumber`, `getLifeArea` |
| `chart-helpers.test.ts` | `chart-helpers.ts` -- `getTierSymbol`, `getTierColorClass`, `getYearsForColumn`, `getCurrentYearColumn` |
| `url-encoding.test.ts` | `url-encoding.ts` -- `encodeBirthDate`, `decodeBirthDate`, `buildSharePath`, roundtrip validation |
| `storage.test.ts` | `storage.ts` -- `saveBirthDate`, `readStoredBirthDate`, `clearStoredBirthDate`, roundtrip, malformed-data rejection (29 tests) |
| `reduced-motion.test.ts` | `globals.css` -- verifies `prefers-reduced-motion` media query disables `.animate-breathe` |

### Testing patterns

- **Deterministic dates**: `validateBirthDate` accepts an optional `todayOverride` parameter so tests pin "today" to a fixed date rather than depending on the system clock.
- **Boundary coverage**: Tests exercise CNY boundary dates, leap years, min/max year range, and edge-case weekdays (Sunday=1, Saturday=7).
- **Worked examples**: The derive test suite includes a full acceptance test for July 24, 1997, verifying the expected 12-number cycle `[3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8]`.
- **Component tests**: Use React Testing Library under jsdom, opted into per file. Mock `useReducedMotion` from `motion/react` for deterministic rendering (see `year-timeline.test.tsx`).
