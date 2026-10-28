# Developer Documentation

## Tech Stack

- **Next.js 16** with App Router and React 19
- **Tailwind CSS v4** for styling
- **Motion** (`motion/react`), React `<ViewTransition>` and CSS for animation — see the motion rules in [the design language](../standards/design-language.md#motion)
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
├── standards/      # Design language, code, writing and shipping standards
└── dev/            # This file, architecture, contributing
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [standards/](../standards/README.md) | The project standard: design language, code, writing, shipping |
| [system-overview.md](../system-overview.md) | Domain rules, algorithm, worked examples |
| [design-spec.md](../design-spec.md) | Component specs: layout, states and behavior of each part of the app |
| [architecture.md](./architecture.md) | Module structure, data flow |
| [contributing.md](./contributing.md) | Dev setup, CI, practical tips |
| [backlog.md](../backlog.md) | Open stories and acceptance criteria |
| [decisions/](../decisions/) | Architecture decision records |

## Working with Claude

[CLAUDE.md](../../CLAUDE.md) is the entry point. It covers the `/story`, `/build` and `/design-review` skills in `.claude/skills/` and the lint and test hooks. [ADR-002](../decisions/adr-002-lean-claude-setup.md) explains why it's set up this way.
