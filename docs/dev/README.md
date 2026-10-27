# Developer Documentation

## Tech Stack

- **Next.js 16** with App Router and React 19
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations
- **TypeScript** throughout
- **Jest 30** + ts-jest for testing
- **GitHub Actions** for CI

## Quick Start

```bash
npm install
npm run dev
```

Requires Node >= 22.

## Project Structure

```
src/
├── app/            # Next.js App Router pages
├── components/     # React components
├── lib/numerology/ # Pure calculation logic
│   └── __tests__/ # Unit tests
docs/
├── backlog.md      # Open stories
├── decisions/      # Architecture decision records
└── dev/            # This file, architecture, contributing
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [system-overview.md](../system-overview.md) | Domain rules, algorithm, worked examples |
| [design-spec.md](../design-spec.md) | Visual design, component specs |
| [architecture.md](./architecture.md) | Module structure, data flow |
| [contributing.md](./contributing.md) | Dev setup, conventions, CI |
| [backlog.md](../backlog.md) | Open stories and acceptance criteria |
| [decisions/](../decisions/) | Architecture decision records |

## Working with Claude

[CLAUDE.md](../../CLAUDE.md) is the entry point. It covers the `/story`, `/build` and `/design-review` skills in `.claude/skills/` and the lint and test hooks. [ADR-002](../decisions/adr-002-lean-claude-setup.md) explains why it's set up this way.
