---
id: assumptions-review
version: 2.0.0
---

# Assumptions Guide

**Purpose:** Define rules for identifying, documenting, and reviewing assumptions throughout the work package lifecycle. This guide covers both the review process and the log template.

**When to use:** Throughout the entire workflow - from design philosophy through implementation. Each phase that involves decision-making should collect and review assumptions.

---

## Overview

**After completing each task, explicitly identify assumptions made during implementation.** This step surfaces implicit design decisions that may warrant user validation before proceeding.

The primary technique used here is **assumption elevation** — the process of making implicit assumptions explicit so they can be validated and managed. This is critical for preventing project failures due to false beliefs that compound across tasks.

---

## Sources of False Assumptions

Understanding *why* assumptions go wrong helps prevent errors. Five primary origins create incorrect assumptions:

| Source | Description | Prevention Strategy |
|--------|-------------|---------------------|
| **Lack of valid information** | Deciding based on incomplete or missing data | Explicitly identify information gaps before making decisions |
| **Invalidation over time** | Previously true assumptions that are no longer valid | Revisit assumptions when context, requirements, or environment changes |
| **Turnpike effects** | Changing conditions that invalidate prior decisions mid-implementation | Monitor for environmental changes; re-validate long-standing assumptions |
| **Requirements leakage** | Undocumented requirements communicated verbally or implied | Document all decisions, not just written requirements |
| **Overlooking existing solutions** | Building new components when existing infrastructure already handles the case | Search codebase for similar patterns before proposing new abstractions; check build scripts, deployment tools, and adjacent layers |

---

## Sources of Ambiguity

Assumptions often arise from different interpretations. Four categories of interpretation differences create hidden assumptions:

| Ambiguity Source | Description | Assumption Pattern |
|------------------|-------------|-------------------|
| **Observational errors** | Seeing situations differently | "I assumed X was happening because that's how I observed it" |
| **Recall errors** | Memory variations about prior decisions | "I assumed we decided Y in that meeting" |
| **Interpretation errors** | Understanding requirements differently | "I interpreted the requirement to mean Z" |
| **Problem statement ambiguity** | Unclear or incomplete specifications | "The spec didn't clarify, so I assumed..." |

When documenting assumptions, consider which ambiguity source contributed to the assumption.

---

## Assumption Categories

Use these categories to classify assumptions:

| Category | Description | Examples |
|----------|-------------|----------|
| **Behavioral** | How the system behaves in specific scenarios | Default values, fallback behavior, edge case handling |
| **Architectural** | Structural decisions about components | Component boundaries, data flow direction, abstraction levels |
| **Interface** | API and contract decisions | Function signatures, return types, error types |
| **Performance** | Trade-offs affecting speed/memory | Lazy vs eager evaluation, caching strategies, algorithm choice |
| **Compatibility** | Backward/forward compatibility | Breaking changes, deprecation handling, migration paths |
| **Scope** | What was included/excluded | Deferred features, intentional limitations, out-of-scope items |
| **Implicit Requirements** | Unspoken needs assumed to exist or not exist | Error handling not specified, logging levels, security boundaries, hidden functions |

---

## Questions to Ask Yourself

After completing a task, review your implementation against these questions:

### Requirements Questions

1. **What did I assume about requirements?** — Were there ambiguities I resolved without asking?
2. **Is this assumption based on current, valid information?** — Could it have become stale or been invalidated?
3. **Did I treat a preference as a hard constraint (or vice versa)?** — Are mandatory requirements truly mandatory?
4. **What implicit requirements did I assume?** — Are there hidden functions or capabilities I assumed were needed (or not needed)?

### Design Questions

5. **What alternatives did I reject?** — Why was this approach chosen over others?
6. **Is this problem already solved?** — Does existing infrastructure, configuration, or a different layer already handle this case? Check build scripts, deployment tools, and adjacent components before proposing new code.
7. **Is this the simplest solution?** — Could this be solved with less code, fewer abstractions, or existing configuration? Complexity should be justified by requirements, not assumed.
8. **What implicit contracts exist?** — Are there undocumented expectations about inputs, ordering, or state?
9. **What edge cases did I handle (or ignore)?** — How will the code behave in unexpected situations?

### Scope Questions

10. **What did I assume about scope boundaries?** — Did I make assumptions about what is explicitly *out of scope*?
11. **What would I do differently with more context?** — Are there decisions I'm uncertain about?

