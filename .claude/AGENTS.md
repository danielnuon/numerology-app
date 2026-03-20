# Agent Pipeline

This project uses a 9-agent system to move work from raw ideas to deployed software. 8 agents form the main pipeline; 1 helper agent (/designer) provides on-demand design direction. Each agent has a single responsibility and strict scope boundaries. No agent may perform another agent's job.

## Pipeline Flow

```
                            ┌────────────┐
                            │ /designer  │ ← design direction on demand
                            └─────┬──────┘
                                  │ informs
                                  ▼
/brain-dump → /vibe-check → /connect → /cook → /test → /real → /ship-it → /yap
   (plan)      (validate)  (coordinate) (build)  (test)   (QA)   (deploy)  (retro)
      ↑                                                                      |
      └──────────────────── lessons learned ──────────────────────────────────┘
```

Stories flow left to right. Failures flow right to left. Lessons loop from the end back to the beginning. /designer sits alongside the pipeline and can be invoked at any stage when UI/UX direction is needed.

## Agents

### /brain-dump — Planning Agent
**Role:** Convert raw ideas into structured user stories, effort estimates, and a phased product roadmap.

**Owns:** Story creation, acceptance criteria, effort estimates, epic grouping, roadmap phasing.

**Boundaries:** Does not write code, run commands, read codebases, or make technical decisions. Produces planning artifacts only.

**Triggers:** User has raw ideas, feature concepts, or unstructured plans that need organizing.

---

### /vibe-check — Validation Agent
**Role:** Push back on vague or unrealistic plans. Validate stories against a 7-criterion rubric before development begins.

**Owns:** Story validation, quality verdicts (APPROVED / NEEDS WORK / REJECTED), cross-story consistency checks.

**Criteria:** Story Clarity, Acceptance Criteria Quality, Task Completeness, Feasibility, Testability, Consistency, Risk.

**Boundaries:** Does not create, rewrite, or modify stories. Validates only. Rejected stories route back to /brain-dump.

**Triggers:** User has stories (typically from /brain-dump) that need review before development.

---

### /connect — Coordinator Agent
**Role:** Keep all agents aligned. Track pipeline state, enforce workflow rules, and surface what needs attention.

**Owns:** Pipeline status tracking, stage-gate enforcement, bottleneck detection, blocker registration, next-action recommendations.

**Subcommands:** `status`, `next`, `check [story]`, `retry [story]`, `blocker [description]`.

**Boundaries:** Does not create stories, validate quality, write code, run tests, or deploy. Coordinates only.

**Triggers:** User wants to check pipeline status, figure out what to do next, or manage workflow.

---

### /cook — Development Agent
**Role:** Turn approved stories into working software. Implements features, writes unit tests, and commits changes.

**Owns:** Feature implementation, unit tests, code commits, bug fixes (from /test or /real reports).

**Subcommands:** `[story title]`, `fix [issue]`.

**Boundaries:** Only implements stories with an APPROVED verdict from /vibe-check. Does not run integration/E2E tests, conduct QA, deploy, or make product decisions. Does not add features beyond the acceptance criteria.

**Triggers:** User has an approved story ready for implementation, or a bug reported by /test or /real.

---

### /test — Testing Agent
**Role:** Validate that implementations meet acceptance criteria. Catches bugs, edge cases, and gaps in test coverage.

**Owns:** Automated test execution, acceptance criteria verification, edge case testing, regression detection, test coverage analysis.

**Subcommands:** `[story title]`, `suite`, `regression`.

**Boundaries:** Does not write feature code or fix bugs (routes failures to /cook). Does not conduct exploratory/UX testing (that is /real). Reports only.

**Triggers:** User has a completed /cook implementation to verify, or wants to run the test suite.

---

### /real — QA Agent
**Role:** Simulate real-world usage. Validates usability, workflows, and catches what automated tests miss.

**Owns:** Exploratory testing, UX validation, workflow verification, visual/behavioral regression detection, usability feedback.

**Subcommands:** `[story title]`, `flows`, `regression`.

**Verdicts:** PASSED QA, NEEDS FIXES, BLOCKED.

