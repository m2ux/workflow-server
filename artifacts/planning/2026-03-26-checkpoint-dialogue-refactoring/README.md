# Checkpoint Dialogue Refactoring — work-package workflow

**Date:** 2026-03-26
**Scope:** All 38 checkpoints across 14 activities + review-mode overrides
**Status:** Plan approved (interview review complete)

---

## Problem Statement

The work-package workflow's checkpoint dialogue (AskQuestion) patterns have several issues:

1. **Per-activity assumptions review checkpoints** dump a full table and ask a single multi-choice question — the user cannot resolve individual assumptions inline or defer specific ones to stakeholder review
2. **Several blocking checkpoints** lack auto-advance defaults, creating unnecessary friction on the happy path
3. **Agent-generated findings** are presented without a recommended action, forcing the user to evaluate severity themselves
4. **One checkpoint** has a single option (effectively a message masquerading as a question)
5. **The consolidated assumptions checkpoint** in plan-prepare becomes redundant once per-activity reviews handle open questions interview-style

---

## Refactoring Categories

### Category A: Interview-Style Assumptions Review

**Applies to:** Checkpoints 17, 19, 27 (research-assumptions-review, analysis-assumptions-review, implementation-assumptions-review)

**Current pattern:**
1. Present full assumptions table as a message
2. Single AskQuestion: "Confirming in 30s" with options: confirmed / corrections / skip

**New pattern:**
1. **Message box** (non-interactive): Display all resolved assumptions with evidence and resolution status
2. **Interview loop**: Present each open/stakeholder-dependent assumption individually as its own AskQuestion, with options:
   - "Resolved" — user provides resolution inline (assumption closed)
   - "Defer to stakeholder review" — queued for aggregation and posting in activity 07
3. **Post-interview**: Only deferred assumptions flow into the `assumptions-review` activity (07) for ticket posting

**Rationale:** Users can resolve what they know directly, reducing the number of assumptions that reach stakeholders. The current pattern forces an all-or-nothing response to a mixed bag of assumptions.

**Dependent change:** Checkpoint 21 (`assumptions-log-final` in plan-prepare) is **removed** — with per-activity interviews handling all open questions, the consolidated review is redundant.

---

### Category B: Auto-Advance Defaults

**Applies to:** Checkpoints 8, 11, 12, 25, 26, 28

| # | Checkpoint | Current | New |
|---|-----------|---------|-----|
| 8 | pr-creation | Blocking | 30s auto-advance → "Create branch and PR" |
| 11 | classification-confirmed | Blocking | 30s auto-advance → "Classification confirmed" |
| 12 | workflow-path-selected | Blocking | 30s auto-advance → **conditional default**: simple→D (skip optional), moderate→C (research only), complex→A (full workflow) |
| 25 | switch-model-pre-impl | Blocking | 10s auto-advance → "Continue with current model" |
| 26 | confirm-implementation | Blocking | 30s auto-advance → "Proceed with implementation" |
| 28 | switch-model-post-impl | Blocking | 10s auto-advance → "Continue with current model" |

**Rationale:** These checkpoints gate the happy path unnecessarily. Auto-advance with short timers lets the user intervene when needed while keeping the workflow moving.

**Note on checkpoint 12:** The auto-advance default is derived from the `complexity` variable set during the classification step. This requires a `defaultOption` that references a condition rather than a static value. Schema may need a `conditionalDefault` construct or the checkpoint message can state the recommended path.

---

### Category C: Agent-Recommended Defaults

**Applies to:** Checkpoints 24, 31, 32, 34

| # | Checkpoint | Activity | Recommendation Basis |
|---|-----------|----------|---------------------|
| 24 | feedback-triage | assumptions-review | Analyze stakeholder feedback content and severity |
| 31 | review-findings | post-impl-review | Assess severity of code review + test suite findings |
| 32 | review-findings | strategic-review | Assess severity of strategic review findings |
| 34 | review-outcome | submit-for-review | Analyze PR review comment content and severity |

**New pattern:** The agent analyzes its own output (findings, feedback content) and sets the `defaultOption` to its recommended action. The recommendation is stated in the checkpoint message. The user can still override.

**Rationale:** The agent already has the information to make a recommendation. Asking the user to evaluate without a recommendation wastes their cognitive budget.

---

### Category D: Message and Wording Refinements

#### D1: research-findings (checkpoint 16)

| Change | Detail |
|--------|--------|
| Rename option A | "Findings confirmed" → "Findings Sufficient" |
| Rename option B | "Need more research" → "Need Further Research" |
| Add follow-up | Selecting B triggers a follow-up checkpoint asking the user to specify what further research is needed |
| Remove option C | "Different focus needed" — covered by the B flow |

#### D2: analysis-confirmed (checkpoint 18)

