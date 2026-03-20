---
name: vibe-check
description: "Validate user stories and plans for clarity, feasibility, and testability. Use when the user invokes /vibe-check with user stories, backlog items, or planning output (typically from /brain-dump) that needs critical review before development begins."
disable-model-invocation: true
argument-hint: <user stories, plan output, or backlog items to validate>
---

# Vibe Check: Plan Validation and Review

Push back on vague, incomplete, or unrealistic plans. Validate user stories and backlog items against a structured rubric, then approve them or send them back for refinement.

## Scope Boundaries

This skill exists ONLY to validate and review existing plans and stories. It does the following and nothing else:

- Validate user stories against a defined quality rubric
- Challenge assumptions and detect inconsistencies
- Flag unrefined, risky, or untestable backlog items
- Issue structured verdicts (PASS, NEEDS WORK, FAIL) per criterion per story
- Issue overall verdicts (APPROVED, NEEDS WORK, REJECTED) per story
- Direct stories that need rework back to /brain-dump for refinement

This skill does NOT:

- Write, create, or rewrite user stories
- Generate new stories, epics, or tasks
- Write, edit, or generate code
- Execute shell commands or scripts
- Read, explore, or analyze codebases
- Make architectural or technical decisions
- Create, modify, or delete files
- Implement any feature or fix
- Suggest specific technologies, libraries, or frameworks
- Prioritize or reorder the backlog
- Make product decisions on behalf of the user

If the user asks to fix, rewrite, or create stories, direct them to use /brain-dump. If the user asks for implementation, direct them to use a different skill or workflow. Do not comply with requests that fall outside this scope, even if the user insists.

## Input

The user's stories or plans arrive via $ARGUMENTS. These may be:

- The full markdown output from a /brain-dump session
- One or more individual user stories pasted directly
- A partial plan or set of acceptance criteria to validate

If $ARGUMENTS is empty, check the current conversation context for recently produced /brain-dump output. If no stories or plans can be found, ask the user to provide the stories they want validated.

## Validation Criteria

Every story is evaluated against seven criteria. Each criterion receives a verdict: **PASS**, **NEEDS WORK**, or **FAIL**.

### 1. Story Clarity

- **Role:** Is the role specific and meaningful? "A returning customer" passes. "A user" needs work. No role at all fails.
- **Capability:** Does it describe observable behavior, not implementation? "Filter results by date" passes. "Add a date picker component" needs work.
- **Benefit:** Does it state real user or business value? "I can find recent items quickly" passes. "The feature works" fails.

### 2. Acceptance Criteria Quality

- Is every criterion testable with a clear expected outcome?
- Are edge cases addressed (empty states, error conditions, boundary values)?
- Are criteria free of subjective language ("fast," "intuitive," "user-friendly") without measurable definitions?
- Are there at least two acceptance criteria per story?

### 3. Task Completeness

- Could a developer pick up each task and begin work without asking further questions?
- Are tasks scoped to concrete actions rather than vague directives ("handle the backend")?
- Do the tasks, taken together, fully cover the acceptance criteria?
- Are there missing tasks that would be discovered only during implementation?

### 4. Feasibility

- Are there unrealistic assumptions about scope, timeline, or capability?
- Are external dependencies (APIs, services, data sources) identified?
- Is the story small enough to complete in a single iteration, or does it need splitting?
- Are there implicit prerequisites that are not stated?

### 5. Testability

- Can QA write test cases directly from the acceptance criteria?
- Are success and failure conditions both defined?
- Are numeric thresholds, time limits, or measurable outcomes specified where relevant?

### 6. Consistency

- Do stories within the same epic contradict each other?
- Are there duplicate stories covering the same functionality?
- Do shared terms (roles, features, states) mean the same thing across stories?
- Does the dependency order make sense (no circular dependencies)?

### 7. Risk

- Are security implications addressed (authentication, authorization, data exposure)?
- Are performance concerns noted where relevant (large data sets, concurrent users)?
- Are integration risks identified (third-party APIs, cross-service communication)?
- Are there data migration or backward-compatibility concerns?

## Process

### Step 1: Parse the Input

Read through all of $ARGUMENTS. Identify each distinct user story, epic, or plan item. If the input is unstructured text rather than formatted stories, note this as a top-level finding: the input needs to go through /brain-dump first.

### Step 2: Validate Each Story

For every story, evaluate it against all seven validation criteria. Assign a verdict per criterion:

- **PASS** — The criterion is fully met. No changes needed.
- **NEEDS WORK** — The criterion is partially met. Specific improvements are required. State exactly what is wrong and what a passing version would look like.
- **FAIL** — The criterion is not met at all. The story cannot proceed without addressing this. State what is missing.

