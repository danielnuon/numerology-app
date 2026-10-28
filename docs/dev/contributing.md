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

Tests run with Jest 30 + ts-jest in a Node environment by default; component tests opt into jsdom per file. The Jest config lives in `jest.config.ts` and maps the `@/*` path alias to `src/*`.

### Lint

```bash
npm run lint
```

Uses ESLint 9 with `eslint-config-next`, plus project rules in `eslint.config.mjs` that enforce the [standards](../standards/README.md#where-each-rule-is-enforced).

## Standards

How code is written, how the app looks and moves, how copy and commits read, and what a PR needs before merging are defined once, in [docs/standards/](../standards/README.md):

- [Design language](../standards/design-language.md): color and contrast, type, spacing, iconography, interaction states, motion and accessibility
- [Code](../standards/code.md): structure, TypeScript, React and Next.js 16 conventions, styling, comments, naming, tests
- [Writing](../standards/writing.md): voice, American spelling, the Solini name, commit messages and PR text
- [Shipping](../standards/shipping.md): the definition of done and the PR checklist

This page keeps setup steps and practical tips that don't belong in a standard.

---

## Adding a Calculation Module

1. Create a pure function file in `src/lib/numerology/` (e.g., `my-calculation.ts`).
2. Export typed interfaces and functions. Follow the pattern in `calculate.ts`: a header comment, JSDoc on every export, explicit parameter types and a result interface.
3. Add tests in `src/lib/numerology/__tests__/my-calculation.test.ts` covering:
   - The worked example from the numerology specification
   - Boundary values (min/max inputs, zero cases)
   - Data integrity (no gaps in lookup ranges, all fields populated)
4. No React imports. The module must work in a plain Node environment (`testEnvironment: "node"` in Jest config).

---

## Adding a UI Component

1. Create it in `src/components/` (or `src/components/ui/` for a small presentational piece). Add `"use client"` only if it uses state, effects, browser APIs or event handlers.
2. Build it from the tokens and shared states in the [design language](../standards/design-language.md), and the component specs in [docs/design-spec.md](../design-spec.md).
3. Add a jsdom test in `src/components/__tests__/` that queries by role and accessible name.
4. Check it at 320px, 768px and 1280px, by keyboard and with Reduce Motion on, as the [shipping checklist](../standards/shipping.md#definition-of-done) asks.

---

## Lock File Management

- Local npm 11 generates `package-lock.json` with lockfileVersion 3. CI uses `npm install` (not `npm ci`) to handle version divergence gracefully.
- If `package-lock.json` is dirty after any operation, commit it before pushing.
- While verifying or QA-ing a change, do **not** run `npm install`. Use `npm ls` for read-only dependency inspection.

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

**Why:** The fiber traversal approach shows the visual fallback in a running app without modifying production code, and without needing `throw` to propagate through the component tree. (A jsdom component test is the better option for automated coverage; see Tests above.)

**Note:** `componentDidCatch` will NOT fire when using this approach (it only fires during real React render exceptions). Verify console logging by code inspection, not by checking browser console output after a simulated trigger.

---

## QA: Verify URL Formats Before Filing Bugs

When QA-testing any URL-based feature (share links, deep links, encoded routes), always verify the URL format against the encoding spec or existing unit tests **before** filing a bug.

**Convention:** Before testing a URL-encoded route in the browser, check `src/lib/numerology/__tests__/` or the relevant encoding module to confirm the expected format.

**Why this matters:** During the Current Year Widget work, QA navigated to `/r/24-07-1997` (DD-MM-YYYY). The share URL spec (`decodeBirthDate`) requires `YYYY-MM-DD`. The mismatch caused `decodeBirthDate` to return null — which correctly triggered `redirect("/")` — but was misread as a share redirect bug. This spawned a false bug-fix cycle before investigation revealed the QA test input was wrong.

**When it applies:** Any feature involving URL encoding, route params, or encoded identifiers. Check the format spec first; test with a valid example URL before concluding the feature is broken.

---

## CI Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on pushes and pull requests to `main`:

1. **Checkout** -- `actions/checkout@v4`
2. **Node setup** -- `actions/setup-node@v4` with Node 22 and npm cache enabled
3. **Install** -- `npm install` (not `npm ci`, to tolerate lockfile version differences)
4. **Lint** -- `npm run lint`
5. **Type check** -- `npx tsc --noEmit`
6. **Test** -- `npm test`
7. **Build** -- `npm run build`

Vercel deploys every push to `main` to production and builds a preview for every PR.
