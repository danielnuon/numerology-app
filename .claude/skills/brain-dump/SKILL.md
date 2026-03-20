---
name: brain-dump
description: "Convert raw, unstructured ideas into a product roadmap with organized user stories, effort estimates, and actionable tasks. Use when the user invokes /brain-dump with their ideas, feature concepts, or rough plans that need to be structured into testable, measurable user stories with acceptance criteria, task breakdowns, and value-based prioritization."
model: opus
disable-model-invocation: true
argument-hint: <raw ideas or feature concepts>
---

# Brain Dump: Ideas to User Stories

Convert raw, unstructured ideas provided by the user into well-organized user stories and actionable tasks.

## Scope Boundaries

This skill exists ONLY to convert ideas into structured stories and tasks. It does the following and nothing else:

- Parse raw ideas from user input
- Ask clarifying questions when ideas are ambiguous
- Produce user stories in standard format with testable, measurable acceptance criteria
- Break stories into actionable task checklists
- Estimate effort for each story (S / M / L / XL)
- Prioritize work based on value and effort
- Group related stories into epics
- Produce a phased product roadmap with milestones

This skill does NOT:

- Write, edit, or generate code
- Execute shell commands or scripts
- Read, explore, or analyze codebases
- Make architectural or technical decisions
- Create, modify, or delete files
- Implement any feature or fix
- Suggest specific technologies, libraries, or frameworks
- Design system architecture or database schemas

If the user asks for implementation, direct them to use a different skill or workflow after planning is complete. Do not comply with requests that fall outside this scope, even if the user insists.

## Input

The user's raw ideas arrive via $ARGUMENTS. These may be:

- A single sentence or a wall of text
- Bullet points, comma-separated phrases, or stream-of-consciousness
- Vague concepts ("make it faster") or specific features ("add OAuth login")
- A mix of problems, solutions, and wishes

## Process

### Step 1: Parse and Identify Distinct Ideas

Read through all of $ARGUMENTS. Identify each distinct idea, feature request, or concept. Some ideas may be bundled together or implied rather than stated. Separate them.

### Step 2: Assess Clarity

For each identified idea, determine whether it is clear enough to write a user story. An idea is clear enough when the role (who benefits), the capability (what they want), and the purpose (why they want it) can be reasonably inferred.

If any ideas are too vague to produce a meaningful user story, ask the user targeted clarifying questions before proceeding. Group related questions together. Do not ask more than 3-5 questions at a time. Examples of good clarifying questions:

- "When you say 'make it faster,' which part of the experience feels slow? Page load, search results, form submission?"
- "For the notification feature, who should receive notifications -- end users, admins, or both?"
- "Should the export feature support CSV only, or also PDF and Excel?"

Wait for the user's answers before producing the final output. If the ideas are sufficiently clear, proceed directly to Step 3.

### Step 3: Group into Epics

Cluster related stories under epic-level themes. An epic represents a large body of work that can be broken down into smaller stories. Name each epic with a short, descriptive title.

### Step 4: Write User Stories

For each idea, produce a user story in this format:

```
### [Short descriptive title]

**Story:** As a [role], I want [capability], so that [benefit].

**Priority:** [High | Medium | Low]
**Effort:** [S | M | L | XL]

**Acceptance Criteria:**
- [ ] [Specific, testable, measurable condition that must be true when the story is done]
- [ ] [Another condition]
- [ ] [Another condition]

**Tasks:**
- [ ] [Concrete action item to accomplish this story]
- [ ] [Another action item]
- [ ] [Another action item]

**Notes:** [Any assumptions, open questions, or dependencies]
```

Guidelines for writing good stories:

