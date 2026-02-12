# Work Package Implementation Workflow

> v3.1.0 — Defines how to plan and implement ONE work package from inception to merged PR. A work package is a discrete unit of work such as a feature, bug-fix, enhancement, refactoring, or any other deliverable change. **Supports review mode** for conducting structured reviews of existing PRs.

## Overview

This workflow guides the complete lifecycle of a single work package:

1. **Start Work Package** — Verify/create issue, set up branch, PR, and planning folder
2. **Design Philosophy** — Classify problem, assess complexity, determine workflow path
3. **Requirements Elicitation** (optional) — Clarify requirements through stakeholder conversation
4. **Research** (optional) — Gather best practices from knowledge base and web
5. **Implementation Analysis** — Understand current state, establish baselines
6. **Plan & Prepare** — Create implementation and test plans
7. **Implement** — Execute tasks with implement-test-commit cycles
8. **Post-Implementation Review** — Manual diff review, code review, test review
9. **Validate** — Run tests, build, and lint
10. **Strategic Review** — Ensure minimal, focused changes
11. **Submit for Review** — Push PR, mark ready, handle reviewer feedback
12. **Complete** — Finalize documentation, create ADR, conduct retrospective

**Key characteristics:**
- Sequential flow with conditional branches (12 activities, 22 skills)
- Multiple feedback loops for quality gates
- 40 checkpoints across all activities
- Task implementation loop with assumption reviews
- Manual diff review with interview-based finding collection
- **Review mode** for reviewing existing PRs (see [Review Mode](#review-mode))

---

## Workflow Flow

```mermaid
graph TD
    Start(["Start"]) --> SWP["01 start-work-package"]
    SWP --> DP["02 design-philosophy"]

    DP --> PATH{"workflow path?"}
    PATH -->|"full"| REL["03 requirements-elicitation"]
    PATH -->|"elicit-only"| REL
    PATH -->|"research-only"| RS
    PATH -->|"direct"| PP

    REL --> RS["04 research"]
    RS --> IA["05 implementation-analysis"]
    IA --> PP["06 plan-prepare"]

    PP --> IMP["07 implement"]
    IMP --> PIR["08 post-impl-review"]
    PIR --> BLK{"critical blocker?"}
    BLK -->|"yes"| IMP
    BLK -->|"no"| VAL["09 validate"]

    VAL --> SR["10 strategic-review"]

    SR --> SRD{"review passed?"}
    SRD -->|"yes"| SFR["11 submit-for-review"]
    SRD -->|"rework"| PP

    SFR --> RVD{"review outcome?"}
    RVD -->|"approved/minor"| COMP["12 complete"]
    RVD -->|"significant changes"| PP

    COMP --> Done(["End"])
```

---

## Review Mode

This workflow supports **review mode** for reviewing existing PRs rather than implementing new code. When activated, the workflow adapts its behavior using the formal `modes` and `modeOverrides` schema constructs.

**See [REVIEW-MODE.md](REVIEW-MODE.md) for complete documentation.**

Quick summary:
- Detected from user intent (e.g., "start review work package", "review PR #123")
- Skips elicitation and implementation phases
- Analyzes pre-change baseline from base branch
- Documents findings rather than applying fixes
- Generates structured PR review comments

Review mode flow:
```
start-work-package → design-philosophy → [research →] implementation-analysis → plan-prepare → post-impl-review → validate → strategic-review → submit-for-review → END
```

---

## Activities

### 01. Start Work Package

**Purpose:** Initialize the work package — verify or create an issue, set up feature branch and draft PR, create planning folder. In review mode: captures PR reference and extracts associated Jira ticket.

**Skills:** primary `create-issue`, supporting `manage-git`, `manage-artifacts`

**Checkpoints (8):** issue-verification, branch-check, pr-check, platform-selection, jira-project-selection, issue-type-selection, issue-review, pr-creation

### 02. Design Philosophy

**Purpose:** Classify the problem, assess complexity, and determine which optional activities are needed. Sets `complexity` (simple/moderate/complex) which drives ADR creation in the complete activity. In review mode: assesses ticket completeness.

**Skills:** primary `classify-problem`, supporting `review-assumptions`

**Checkpoints (4):** problem-classified, workflow-path, design-philosophy-doc, assumptions-review

### 03. Requirements Elicitation (optional)

**Purpose:** Discover and clarify requirements through stakeholder discussion and structured sequential conversation.

**Skills:** primary `elicit-requirements`, supporting `manage-artifacts`, `review-assumptions`

**Checkpoints (5):** stakeholder-transcript, domain-complete, jira-comment-review, stakeholder-response, document-review

### 04. Research (optional)

**Purpose:** Research knowledge base and external sources for best practices and patterns.

**Skills:** primary `research-knowledge-base`, supporting `review-assumptions`

**Checkpoints (4):** kb-insights, web-research-confirmed, assumptions-review, research-complete

### 05. Implementation Analysis

**Purpose:** Analyze current implementation — establish baselines, identify gaps. In review mode: checks out base branch to analyze pre-change state.

**Skills:** primary `analyze-implementation`, supporting `manage-artifacts`, `review-assumptions`

**Checkpoints (2):** analysis-confirmed, assumptions-review

### 06. Plan & Prepare

**Purpose:** Create the work package plan (task breakdown) and test plan.

**Skills:** primary `create-plan`, supporting `classify-problem`, `review-assumptions`, `create-test-plan`

**Checkpoints (4):** approach-confirmed, assumptions-review, ready-implement, assumptions-log-final

### 07. Implement

**Purpose:** Execute the implementation plan task by task. Each task follows an implement-test-commit cycle. In review mode: SKIPPED entirely.

**Skills:** primary `implement-task`, supporting `review-assumptions`, `validate-build`, `manage-git`

**Loops:** task-cycle (forEach over plan.tasks), assumption-review-cycle (forEach over task_assumptions)

**Checkpoints (2):** task-complete, assumption-review

### 08. Post-Implementation Review

**Purpose:** Review implementation quality — manual diff review, code review, test suite review, architecture summary. Includes a review-fix cycle (doWhile loop) for addressing findings.

**Skills:** primary `review-diff`, supporting `review-code`, `review-test-suite`, `summarize-architecture`

**Checkpoints (5):** file-index-table, block-interview, code-review, test-quality, architecture-summary

**Decision:** blocker-gate — if `has_critical_blocker` is true, transitions back to implement.

### 09. Validate

**Purpose:** Run all tests, verify build, check lint. Fix failures and re-run until all pass. In review mode: documents failures as findings.

**Skills:** primary `validate-build`

**Steps:** run-tests, verify-build, check-lint, evaluate-results, fix-failures (conditional on has_failures)

### 10. Strategic Review

**Purpose:** Ensure changes are minimal and focused. Creates strategic review document and architecture summary.

**Skills:** primary `review-strategy`

**Checkpoints (2):** review-findings, review-result

**Decision:** review-result — if `review_passed` is true, transitions to submit-for-review; otherwise loops back to plan-prepare.

### 11. Submit for Review

**Purpose:** Push PR, update description, mark ready for review, then handle the review cycle. In review mode: consolidates findings and posts PR review comments.

**Skills:** primary `update-pr`, supporting `respond-to-pr-review`

**Checkpoints (3):** pr-description, review-received, review-outcome

**Transitions:** if `review_requires_changes` → plan-prepare; default → complete

### 12. Complete

**Purpose:** Final activity — create ADR (if moderate/complex), finalize documentation, conduct retrospective, update status. In review mode: retrospective only.

**Skills:** primary `finalize-documentation`, supporting `create-adr`, `conduct-retrospective`

**Checkpoints (1):** retrospective-review

---

## Skills (22)

| # | Skill ID | Capability |
|---|----------|------------|
| 00 | `review-code` | Comprehensive Rust/Substrate code review |
| 01 | `review-test-suite` | Test suite quality, coverage, and anti-patterns |
| 02 | `respond-to-pr-review` | Analyze and respond to PR review comments |
| 03 | `create-issue` | Create GitHub or Jira issues with type mapping |
| 04 | `classify-problem` | Problem classification, complexity assessment, path selection |
| 05 | `elicit-requirements` | Requirements discovery through sequential conversation |
| 06 | `research-knowledge-base` | Knowledge base and web research |
| 07 | `analyze-implementation` | Implementation analysis, baselines, gap identification |
| 08 | `create-plan` | Work package plan with task breakdown |
| 09 | `create-test-plan` | Test strategy and acceptance criteria |
| 10 | `implement-task` | Single task code implementation |
| 11 | `review-diff` | Manual diff review with indexed block references |
| 12 | `review-strategy` | Strategic review for minimal, focused changes |
| 13 | `review-assumptions` | Assumption collection, classification, and review |
| 14 | `manage-artifacts` | Planning folder and artifact numbering management |
| 15 | `manage-git` | Git branching, PR lifecycle, branch sync |
| 16 | `validate-build` | Test execution, build verification, lint checking |
| 17 | `finalize-documentation` | ADR updates, test plan finalization, COMPLETE.md |
| 18 | `update-pr` | PR description update, push, mark ready |
| 19 | `conduct-retrospective` | Workflow retrospective and lessons learned |
| 20 | `summarize-architecture` | Architecture summary with diagrams for stakeholders |
| 21 | `create-adr` | Architecture Decision Record creation |

---

## Feedback Loops

| From | To | Condition |
|------|----|-----------|
| post-impl-review | implement | Critical blocker found (`has_critical_blocker`) |
| strategic-review | plan-prepare | Significant rework needed (`review_passed == false`) |
| submit-for-review | plan-prepare | Review requires significant changes (`review_requires_changes`) |
| requirements-elicitation | requirements-elicitation | Elicitation incomplete (self-loop) |

---

## Artifact Prefixing

Each activity declares an `artifactPrefix` matching its file number. Skills produce bare artifact names (e.g., `code-review.md`) and the activity's prefix is prepended at write time (e.g., `08-code-review.md`).

---

## Resources

| Resource | Purpose |
|----------|---------|
| `24-review-mode.md` | Complete guide for review mode behavior and PR review comment formats |
| `16-rust-substrate-code-review.md` | Rust/Substrate code review criteria |
| `17-test-suite-review.md` | Test suite quality assessment |
| `22-manual-diff-review.md` | Manual diff review with interview loop |
| `23-tdd-concepts-rust.md` | TDD best practices for Rust |

---

## Variables (49)

Key variables driving workflow behavior:

| Variable | Type | Description |
|----------|------|-------------|
| `complexity` | string | Problem complexity (simple/moderate/complex) — drives ADR creation |
| `needs_elicitation` | boolean | Whether requirements elicitation is needed |
| `needs_research` | boolean | Whether research activity is needed |
| `skip_to_planning` | boolean | Skip directly to plan-prepare |
| `has_failures` | boolean | Whether validation detected failures |
| `review_passed` | boolean | Whether strategic review passed |
| `has_critical_blocker` | boolean | Whether a critical blocker was found in post-impl review |
| `review_requires_changes` | boolean | Whether PR review requires returning to planning |
| `is_review_mode` | boolean | Whether review mode is active |

See `workflow.toon` for the complete list of 49 declared variables.
