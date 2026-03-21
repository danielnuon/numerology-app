# Contributing

## Getting Started

### Prerequisites

- Node.js 22 or later
- npm

### Setup

```bash
npm install
npm run dev
```

The dev server starts via `next dev` (Next.js 16).

### Tests

```bash
npm test
```

Tests run with Jest 30 + ts-jest in a Node environment (not jsdom). The Jest config lives in `jest.config.ts` and maps the `@/*` path alias to `src/*`.

### Lint

```bash
npm run lint
```

Uses ESLint 9 with `eslint-config-next`.

---

## Project Conventions

### Path alias

`@/*` maps to `src/*` (configured in both `tsconfig.json` and `jest.config.ts`).

### Calculation code

All numerology logic lives in `src/lib/numerology/` as pure functions with zero framework imports. Modules export typed interfaces and functions that work in any Node environment. Examples: `calculate.ts`, `interpretation.ts`, `months.ts`, `zodiac.ts`, `year-lookup.ts`.

### Components

All components live in `src/components/` and must use the `"use client"` directive. There are no server components.

### Tests

Co-located in `src/lib/numerology/__tests__/`, named `*.test.ts`. Tests cover boundary values, worked examples from the numerology spec, and data integrity checks.

### Styling

Tailwind CSS 4 utility classes. Custom design tokens are defined in `globals.css` inside the `@theme inline` block:

- Colors: `parchment`, `manuscript`, `ink`, `ink-light`, `ink-faint`, `gold`, `gold-light`, `border`, `border-light`
- Luck tier colors: `tier-very-strong`, `tier-strong`, `tier-moderate`, `tier-weak`, `tier-zero`
- Typography: `--font-serif` stack combining Cormorant Garamond + Noto Serif Khmer
- Spacing: `--spacing-4_5` (18px) for temple-proportion layouts

Use these tokens via Tailwind classes (e.g., `text-ink`, `bg-parchment`). Do not hardcode hex values.

### Fonts

Loaded via `next/font/google` in `layout.tsx`:

- **Cormorant Garamond** (Latin) -- CSS variable `--font-cormorant`, weights 300/400/500/600
- **Noto Serif Khmer** (Khmer script) -- CSS variable `--font-noto-serif-khmer`, weights 400/600

Both are applied to the `<html>` element as CSS variable classes and composed into `--font-serif` in `globals.css`.

---

## Adding a Calculation Module

1. Create a pure function file in `src/lib/numerology/` (e.g., `my-calculation.ts`).
2. Export typed interfaces and functions. Follow the pattern in `calculate.ts`: JSDoc comments, explicit parameter types, and a result interface.
3. Add tests in `src/lib/numerology/__tests__/my-calculation.test.ts` covering:
   - The worked example from the numerology specification
   - Boundary values (min/max inputs, zero cases)
   - Data integrity (no gaps in lookup ranges, all fields populated)
4. No React imports. The module must work in a plain Node environment (`testEnvironment: "node"` in Jest config).

---

## Adding a UI Component

1. Create in `src/components/` with the `"use client"` directive at the top of the file.
2. Use Tailwind tokens from `globals.css` (e.g., `text-gold`, `bg-manuscript`) instead of hardcoded hex values.
3. Follow accessibility patterns: `aria-label`, keyboard navigation, `role` attributes where appropriate.
4. Reference `docs/design-spec.md` for visual specifications (color palette, typography, spacing, animation).

---

## Commit Conventions

- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`
- Include `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` when AI-assisted
- Commit doc updates (e.g., roadmap checkbox changes) in the same commit as the code they describe -- not as a separate commit

---

## Lock File Management

- Local npm 11 generates `package-lock.json` with lockfileVersion 3. CI uses `npm install` (not `npm ci`) to handle version divergence gracefully.
- If `package-lock.json` is dirty after any operation, commit it before pushing.
- During QA (`/real`), do **not** run `npm install`. Use `npm ls` for read-only dependency inspection.

---

## CI Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on pushes and pull requests to `main`:

1. **Checkout** -- `actions/checkout@v4`
2. **Node setup** -- `actions/setup-node@v4` with Node 22 and npm cache enabled
3. **Install** -- `npm install` (not `npm ci`, to tolerate lockfile version differences)
4. **Test** -- `npm test`
5. **Build** -- `npm run build`

There is no automated deployment step. Deployment is handled manually or via Vercel auto-deploy.
