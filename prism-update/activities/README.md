# Activities

> prism-update workflow — 5 activities (linear pipeline with a verify → apply-updates retry loop)

Technique binding is per-step: each step declares the technique it runs via `step.technique`. The Step Technique column below names the technique those steps bind; the Supporting column lists the activity-level strategy techniques.

## Activity Sequence

| # | Activity | Steps | Step Technique | Supporting | Checkpoints | Transitions |
|---|----------|-------|----------------|------------|-------------|-------------|
| 00 | **Discover Changes** | 1 | `diff-upstream` | `variable-binding` | — | → review-changes |
| 01 | **Review Changes** | 2 | `review-change-set::present-summary`, `review-change-set::apply-exclusions` | `variable-binding` | `change-review` (blocking) | → apply-updates |
| 02 | **Apply Updates** | 3 | `sync-resources`, `update-skill-routing`, `update-prism-docs` | `variable-binding` | — | → verify |
| 03 | **Verify Consistency** | 1 | `verify-prism-consistency` | `variable-binding` | `verification-result` (non-blocking) | → commit-and-submit (no issues) / → apply-updates (issues) |
| 04 | **Commit and Submit** | 1 | `submit-update` | `variable-binding` | — | — (terminal) |

## Flow

```
discover-changes → review-changes → apply-updates → verify → commit-and-submit
                                          ↑              │
                                          └── (if has_issues) ──┘
```

## Activity Details

### 00 — Discover Changes

Diffs the upstream prisms directory against current workflow resources. Categorizes each prism as new, modified, renamed, or deleted, classifies new prisms by family, and determines the next available resource index. One step:

1. `diff-upstream` → `diff-upstream` (sets `next_index`)

### 01 — Review Changes

Presents discovered changes to the user for approval. The `change-review` checkpoint allows the user to confirm all changes, adjust exclusions, or abort the workflow. Two steps, binding the operations of the `review-change-set` group:

1. `present-summary` → `review-change-set::present-summary` (checkpoint `change-review`)
2. `apply-exclusions` → `review-change-set::apply-exclusions`

### 02 — Apply Updates

Applies the approved upstream change set across resources, routing, and documentation, in that order. After a precondition check (`resource_path`, `change_set`), three bound steps:

1. `sync-resources` → sync modified, apply renames, import new, remove deleted — committed in logical groups for clean git history
2. `update-skill-routing` → fix renamed references, add goal-mapping entries, expand catalogs across the prism techniques (plan-analysis, portfolio-analysis, behavioral-pipeline, orchestrate-prism)
3. `update-prism-docs` → rebuild the resource catalog, prompt guide entries, model sensitivity table, and file structure

### 03 — Verify Consistency

Verifies content integrity against upstream, stale name references, prompt guide routing accuracy, resource count alignment, and duplicate index detection, then records the result. The `verification-result` checkpoint presents findings and auto-proceeds after 30 seconds unless the user intervenes; choosing "Fix issues" loops back to apply-updates. One step:

1. `verify-prism-consistency` → `verify-prism-consistency` (sets `has_issues`)

### 04 — Commit and Submit

Ensures a feature branch, pushes all commits, and creates a pull request against the workflows branch. Produces the `pull-request` artifact. One step:

1. `submit-update` → `submit-update`
