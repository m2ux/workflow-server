---
name: wp-plan
description: Guidelines for creating the work package plan artifact.
metadata:
  version: 1.2.0
  order: 10
  legacy_id: 10
---

# Work Package Plan Guide

The work package plan is the detailed implementation specification: enough detail for an implementer to begin work. Create it when the work package has 3+ distinct tasks, modifies multiple components or files, requires architectural decisions, or has performance/quality targets.

## Template

```markdown
# [Work Package Name] - Implementation Plan

> plan · [HIGH/MEDIUM/LOW] · [Planning/Ready/In Progress/Complete] · X-Yh agentic + Zh review · [date]

## Overview

### Problem & Scope
[One line linking the canonical statement: Problem, scope, and success criteria: [requirements](requirements-elicitation.md). Do not restate them here.]

## Inputs

[One line per consumed artifact — link the section that shaped the approach (anchors permitted), never restate its findings:]
- [Knowledge Base Research](kb-research.md#recommended-approach) — [what it contributed, one line]
- [Implementation Analysis](implementation-analysis.md#gap-analysis) — [what it contributed, one line]

## Proposed Approach

### Solution Design
[How will we solve the problem?]

### Alternatives Considered
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Option A | Pro 1 | Con 1 | **Selected** |
| Option B | Pro 1 | Con 1 | Rejected |

### Assumptions
[One line: Assumptions underlying the approach: [assumptions log](assumptions-log.md). Do not restate them here.]

## Implementation Tasks

### Task 1: [Name] (X-Y min)
**Goal:** [Objective]
**Deliverables:**
- `src/path/to/component` - Description
- `tests/...` - Test coverage

### Task 2: [Name] (X-Y min)
[Continue pattern...]

## Success Criteria

[One line: Success criteria: [requirements](requirements-elicitation.md#success-criteria); baselines and measurement: [implementation analysis](implementation-analysis.md#baseline-metrics). Add ONLY task-level acceptance items that exist nowhere else, each linked to its gap ID.]

## Testing Strategy

[One line: Test cases and acceptance matrix: [test plan](test-plan.md). Add ONLY ordering or fixture constraints the test plan does not carry.]

## Dependencies & Risks

### Requires (Blockers)
[Omit this section if none]
- [ ] Dependency A

### Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk 1] | HIGH/MEDIUM/LOW | HIGH/MEDIUM/LOW | [Strategy] |

**Status:** Ready for implementation
```

## Rules

- **Problem & Scope, Success Criteria, Testing Strategy, Assumptions** — link-only slots: a markdown link to the canonical home plus at most one line (see the [canonical-home map](../techniques/manage-artifacts/TECHNIQUE.md#canonical-home-map)). Restating homed content in these slots is a conformance violation.
- **Inputs** — one line per consumed artifact, linking the specific section that shaped the approach; never reproduce findings. The plan documents what it *decided*, the inputs document what was *learned*.
- **Proposed Approach** — the plan's canonical content: describe the solution, document alternatives considered with pros/cons and decision, and record each design decision's rationale so reviewers and implementers can validate or challenge it. Design decisions home here (durable ones graduate to an ADR at completion).
- **Implementation Tasks** — discrete, estimable, completable in one session, with concrete deliverable paths and test coverage. Forbidden patterns: verification-as-task (e.g. "Task: Verify compilation", "Task: Verify existing tests pass") and raw cargo invocations (`cargo check`, `cargo test`) as tasks. Vague tasks ("make search better") are also rejected.
- **Dependencies & Risks** — the planning risk register homes here: list blockers; every risk gets impact, probability, and a mitigation strategy.
- **Line budget** — 150 lines. A plan over budget is restating homed content or padding; cut before committing.
