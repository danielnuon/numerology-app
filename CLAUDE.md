# CLAUDE.md

@AGENTS.md

**Solini** is a Khmer numerology web app. A visitor enters a birth date and gets a 12-year repeating luck cycle built from three inputs: birth month (Margasir calendar), zodiac year and birth weekday. The repo and package keep the internal name `numerology-app`.

Production: https://solini.vercel.app. Vercel deploys every push to `main`. CI (`.github/workflows/ci.yml`) runs lint, type check, tests and a production build on pushes and PRs to `main`.

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

## Standards

The project's standards live in [docs/standards/](docs/standards/README.md). Read the one that matches the work before starting, and follow it:

| Standard | Covers |
|----------|--------|
| [Design language](docs/standards/design-language.md) | Principles, color, type, spacing, iconography, interaction states, motion (living surfaces and transitions), accessibility |
| [Code](docs/standards/code.md) | Structure, TypeScript and React conventions, styling with tokens, comments, naming, tests |
| [Writing](docs/standards/writing.md) | Voice, American spelling, naming, commit messages and PR text |
| [Shipping](docs/standards/shipping.md) | Definition of done, the PR checklist, CI, review and deploy |

ESLint and `src/lib/__tests__/standards.test.ts` enforce the rules that can be checked by machine. If a standard is wrong or missing, change it in the same PR as the code, rather than working around it.

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
| Components (`"use client"` only where needed) | `src/components/`, shared pieces in `components/ui/`, tests in `__tests__/` |
| Routes | `src/app/` (`/`, `/about`, `/how-it-works`, `/meaning` and the share route `/r/[date]`) |
| Design tokens | `src/app/globals.css` (`@theme inline` block) and `src/lib/motion.ts` |
| Project standards | [docs/standards/](docs/standards/README.md) |
| Domain rules, algorithm, worked examples | [docs/system-overview.md](docs/system-overview.md) |
| How a year is read, its sources and open questions | [docs/reading-model.md](docs/reading-model.md) |
| Visual design and component specs | [docs/design-spec.md](docs/design-spec.md) |
| Modules, types, data flow, component tree | [docs/dev/architecture.md](docs/dev/architecture.md) |
| Setup and detailed conventions | [docs/dev/contributing.md](docs/dev/contributing.md) |
| Open stories | [docs/backlog.md](docs/backlog.md) |
| Architecture decisions | [docs/decisions/](docs/decisions/) |

The repo copies of `system-overview.md` and `design-spec.md` are the source of truth. Danny's Brain vault keeps mirrors, so edit the repo copy.

## Domain rules that are easy to get wrong

- The month row is Margasir-relative, not Gregorian. July is always position 8, and the mapping doesn't change by year.
- The zodiac year turns at Khmer New Year (mid-April) by default, or at Chinese New Year if the visitor chooses it on the form. A birth before the chosen New Year belongs to the previous animal year (`zodiac.ts`, `khmer-new-year.ts`).
- Weekday is 1-indexed starting Sunday, not JS `getDay()`.
- Cycle values are modulo 12. **0 is a valid "reset" tier**, not an error.
- The active year waits for the birthday. Before this year's birthday, show the previous year's number (`getActiveYear()`).
- Tiers: 10–11 very strong (●), 7–9 strong (◕), 4–6 moderate (◑), 1–3 weak (◔), 0 reset (⊙).
- Worked example for tests: born 1997-07-24 (Ox).

## Conventions

The full rules are in the standards above. The ones most often missed:

- Transparency is core to the product. When a result rests on Solini's own choice rather than a rule of Khmer numerology, say so in plain words, beside it or in the explanation it links to, so the visitor can judge it (see the principles in `docs/standards/README.md`).
- Colors come from tokens (`text-ink`, `bg-manuscript`, `text-gold-deep`, `tier-*`). Never hardcode hex; ESLint rejects it.
- `ink-faint` and `gold` are for decoration and placeholders only. Meaningful text uses `ink`, `ink-light` or `gold-deep`. The focus ring is the global 2px `gold-deep` outline.
- Pressed controls use `pressable active:scale-[0.97]` or `PRESS` from `@/lib/motion`. Selection is an ink outline that glides with `<ViewTransition>`; gold means "now".
- Living surfaces: glows breathe (`.title-glow`, `.breathe-glow`) and floating things carry scroll weight, as listed under Living surfaces in the design language. No other loops. Every state change uses a shared transition (page change, `<Reveal>`, `.animate-settle-in`, selection glide). Everything stops with Reduce Motion.
- Tier symbols and decorative icons are `aria-hidden="true"`; the parent's label carries the meaning.
- Next.js 16: route `params` and `searchParams` are Promises, so always `await` them. `useSearchParams()` needs a `<Suspense>` boundary.
- Lib tests run in Node. Component tests opt into jsdom with a `/** @jest-environment jsdom */` docblock.
- American spelling everywhere. Commits use conventional prefixes, and PR text describes the change like a technical writer, with no narration of who asked for it.

## Gotchas

- Share URLs are `/r/YYYY-MM-DD`. A DD-MM-YYYY URL redirects to `/` by design, and that's not a bug.
- Don't run `npm install` just to verify or QA something. It rewrites `package-lock.json` against your local npm version. If the lock file does change, commit it.
- To see the error boundary's fallback without editing code, set `hasError: true` on the `ErrorBoundary` instance through React fiber traversal in the browser console (snippet in `docs/dev/contributing.md`).
- Scroll weight moves `.glass` cards and `.sky-glow` with paused Web Animations on `translate` (`LanternSky`). Don't give those elements a CSS `translate` of their own; the held animation overrides it. Writing inline styles there instead costs a full style recalc per frame, which showed up in phone profiling.
- Unicode tier glyphs (● ◕ ◑ ◔ ⊙) render at different sizes depending on the fallback font, most visibly on iOS. Use `TierIcon` on the page.
- Don't animate `height`, grid rows or other layout properties for an expand or collapse; it lays out and repaints the whole page every frame and stutters on phones. Use `<Reveal>`, which lays out once and glides with transforms and clips. It measures the page around itself, so it works in any layout, but content that changes size on its own mid-glide will snap at the end.
- OG images use Satori. Every `div` with more than one child needs `display: flex`, or the route returns a 500.
