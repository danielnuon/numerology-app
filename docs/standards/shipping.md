# Shipping Standard

Solini is live at [solini.vercel.app](https://solini.vercel.app). Vercel deploys every push to `main`, so merging a PR is releasing it. Every change therefore reaches `main` through a reviewed pull request that meets this standard.

## Flow

1. **Branch** from an up-to-date `main`. One change per branch: a story, a fix or a standards update.
2. **Build** following the [code](./code.md), [design language](./design-language.md) and [writing](./writing.md) standards. Larger features start as a story in [docs/backlog.md](../backlog.md) (`/story`), and are implemented with `/build`.
3. **Verify locally** with the checks below.
4. **Open a PR** using the template. The template is the checklist; fill it in honestly, and say why when an item does not apply.
5. **CI** runs lint, type check, tests and a production build on every PR. A red check blocks merging.
6. **Review.** The owner reviews the PR, and UI changes on the Vercel preview, ideally on a real phone.
7. **Merge** when CI is green and the review is done. Watch the production deploy and check the live site.

New features come from the backlog one at a time, and each is finished, merged and live before the next starts.

## Definition of done

A change is done when all of these are true.

**Automated checks** (the same commands CI runs)

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

**Viewports** (for any change a visitor can see)

- Checked at 320px, 768px and 1280px wide at minimum (`node .claude/skills/design-review/screenshot.mjs <url>` captures 320, 768, 1280 and 1920).
- No horizontal page scroll; no truncated, clipped or overlapping text; touch targets at least 44px.
- Behavior that differs on touch (tap outside, hover-only states) is checked with touch emulation, and the PR says whether real Safari on iOS was tested.

**Design and accessibility** (for UI changes)

- Uses tokens and the shared pressed, focus, hover and selected states from the design language.
- Keyboard: every new control is reachable, operable and shows the focus ring.
- Reduce Motion: with it on, nothing moves, scales or loops.
- Contrast: meaningful text uses `ink`, `ink-light` or `gold-deep`.
- Any new looping or ambient motion is listed under "Approved exceptions" in the design language.

**Code and docs**

- New logic has tests; a bug fix has a test that fails without it.
- Comments explain why, and new modules open with a header comment.
- Docs describe the new state: `docs/design-spec.md` for component behavior, `docs/dev/architecture.md` for new modules or data flow, `docs/system-overview.md` for domain rules, `docs/backlog.md` for story progress, and these standards when a rule changes.
- Copy and docs use American spelling, and the PR and commits follow the [writing standard](./writing.md).

## Hotfixes

When production is broken, the smallest fix that restores it still goes through a PR with green CI. Explain the cause and the fix in the description, and follow up with a test if the fix shipped without one.

## Claude Code

`.claude/settings.json` runs two hooks for Claude Code sessions: ESLint on each `src/` file right after it is edited, and the test suite before a session finishes with uncommitted `src/` changes. If a hook reports a failure, fix the cause rather than working around it. See [CLAUDE.md](../../CLAUDE.md) for the `/story`, `/build` and `/design-review` skills.
