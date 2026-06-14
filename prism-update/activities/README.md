# Activities

> prism-update workflow — 7 activities (linear pipeline with a verify → import-resources retry loop)

Technique binding is per-step: each step declares the technique it runs via `step.technique`. The Step Technique column below names the technique those steps bind; the Supporting column lists the activity-level strategy techniques.

## Activity Sequence

| # | Activity | Steps | Step Technique | Supporting | Checkpoints | Transitions |
|---|----------|-------|----------------|------------|-------------|-------------|
| 00 | **Discover Changes** | 1 | `diff-upstream` | `variable-binding` | — | → review-changes |
| 01 | **Review Changes** | 2 | `review-change-set::present-summary`, `review-change-set::apply-exclusions` | `variable-binding` | `change-review` (blocking) | → import-resources |
| 02 | **Import Resources** | 1 | `sync-resources` | `variable-binding` | — | → update-routing |
| 03 | **Update Routing** | 1 | `update-skill-routing` | `variable-binding` | — | → update-docs |
| 04 | **Update Documentation** | 1 | `update-prism-docs` | `variable-binding` | — | → verify |
| 05 | **Verify Consistency** | 1 | `verify-prism-consistency` | `variable-binding` | `verification-result` (non-blocking) | → commit-and-submit (no issues) / → import-resources (issues) |
| 06 | **Commit and Submit** | 1 | `submit-update` | `variable-binding` | — | — (terminal) |

## Flow

```
discover-changes → review-changes → import-resources → update-routing → update-docs → verify → commit-and-submit
                                          ↑                                              │
                                          └────────────── (if has_issues) ──────────────┘
```

## Activity Details

### 00 — Discover Changes

Diffs the upstream prisms directory against current workflow resources. Categorizes each prism as new, modified, renamed, or deleted, classifies new prisms by family, and determines the next available resource index. One step:

1. `diff-upstream` → `diff-upstream` (sets `next_index`)

### 01 — Review Changes

Presents discovered changes to the user for approval. The `change-review` checkpoint allows the user to confirm all changes, adjust exclusions, or abort the workflow. Two steps, binding the operations of the `review-change-set` group:

1. `present-summary` → `review-change-set::present-summary` (checkpoint `change-review`)
2. `apply-exclusions` → `review-change-set::apply-exclusions`

### 02 — Import Resources

Applies all approved resource file changes — sync modified, apply renames, import new, remove deleted — committed in logical groups for clean git history. Produces the `import-commits` artifact. One step:

1. `sync-resources` → `sync-resources`

### 03 — Update Routing

Updates all prism workflow techniques (plan-analysis, portfolio-analysis, behavioral-pipeline, orchestrate-prism) to reflect resource changes: fixes renamed references, adds goal-mapping entries, expands catalogs. Produces the `routing-commit` artifact. One step:

1. `update-skill-routing` → `update-skill-routing`

### 04 — Update Documentation

Rebuilds documentation across the resource catalog, prompt guide entries, model sensitivity data, and file structure to reflect the current resource state. Produces the `docs-commit` artifact. One step:

1. `update-prism-docs` → `update-prism-docs`

### 05 — Verify Consistency

Verifies content integrity against upstream, stale name references, prompt guide routing accuracy, resource count alignment, and duplicate index detection, then records the result. The `verification-result` checkpoint presents findings and auto-proceeds after 30 seconds unless the user intervenes; choosing "Fix issues" loops back to import-resources. One step:

1. `verify-prism-consistency` → `verify-prism-consistency` (sets `has_issues`)

### 06 — Commit and Submit

Ensures a feature branch, pushes all commits, and creates a pull request against the workflows branch. Produces the `pull-request` artifact. One step:

1. `submit-update` → `submit-update`
