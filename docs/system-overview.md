# Khmer Numerology System — Core Specification

## What This Is

A fortune calculation system rooted in Khmer tradition that combines three inputs — birth month, Chinese zodiac year, and birth weekday — into a 12-number repeating life cycle. Each number represents the relative luck strength for a given year, and the cycle repeats every 12 years from birth.

## Inputs

The system requires three pieces of birth data:

| Input | Source | Range |
|-------|--------|-------|
| Birth month | Khmer lunar calendar (Margasir-based) | 1–12 |
| Birth year | Chinese zodiac (12-animal cycle) | 1–12 |
| Birth weekday | Day of the week | 1–7 |

## Calendar Foundation

This system uses a non-standard month cycle start. Unlike the standard Khmer New Year system, the month cycle begins at **Margasir** (approximately November–December), not the Gregorian January or the traditional Khmer New Year in April. This shifts all month indexing and is critical to producing correct results.

## The Three Rows

The calculation constructs three rows of numbers, each 12 columns wide.

### Row 1: Month Row (Margasir-Based)

Assign values 1–12, aligned so the birth month falls at its correct position relative to the Margasir start.

The birth month determines the starting value. For example, July maps to position 8, producing:

```
8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7
```

The row always contains all values 1–12 in cyclic order, starting from the birth month's Margasir-relative position.

### Row 2: Zodiac Row (12-Animal Cycle)

Each Chinese zodiac animal maps to a fixed number:

| Animal | Number | Animal | Number |
|--------|--------|--------|--------|
| Rat | 1 | Horse | 7 |
| Ox | 2 | Goat | 8 |
| Tiger | 3 | Monkey | 9 |
| Rabbit | 4 | Rooster | 10 |
| Dragon | 5 | Dog | 11 |
| Snake | 6 | Pig | 12 |

The row starts at the birth year's zodiac number and increments cyclically through all 12 values.

Example for Ox (2):
```
2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1
```

### Row 3: Day Row (7-Day Cycle — Non-Repeating)

Each weekday maps to a number (family-specific mapping). The row starts at the birth weekday's number and cycles through 7 values.

**Critical rule: The day row only occupies columns 1–7. Columns 8–12 receive no day value (effectively 0). The day row does NOT wrap or repeat to fill all 12 columns.**

Example for Thursday (5):
```
5, 6, 7, 1, 2, 3, 4, _, _, _, _, _
```

## Calculation

### Step 1: Column Summation

Sum each column vertically across all three rows. Columns 1–7 sum three values. Columns 8–12 sum only two values (month + zodiac) because the day row does not extend past column 7.

| Column | Formula (cols 1–7) | Formula (cols 8–12) |
|--------|-------------------|---------------------|
| 1–7 | month + zodiac + day | — |
| 8–12 | — | month + zodiac |

### Step 2: Modulo Reduction

Apply `mod 12` to each column sum to produce the final value:

```
final = column_sum mod 12
```

**Important: 12 mod 12 = 0, not 12.** Zero is a valid and meaningful output.

### Result

The 12 final values form the person's **life cycle** — a sequence that repeats every 12 years starting from their birth year.

## Worked Example

**Birth data:** July 24, 1997 (Thursday, Year of the Ox)

| Column | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|--------|---|---|---|---|---|---|---|---|---|----|----|-----|
| Month | 8 | 9 | 10 | 11 | 12 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| Zodiac | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 1 |
| Day | 5 | 6 | 7 | 1 | 2 | 3 | 4 | — | — | — | — | — |
| **Sum** | 15 | 18 | 21 | 17 | 20 | 11 | 14 | 12 | 14 | 16 | 18 | 8 |
| **mod 12** | **3** | **6** | **9** | **5** | **8** | **11** | **2** | **0** | **2** | **4** | **6** | **8** |

**Life cycle:** `3, 6, 9, 5, 8, 11, 2, 0, 2, 4, 6, 8`

## Interpretation

