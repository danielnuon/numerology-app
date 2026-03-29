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
          |- getZodiacRow() [zodiac.ts]      -- CNY-adjusted zodiac animal number
          +- buildDayRow() [calculate.ts]    -- weekday value for columns 1-7 only
      -> CycleResultWithYear -> HomeClient state
          -> CycleChart (display)
              |- getTierSymbol/ColorClass() [chart-helpers.ts]
              |- interpretYear() [interpretation.ts]
              |- interpretTotal() [interpretation.ts]
              |- getLifeArea() [year-lookup.ts]
              +- DetailPanel (selected pillar)
                  |- getYearsForColumn() [chart-helpers.ts]
                  |- getTierSymbol() [chart-helpers.ts]
                  |- interpretYear() [interpretation.ts]
                  +- getLifeArea() [year-lookup.ts]

--- Returning visitor entry (localStorage) ---

HomeClient (useEffect on mount)
  |- hasShareParams? → skip localStorage, use share URL path
  +- readStoredBirthDate() [storage.ts]
      |- validates JSON, field types, ranges, calendar validity
      +- returns StoredBirthDate | null
          |- null → show BirthDataForm (first-visit state)
          +- valid → computeCycleFromBirthDate() [derive.ts]
              -> setResult() + setShowWidget(true)
                 |- CurrentYearWidget (display)
                 |    |- getYearNumber() [year-lookup.ts]
                 |    |- interpretYear() [interpretation.ts]
                 |    |- getLifeArea() [year-lookup.ts]
                 |    |- "View full cycle" → smooth-scroll to #cycle-chart-section
                 |    +- "Not you?" → clearStoredBirthDate(), reset to first-visit
                 +- CycleChart (display) — same as form-submission path

BirthDataForm (on successful submit)
  +- saveBirthDate(day, month, year) [storage.ts]
      -> localStorage.setItem("khmer-numerology:birth", JSON.stringify({day, month, year}))

--- Share URL entry (/r/[date]) ---

/r/[date]/page.tsx (server component)
  |- generateMetadata(): decodeBirthDate() [url-encoding.ts]
  |    -> computeCycleFromBirthDate() [derive.ts]
  |    -> interpretTotal() [interpretation.ts]
  |    -> returns Metadata with OG title, description, opengraph-image
  |
  |- opengraph-image.tsx (server): decodeBirthDate() -> computeCycleFromBirthDate()
  |    -> renders 1200x630 OG image with cycle pillars and total score
  |
  +- ShareRedirectClient (client): redirects to /?day=D&month=M&year=Y
      -> HomeClient reads searchParams, passes initialValues to BirthDataForm
      -> auto-computes cycle via useEffect
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
  zodiacNumber: number;     // 1-12, Rat=1 ... Pig=12, CNY-boundary adjusted
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

`sum % 12` produces values 0-11. Zero IS a valid cycle value representing "Reset / unstable" -- it is not treated as an error or sentinel. The interpretation engine has an explicit `zero` tier (min: 0, max: 0) with its own label, description, and guidance. The chart renders zero-tier pillars with a distinct charcoal background (`bg-tier-zero`) and a CSS breathing animation.

### Column indexing: mixed 0-indexed and 1-indexed

Cycle arrays and component state use 0-indexed columns (0-11). However, `LIFE_AREA_MAP` in `year-lookup.ts` is keyed 1-12 (column 1 = "Self", column 12 = "Protection"). The `getLifeArea()` function accepts 1-indexed input. Components bridge this gap by calling `getLifeArea(index + 1)`.

### CNY boundary: January/February zodiac adjustment

Births before Chinese New Year in a given Gregorian year belong to the previous zodiac year. The `getZodiacYear()` function in `zodiac.ts` looks up the CNY date from a 201-entry table (`CNY_DATES`, covering 1900-2100) and compares the birth month/day against it. If the birth date falls before CNY, the function returns `year - 1`.

### Calculation engine isolation

All modules in `src/lib/numerology/` are pure functions with zero React or framework imports. They depend only on each other (e.g., `calculate.ts` imports from `months.ts` and `zodiac.ts`). This isolation enables direct unit testing under Node without any DOM or component rendering.

### Client-only rendering (with share route exception)

The home page and all interactive components use `"use client"`. There are no API routes or server actions. The root layout (`layout.tsx`) serves as the server-rendered shell that loads fonts and CSS.

**Exception:** The share route (`/r/[date]/page.tsx`) is a server component. It uses `generateMetadata()` to produce personalized OG tags and a dynamic OG image on the server, then immediately redirects to the client-rendered home page via `ShareRedirectClient`. This hybrid approach provides social media preview cards without duplicating the interactive UI at the share URL.

