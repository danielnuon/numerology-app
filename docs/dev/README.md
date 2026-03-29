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
├── app/            # Client-facing docs
└── dev/           # This file
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [system-overview.md](../system-overview.md) | Domain rules, algorithm, worked examples |
| [design-spec.md](../design-spec.md) | Visual design, component specs |
| [architecture.md](./architecture.md) | Module structure, data flow |
| [contributing.md](./contributing.md) | Dev setup, conventions, CI |
| [product-roadmap.md](./product-roadmap.md) | Stories, acceptance criteria |

## Agent Pipeline

This project uses a multi-agent pipeline for development. See [AGENTS.md](../../AGENTS.md) for model assignments and pipeline structure.
