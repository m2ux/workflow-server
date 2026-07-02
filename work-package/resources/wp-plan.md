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

### Problem Statement
[2-4 sentences: what problem exists, why it matters, impact of not solving it. State it once here — later sections reference this statement rather than re-narrating the problem.]

### Scope
**In Scope:** [Items]
**Out of Scope:** [Items with reasons]

## Research & Analysis

*See companion planning artifacts for full details — link, don't copy:*
- **Knowledge Base Research:** KB research artifact
- **Implementation Analysis:** Implementation analysis artifact

### Key Findings Summary

**From KB Research:**
- [Key concept/pattern discovered]
- [Applicable best practice]

**From Implementation Analysis:**
- **Baseline:** [Key metric] = [value]
- **Gap:** [Primary gap to address]
- **Opportunity:** [Main improvement opportunity]

## Proposed Approach

### Solution Design
[How will we solve the problem?]

### Alternatives Considered
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Option A | Pro 1 | Con 1 | **Selected** |
| Option B | Pro 1 | Con 1 | Rejected |

### Assumptions
- [Assumption underlying the approach, e.g. expected input format, environment, prerequisite state]

## Implementation Tasks

### Task 1: [Name] (X-Y min)
**Goal:** [Objective]
**Deliverables:**
- `src/path/to/component` - Description
- `tests/...` - Test coverage

### Task 2: [Name] (X-Y min)
[Continue pattern...]

## Success Criteria

*Based on baseline metrics and gap analysis above*

### Functional Requirements
- [ ] Requirement 1 (addresses gap: [Gap ID])

### Performance Targets
- [ ] **[Metric]:** Improve from [baseline] to [target] ([X]% improvement)
- [ ] **[Metric]:** Achieve [target] (new capability — no baseline)

### Quality Requirements
- [ ] Test coverage ≥X% (baseline: Y%)
- [ ] All tests passing
- [ ] ADR written

### Measurement Strategy
- [Test/script/report that proves each target achieved]
- [Comparison methodology for before/after]

## Testing Strategy

### Unit Tests
- Component X: [Test scenarios]

### Integration Tests
[Omit this section if not applicable]

### E2E Tests
[Omit this section if not applicable]

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

- **Problem Statement** — 2-4 sentences answering: what problem exists, why it matters, what's the impact of not solving it. Be specific (e.g. "vector-only search misses exact term matches, eroding user trust"), never vague ("search needs to be better"). Later sections reference the Problem Statement instead of restating the problem (state-once-per-artifact).
- **Scope** — explicit in/out boundaries to prevent scope creep; give the reason for each out-of-scope item.
- **Research & Analysis** — link companion artifacts and summarize only the findings most relevant to implementation (single-source-and-link); do not duplicate their content.
- **Proposed Approach** — describe the solution, document alternatives considered with pros/cons and decision, and record each design decision's rationale alongside the assumptions it depends on so reviewers and implementers can validate or challenge them.
- **Implementation Tasks** — discrete, estimable, completable in one session, with concrete deliverable paths and test coverage. Forbidden patterns: verification-as-task (e.g. "Task: Verify compilation", "Task: Verify existing tests pass") and raw cargo invocations (`cargo check`, `cargo test`) as tasks. Vague tasks ("make search better") are also rejected.
- **Success Criteria** — measurable, linked to baselines and gap IDs from the analysis (e.g. "P95 latency: 487ms → 200ms, 59% reduction"), never unquantified ("search is faster"). New capabilities with no baseline state the absolute target. Measurement Strategy names the specific test/script/log comparison that proves each target.
- **Testing Strategy** — specific test scenarios per category (unit/integration/e2e), including edge cases.
- **Dependencies & Risks** — list blockers; every risk gets impact, probability, and a mitigation strategy.
