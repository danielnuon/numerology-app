# Solini — Khmer Numerology

A lantern for every year in your cycle. Enter your birth date and Solini reads a luck number for every year of your 12-year cycle, from a Cambodian tradition rarely found online. Readings are for reflection, not prediction.

Live at [solini.vercel.app](https://solini.vercel.app).

## What It Does

Solini calculates a personal life cycle based on three inputs:
- **Birth month** (counted from Margasir, the lunar month around November–December)
- **Birth year** (zodiac animal, counted from Khmer New Year by default, or Chinese New Year if you prefer)
- **Birth weekday**

The result is a 12-number cycle representing luck strength for each year of your life, starting from birth and repeating every 12 years.

## Understanding Your Cycle

Each number in your cycle maps to a luck tier:

| Number | Luck Tier |
|--------|-----------|
| 10–11 | Very strong |
| 7–9 | Strong |
| 4–6 | Moderate |
| 1–3 | Weak |
| 0 | Reset / Transition |

Your cycle also shows:
- **Year-level luck** — strength for any given year
- **Total cycle strength** — overall trajectory (weak ~56, balanced ~64, strong ~72)
- **Life areas** — each position maps to a domain (self, family, money, health, etc.)

## Coming Later

Partner comparison (how two cycles interact), a share card and a Khmer language option are on the [roadmap](docs/dev/product-roadmap.md).

## Usage

1. Enter your birth date (Solini works out the weekday and zodiac animal)
2. View your 12-year life cycle
3. See your current year's luck strength
4. Explore individual year details and life areas
5. Come back any time: your birth date is saved in your browser only

---

For development details, see [docs/dev/README.md](docs/dev/README.md).
