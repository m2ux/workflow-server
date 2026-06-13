# Activities

> prism-update workflow — 7 activities (linear pipeline with a verify → import-resources retry loop)

Technique binding is per-step: each step declares the technique it runs via `step.technique`. The Step Technique column below names the technique those steps bind; the Supporting column lists the activity-level strategy techniques.

## Activity Sequence

| # | Activity | Steps | Step Technique | Supporting | Checkpoints | Transitions |
|---|----------|-------|----------------|------------|-------------|-------------|
| 00 | **Discover Changes** | 5 | `diff-upstream` | `variable-binding` | — | → review-changes |
| 01 | **Review Changes** | 2 | `review-change-set` | `variable-binding` | `change-review` (blocking) | → import-resources |
| 02 | **Import Resources** | 5 | `sync-resources` | `variable-binding` | — | → update-routing |
| 03 | **Update Routing** | 5 | `update-skill-routing` | `variable-binding` | — | → update-docs |
| 04 | **Update Documentation** | 4 | `update-prism-docs` | `variable-binding` | — | → verify |
| 05 | **Verify Consistency** | 6 | `verify-prism-consistency` | `variable-binding` | `verification-result` (non-blocking) | → commit-and-submit (no issues) / → import-resources (issues) |
| 06 | **Commit and Submit** | 4 | `submit-update` | `variable-binding` | — | — (terminal) |

## Flow

```
discover-changes → review-changes → import-resources → update-routing → update-docs → verify → commit-and-submit
                                          ↑                                              │
                                          └────────────── (if has_issues) ──────────────┘
```

## Activity Details

### 00 — Discover Changes

Diffs the upstream prisms directory against current workflow resources. Categorizes each prism as new, modified, renamed, or deleted. Classifies new prisms by family and determines the next available resource index. Five steps, each binding `diff-upstream`:

1. `list-upstream` → `diff-upstream`
2. `list-current` → `diff-upstream`
3. `diff-and-categorize` → `diff-upstream`
4. `classify-new` → `diff-upstream`
5. `determine-next-index` → `diff-upstream` (sets `next_index`)

### 01 — Review Changes

Presents discovered changes to the user for approval. The `change-review` checkpoint allows the user to confirm all changes, adjust exclusions, or abort the workflow. Two steps, each binding `review-change-set`:

1. `present-summary` → `review-change-set` (checkpoint `change-review`)
2. `apply-exclusions` → `review-change-set`

### 02 — Import Resources

Applies all approved resource file changes in five steps (sync modified, apply renames, import new, remove deleted, verify file count), each binding `sync-resources` and committed in logical groups for clean git history. Produces the `import-commits` artifact:

1. `sync-modified` → `sync-resources`
2. `apply-renames` → `sync-resources`
3. `import-new` → `sync-resources`
4. `remove-deleted` → `sync-resources`
5. `verify-file-count` → `sync-resources`

### 03 — Update Routing

Updates all prism workflow techniques (plan-analysis, portfolio-analysis, behavioral-pipeline, orchestrate-prism) to reflect resource changes: fixes renamed references, adds goal-mapping entries, expands catalogs. Produces the `routing-commit` artifact. Five steps, each binding `update-skill-routing`:

1. `update-plan-analysis` → `update-skill-routing`
2. `update-portfolio-analysis` → `update-skill-routing`
3. `update-behavioral-pipeline` → `update-skill-routing`
4. `update-orchestrate-prism` → `update-skill-routing`
5. `commit-routing` → `update-skill-routing`

### 04 — Update Documentation

Rebuilds documentation across the resources README, the workflow README, and techniques/TECHNIQUE.md with updated catalog tables, prompt guide entries, and model sensitivity data. Produces the `docs-commit` artifact. Four steps, each binding `update-prism-docs`:

1. `update-resources-readme` → `update-prism-docs`
2. `update-workflow-readme` → `update-prism-docs`
3. `update-techniques-readme` → `update-prism-docs`
4. `commit-docs` → `update-prism-docs`

### 05 — Verify Consistency

Runs five consistency checks then records the result: content integrity against upstream, stale name references, prompt guide routing accuracy, resource count alignment, and duplicate index detection. The `verification-result` checkpoint presents findings and auto-proceeds after 30 seconds unless the user intervenes; choosing "Fix issues" loops back to import-resources. Six steps, each binding `verify-prism-consistency`:

1. `verify-content-integrity` → `verify-prism-consistency`
2. `check-stale-references` → `verify-prism-consistency`
3. `verify-prompt-routing` → `verify-prism-consistency`
4. `verify-resource-counts` → `verify-prism-consistency`
5. `check-duplicate-indices` → `verify-prism-consistency`
6. `set-result` → `verify-prism-consistency` (sets `has_issues`)

### 06 — Commit and Submit

Creates a feature branch if needed, pushes all commits, and creates a pull request against the workflows branch. Produces the `pull-request` artifact. Four steps, each binding `submit-update`:

1. `check-branch` → `submit-update`
2. `push-commits` → `submit-update`
3. `create-pr` → `submit-update`
4. `report-completion` → `submit-update`