### Share URL architecture: server metadata + client redirect

Share URLs follow the pattern `/r/YYYY-MM-DD`. The server component decodes the date, computes metadata (OG title, description, image), and renders a client component that redirects to `/?day=D&month=M&year=Y`. The home page reads these search params via `useSearchParams()` (wrapped in `<Suspense>`) and auto-computes the cycle. This avoids duplicating the form+chart rendering at the share route while still providing rich link previews.

### URL encoding: plain ISO dates, no obfuscation

Share URLs use `YYYY-MM-DD` format (e.g., `/r/1997-07-24`) rather than base64 or hashed encodings. This keeps URLs human-readable, short (under 200 characters total), and free of percent-encoded characters. The `url-encoding.ts` module provides `encodeBirthDate()`, `decodeBirthDate()`, and `buildSharePath()` as pure functions with full calendar validation.

### Interpretation data is separated from logic

`interpretation-data.ts` holds all tier definitions (labels, descriptions, guidance text, score ranges) as exported const arrays. `interpretation.ts` contains the lookup logic. This separation enables future i18n by swapping the data module without touching the lookup functions.

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
  |           |- (returning visitor, localStorage valid)
  |           |   +- CurrentYearWidget "use client", year/tier/area/guidance
  |           |       |- "View full cycle" → scrollIntoView #cycle-chart-section
  |           |       +- "Not you?" → clearStoredBirthDate, reset to form
  |           |
  |           +- ErrorBoundary ....... "use client", class component
  |               |- (first visit or "Not you?")
  |               |   +- BirthDataForm "use client", day/month/year inputs
  |               |       |- deriveBirthData() via useMemo (zodiac + weekday preview)
  |               |       |- validateBirthDate() on submit
  |               |       |- saveBirthDate() on successful submit [storage.ts]
  |               |       +- computeCycleFromBirthDate() -> onResult callback
  |               |
  |               +- (conditional, after submit OR localStorage load)
  |                   |- SectionDivider
  |                   +- CycleChart .. "use client", 12-column pillar grid
  |                       |- 12x motion.button (pillars, respects reduced motion)
  |                       |- DetailPanel "use client", AnimatePresence slide-down
  |                       +- Total score summary bar
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
- **HomeClient**: Client component holding `CycleResultWithYear | null` state and `showWidget` boolean. On mount, checks share URL params first (precedence), then reads localStorage via `readStoredBirthDate()`. If valid stored data exists, computes cycle and renders both `CurrentYearWidget` and `CycleChart`. Also reads URL search params for pre-fill from share redirects. On form submission, scrolls to the result card via `requestAnimationFrame` + `scrollIntoView`.
- **CurrentYearWidget**: Client component displaying the current year's cycle number, luck tier, life area domain, and one-sentence guidance. Renders "View full cycle" (smooth-scroll to chart) and "Not you?" (clear localStorage, reset to form) actions. Uses `getYearNumber()`, `interpretYear()`, and `getLifeArea()` from the numerology library.
- **ShareRedirectClient**: Client component at `/r/[date]`. Receives decoded day/month/year as props, redirects to `/?day=D&month=M&year=Y` via `router.replace()`. Shows "Loading your reading..." during the redirect.
- **BirthDataForm**: Three number inputs (day, month, year). Accepts optional `initialValues` for pre-fill. Auto-derives zodiac/weekday via `useMemo`. Re-validates on change after first submission attempt. Respects `prefers-reduced-motion` for fade-in animation. Emits `CycleResultWithYear` via `onResult` prop.
- **CycleChart**: Renders 12 pillars as a `grid-cols-6 md:grid-cols-12` grid. Each pillar is a `<motion.button>` with role="tab". Supports keyboard navigation (ArrowLeft/ArrowRight). Highlights the current year column with a gold border and dot. Renders `DetailPanel` when a pillar is selected. Shows total score summary with `interpretTotal()`.
- **DetailPanel**: Displays years for the column, tier symbol, label, description, and italic guidance text. Animated via Framer Motion `AnimatePresence`.
- **SectionDivider**: Horizontal rule with a centered diamond glyph on a parchment background.

## Styling Architecture

### Framework

Tailwind CSS v4, imported via `@import "tailwindcss"` in `globals.css`. Custom theme tokens are defined inline using the `@theme inline` directive.

### Color palette: "Temple at Dusk"

