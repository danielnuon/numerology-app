# Khmer Numerology

A fortune calculation app rooted in Khmer tradition. Combines birth month (Margasir lunar calendar), Chinese zodiac year, and birth weekday into a 12-number repeating life cycle that maps luck strength across years and life domains.

The visual design draws from Khmer satra (palm-leaf manuscripts) — parchment textures, sepia ink, gold accents for sacred elements, and generous whitespace evoking temple proportions.

## Tech Stack

- **Next.js 16** with App Router and React 19
- **Tailwind CSS v4** for utility-first styling with custom design tokens
- **Framer Motion** for staggered cycle reveal and pillar selection animations
- **TypeScript** throughout
- **Jest 30** + ts-jest for pure-logic unit tests
- **GitHub Actions** for CI

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Requires Node >= 22.

## Project Structure

```
src/
  app/            # Next.js App Router pages and layout
  components/     # UI components (birth form, cycle chart, detail panel)
  lib/numerology/ # Core calculation engine, interpretation data, calendar mappings
docs/             # Domain knowledge, design spec, roadmap
```

## Documentation

| Doc | Contents |
|-----|----------|
| [`docs/system-overview.md`](docs/system-overview.md) | Domain rules, three-row algorithm, worked examples, interpretation tiers |
| [`docs/design-spec.md`](docs/design-spec.md) | Visual design, color palette, typography, component specs, interaction patterns |
| [`docs/product-roadmap.md`](docs/product-roadmap.md) | Stories, acceptance criteria, phase tracking |
| [`docs/architecture.md`](docs/architecture.md) | Module structure, data flow, type contracts, design decisions |
| [`docs/contributing.md`](docs/contributing.md) | Dev setup, project conventions, commit/CI guidelines |

## Agent Pipeline

This project uses a multi-skill agent pipeline for development. See [`AGENTS.md`](AGENTS.md) for model assignments and pipeline structure.
