---
name: story
description: Turn an idea, bug report or feature request for Solini into a well-formed story in docs/backlog.md, or tighten an existing one. Use when planning new work before building it.
argument-hint: <idea | story title to refine>
---

# Story

Write stories that `/build` can implement without asking questions. This replaces the old `/brain-dump` and `/vibe-check` steps: you draft the story and then review it yourself before saving.

## Steps

1. **Read context.** `docs/backlog.md` (to avoid duplicates and see priorities), `docs/system-overview.md` for any domain logic, `docs/design-spec.md` for any UI. Skim the relevant code so the story matches what exists.
2. **Ask only what you can't infer.** If the request has a gap that would change the ACs (which screen, what happens on error), ask once. Otherwise choose the conventional answer and note it under **Notes**.
3. **Draft** using the format below. One story is one PR. Split anything bigger than about a day's work.
4. **Review it yourself** against the checklist. Fix what fails before saving.
5. **Save** under the right section of `docs/backlog.md`: **Now** if Danny wants it next, **Next** otherwise, **Blocked** if it waits on something outside the repo.
6. Reply with the story title, its size, and any assumptions you made.

## Format

```markdown
### <Title in sentence case>

**Story:** As a <visitor type>, I want <capability>, so that <benefit>.

**Size:** S | M | L

**Acceptance Criteria:**
- [ ] <observable behavior, with exact values, ranges and viewports where they matter>

**Notes:** <dependencies, assumptions, out of scope, files likely touched>
```

Skip a separate task list. `/build` works out the tasks.

## Review checklist

- Every AC can be checked by a test, a screenshot or a single manual step. "Feels intuitive" fails; "shows the error inline under the field within one render" passes.
- Domain claims match `docs/system-overview.md`. Pay special attention to the rules in CLAUDE.md's "easy to get wrong" list, such as zero being a valid tier and the active year waiting for the birthday.
- UI stories say what happens at 320px and at desktop width, and name the design tokens to use rather than hex values.
- Accessibility is covered: keyboard path, screen reader label, contrast (see CLAUDE.md conventions), and reduced motion if anything animates.
- Error, empty and loading states are covered if they can happen.
- No AC duplicates one already in the backlog or already shipped.
