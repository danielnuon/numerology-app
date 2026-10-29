# Solini Standards

These documents are the single standard for how Solini is built, how it looks and moves, and how changes ship. They describe the app as it is today. When code and a standard disagree, either the code is a bug or the standard is out of date; fix whichever is wrong in the same PR.

| Standard | What it covers |
|----------|----------------|
| [Design language](./design-language.md) | Principles, color, type, spacing, shape, motion (living surfaces and transitions), interaction states, iconography, accessibility |
| [Code](./code.md) | Project structure, TypeScript and React conventions, styling with tokens, comments, tests |
| [Writing](./writing.md) | Voice and copy, American spelling, naming, commit messages and PR text |
| [Shipping](./shipping.md) | Definition of done, the PR checklist, CI, review and deploy |

Component-level specifications (the cycle wheel, the form, the timeline) live in [docs/design-spec.md](../design-spec.md). The numerology rules live in [docs/system-overview.md](../system-overview.md). Module structure and data flow live in [docs/dev/architecture.md](../dev/architecture.md).

## Principles

1. **Calm.** Solini is a quiet, reflective space: a temple lit by lanterns. Nothing shouts, blinks or hurries. Motion is slow and purposeful, and color is used sparingly.
2. **Transparent.** Solini shows its working, so visitors can judge a reading for themselves. Where a result follows the family's rules, the rule is a click away (How it works, Meaning). Where Solini fills a gap in those rules, chooses between traditions or isn't sure, the page says so in plain words, either beside the result or in the explanation the result links to: the comparison's "How the totals are read" link to How your cycle is made, under its "How to read this", is the pattern. Nothing is presented as more certain than it is, and the open questions are kept in [docs/reading-model.md](../reading-model.md) and [docs/system-overview.md](../system-overview.md).
3. **Familiar.** Interactions behave the way people already expect from Apple and Google products. If something looks interactive, it is; if it is interactive, it looks it. Nobody should have to guess how a control works.
4. **Readable.** Code is written for the next person to read. Names say what things are, comments explain why, and each module does one job.
5. **One source of truth.** Design values live in tokens, rules live in these documents, and the repo is the record. Mirrors elsewhere (the Brain vault, chat threads, mockups) follow the repo, never the other way around.
6. **Living.** Surfaces that look alive are. Every glow breathes softly, and things that look like they float (the sky, the glass cards) carry a little weight as the page scrolls and settle when it stops. Every change of state is a smooth transition from one shared set, never a jump. All of it is slow, small and calm, and stops with Reduce Motion. The rules and limits are under [Living surfaces](./design-language.md#living-surfaces) and [Transitions](./design-language.md#transitions).
7. **Verified, not assumed.** Every change passes lint, type check, tests and a production build, and UI changes are looked at on mobile, tablet and desktop before they merge.

## Where each rule is enforced

Prose is the last resort. Where a rule can be checked by a machine, it is.

| Rule | Enforced by |
|------|-------------|
| No raw hex colors in components; use tokens | ESLint (`eslint.config.mjs`) |
| One pressed style (`active:scale-[0.97]`, `PRESS` in Motion) | ESLint |
| No Tailwind looping utilities (`animate-pulse`, `animate-spin`, `animate-bounce`, `animate-ping`) | ESLint |
| Loops only on registered living surfaces, slow and symmetric, only when motion is allowed | `src/lib/numerology/__tests__/reduced-motion.test.ts` |
| Scroll weight settles without overshoot and never swings far | `src/lib/__tests__/scroll-spring.test.ts` |
| Animation imports come from `motion/react`, not `framer-motion` | ESLint |
| No stray `console.log` | ESLint |
| American spelling in code, copy and docs | `src/lib/__tests__/standards.test.ts` |
| Motion durations and curves match between CSS and JavaScript | `src/lib/__tests__/standards.test.ts` |
| Preview-image and browser theme colors match the CSS tokens | `src/lib/__tests__/standards.test.ts` |
| Reduce Motion stops all CSS animation and view transitions | `src/lib/numerology/__tests__/reduced-motion.test.ts` |
| Lint, types, tests and build pass | CI (`.github/workflows/ci.yml`) |
| Viewport check, accessibility check, docs updated | PR template (`.github/pull_request_template.md`) |

## Changing a standard

Standards change through a PR like any other change. Update the document, the tokens and the enforcement together, and say in the PR description what changed and why. A new living surface or transition is added to the standard itself (see "Living surfaces" and "Transitions" in the design language), not left as a one-off in code.