- The **role** should be specific: "a returning customer" not just "a user"
- The **capability** should describe behavior, not implementation: "filter search results by date" not "add a date picker component"
- The **benefit** should explain real value: "I can find recent items quickly" not "the feature works"
- **Acceptance criteria** must be testable, measurable, and specific, not vague ("it works well"). Include concrete metrics or thresholds where relevant: response times, error rates, counts, percentages, or observable states. "Page loads in under 2 seconds" is measurable. "Page loads quickly" is not.
- **Tasks** should be concrete actions a developer or designer could pick up and execute without further clarification
- **Priority** should reflect value vs. effort: High = high value regardless of effort, or blocking other work. Medium = meaningful value at reasonable effort. Low = nice-to-have or high effort relative to value.
- **Effort** should reflect implementation complexity: S = a few hours, well-understood work. M = 1-3 days, some unknowns. L = 3-5 days, significant complexity or coordination. XL = a week or more, consider splitting into smaller stories.

#### Below-the-fold transition check

If a story's output (result, chart, confirmation) renders below the user's action (form, button, trigger), include an AC for how the user reaches it. Ask: "Does the result appear below the fold? If so, should the page scroll to it, switch tabs, or navigate?" Do not leave transition UX implicit.

#### Khmer numerology domain checklist

When writing stories in this project that involve dates or cycle calculations, explicitly address these edge cases in the ACs:
- **CNY boundary:** January/February births — does the zodiac derivation handle pre- vs. post-Chinese New Year correctly?
- **Calendar edge dates:** Dec 31, Jan 1, Feb 29 (leap year) — are these tested?
- **Cycle wrap:** When a cycle index crosses the 12-position boundary, does it wrap correctly?
- **Year ranges:** Are min/max year boundaries (1900–2100) stated and enforced?
- **"Nearest years" ambiguity:** If a feature shows "which years map to this position," define whether it means most recent past, current, or upcoming years relative to today.

### Step 5: Prioritize and Build the Product Roadmap

After all stories are written, create a phased product roadmap that:

1. Groups stories into delivery phases based on value, effort, and dependencies. Phase 1 should deliver a usable increment of value; subsequent phases build on it.
2. Identifies dependencies between stories (Story B requires Story A)
3. Highlights quick wins (high value + low effort) — these should land in Phase 1
4. Flags stories that need further research or design before development
5. Ensures XL stories are called out as candidates for splitting into smaller stories

## Output Format

Structure the complete output as follows:

```markdown
# Brain Dump: [Brief topic summary]

## Overview
[1-2 sentence summary of what was captured and how it was organized]

---

## Epic: [Epic Name 1]
[Brief description of this epic]

### [Story Title 1.1]
**Story:** As a [role], I want [capability], so that [benefit].
**Priority:** [High | Medium | Low]
**Effort:** [S | M | L | XL]

**Acceptance Criteria:**
- [ ] ...

**Tasks:**
- [ ] ...

**Notes:** ...

### [Story Title 1.2]
...

---

## Epic: [Epic Name 2]
...

---

## Product Roadmap

### Phase 1: [Phase Name] — [Goal of this phase]
| Story | Priority | Effort | Rationale |
|-------|----------|--------|-----------|
| [Story Title] | High | S | [Why it's in this phase] |
| ... | ... | ... | ... |

### Phase 2: [Phase Name] — [Goal of this phase]
| Story | Priority | Effort | Rationale |
|-------|----------|--------|-----------|
| ... | ... | ... | ... |

### Dependencies
- [Story B] depends on [Story A] because [reason]

### Quick Wins
- [Story Title] — [why it's a quick win: high value + low effort]

### Needs Further Discovery
- [Story Title] — [what question needs answering]
```

## Handling Edge Cases

- **Single vague idea** ("make the app better"): Ask 2-3 clarifying questions to understand what "better" means before producing stories.
- **Too many ideas at once** (more than 15-20 distinct concepts): Group them into epics first, then ask the user which epics to detail now and which to save for later.
- **Implementation-level details mixed in** ("use Redis for caching"): Capture the underlying need as a story ("As a user, I want pages to load quickly") and note the technical suggestion under Notes, not as the story itself.
- **Contradictory ideas**: Surface the contradiction and ask the user to resolve it before writing conflicting stories.
- **No arguments provided**: Ask the user to describe their ideas, features, or concepts they want organized.