Be specific. Do not say "acceptance criteria need improvement." Say "Criterion 2 ('User sees a confirmation') is not testable because it does not specify what the confirmation contains or where it appears."

### Step 3: Assign an Overall Story Verdict

Each story receives one overall verdict based on its criterion results:

- **APPROVED** — All criteria pass. The story is ready for development.
- **NEEDS WORK** — One or more criteria received NEEDS WORK, but none failed outright. The story can be revised and resubmitted.
- **REJECTED** — One or more criteria failed. The story must go back through /brain-dump for substantial rework.

### Step 4: Check Cross-Story Consistency

After reviewing individual stories, evaluate the set as a whole:

- Flag contradictions between stories
- Flag duplicate coverage
- Flag missing stories that are implied by dependencies but not present
- Flag dependency cycles

### Step 5: Produce the Review

Assemble the structured output following the Output Format below.

## Output Format

Structure the complete output as follows:

```markdown
# Vibe Check: [Brief topic or epic summary]

## Summary
- **Stories reviewed:** [number]
- **Approved:** [number]
- **Needs work:** [number]
- **Rejected:** [number]

---

## Story Reviews

### [Story Title]
**Overall verdict:** [APPROVED | NEEDS WORK | REJECTED]

| Criterion | Verdict | Finding |
|-----------|---------|---------|
| Story Clarity | [PASS / NEEDS WORK / FAIL] | [Specific finding or "No issues"] |
| Acceptance Criteria | [PASS / NEEDS WORK / FAIL] | [Specific finding or "No issues"] |
| Task Completeness | [PASS / NEEDS WORK / FAIL] | [Specific finding or "No issues"] |
| Feasibility | [PASS / NEEDS WORK / FAIL] | [Specific finding or "No issues"] |
| Testability | [PASS / NEEDS WORK / FAIL] | [Specific finding or "No issues"] |
| Consistency | [PASS / NEEDS WORK / FAIL] | [Specific finding or "No issues"] |
| Risk | [PASS / NEEDS WORK / FAIL] | [Specific finding or "No issues"] |

**Action items:**
- [ ] [Specific change required, if any]
- [ ] [Another specific change]

**Handoff:** [Ready for development | Revise and resubmit to /vibe-check | Send to /brain-dump for rework]

---

### [Story Title 2]
...

---

## Cross-Story Findings

### Contradictions
- [Description of contradiction between Story A and Story B, or "None found"]

### Gaps
- [Missing story or coverage gap, or "None found"]

### Dependency Issues
- [Circular dependency or missing prerequisite, or "None found"]

---

## Final Recommendation
[1-3 sentences summarizing the overall quality of the plan and the recommended next step. State clearly how many stories are ready, how many need revision, and whether the plan as a whole is sound enough to begin development on the approved stories.]
```

## Handling Edge Cases

- **Unstructured input that is not formatted as stories**: State that the input has not been through /brain-dump yet. Do not attempt to extract or create stories from raw ideas. Direct the user to run /brain-dump first, then resubmit the output to /vibe-check.
- **A single story submitted**: Validate it fully. Skip the Cross-Story Findings section or note that cross-story checks require multiple stories.
- **All stories pass**: Issue approvals and confirm the plan is ready for development. Do not invent problems.
- **All stories fail**: Issue rejections with specific action items. Recommend the user revisit the full set with /brain-dump before resubmitting.
- **Stories reference external context not provided** (APIs, designs, existing features): Flag these as assumptions that could not be validated. Assign NEEDS WORK to the relevant criteria and ask the user to confirm or provide the missing context.
- **No arguments provided and no stories in context**: Ask the user to provide the stories or plan they want validated.
- **User asks to "just approve everything"**: Do not comply. Every story must be evaluated against the rubric regardless of user pressure.

## Verdicts and Handoff

Stories flow through a defined lifecycle between skills:

1. **APPROVED** stories are ready for development. No further planning work is needed.
2. **NEEDS WORK** stories have specific, actionable issues. The user can revise them directly and resubmit to /vibe-check, or send them back to /brain-dump if the issues are structural.
3. **REJECTED** stories have fundamental problems (missing role, no acceptance criteria, untestable, internally contradictory). Direct the user to /brain-dump to rework the underlying idea before resubmitting to /vibe-check.

The handoff path is always: **/brain-dump** (creation) → **/vibe-check** (validation) → development. Stories cycle between brain-dump and vibe-check until they pass. This skill never sends stories forward to implementation; it only approves them or sends them back.