### Context-Free Questions

These high-level questions apply to any implementation task:

12. **Process:** Who should have been consulted about this decision?
13. **Product:** What problem does this solve, and did I solve the right one?
14. **Meta:** Am I asking the right questions about this implementation?

---

## Assumption Risk Assessment

Not all assumptions carry equal risk. Assess each assumption to prioritize validation:

| Risk Level | Criteria | Action |
|------------|----------|--------|
| **High** | Affects multiple components, external interfaces, or security | Must validate before proceeding to next task |
| **Medium** | Affects current task scope; moderate effort to change | Document and confirm at checkpoint |
| **Low** | Easily reversible; minimal downstream impact | Log for reference; batch validation acceptable |

When surfacing assumptions, indicate risk level to help prioritize user review.

---

## Best Practices

1. **Be specific** — Vague assumptions are hard to validate
2. **Include rationale** — Explain why the assumption seemed reasonable
3. **Assess risk** — Prioritize high-risk assumptions for immediate validation
4. **Identify ambiguity sources** — Understanding *why* helps prevent recurrence
5. **Document trade-offs** — Record alternatives considered for architectural decisions
6. **Document changes** — If corrected, describe exactly what changed
7. **Update summary** — Keep the summary table current after each task
8. **Complete final review** — Analyze patterns after work package completion

---

## Anti-Patterns

| Don't | Why |
|-------|-----|
| Skip assumption review after each task | Hidden design decisions compound errors; user loses opportunity to correct course early |
| Skip documentation after user confirms | Loses the audit trail; future maintainers need context |
| Document only corrections | Confirmed assumptions are equally valuable for understanding decisions |
| Use vague categories | "Misc" or "Other" categories hide important distinctions |
| Delay updates | Assumptions are harder to recall accurately after time passes |
| Omit rationale | Without "why", the assumption lacks context for review |
| Treat preferences as constraints | Creates impossible requirements or unnecessarily limits solutions |
| Treat constraints as preferences | Leads to solutions that violate actual requirements |
| Ignore implicit requirements | Hidden functions often cause the most costly rework |
| Skip risk assessment | All assumptions are not equal; prioritization enables efficient review |

---

## Trade-off Documentation

For architectural and design assumptions, document the trade-offs considered:

| Decision Point | Option A | Option B | Chosen | Rationale |
|----------------|----------|----------|--------|-----------|
| [What needed deciding] | [First approach] | [Second approach] | A or B | [Why this option was selected] |

This provides context for why an assumption was made and what alternatives were rejected.

---

## Why This Matters

- Catches misunderstandings before they compound across tasks
- Surfaces design decisions that may conflict with user intent
- Creates opportunities for course correction early
- Documents rationale that would otherwise be lost
- Enables expectation management by clarifying what will and will not be done
- Reduces risk by validating high-impact assumptions early

---

## Interactive Assumption Review (Interview Style)

**Preferred approach:** Present assumptions one at a time using the activity's assumption review checkpoint, with numbered alternatives for the user to choose from.

### Checkpoint Flow

Each activity has an `assumptions-review` checkpoint. During implementation, the `07-implement.toon` activity has per-task assumption checkpoints. For each assumption:

1. Present the assumption type, statement, and rationale
2. Offer alternatives including the current choice
3. User confirms or selects alternative via checkpoint
4. Mark assumption as confirmed or corrected

### User Response Options

| Response | Meaning | Agent Action |
|----------|---------|--------------|
| Confirmed | Current choice is correct | Mark confirmed, proceed to next |
| Select alternative | Choose numbered option | Implement change, mark corrected |
| Need correction | Custom alternative needed | Discuss and implement as directed |

### Benefits

- **Reduces cognitive load** — User reviews one decision at a time
- **Surfaces alternatives** — Makes implicit trade-offs explicit
- **Enables quick confirmation** — "skip" for uncontroversial assumptions
- **Supports informed decisions** — User sees options before choosing

### When to Use Interview Style

Use the interview-style approach when:
- Multiple assumptions need review (3+)
- Assumptions involve design trade-offs with clear alternatives
- User prefers interactive review over batch review

Use batch/table format when:
- Few assumptions (1-2)
- Assumptions are straightforward confirmations
- User explicitly requests summary format

### Research Context

Before presenting alternatives, the agent should research:
- Existing patterns in the codebase for similar decisions
- SDK/framework conventions that may apply
- Previous implementations of similar functionality

