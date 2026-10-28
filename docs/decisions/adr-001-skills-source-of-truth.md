# ADR-001: Skills as Single Source of Truth for Agent Behavior

## Status

Superseded by [ADR-002](./adr-002-lean-claude-setup.md)

## Context

The project had two parallel sets of agent definitions:

1. **Agent files** (`.claude/agents/*.md`) — 9 thin markdown files describing each agent's role, responsibilities, and pipeline position
2. **Skill files** (`.claude/skills/*/SKILL.md`) — 9 comprehensive skill definitions with frontmatter (including `model:` for model selection), detailed scope boundaries, documentation references, process steps, output formats, and edge case handling

The agent files were strict subsets of their corresponding skill files. The SKILL.md `model:` frontmatter field is what Claude Code actually uses for model routing — agent files had no runtime effect. This duplication created maintenance burden and risked drift between the two definitions.

## Decision

Remove `.claude/agents/` entirely. Skills (`.claude/skills/*/SKILL.md`) are the single source of truth for all agent behavior, model assignment, scope boundaries, and process definitions.

- New agents are added only as skills under `.claude/skills/`
- The `CLAUDE.md` Skill Reference table serves as the agent index
- The Agent Reference section and `.claude/agents/` directory link have been removed from `CLAUDE.md`

## Consequences

### Positive

- Single source of truth — no risk of agent/skill definition drift
- Less maintenance — changes to agent behavior require updating one file, not two
- Clearer architecture — skill files are self-contained and authoritative

### Negative

- Agent files provided a quick-glance summary of each agent's role; this is now only available via the Skill Reference table in `CLAUDE.md` or by reading the full SKILL.md

## Related ADRs

- None (first ADR)