| Token | Hex | Usage |
|---|---|---|
| `parchment` | `#F5F0E8` | Page background |
| `manuscript` | `#FFFDF7` | Card backgrounds |
| `manuscript-alt` | `#EDE7DB` | Alternate card bg |
| `ink` | `#2C2417` | Primary text |
| `ink-light` | `#7A6F5F` | Secondary text |
| `ink-faint` | `#A89F8F` | Placeholder / tertiary text |
| `gold` | `#B8860B` | Accents, current-year border |
| `gold-light` | `#D4A843` | Light accent |
| `border` | `#D5CBBA` | Card/pillar borders |
| `border-light` | `#E8E0D2` | Lighter borders |

### Tier colors

| Tier | Token | Hex |
|---|---|---|
| Very strong | `tier-very-strong` | `#5B7744` |
| Strong | `tier-strong` | `#7A9B6B` |
| Moderate | `tier-moderate` | `#B8860B` |
| Weak | `tier-weak` | `#A0522D` |
| Zero | `tier-zero` | `#4A4039` |

Non-zero tiers use `/15` opacity as pillar backgrounds. Zero tier uses full opacity with inverted (parchment) text.

### Typography

- **Serif stack**: Cormorant Garamond (Latin) + Noto Serif Khmer (Khmer script), falling back to Georgia.
- Font loaded via `next/font/google` with `display: "swap"`.
- Weights loaded: Cormorant 300/400/500/600; Noto Serif Khmer 400/600.
- Base font size: `1.125rem` (18px), line-height `1.7`, letter-spacing `0.01em`.

### Paper texture effect

A CSS pseudo-element (`::before`) on `.paper-texture` applies an inline SVG fractal noise filter at 4% opacity, creating a subtle parchment texture. Content is elevated to `z-index: 2` above the texture layer.

### Custom animation

`animate-breathe`: A 3-second infinite ease-in-out animation that pulses opacity between 1.0 and 0.85, applied to zero-tier pillars. Disabled via `@media (prefers-reduced-motion: reduce)` for accessibility.

### Reduced motion support

The app respects `prefers-reduced-motion` at two levels:
- **CSS**: `@media (prefers-reduced-motion: reduce)` in `globals.css` disables `.animate-breathe`.
- **JavaScript**: `BirthDataForm` uses `window.matchMedia("(prefers-reduced-motion: reduce)")` to conditionally skip its fadeIn animation. `CycleChart` uses Framer Motion's `useReducedMotion()` hook to disable pillar stagger animations.

## Testing Conventions

### Framework

Jest with `ts-jest` preset, running in a Node environment (no jsdom). This works because the calculation engine has no DOM dependencies.

### Configuration (jest.config.ts)

- Preset: `ts-jest`
- Test environment: `node`
- Root: `<rootDir>/src`
- Module alias: `@/*` maps to `<rootDir>/src/*` (matches tsconfig paths)

### Test file locations

All tests live in `src/lib/numerology/__tests__/`:

| Test file | Module under test |
|---|---|
| `months.test.ts` | `months.ts` -- Margasir month mapping |
| `zodiac.test.ts` | `zodiac.ts` -- CNY lookup and zodiac resolution |
| `calculate.test.ts` | `calculate.ts` -- `buildDayRow`, `computeCycle`, `computeTotalScore` |
| `derive.test.ts` | `derive.ts` -- `deriveBirthData`, `validateBirthDate`, `computeCycleFromBirthDate` |
| `interpretation.test.ts` | `interpretation.ts` -- `interpretYear`, `interpretTotal` |
| `year-lookup.test.ts` | `year-lookup.ts` -- `getCycleIndex`, `getYearNumber`, `getLifeArea` |
| `chart-helpers.test.ts` | `chart-helpers.ts` -- `getTierSymbol`, `getTierColorClass`, `getYearsForColumn`, `getCurrentYearColumn` |
| `url-encoding.test.ts` | `url-encoding.ts` -- `encodeBirthDate`, `decodeBirthDate`, `buildSharePath`, roundtrip validation |
| `storage.test.ts` | `storage.ts` -- `saveBirthDate`, `readStoredBirthDate`, `clearStoredBirthDate`, roundtrip, malformed-data rejection (29 tests) |
| `reduced-motion.test.ts` | `globals.css` -- verifies `prefers-reduced-motion` media query disables `.animate-breathe` |

### Testing patterns

- **Deterministic dates**: `validateBirthDate` accepts an optional `todayOverride` parameter so tests pin "today" to a fixed date rather than depending on the system clock.
- **Boundary coverage**: Tests exercise CNY boundary dates, leap years, min/max year range, and edge-case weekdays (Sunday=1, Saturday=7).
- **Worked examples**: The derive test suite includes a full acceptance test for July 24, 1997, verifying the expected 12-number cycle `[3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8]`.
- **No component tests**: All tests target the pure calculation layer. There are no React component tests or integration tests with jsdom.