Include this context when presenting alternatives to enable informed decisions.

---

## Workflow Integration

### When to Create the Log

Create the assumptions log during **design-philosophy** (the first activity that makes decisions requiring assumptions). This ensures assumptions are tracked from the very beginning of the work package.

### Which Activities Update the Log

Each phase that involves decision-making should collect and review assumptions:

| Activity | Assumption Categories |
|----------|----------------------|
| **02-design-philosophy** | Problem Interpretation, Complexity Assessment, Workflow Path |
| **03-requirements-elicitation** | Requirement Interpretation, Scope Boundaries, Implicit Requirements, Success Criteria |
| **04-research** | Pattern Applicability, Source Relevance, Synthesis Decisions, Risk Assessment |
| **05-implementation-analysis** | Current Behavior, Gap Identification, Baseline Interpretation, Dependency Understanding |
| **06-plan-prepare** | Design Approach, Task Breakdown, Dependency Assumptions, Test Strategy, Scope Decisions |
| **07-implement** | Behavioral, Architectural, Interface, Performance, Compatibility, Scope, Implicit Requirements |

### When to Update the Log

**After each activity's assumption checkpoint**, once the user has reviewed and responded to assumptions:

1. Record the assumptions that were surfaced for that phase
2. Document the user's response (confirmed, corrected, or deferred)
3. Note any changes made as a result

**During implementation**, update the log AFTER completing the assumption review for each task:

1. Collect assumptions during task implementation
2. Present assumptions at checkpoint for user review
3. Record user responses (confirmed, corrected, deferred)
4. **Then update the assumptions log** with outcomes

This ensures the log reflects the reviewed state, not just the initially collected assumptions.

### Outcome Statuses

| Status | Meaning | Action |
|--------|---------|--------|
| ✅ Confirmed | User agreed assumption was correct | No changes needed |
| 🔄 Corrected | User provided different direction | Document changes made |
| ⏸️ Deferred | Decision postponed for later | Track for follow-up |

---

## Assumptions Log Template


**Template:**

