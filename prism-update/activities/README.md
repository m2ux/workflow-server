# Activities

> prism-update workflow — 7 sequential activities

## Activity Sequence

| # | Activity | Skill | Checkpoints | Transitions |
|---|----------|-------|-------------|-------------|
| 00 | **Discover Changes** | `diff-upstream` | — | → review-changes |
| 01 | **Review Changes** | `diff-upstream` | `change-review` | → import-resources |
| 02 | **Import Resources** | `sync-resources` | — | → update-routing |
| 03 | **Update Routing** | `update-skill-routing` | — | → update-docs |
| 04 | **Update Docs** | `update-prism-docs` | — | → verify |
| 05 | **Verify** | `verify-prism-consistency` | `verification-result` | → commit-and-submit (no issues) / → import-resources (issues) |
| 06 | **Commit and Submit** | `sync-resources` | — | — (terminal) |

## Flow

```
discover-changes → review-changes → import-resources → update-routing → update-docs → verify → commit-and-submit
                                                                                          ↑                      
                                                                                          └── (if has_issues) ───┘
```

## Activity Details

### 00 — Discover Changes

Diffs the upstream prisms directory against current workflow resources. Categorizes each prism as new, modified, renamed, or deleted. Classifies new prisms by family and determines the next available resource index.

### 01 — Review Changes

Presents discovered changes to the user for approval. The `change-review` checkpoint allows the user to confirm all changes, adjust exclusions, or abort the workflow.

### 02 — Import Resources

Applies all approved resource file changes in four stages (sync modified, apply renames, import new, remove deleted), each committed separately for clean git history.

### 03 — Update Routing

Updates all prism workflow skills (plan-analysis, portfolio-analysis, behavioral-pipeline, orchestrate-prism) to reflect resource changes: fixes renamed references, adds goal-mapping entries, expands catalogs.

### 04 — Update Docs

Rebuilds documentation across resources/README.md, workflow README.md, and skills/README.md with updated catalog tables, prompt guide entries, and model sensitivity data.

### 05 — Verify

Runs four consistency checks: stale name references, prompt guide routing accuracy, resource count alignment, and duplicate index detection. The `verification-result` checkpoint presents findings and auto-proceeds after 30 seconds unless the user intervenes.

### 06 — Commit and Submit

Creates a feature branch if needed, pushes all commits, and creates a pull request against the workflows branch.
