# Schema Update Proposal: Checkpoint Condition Field

**Date:** 2026-03-20
**Source:** Compliance reviews of `work-package` v3.4.0 and `workflow-design` v1.2.0
**Status:** Proposed

---

## Context

Two compliance reviews conducted on 2026-03-20 identified findings that could imply schema changes. Six candidates were evaluated against the criteria: does this represent a genuine schema expressiveness gap, or is it a content/process issue addressable with existing constructs?

Five of the six candidates were rejected — they are either solvable with existing schema constructs, represent content authoring choices, or describe runtime behavioral contracts outside the schema's structural domain. One candidate is genuinely useful.

---

## Candidate Evaluation Summary

| # | Candidate | Source Finding | Verdict | Rationale |
|---|-----------|---------------|---------|-----------|
| 1 | Formal `condition` on checkpoints | work-package F-01 | **Genuinely useful** | Only conditional construct in the schema that uses prose instead of a formal condition object |
| 2 | Orchestrator protocol / execution model construct | work-package F-02 | Not beneficial | Runtime inter-agent behavioral contracts don't belong in structural schema; not enforceable by validation |
| 3 | Shared / reusable loop definitions | work-package F-10 | Not a schema issue | Existing skill-step pattern (`step.skill`) already provides the clean approach; duplication is a content authoring choice |
| 4 | Validate actions for text-only rules | workflow-design M-01 | Not a schema issue | Existing `validate` action type already supports this; add entryActions/exitActions to activities |
| 5 | Formalize `context_to_preserve` as variables | workflow-design L-01 | Not beneficial | Variables drive structural control flow (conditions, transitions, effects); context_to_preserve is agent memory guidance — the distinction is useful |
| 6 | Explicit defaults on checkpoint required/blocking | workflow-design L-02 | No change needed | Schema already defines `default: true` for both fields; finding is about TOON authoring style |

---

## Proposed Change: Checkpoint `condition` Field

### Problem

The `checkpoint` definition in `activity.schema.json` has a `prerequisite` field typed as `string` — free-text prose describing when the checkpoint should be presented. Every other conditional construct in the schema uses a formal `condition` reference to `condition.schema.json`:

| Construct | Field | Type |
|-----------|-------|------|
| `step` | `condition` | `$ref: condition.schema.json` |
| `transition` | `condition` | `$ref: condition.schema.json` |
| `decisionBranch` | `condition` | `$ref: condition.schema.json` |
| `loop` | `condition` | `$ref: condition.schema.json` |
| `loop` | `breakCondition` | `$ref: condition.schema.json` |
| **`checkpoint`** | **`prerequisite`** | **`type: string`** |

Checkpoints are the sole outlier. In practice, 12 checkpoints across the work-package workflow contain prose prerequisites that directly map to simple conditions:

```
"Only present when on_feature_branch is true"        → { type: simple, variable: on_feature_branch, operator: ==, value: true }
"Only present when pr_exists is true"                → { type: simple, variable: pr_exists, operator: ==, value: true }
"Only present when needs_issue_creation is true"     → { type: simple, variable: needs_issue_creation, operator: ==, value: true }
"Only present when issue_platform is jira"           → { type: simple, variable: issue_platform, operator: ==, value: jira }
"Only present when issue_cancelled is false"         → { type: simple, variable: issue_cancelled, operator: ==, value: false }
"Only present when issue_platform is set"            → { type: simple, variable: issue_platform, operator: exists }
"Only present when has_open_assumptions is true"     → { type: simple, variable: has_open_assumptions, operator: ==, value: true }
"Only present when has_stakeholder_comment is true"  → { type: simple, variable: has_stakeholder_comment, operator: ==, value: true }
"Only present when has_open_questions is true"       → { type: simple, variable: has_open_questions, operator: ==, value: true }
"Repeats for each entry in flagged_block_indices"    → (iteration pattern, not a simple condition)
```

### What This Would Enable

1. **Machine-interpretable checkpoint skip logic** — the server or orchestrator could evaluate conditions programmatically rather than relying on agents to parse English prose
2. **Schema consistency** — all conditional constructs would use the same formal condition pattern
3. **Workflow graph analysis** — tooling could determine checkpoint reachability given a particular state, enabling static validation ("is this checkpoint ever reached?", "are there unreachable checkpoints?")
4. **Condition composability** — checkpoints could use AND/OR/NOT conditions, matching the expressiveness available to transitions and decisions

### Proposed Schema Change

Replace the `prerequisite` string field with a `condition` field referencing `condition.schema.json`. Two approaches:

**Option A — Replace (breaking change):**

```json
{
  "checkpoint": {
    "properties": {
      "condition": {
        "$ref": "condition.schema.json",
        "description": "Condition that must be true before presenting this checkpoint. If false, the checkpoint is skipped."
      }
    }
  }
}
```

Remove the `prerequisite` field. All existing workflows must migrate prose prerequisites to formal conditions.

**Option B — Add alongside (backward compatible):**

