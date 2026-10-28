# CLAUDE.md

@AGENTS.md

**Solini** is a Khmer numerology web app. A visitor enters a birth date and gets a 12-year repeating luck cycle built from three inputs: birth month (Margasir calendar), Chinese zodiac year and birth weekday. The repo and package keep the internal name `numerology-app`.

Production: https://solini.vercel.app. Vercel deploys every push to `main`. CI (`.github/workflows/ci.yml`) runs `npm test` and `npm run build` on pushes and PRs to `main`.

## Commands

| Need | Command |
|------|---------|
| Dev server | `npm run dev` (port 3000) |
| Tests | `npm test` (Jest 30, about 3s) |
| Lint | `npm run lint` |
| Type check | `npx tsc --noEmit` |
| Production build | `npm run build` |
| Screenshots at 320/768/1280/1920px | `node .claude/skills/design-review/screenshot.mjs [url]` |

Node 22 or later.

## Workflow

1. **Plan.** `/story <idea>` writes or refines a story with testable acceptance criteria (ACs) in [docs/backlog.md](docs/backlog.md).
2. **Build.** `/build <story or bug>` implements it on a branch, writes tests, verifies it (including in the browser for UI), checks off ACs and opens a PR.
3. **Review the look.** `/design-review <page or component>` screenshots it at every viewport and checks it against the design spec and the contrast rules below. Use it on demand, and before merging UI work.

Merging the PR deploys it. Small fixes don't need a story; just say what you're fixing.

Hooks in `.claude/settings.json` lint each `src/` file after it's edited and run the tests before Claude finishes a turn that changed `src/`. If a hook reports a failure, fix it rather than working around it.

When you learn something a future session would otherwise rediscover the hard way, add it to **Gotchas** below in the same PR.

## Where things live

| What | Where |
|------|-------|
| Pure calculation logic (no React, no Next) | `src/lib/numerology/`, tests in `__tests__/` beside it |
| Components (all `"use client"`) | `src/components/`, tests in `__tests__/` |
| Routes | `src/app/` (`/` and the share route `/r/[date]`) |
| Design tokens | `src/app/globals.css` (`@theme inline` block) |
| Domain rules, algorithm, worked examples | [docs/system-overview.md](docs/system-overview.md) |
| Visual design and component specs | [docs/design-spec.md](docs/design-spec.md) |
| Modules, types, data flow, component tree | [docs/dev/architecture.md](docs/dev/architecture.md) |
| Setup and detailed conventions | [docs/dev/contributing.md](docs/dev/contributing.md) |
| Open stories | [docs/backlog.md](docs/backlog.md) |
| Architecture decisions | [docs/decisions/](docs/decisions/) |

The repo copies of `system-overview.md` and `design-spec.md` are the source of truth. Danny's Brain vault keeps mirrors, so edit the repo copy.

## Domain rules that are easy to get wrong

- The month row is Margasir-relative, not Gregorian. July is always position 8, and the mapping doesn't change by year.
- Zodiac year follows Chinese New Year. A birth before CNY in January or February belongs to the previous zodiac year (lookup table for 1900–2100).
- Weekday is 1-indexed starting Sunday, not JS `getDay()`.
- Cycle values are modulo 12. **0 is a valid "reset" tier**, not an error.
- The active year waits for the birthday. Before this year's birthday, show the previous year's number (`getActiveYear()`).
- Tiers: 10–11 very strong (●), 7–9 strong (◕), 4–6 moderate (◑), 1–3 weak (◔), 0 reset (⊙).
- Worked example for tests: born 1997-07-24 (Ox).

## Conventions

- `@/*` maps to `src/*`.
- Use "Solini" in anything user-facing, and keep "numerology-app" and existing `numerology`/`cycle` identifiers in code.
- Colors come from Tailwind tokens (`parchment`, `manuscript`, `ink`, `ink-light`, `ink-faint`, `gold`, `tier-*`). Never hardcode hex.
- Contrast: `text-ink-faint` and `text-gold` fail WCAG for meaningful text. Use them only for placeholders and decoration. Focus rings use `focus-visible:ring-ink-light`, not gold.
- Tier symbols are `aria-hidden="true"`. The parent's `aria-label` carries the meaning.
- Animations respect `prefers-reduced-motion` (Framer Motion `useReducedMotion()`).
- Next.js 16: `useSearchParams()` needs a `<Suspense>` boundary, and route `params` is a Promise, so always `await params`.
- Lib tests run in Node. Component tests opt into jsdom with a `/** @jest-environment jsdom */` docblock.
- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`). Doc and backlog updates go in the same commit as the code they describe.

## Gotchas

- Share URLs are `/r/YYYY-MM-DD`. A DD-MM-YYYY URL redirects to `/` by design, and that's not a bug.
- Don't run `npm install` just to verify or QA something. It rewrites `package-lock.json` against your local npm version. If the lock file does change, commit it.
- To see the error boundary's fallback without editing code, set `hasError: true` on the `ErrorBoundary` instance through React fiber traversal in the browser console (snippet in `docs/dev/contributing.md`).
- OG images use Satori. Every `div` with more than one child needs `display: flex`, or the route returns a 500.