| Change | Detail |
|--------|--------|
| Simplify message | → "Proceeding in 30s unless you intervene." |
| Add summary requirement | Analysis summary must be presented as a message *above* the AskQuestion box |

#### D3: ticket-completeness (checkpoint 13, review mode)

| Change | Detail |
|--------|--------|
| Refactor option B | "Proceed with gaps noted" must write identified gaps to a planning artifact (e.g., assumptions-log.md or dedicated ticket-gaps.md), not just set a boolean |

#### D4: review-complete (checkpoint 36, review mode)

| Change | Detail |
|--------|--------|
| Convert to message | Single-option checkpoint → non-interactive message. No user action required. |

#### D5: architecture-confirmed (checkpoint 37)

| Change | Detail |
|--------|--------|
| Add artifact link | Include a link to the comprehension artifact in the checkpoint message |

---

### Category E: Removal

#### E1: assumptions-log-final (checkpoint 21, plan-prepare)

**Remove entirely.** With per-activity interview-style assumption reviews (Category A), all open assumptions are either resolved inline by the user or deferred to stakeholder review before this point. No open questions remain for a consolidated review.

The resolved/deferred summary is written to the assumptions log artifact automatically without user interaction.

---

## Unchanged Checkpoints (22 of 38)

The following checkpoints were reviewed and confirmed as appropriate:

| # | Checkpoint | Activity | Notes |
|---|-----------|----------|-------|
| 1 | issue-verification | start-work-package | Useful decision point |
| 2 | branch-check | start-work-package | Prevents duplicate branches |
| 3 | pr-check | start-work-package | Prevents duplicate PRs |
| 4 | platform-selection | start-work-package | Routes issue creation |
| 5 | jira-project-selection | start-work-package | Jira-specific routing |
| 6 | issue-type-selection | start-work-package | Sets issue type |
| 7 | issue-review | start-work-package | Already has 30s auto-advance |
| 9 | review-mode-detection | start-work-package (review) | Confirms mode detection |
| 10 | review-pr-reference | start-work-package (review) | Captures PR reference |
| 14 | stakeholder-transcript | requirements-elicitation | Necessary blocking pause |
| 15 | elicitation-complete | requirements-elicitation | Already has 30s auto-advance |
| 20 | approach-confirmed | plan-prepare | Already has 30s auto-advance |
| 22 | comment-review | assumptions-review | Useful preview before posting |
| 23 | stakeholder-response | assumptions-review | Necessary blocking pause |
| 29 | file-index-table | post-impl-review | Necessary blocking pause |
| 30 | block-interview | post-impl-review | Already interview-style |
| 33 | review-received | submit-for-review | Necessary blocking pause |
| 35 | review-summary-approval | submit-for-review (review) | Useful preview before posting |
| 38 | comprehension-sufficient | codebase-comprehension | Already has 30s auto-advance |

---

## Implementation Sequence

1. **Schema check**: Verify whether `conditionalDefault` (for checkpoint 12) needs a schema extension or can be handled via checkpoint message + agent logic
2. **Category A** (interview-style assumptions): Refactor checkpoints 17, 19, 27 and remove checkpoint 21
3. **Category B** (auto-advance defaults): Update checkpoints 8, 11, 12, 25, 26, 28
4. **Category C** (agent-recommended defaults): Update checkpoints 24, 31, 32, 34
5. **Category D** (message/wording): Apply refinements D1–D5
6. **Category E** (removal): Remove checkpoint 21, convert checkpoint 36 to message
7. **Validation**: Run schema validator against all modified TOON files

---

## Files Affected

| File | Changes |
|------|---------|
| `activities/01-start-work-package.toon` | Checkpoint 8: add auto-advance |
| `activities/02-design-philosophy.toon` | Checkpoints 11, 12: add auto-advance (12 conditional); checkpoint 13 (review): refactor option B |
| `activities/04-research.toon` | Checkpoint 16: rename/restructure options; checkpoint 17: interview-style refactor |
| `activities/05-implementation-analysis.toon` | Checkpoint 18: simplify message; checkpoint 19: interview-style refactor |
| `activities/06-plan-prepare.toon` | Checkpoint 21: remove |
| `activities/07-assumptions-review.toon` | Checkpoint 24: add agent recommendation |
| `activities/08-implement.toon` | Checkpoints 25, 28: 10s auto-advance; checkpoint 26: 30s auto-advance; checkpoint 27: interview-style refactor |
| `activities/09-post-impl-review.toon` | Checkpoint 31: add agent recommendation |
| `activities/11-strategic-review.toon` | Checkpoint 32: add agent recommendation |
| `activities/12-submit-for-review.toon` | Checkpoint 34: add agent recommendation; checkpoint 36 (review): convert to message |
| `activities/14-codebase-comprehension.toon` | Checkpoint 37: add artifact link |
