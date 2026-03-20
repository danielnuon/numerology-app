<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Model Strategy

Each pipeline skill specifies its model via frontmatter. The assignment balances reasoning quality against cost and speed:

| Model | Skills | Why |
|-------|--------|-----|
| **Opus** | `/brain-dump`, `/cook`, `/designer` | Story quality and code correctness cascade through the entire pipeline. These skills need the strongest reasoning. |
| **Sonnet** | `/vibe-check`, `/connect`, `/test`, `/real`, `/yap` | Structured evaluation, coordination, and reporting. Pattern matching against criteria, not open-ended reasoning. |
| **Haiku** | `/ship-it` | Mechanical: git commands, CI checks, status reports. Lowest cognitive load. |

**Subagents:** When `/cook` spawns parallel implementation agents (e.g., 3 stories at once), use `model: "sonnet"` on the Agent tool calls. The orchestrating Opus conversation provides detailed specs, so subagents execute against clear instructions rather than reasoning from scratch.
