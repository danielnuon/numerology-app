# ADR-002: Lean Claude setup: three skills, hooks and a committed `.claude/`

## Status

Accepted (October 2026). Supersedes [ADR-001](./adr-001-skills-source-of-truth.md).

## Context

The project ran a 9-stage skill pipeline (`/brain-dump → /vibe-check → /connect → /cook → /test → /real → /ship-it → /yap`, plus `/designer`). The skill files added up to about 2,300 lines. In practice:

- Most stages were handoffs between narrow roles that a single session can now do in one pass: plan and validate a story, build and verify it, review the visuals.
- Checks that should always run, like lint and tests, depended on the model remembering to run them.
- `/connect` tracked state that git, PRs and the backlog already hold. `/ship-it` duplicated Vercel's auto-deploy on push to `main`. `/yap` retros produced conventions that were better recorded directly in CLAUDE.md.
- `.claude/` was gitignored, so cloud sessions and other machines had none of the skills, memory or ADRs that CLAUDE.md linked to.
- Per-skill `model:` pins (Haiku for planning) traded quality for cost on the steps where mistakes are most expensive.

## Decision

- Three skills in `.claude/skills/`: `/story` (plan and self-review a story into `docs/backlog.md`), `/build` (implement, test, verify in the browser, update docs, open a PR) and `/design-review` (viewport screenshots and review against the design spec, or design direction). No model pins.
- Hooks in `.claude/settings.json` lint each edited `src/` file and run the tests before a turn that changed `src/` ends.
- `.claude/` is committed. Only `settings.local.json` and `screenshots/` stay ignored.
- `.claude/memory/*` is folded into CLAUDE.md. ADRs move to `docs/decisions/`.
- The 947-line product roadmap is replaced by `docs/backlog.md`, which holds only open stories plus a list of done titles.
- `docs/system-overview.md` and `docs/design-spec.md` remain the source of truth in the repo. The Brain vault keeps mirrors.

## Consequences

### Positive

- One short CLAUDE.md and three skills are much less for a session to load and much easier to keep current.
- Lint and test checks happen automatically instead of relying on the model to remember them.
- Every environment, cloud sessions included, sees the same setup.

### Negative

- No mandatory separate QA pass. `/build` verifies its own work, and `/design-review` is a second look only when asked or before merging UI.
- Story history lives in git (`docs/dev/product-roadmap.md` at `7ce1379`) instead of an always-growing file.
- The vault mirrors can drift if someone edits them instead of the repo.

## Related ADRs

- [ADR-001](./adr-001-skills-source-of-truth.md): skills as the single source of truth (superseded)