### Year-Level Luck (Micro)

Each number in the cycle corresponds to a year of life, starting at the birth year and repeating every 12 years.

| Number | Meaning |
|--------|---------|
| 10–11 | Very strong luck |
| 7–9 | Strong luck |
| 4–6 | Moderate / neutral |
| 1–3 | Weak luck |
| 0 | Reset / unstable |

**Primary rule:** Higher number = better luck. Lower number = worse luck.

### The Zero (Special Case)

A value of 0 occurs when the column sum is an exact multiple of 12. It represents:

- A reset point or transition
- Instability and unpredictability
- A year to avoid major risks and expect change

### Total Cycle Strength (Macro)

Sum all 12 final values to produce the **total score** — a macro-level evaluation of the entire life cycle.

| Total | Meaning |
|-------|---------|
| ~56 | Overall weak / difficult cycle |
| ~64 | Balanced / moderate cycle |
| ~72 | Strong / favorable cycle |

The total represents a baseline life trajectory. Individual year numbers show micro-level variation; the total shows the macro pattern.

### 12 Life Areas (Optional Layer)

Each column position can also map to a life domain, allowing year-by-domain interpretation:

| Position | Domain | Position | Domain |
|----------|--------|----------|--------|
| 1 | Self | 7 | Relationships |
| 2 | Family | 8 | Health |
| 3 | Movement | 9 | Status |
| 4 | Home | 10 | Opportunity |
| 5 | Money | 11 | Karma |
| 6 | Allies | 12 | Protection |

## Compatibility

Luck is not isolated — it is influenced by close relationships (partners, family members sharing a household).

### Tier Mapping

For compatibility purposes, each person's year number maps to a tier:

| Number | Tier |
|--------|------|
| 0 | Zero (override) |
| 1–3 | Low |
| 4–6 | Moderate |
| 7–11 | High (includes "very high" 10–11) |

### Year-Level Interaction

The interaction between two people's tiers for a shared year follows this complete matrix. Zero always overrides; all other combinations are symmetric (order doesn't matter).

| Person A | Person B | Result | Rationale |
|----------|----------|--------|-----------|
| 0 | Any | Unstable | Zero override — always takes precedence |
| Low | Low | Risk | Compounded weakness |
| Low | Moderate | Neutral | Moderate tempers low; net wash |
| Low | High | Stabilized | Strong compensates for weak |
| Moderate | Moderate | Neutral | Balanced, no strong pull |
| Moderate | High | Stabilized | Strong reinforces moderate |
| High | High | Amplified | Both strong, energy amplifies |

### Total-Level Interaction

Each person's total score also influences the relationship:

| Person A Total | Person B Total | Assessment |
|---------------|---------------|------------|
| Both ≥ 68 | | Strong stability |
| Both ≥ 60 | | Moderate stability |
| One ≥ 68, other < 60 | | Mixed stability |
| Both < 60 | | Challenging |

Partner influence is strongest in shared living, finances, and emotional state.

## Cycle Patterns

The 12-number sequence has structural characteristics worth noting:

- **Gradual rise to peak** — numbers may climb toward the highest value in the cycle
- **Sharp drop to reset** — a 0 value often follows a peak, creating a dramatic shift
- **Rebuild phase** — post-reset values typically climb again
- **Symmetry around reset** — the pattern before and after 0 may mirror each other
- **Repeated values** — the same number appearing multiple times indicates recurring themes

## Practical Guidance

For any given year:

1. Find the year's number in the cycle
2. Interpret its strength using the scale
3. Adjust based on:
   - Total score (baseline trajectory)
   - Partner's number for that year (if applicable)

**High years (7–11):** Take action, expand, invest, pursue opportunities.

**Moderate years (4–6):** Steady progress, balanced decisions, neither push nor retreat.

**Low years (1–3):** Be cautious, maintain what you have, avoid overextension.

**Zero years:** Expect change or reset. Avoid major risks. Prepare for transition.
