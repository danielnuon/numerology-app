---
name: build
description: Implement a Solini backlog story or bug fix end to end - branch, code, tests, verification in the browser, backlog update and PR. Use when asked to build, implement or fix something in the app.
argument-hint: <story title | fix: description>
---

# Build

Take one story from `docs/backlog.md`, or one bug, to an open PR that's ready to merge. This replaces the old `/cook`, `/test`, `/real` and `/ship-it` steps.

## Steps

1. **Find the work.** For a story, read it in `docs/backlog.md`. If it isn't there, or its ACs are vague, run `/story` first. For a bug, reproduce it before touching code.
2. **Branch** from up-to-date `main` unless you're already on a task branch.
3. **Read before writing.** The files you'll change, their tests, and the matching section of `docs/dev/architecture.md`. For UI, also read `docs/design-spec.md` and the tokens in `src/app/globals.css`. Follow the patterns you find.
4. **Implement** only what the ACs ask for. Calculation logic goes in `src/lib/numerology/` as pure functions. UI goes in `src/components/`.
5. **Test.** At least one test per AC that can be tested in code. For calculation code, include the 1997-07-24 worked example and boundary values. For a bug, add a test that fails before the fix.
6. **Verify.** All of these must pass:
   - `npm test`
   - `npx eslint <changed files>` and `npx tsc --noEmit` (don't introduce new errors; fix existing ones in files you touch)
   - `npm run build`
   - For UI: start `npm run dev`, run `node .claude/skills/design-review/screenshot.mjs http://localhost:3000/?year=1997&month=7&day=24`, and look at every screenshot. Check the changed area at 320px and 1280px at minimum, plus keyboard focus order.
7. **Check each AC literally.** Re-read every AC and point to the code, test or screenshot that satisfies it. Ranges, values and viewports must match exactly, not approximately. Fix gaps before going on.
8. **Update docs in the same commit.** Check off ACs in `docs/backlog.md`. When all of a story's ACs are checked, move its title to **Done** and delete its body. Update `docs/dev/architecture.md` if you added or changed a module, type or component. Add to CLAUDE.md **Gotchas** if you hit a trap.
9. **Commit and open a PR.** Use conventional commits. The PR body lists each AC with how it was verified, and attaches or links screenshots for UI changes. CI must be green.

## When things go sideways

- **An AC is ambiguous:** pick the most reasonable reading, implement it, and call it out in the PR.
- **The work is much bigger than the story's size:** stop after the smallest useful slice, open the PR for that slice, and propose splitting the rest with `/story`.
- **You find an unrelated bug:** don't fix it in this PR. Note it in the PR and add it to the backlog.
- **Shared code changes:** list the other call sites you checked in the PR.
