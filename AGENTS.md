<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Model Strategy

Each pipeline skill specifies its model via frontmatter. The assignment balances reasoning quality against cost and speed:

| Model | Skills | Why |
|-------|--------|-----|
| **Haiku** | `/brain-dump`, `/vibe-check`, `/connect`, `/yap`, `/ship-it` | Lightweight: parsing, coordination, reporting |
| **Sonnet** | `/cook`, `/designer`, `/test`, `/real` | Standard coding, testing, and design work |
| **Opus** | — | Reserved for rare complex tasks |

**Subagents:** When `/cook` spawns parallel implementation agents (e.g., 3 stories at once), use `model: "sonnet"` on the Agent tool calls. The orchestrating conversation provides detailed specs, so subagents execute against clear instructions rather than reasoning from scratch.
