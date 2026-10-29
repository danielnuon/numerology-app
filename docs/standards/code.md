# Code Standard

Solini's code should read like a well-edited book: someone new to the project can open any file, understand what it is for within a minute, and change it without fear. These rules serve that goal. ESLint (`npm run lint`), the TypeScript compiler (`npx tsc --noEmit`) and the tests enforce what they can; the rest is for authors and reviewers.

## Structure

| What | Where | Rules |
|------|-------|-------|
| Numerology logic | `src/lib/numerology/` | Pure functions and data. No React, Next.js or browser APIs, so it runs in plain Node. |
| Other shared logic | `src/lib/` | Small modules with one job each: `storage.ts`, `analytics.ts`, `track.ts`, `motion.ts`, `site-copy.ts`, `og-theme.ts`. |
| Feature components | `src/components/` | One component per file, named after the file (`cycle-chart.tsx` exports `CycleChart`). |
| Shared building blocks | `src/components/ui/` | Small presentational pieces with no app state: `ZodiacIcon`, `SectionDivider`, page parts. |
| Routes | `src/app/` | Thin. A page reads its params and renders components; logic lives in `lib/` and components. |
| Design tokens | `src/app/globals.css` | The only place color, shadow, easing and duration values are defined for CSS. |
| Tests | `__tests__/` beside the code they test | `*.test.ts` for logic, `*.test.tsx` for components and pages. |

Data flows one way: `lib/numerology` computes, components display, routes compose. Components never re-implement a calculation; if a component needs a derived value twice, it belongs in `lib/`.

## TypeScript

- `strict` is on. Do not use `any`; use `unknown` and narrow it. Avoid non-null assertions (`!`) unless a comment explains why the value cannot be null.
- Name domain concepts with types (`Weekday`, `ZodiacAnimal`, `YearTier`, `NewYearRule`) and use them in signatures instead of bare `number` or `string`.
- Prefer `interface` for object shapes that are exported, and string-literal unions over enums.
- Prefer `const` objects with `as const` for fixed tables (tier symbols, motion tokens).
- Import with the `@/` alias for anything outside the current folder; use `./` within it.
- Keep functions small and single-purpose. If a function needs a comment to separate its steps, those steps are probably functions.

## React and Next.js

- Server components by default. Add `"use client"` only to components that use state, effects, browser APIs or event handlers. Presentational pieces in `components/ui/` stay server-compatible.
- This is Next.js 16. Read the matching guide in `node_modules/next/dist/docs/` before using an API you have not used here before. Route `params` and `searchParams` are Promises: always `await` them. `useSearchParams()` needs a `<Suspense>` boundary, so prefer reading search params on the server and passing them down (as `src/app/page.tsx` does).
- Props interfaces are named `Props` inside a component file, with a short JSDoc comment on each prop that is not obvious.
- Derive values during render instead of syncing them into state with effects. Use effects only to talk to the outside world (storage, timers, observers, the DOM).
- Selection changes run inside `startTransition` so `<ViewTransition>` can animate them (see the [design language](./design-language.md#interaction)).
- Interactive elements are real `<button>`s and `<a>`s with the right ARIA roles for their pattern (`tab`, `radio`, `dialog`). Every interactive element is keyboard operable.
- The share images under `opengraph-image.tsx` render with Satori: every `div` with more than one child needs `display: flex`, and colors come from `OG_COLORS` in `src/lib/og-theme.ts`.

## Styling

- Style with Tailwind utility classes and the tokens from `globals.css` (`text-ink`, `bg-manuscript`, `border-border`, `text-tier-weak`). Never write a raw hex color in a component; ESLint rejects it.
- Reusable effects that need more than utilities (the glass card, lantern glows, orbs, form fields, entrance animations) are named classes in `globals.css`, grouped under a comment that says what they are for. Do not create a new class for something one utility list can do.
- Long class lists are written as an array joined with spaces, one concern per line, as `birth-data-form.tsx` does. Comment a line when the reason is not obvious.
- Arbitrary values (`max-w-[640px]`, `tracking-[0.14em]`) are fine for layout and type values that the design language lists. They are not fine for colors.
- Pressed feedback is always `pressable active:scale-[0.97]` in CSS or `PRESS` from `src/lib/motion.ts` in Motion. ESLint rejects any other pressed scale.
- Animation imports come from `motion/react`. Durations and curves come from `MOTION`, `EASE` and `PRESS` in `src/lib/motion.ts`, or the matching CSS variables.
- Every new animation is checked with Reduce Motion on.

## Comments and documentation

The goal is context, not narration. A reader should learn why the code is the way it is.

- **Every file opens with a short block comment** saying what the module or component is and how it fits in. See `cycle-chart.tsx` and `calculate.ts`.
- **Every exported function, type and constant has a JSDoc comment** of one or two sentences. Document units, ranges and edge cases (`Weekday: Sunday=1 ... Saturday=7`, "0 is a valid reset tier").
- **Inside functions, comment the why**: a domain rule, a browser quirk, a non-obvious trade-off. Do not restate what the next line does.
- When a value must be kept in step with another file, say so where it is defined (`og-theme.ts` does this) and, where possible, add a test.
- Domain rules cite [docs/system-overview.md](../system-overview.md) rather than re-explaining the whole method.
- Write comments in plain American English, in full sentences. No commented-out code; git keeps history.

## Naming

- Files and folders: `kebab-case` (`year-timeline.tsx`, `url-encoding.ts`).
- Components and types: `PascalCase`. Functions and variables: `camelCase`. Module-level constants that are fixed tables: `UPPER_SNAKE_CASE` (`OG_COLORS`, `DAY_ROW_COLUMNS`).
- Booleans read as questions: `isCurrentYear`, `hasShareParams`, `choiceMatters`.
- Event handlers are `handleX` inside a component and `onX` as props.
- Use the domain's words: cycle, tier, life area, zodiac animal, New Year rule. Internal names keep "numerology" and "cycle"; user-facing text says "Solini" (see [writing](./writing.md)).

## Errors and logging

- Validate input at the edges (form fields, URL params, local storage) and return `null` or a typed result for invalid input instead of throwing. The rest of the app can then trust its data.
- `console.error` and `console.warn` are allowed for real failures. `console.log` is not committed; ESLint rejects it.
- The `ErrorBoundary` wraps interactive content so a render error never blanks the page.

## Tests

- Tests sit in `__tests__/` beside the code they cover. Logic tests run in Node. Component and page tests opt into jsdom with a `/** @jest-environment jsdom */` docblock and use Testing Library, querying by role and accessible name the way a user would.
- Calculation code is tested with the worked example from the spec (born 1997-07-24: cycle `[3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8]`), boundary values (New Year dates, leap years, Sunday and Saturday) and data-integrity checks.
- Tests never depend on today's date. Pass a fixed "today" (`todayOverride`) or mock the clock.
- A bug fix includes a test that fails without the fix.
- Test names describe behavior: `it("returns null for a February 30 birth date")`.
- Rules that guard the design system (reduced motion, token sync, spelling) live in `src/lib/__tests__/standards.test.ts` and `src/lib/numerology/__tests__/reduced-motion.test.ts`.

## Dependencies

- Add a dependency only when it removes real work or risk. Prefer the platform (CSS scroll-driven animation, native view transitions, `Intl`) over a library.
- Do not run `npm install` just to verify something; it can rewrite `package-lock.json` for a different npm version. If the lock file changes as part of real work, commit it.