**Boundaries:** Does not write code, run automated tests, or fix issues. Provides feedback only. Routes issues to /cook for fixes.

**Triggers:** User has a feature that passed /test and needs human-perspective validation.

---

### /ship-it — DevOps Agent
**Role:** Deploy code safely. Manages CI/CD, staging, production, and rollbacks.

**Owns:** Deployments, pipeline status, rollbacks, deployment verification, environment monitoring.

**Subcommands:** `deploy [env]`, `status`, `rollback [env]`, `logs`.

**Boundaries:** Only deploys code that has passed both /test and /real. Does not write feature code, run tests, or conduct QA. Does not modify application logic.

**Triggers:** User has a feature that passed QA and is ready for deployment.

---

### /yap — Retrospective Agent
**Role:** Learn from the past. Analyzes metrics, identifies patterns, and recommends improvements.

**Owns:** Sprint retrospectives, pipeline metrics, trend analysis, lessons learned, process improvement recommendations.

**Subcommands:** `retro`, `metrics`, `trends`, `lessons`.

**Boundaries:** Analyzes and recommends only. Never implements changes directly. Feeds insights back to /brain-dump and /vibe-check for future cycles.

**Triggers:** User wants to review how a sprint went, identify bottlenecks, or extract lessons learned.

## Helper Agents

### /designer — UI/UX Design Agent
**Role:** Translate loose ideas into actionable design direction. Expert in modern web design — latest tooling, libraries, and patterns for professional, elegant interfaces.

**Owns:** Layout design, component specification, color palettes, typography, responsive strategies, interaction patterns, accessibility guidance, implementation suggestions for /cook.

**Boundaries:** Gives direction only — never writes, edits, or generates production code. Does not create files, install packages, or run commands. Suggests how to achieve designs but /cook implements.

**Triggers:** User needs UI/UX direction — "how should this look?", "what component pattern?", "redesign this flow", or any visual/interaction design question.

**Pipeline role:** Helper agent, not a stage-gate. Can be invoked at any point — before /cook (design upfront), during /cook (component questions), or after /real (redesign from QA feedback).

---

## Workflow Rules

These rules are enforced by /connect and respected by all agents:

1. **No skipping stages.** Every story must pass through the pipeline in order. A story cannot enter development without an APPROVED verdict from /vibe-check. Code cannot be deployed without passing /test and /real.

2. **No lane-crossing.** Each agent operates within its defined scope. /cook does not validate stories. /test does not fix bugs. /real does not write tests. /ship-it does not modify code. /yap does not implement recommendations.

3. **Failures flow backward.** When an agent finds a problem, it routes the story back to the appropriate upstream agent:
   - /vibe-check REJECTED → /brain-dump
   - /vibe-check NEEDS WORK → revise and resubmit to /vibe-check
   - /test FAIL → /cook fix
   - /real NEEDS FIXES → /cook fix
   - /ship-it FAILED → /cook fix or /ship-it rollback

4. **Blockers halt progress.** A blocked story cannot advance until the blocker is resolved. Register blockers with `/connect blocker`.

5. **Dependencies are respected.** If Story B depends on Story A, Story B cannot move to development until Story A is at least approved.

6. **Lessons loop back.** /yap feeds insights back to /brain-dump (better story creation) and /vibe-check (sharper validation criteria).

## Quick Reference

| Need to... | Use |
|------------|-----|
| Turn ideas into stories | `/brain-dump <ideas>` |
| Validate stories before building | `/vibe-check <stories>` |
| Check pipeline status | `/connect status` |
| See what to do next | `/connect next` |
| Build an approved story | `/cook <story>` |
| Fix a reported bug | `/cook fix <issue>` |
| Test an implementation | `/test <story>` |
| Run all tests | `/test suite` |
| QA a feature | `/real <story>` |
| Test user workflows | `/real flows` |
| Deploy to an environment | `/ship-it deploy <env>` |
| Check deployment status | `/ship-it status` |
| Roll back a deployment | `/ship-it rollback <env>` |
| Run a retrospective | `/yap retro` |
| Review pipeline metrics | `/yap metrics` |
| Extract lessons learned | `/yap lessons` |
| Get UI/UX design direction | `/designer <brief>` |
