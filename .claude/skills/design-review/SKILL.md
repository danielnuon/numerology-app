---
name: design-review
description: Screenshot a Solini page or component at every viewport and review it against the design spec, design tokens and accessibility rules, or give design direction for something new. Use for visual QA, responsive bugs, theme or design-language work, and before merging UI changes.
argument-hint: <page, component, PR or design question>
---

# Design review

Two modes. This replaces the old `/designer` and the visual half of `/real`.

- **Review** (default): look at what exists and report what's wrong.
- **Direction**: the request asks how something *should* look ("design the comparison view", "make the timeline feel calmer"). Propose a design that fits the existing system.

## Review

1. **Capture.** Start `npm run dev`, then run
   `node .claude/skills/design-review/screenshot.mjs "http://localhost:3000/?year=1997&month=7&day=24"`.
   It saves full-page PNGs at 320, 768, 1280 and 1920px wide to `.claude/screenshots/` (gitignored) and reports any horizontal overflow. Pass another URL or `--widths=375,414` if needed. Look at every image.
2. **Check against the system.**
   - Layout: no horizontal page scroll, no clipped or overlapping text, touch targets at least 44px on mobile, sensible reflow between breakpoints (see the breakpoint table in `docs/design-spec.md`).
   - Tokens: colors, fonts and spacing come from `src/app/globals.css`. Search the changed code for raw hex values and arbitrary Tailwind values.
   - Typography: hierarchy and sizes match the spec, and body text stays readable at 320px.
   - Accessibility: the contrast rules in CLAUDE.md, visible focus on every interactive element, symbols `aria-hidden` with labels on the parent, and nothing animates under `prefers-reduced-motion`.
   - Consistency: the same element looks and behaves the same everywhere it appears.
3. **Report** a table of findings, most severe first: what, where (file and viewport), why it matters, and the fix. Severity is **Blocker** (broken or inaccessible), **Should fix**, or **Polish**. Link the screenshots.
4. Fix the issues only if asked, or if you're reviewing your own `/build` work.

## Direction

1. Read `docs/design-spec.md` and the tokens first. Extend the existing language (the "Temple at Dusk" palette, serif type, paper texture) rather than inventing a new one, unless Danny asks for a change of direction.
2. Give: the layout as an ASCII sketch per breakpoint (320 and 1280 at least), the tokens and components to use, every state (default, hover, focus, empty, error, loading), the motion and its reduced-motion fallback, and the keyboard and screen reader behavior.
3. Name any new tokens or spec changes this needs. Once Danny agrees, update `docs/design-spec.md` and `globals.css` together, so the spec always describes the current state rather than its history.
