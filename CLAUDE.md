# CLAUDE.md — AI Operating Manual

This file is the authoritative reference for AI agents working on this project.

---

## Project Overview

**Solini** is a Khmer Numerology fortune calculation system built with Next.js 16. It calculates a 12-year life cycle based on birth month, Chinese zodiac year, and birth weekday.

- **Tech Stack**: Next.js 16, TypeScript, Tailwind CSS 4, Jest
- **Domain**: Khmer numerology with Margasir-based month cycling
- **Deployment**: Vercel (manual)

See [.claude/memory/vision.md](./.claude/memory/vision.md) for domain details.

---

## Documentation Map

| Purpose | Location |
|---------|----------|
| Agent pipeline | [.claude/agents/](./.claude/agents/) |
| Skills (subagents) | [.claude/skills/](./.claude/skills/) |
| Project memory | [.claude/memory/](./.claude/memory/) |
| Architecture decisions | [.claude/decisions/](./.claude/decisions/) |
| Task templates | [.claude/tasks/](./.claude/tasks/) |
| Product roadmap | [docs/product-roadmap.md](./docs/product-roadmap.md) |
| System spec | [docs/system-overview.md](./docs/system-overview.md) |
| Architecture details | [docs/architecture.md](./docs/architecture.md) |
| Design spec | [docs/design-spec.md](./docs/design-spec.md) |

---

## Development Workflow

This project uses a 9-agent pipeline:

```
                            ┌────────────┐
                            │ /designer  │ ← design direction on demand
                            └─────┬──────┘
                                  │ informs
                                  ▼
/brain-dump → /vibe-check → /connect → /cook → /test → /real → /ship-it → /yap
   (plan)      (validate)  (coordinate) (build)  (test)   (QA)   (deploy)  (retro)
      ↑                                                                      |
      └──────────────────── lessons learned ─────────────────────────────────┘
```

**Rules:**
1. No skipping stages — every story must pass through the pipeline in order
2. No lane-crossing — each agent operates within its defined scope
3. Failures flow backward — issues route to the appropriate upstream agent
4. Lessons loop back — /yap insights feed into /brain-dump and /vibe-check

---

## Agent Reference

| Agent | Role | Model |
|-------|------|-------|
| /brain-dump | Convert ideas to user stories | Haiku |
| /vibe-check | Validate story quality | Haiku |
| /connect | Coordinate pipeline | Haiku |
| /cook | Implement features | Sonnet |
| /test | Run automated tests | Sonnet |
| /real | Exploratory testing | Sonnet |
| /ship-it | Deploy to production | Haiku |
| /yap | Retrospectives | Haiku |
| /designer | UI/UX guidance | Sonnet |

See [.claude/agents/](./.claude/agents/) for detailed agent definitions.

---

## Skill Reference

Each skill is invoked with `/skill-name`. Skills are specialized subagents with single responsibilities:

| Skill | Purpose | Model |
|-------|---------|-------|
| /brain-dump | Story planning | Haiku |
| /vibe-check | Story validation | Haiku |
| /connect | Pipeline coordination | Haiku |
| /cook | Implementation | Sonnet |
| /test | Automated testing | Sonnet |
| /real | QA/UX validation | Sonnet |
| /ship-it | Deployment | Haiku |
| /yap | Metrics/retros | Haiku |
| /designer | Design guidance | Sonnet |

See [.claude/skills/*/SKILL.md](./.claude/skills/) for skill details.

---

## Task System

Tasks are small, atomic work items produced by the planner. Each task should be completable in a single developer execution.

- **Template**: [.claude/tasks/task-template.md](./.claude/tasks/task-template.md)
- **Source of Truth**: [docs/product-roadmap.md](./docs/product-roadmap.md)

---

## Architecture Decisions

Major technical decisions are documented as ADRs in [.claude/decisions/](./.claude/decisions/).

- **Template**: [.claude/decisions/adr-template.md](./.claude/decisions/adr-template.md)

---

## Development Principles

1. **Tasks must be atomic** — implementable in a single execution
2. **No ambiguous tasks** — skills resolve ambiguity by choosing conventional solutions
3. **Documentation over memory** — never rely on conversation history
4. **Minimal context** — each skill uses only necessary documentation
5. **Code lives in tests** — calculation logic in `src/lib/numerology/` with co-located tests

---

## Quick Commands

| Need... | Use |
|---------|-----|
| Turn ideas into stories | `/brain-dump <ideas>` |
| Validate stories | `/vibe-check <stories>` |
| Check pipeline status | `/connect status` |
| Implement a story | `/cook <story>` |
| Run tests | `/test <story>` |
| QA a feature | `/real <story>` |
| Deploy | `/ship-it deploy <env>` |
| Get design direction | `/designer <brief>` |