```markdown
# Assumptions Log

**Work Package:** [Name]
**Issue:** #[number] - [Title]
**Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD

---

## Summary

| Phase/Task | Assumptions | Confirmed | Corrected | Deferred |
|------------|-------------|-----------|-----------|----------|
| Design Philosophy | X | Y | Z | W |
| Requirements Elicitation | X | Y | Z | W |
| Research | X | Y | Z | W |
| Implementation Analysis | X | Y | Z | W |
| Planning | X | Y | Z | W |
| Task 1 | X | Y | Z | W |
| Task 2 | X | Y | Z | W |
| ... | ... | ... | ... | ... |
| **Total** | **X** | **Y** | **Z** | **W** |

---

# Pre-Implementation Phases

## Design Philosophy

**Date:** YYYY-MM-DD

### Assumptions Surfaced

| ID | Category | Risk | Assumption | Rationale |
|----|----------|------|------------|-----------|
| DP-1 | Problem Interpretation | H/M/L | [Assumption about problem nature] | [Why this seemed reasonable] |
| DP-2 | Complexity Assessment | H/M/L | [Assumption about complexity] | [Why this seemed reasonable] |
| DP-3 | Workflow Path | H/M/L | [Assumption about which activities needed] | [Why this seemed reasonable] |

**Categories:** Problem Interpretation, Complexity Assessment, Workflow Path

### User Response

**Review Status:** ✅ All Confirmed | 🔄 Some Corrected | ⏸️ Some Deferred

**Feedback:**
- **DP-1:** [User's response]

### Outcome

| ID | Original Assumption | Outcome | Changes Made |
|----|---------------------|---------|--------------|
| DP-1 | [Assumption] | ✅ Confirmed | None required |

---

## Requirements Elicitation

**Date:** YYYY-MM-DD

### Assumptions Surfaced

| ID | Category | Risk | Assumption | Rationale |
|----|----------|------|------------|-----------|
| RE-1 | Requirement Interpretation | H/M/L | [Assumption about requirement meaning] | [Why this interpretation] |
| RE-2 | Scope Boundaries | H/M/L | [Assumption about in/out of scope] | [Why this boundary] |
| RE-3 | Implicit Requirements | H/M/L | [Assumed unstated requirement] | [Why this seemed needed] |

**Categories:** Requirement Interpretation, Scope Boundaries, Implicit Requirements, Success Criteria Interpretation

### User Response

**Review Status:** ✅ All Confirmed | 🔄 Some Corrected | ⏸️ Some Deferred

### Outcome

| ID | Original Assumption | Outcome | Changes Made |
|----|---------------------|---------|--------------|
| RE-1 | [Assumption] | ✅ Confirmed | None required |

---

## Research

**Date:** YYYY-MM-DD

### Assumptions Surfaced

| ID | Category | Risk | Assumption | Rationale |
|----|----------|------|------------|-----------|
| RS-1 | Pattern Applicability | H/M/L | [Assumption about pattern relevance] | [Why this pattern applies] |
| RS-2 | Synthesis Decision | H/M/L | [Assumption about connecting findings] | [Why this synthesis] |

**Categories:** Pattern Applicability, Source Relevance, Synthesis Decisions, Risk Assessment

### User Response

**Review Status:** ✅ All Confirmed | 🔄 Some Corrected | ⏸️ Some Deferred

### Outcome

| ID | Original Assumption | Outcome | Changes Made |
|----|---------------------|---------|--------------|
| RS-1 | [Assumption] | ✅ Confirmed | None required |

---

## Implementation Analysis

**Date:** YYYY-MM-DD

### Assumptions Surfaced

| ID | Category | Risk | Assumption | Rationale |
|----|----------|------|------------|-----------|
| IA-1 | Current Behavior | H/M/L | [Assumption about existing behavior] | [Based on what evidence] |
| IA-2 | Gap Identification | H/M/L | [Assumption about what's missing] | [Why this is a gap] |

**Categories:** Current Behavior, Gap Identification, Baseline Interpretation, Dependency Understanding

### User Response

**Review Status:** ✅ All Confirmed | 🔄 Some Corrected | ⏸️ Some Deferred

### Outcome

| ID | Original Assumption | Outcome | Changes Made |
|----|---------------------|---------|--------------|
| IA-1 | [Assumption] | ✅ Confirmed | None required |

---

## Planning

**Date:** YYYY-MM-DD

### Assumptions Surfaced

| ID | Category | Risk | Assumption | Rationale |
|----|----------|------|------------|-----------|
| PL-1 | Design Approach | H/M/L | [Assumption about design choice] | [Why this approach] |
| PL-2 | Task Breakdown | H/M/L | [Assumption about task structure] | [Why this breakdown] |
| PL-3 | Dependency | H/M/L | [Assumption about dependencies] | [Why this order] |

**Categories:** Design Approach, Task Breakdown, Dependency Assumptions, Test Strategy, Scope Decisions

### User Response

**Review Status:** ✅ All Confirmed | 🔄 Some Corrected | ⏸️ Some Deferred

### Outcome

| ID | Original Assumption | Outcome | Changes Made |
|----|---------------------|---------|--------------|
| PL-1 | [Assumption] | ✅ Confirmed | None required |

---

# Implementation Phase

## Task 1: [Task Name]

**Date:** YYYY-MM-DD
**Commit:** `abc123`

### Assumptions Surfaced

| ID | Category | Risk | Assumption | Rationale | Ambiguity Source |
|----|----------|------|------------|-----------|------------------|
| 1.1 | [Category] | H/M/L | [Assumption made] | [Why this seemed reasonable] | [Source if applicable] |
| 1.2 | [Category] | H/M/L | [Assumption made] | [Why this seemed reasonable] | [Source if applicable] |

**Categories:** Behavioral, Architectural, Interface, Performance, Compatibility, Scope, Implicit Requirements

**Risk Levels:** H = High (validate before proceeding), M = Medium (confirm at checkpoint), L = Low (log for reference)

**Ambiguity Sources:** Observational, Recall, Interpretation, Problem Statement, N/A

### Trade-offs Considered (if applicable)

| Decision Point | Option A | Option B | Chosen | Rationale |
|----------------|----------|----------|--------|-----------|
| [Decision] | [Description] | [Description] | A/B | [Why] |

### User Response

**Review Status:** ✅ All Confirmed | 🔄 Some Corrected | ⏸️ Some Deferred

**Feedback:**
- **1.1:** [User's response]
- **1.2:** [User's response]

### Outcome

| ID | Original Assumption | Outcome | Changes Made |
|----|---------------------|---------|--------------|
| 1.1 | [Assumption] | ✅ Confirmed | None required |
| 1.2 | [Assumption] | 🔄 Corrected | [Description of changes made] |

### Lessons Learned

- [Any insights that apply to future tasks]
- [Patterns noticed in assumption accuracy]
- [Ambiguity sources that frequently caused issues]

---

## Task 2: [Task Name]

**Date:** YYYY-MM-DD
**Commit:** `def456`

### Assumptions Surfaced

| ID | Category | Risk | Assumption | Rationale | Ambiguity Source |
|----|----------|------|------------|-----------|------------------|
| 2.1 | [Category] | H/M/L | [Assumption made] | [Why this seemed reasonable] | [Source if applicable] |

### User Response

**Review Status:** ✅ All Confirmed

**Feedback:**
- **2.1:** [User's response]

### Outcome

| ID | Original Assumption | Outcome | Changes Made |
|----|---------------------|---------|--------------|
| 2.1 | [Assumption] | ✅ Confirmed | None required |

### Lessons Learned

- [Insights from this task]

---

## Final Review

**Completed:** YYYY-MM-DD

### Phase-Based Assumption Analysis

| Phase | Total | Confirmed | Corrected | Deferred | Accuracy |
|-------|-------|-----------|-----------|----------|----------|
| Design Philosophy | X | Y | Z | W | Y/X% |
| Requirements Elicitation | X | Y | Z | W | Y/X% |
| Research | X | Y | Z | W | Y/X% |
| Implementation Analysis | X | Y | Z | W | Y/X% |
| Planning | X | Y | Z | W | Y/X% |
| Implementation | X | Y | Z | W | Y/X% |
| **Total** | **X** | **Y** | **Z** | **W** | **Y/X%** |

### Category-Based Assumption Analysis

| Category | Total | Confirmed | Corrected | Accuracy |
|----------|-------|-----------|-----------|----------|
| Problem/Complexity | X | Y | Z | Y/X% |
| Requirements/Scope | X | Y | Z | Y/X% |
| Pattern/Research | X | Y | Z | Y/X% |
| Current State/Gaps | X | Y | Z | Y/X% |
| Design/Planning | X | Y | Z | Y/X% |
| Behavioral | X | Y | Z | Y/X% |
| Architectural | X | Y | Z | Y/X% |
| Interface | X | Y | Z | Y/X% |
| Performance | X | Y | Z | Y/X% |
| Compatibility | X | Y | Z | Y/X% |
| Scope | X | Y | Z | Y/X% |
| Implicit Requirements | X | Y | Z | Y/X% |
| **Total** | **X** | **Y** | **Z** | **Y/X%** |

### False Assumption Source Analysis

| Source | Count | Percentage |
|--------|-------|------------|
| Lack of valid information | X | X% |
| Invalidation over time | X | X% |
| Turnpike effects | X | X% |
| Requirements leakage | X | X% |
| Overlooking existing solutions | X | X% |

### Ambiguity Source Analysis

| Source | Count | Percentage |
|--------|-------|------------|
| Observational errors | X | X% |
| Recall errors | X | X% |
| Interpretation errors | X | X% |
| Problem statement ambiguity | X | X% |

### Key Insights

1. [Which phases generated the most corrected assumptions?]
2. [Pattern observed in assumptions that needed correction]
3. [Areas where assumptions were consistently accurate]
4. [Common ambiguity sources that caused issues]
5. [Were early-phase assumptions validated or invalidated during implementation?]
6. [Recommendations for future work packages]

### Deferred Decisions

| ID | Assumption | Reason Deferred | Follow-up Required |
|----|------------|-----------------|-------------------|
| X.Y | [Assumption] | [Why deferred] | [What needs to happen] |
```

---

## When No Assumptions Were Made

Not every phase or task generates significant assumptions. It's acceptable to record:

```markdown
## [Phase Name] or Task N: [Task Name]

**Date:** YYYY-MM-DD
**Commit:** `abc123` (for tasks)

### Assumptions Surfaced

No significant assumptions were made during this phase/task. [For phases: Decisions followed from explicit requirements and prior phase outputs.] [For tasks: Implementation followed established patterns and explicit requirements.]

### User Response

N/A

### Outcome

N/A
```

**Note:** Even when no assumptions are recorded, the phase section should still exist in the log to show that assumption review was performed.

---

## Related Guides

- [Work Package Implementation Workflow](../workflow.toon)
- [Task Completion Review Guide](14-task-completion-review.md)