```json
{
  "checkpoint": {
    "properties": {
      "prerequisite": {
        "type": "string",
        "description": "DEPRECATED. Human-readable description of when this checkpoint applies. Use 'condition' for machine-evaluable logic."
      },
      "condition": {
        "$ref": "condition.schema.json",
        "description": "Condition that must be true before presenting this checkpoint. If false, the checkpoint is skipped. Preferred over 'prerequisite'."
      }
    }
  }
}
```

Keep `prerequisite` for backward compatibility and documentation purposes. Add `condition` as the formal alternative. Workflows can migrate incrementally.

### Trade-offs

| Dimension | Option A (Replace) | Option B (Add alongside) |
|-----------|--------------------|--------------------------|
| Schema cleanliness | Clean — one field, one purpose | Mild redundancy during transition |
| Migration effort | All workflows must update simultaneously | Workflows migrate at their own pace |
| Backward compatibility | Breaking | Non-breaking |
| TOON readability | Formal conditions are slightly more verbose than prose | Prose can remain as documentation |

### Recommendation

**Option A (Replace)** is preferred if the migration scope is manageable. The current workflow corpus is small enough (10 workflows) that a single migration pass is feasible. The `prerequisite` field's prose descriptions can be preserved in checkpoint `description` fields or as comments if human readability is needed.

If a staged migration is preferred, Option B works but should include a deprecation timeline for `prerequisite`.

### Impact Assessment

**Files requiring migration** (checkpoints with `prerequisite` fields):

| Workflow | Activity Files | Checkpoint Count |
|----------|---------------|-----------------|
| `work-package` | 01-start-work-package, 07-assumptions-review, 09-post-impl-review, 14-codebase-comprehension | 12 |
| Other workflows | To be audited | TBD |

**Server-side changes:**
- `src/schema/activity.schema.js` — update checkpoint definition
- `src/loaders/workflow-loader.js` — if `prerequisite` processing exists, migrate to `condition` evaluation
- `src/utils/toon.js` — no changes expected (TOON parser is format-agnostic)
- Schema validation tests — add test cases for checkpoint conditions

**Documentation changes:**
- `schemas/README.md` — update checkpoint field table, add condition example
- Schema construct inventory (workflow-design resource 01) — update checkpoint entry
- Anti-patterns resource (workflow-design resource 02) — no changes needed

### Example Migration

Before (current):

```
checkpoints[1]:
  - id: branch-check
    name: Branch Check Checkpoint
    message: "You're currently on branch '{current_branch}'. Would you like to use this branch or create a new one?"
    prerequisite: "Only present when on_feature_branch is true"
    options[2]:
      ...
```

After (proposed):

```
checkpoints[1]:
  - id: branch-check
    name: Branch Check Checkpoint
    message: "You're currently on branch '{current_branch}'. Would you like to use this branch or create a new one?"
    condition:
      type: simple
      variable: on_feature_branch
      operator: "=="
      value: true
    options[2]:
      ...
```

---

## Rejected Candidates — Detailed Rationale

### Candidate 2: Orchestrator Protocol Construct

The EXECUTION MODEL, ORCHESTRATOR DISCIPLINE, CHECKPOINT YIELD RULE, and AUTOMATIC TRANSITION RULE describe inter-agent runtime coordination. These specify how the orchestrator and worker sub-agent interact — yielding at checkpoints, resuming via Task tool, presenting context before AskQuestion calls. The schema's domain is workflow *structure* (activities, transitions, checkpoints), not agent *runtime behavior*. A schema construct could describe what pattern to use (orchestrator/worker vs direct) but couldn't enforce how agents communicate. The behavioral details would still require text. An `executionModel` enum as metadata might have mild utility but doesn't solve the enforcement gap.

### Candidate 3: Shared Loop Definitions

The assumption-reconciliation loop is duplicated in 6 activities, but the schema already supports the clean approach: each activity has a step with `skill: reconcile-assumptions`, and the loop logic belongs in the skill's `protocol`. The duplication exists because the workflow author chose to inline the loop alongside the skill step rather than letting the skill drive iteration. This is a content restructuring opportunity, not a schema gap. Adding `workflow.sharedLoops[]` would add schema complexity to solve a problem better addressed by refactoring the activity content.

### Candidate 4: Validate Actions for Text-Only Rules

Three workflow-design rules lack structural enforcement, but the `validate` action type already exists: `{ "action": "validate", "target": "...", "message": "..." }`. Adding validate entryActions or exitActions to activities addresses this with zero schema changes.

### Candidate 5: Formalize context_to_preserve

Variables and context_to_preserve serve different purposes by design. Variables drive structural control flow — they appear in conditions, transitions, and checkpoint effects. context_to_preserve is agent guidance — "carry this analysis result to the next activity." Merging them would inflate the variable list with items that have no structural role and would obscure the distinction between state that drives workflow logic and state that informs agent reasoning.

### Candidate 6: Checkpoint Field Defaults

The schema already defines `default: true` for both `required` and `blocking` on checkpoints. The finding is about TOON authoring style (explicit vs implicit), not a schema deficiency.
