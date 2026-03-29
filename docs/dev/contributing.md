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

### Branding

The application is publicly branded as **Solini**, with "Khmer Numerology" used as a descriptive subtitle. However, for technical stability, the project retains its original internal name for the following:

- **Directory Name:** `numerology-app`
- **Package Name:** `numerology-app` (in `package.json`)
- **Internal Variables:** Any logic or constants referring to "numerology" or "cycle" should remain unchanged.

Always use "Solini" in user-facing strings (headings, metadata, help text) and "numerology-app" for system-level references.

---

## Project Conventions

### Path alias

`@/*` maps to `src/*` (configured in both `tsconfig.json` and `jest.config.ts`).

### Calculation code

All numerology logic lives in `src/lib/numerology/` as pure functions with zero framework imports. Modules export typed interfaces and functions that work in any Node environment. Examples: `calculate.ts`, `interpretation.ts`, `months.ts`, `zodiac.ts`, `year-lookup.ts`.

### Components

All components live in `src/components/` and must use the `"use client"` directive. The one exception is the share redirect route (`src/app/r/[date]/page.tsx`), which is a server component that awaits params and delegates rendering to a client component.

### Next.js 16 conventions

Next.js 16 introduced breaking changes that differ from earlier versions:

**`useSearchParams()` requires a Suspense boundary.** Any page or component that calls `useSearchParams()` must be wrapped in `<Suspense>` in its parent server component. Failure to do this causes a build error. Pattern:

```tsx
// src/app/page.tsx (server component)
import { Suspense } from "react";
import { HomeClient } from "@/components/home-client";

export default function Home() {
  return <Suspense><HomeClient /></Suspense>;
}

// src/components/home-client.tsx ("use client")
// calls useSearchParams() safely inside the Suspense boundary
```

**Route params are `Promise<{ param: string }>`** — not a plain object. Always `await params` in both `generateMetadata` and the default export:

```tsx
type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props) {
  const { date } = await params;
  // ...
}

export default async function Page({ params }: Props) {
  const { date } = await params;
  // ...
}
```

Omitting `await` results in a type error and a runtime failure accessing properties on the Promise object.

### Tests

Co-located in `src/lib/numerology/__tests__/`, named `*.test.ts`. Tests cover boundary values, worked examples from the numerology spec, and data integrity checks.

### Styling

Tailwind CSS 4 utility classes. Custom design tokens are defined in `globals.css` inside the `@theme inline` block:

- Colors: `parchment`, `manuscript`, `ink`, `ink-light`, `ink-faint`, `gold`, `gold-light`, `border`, `border-light`
- Luck tier colors: `tier-very-strong`, `tier-strong`, `tier-moderate`, `tier-weak`, `tier-zero`
- Typography: `--font-serif` stack combining Cormorant Garamond + Noto Serif Khmer
- Spacing: `--spacing-4_5` (18px) for temple-proportion layouts

Use these tokens via Tailwind classes (e.g., `text-ink`, `bg-parchment`). Do not hardcode hex values.

#### WCAG contrast constraints on design tokens

Not all tokens are safe for all contexts. The following rules apply (adopted Cycle 7 after /real caught contrast failures in form labels and focus ring):

| Token | Contrast on manuscript | Safe for informational text? |
|-------|----------------------|------------------------------|
| `text-ink` (#2C2417) | 15.05:1 | ✓ Yes |
| `text-ink-light` (#7A6F5F) | 4.84:1 | ✓ Yes |
| `text-ink-faint` (#A89F8F) | 2.57:1 | ✗ No — decorative/placeholder only |
| `text-gold` (#B8860B) | ~2.87:1 on parchment | ✗ No — decorative accent only |

**Rules:**
- `text-ink-faint` must only be used for placeholder text (`placeholder:text-ink-faint`) and purely decorative labels. Never use it for `<label>` elements or any text that conveys meaning.
- For focus indicators, use `focus-visible:ring-ink-light` — not `ring-gold`. Gold (#B8860B) on parchment (#F5F0E8) is 2.87:1, below the WCAG 2.2 SC 2.4.11 Non-text Contrast minimum of 3:1.
- Opacity-reduced parchment text on the zero-tier charcoal background (#4A4039) must use minimum `/75` opacity at 14px body text (~4.9:1 effective) and `/80` for all other text (~6.4:1 effective). Never go below `/75` for informational text on this background.
- Tier symbols (●/◕/◑/◔/⊙) should always be `aria-hidden="true"` — they are decorative reinforcement. The aria-label on the parent element carries the tier meaning for screen readers.

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

## Testing Error States in the Browser

When QA needs to verify an error boundary's fallback UI without modifying source code, use React fiber traversal via `preview_eval` to directly set `hasError: true` on the class instance:

```js
(() => {
  function walkFiber(fiber, cb) {
    if (!fiber) return;
    cb(fiber);
    walkFiber(fiber.child, cb);
    walkFiber(fiber.sibling, cb);
  }
  const root = document.querySelector('main') || document.body;
  const fiberKey = Object.keys(root).find(k => k.startsWith('__reactFiber'));
  if (!fiberKey) return 'no fiber';
  let eb = null;
  walkFiber(root[fiberKey], (f) => {
    if (f.stateNode?.constructor?.name === 'ErrorBoundary') eb = f.stateNode;
  });
  if (!eb) return 'not found';
  eb.setState({ hasError: true });
  return 'setState called';
})()
```

**Why:** The Jest test suite runs in Node without jsdom — React class components cannot be unit tested in this project. The fiber traversal approach triggers the visual fallback without modifying production code, and without needing `throw` to propagate through the component tree.

**Note:** `componentDidCatch` will NOT fire when using this approach (it only fires during real React render exceptions). Verify console logging by code inspection, not by checking browser console output after a simulated trigger.

---

## QA: Verify URL Formats Before Filing Bugs

When QA-testing any URL-based feature (share links, deep links, encoded routes), always verify the URL format against the encoding spec or existing unit tests **before** filing a bug.

**Convention:** Before testing a URL-encoded route in `/real`, check `src/lib/numerology/__tests__/` or the relevant encoding module to confirm the expected format.

**Why this matters:** During the Current Year Widget cycle, `/real` navigated to `/r/24-07-1997` (DD-MM-YYYY). The share URL spec (`decodeBirthDate`) requires `YYYY-MM-DD`. The mismatch caused `decodeBirthDate` to return null — which correctly triggered `redirect("/")` — but was misread as a share redirect bug. This spawned a false `/cook fix` cycle before investigation revealed the QA test input was wrong.

**When it applies:** Any feature involving URL encoding, route params, or encoded identifiers. Check the format spec first; test with a valid example URL before concluding the feature is broken.

---

## CI Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on pushes and pull requests to `main`:

1. **Checkout** -- `actions/checkout@v4`
2. **Node setup** -- `actions/setup-node@v4` with Node 22 and npm cache enabled
3. **Install** -- `npm install` (not `npm ci`, to tolerate lockfile version differences)
4. **Test** -- `npm test`
5. **Build** -- `npm run build`

There is no automated deployment step. Deployment is handled manually or via Vercel auto-deploy.
