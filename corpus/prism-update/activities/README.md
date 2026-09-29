# Activities

> prism-update workflow — linear pipeline with a verify → apply-updates retry loop

Each activity's authoritative definition — steps, checkpoints, exits — lives in its `NN-<id>.yaml` file (served by `get_activity`). This README is orientation only.

## Activity Sequence

| # | Activity | Role |
|---|----------|------|
| 00 | **[Discover Changes](00-discover-changes.yaml)** | Diff upstream `prisms/` against current resources and categorize what changed |
| 01 | **[Review Changes](01-review-changes.yaml)** | Settle the change set's scope and exclusions with the user |
| 02 | **[Apply Updates](02-apply-updates.yaml)** | Import resource changes, then bring skill routing and docs into line with them |
| 03 | **[Verify Consistency](03-verify.yaml)** | Confirm no stale references, routing mismatches, or count/index errors remain |
| 04 | **[Commit and Submit](04-commit-and-submit.yaml)** | Land the update as a feature branch and open a pull request |

## Flow

```
discover-changes → review-changes → apply-updates → verify → commit-and-submit
                                          ↑              │
                                          └── (if has_issues) ──┘
```

## Activity Details

### 00 — [Discover Changes](00-discover-changes.yaml)

Diffs the upstream prisms directory against current workflow resources, categorizing each prism as new, modified, renamed, or deleted and classifying new prisms by family. The import then proceeds against a well-understood scope.

### 01 — [Review Changes](01-review-changes.yaml)

Produces the user-approved change set the import works from.

### 02 — [Apply Updates](02-apply-updates.yaml)

Applies the approved change set so the catalog, every routing table, and all docs reflect the current resource state with no stale prism name references.

### 03 — [Verify Consistency](03-verify.yaml)

Checks that the applied update is consistent with upstream and across the workflow's resources, routing, and docs. Remaining issues route back to apply-updates.

### 04 — [Commit and Submit](04-commit-and-submit.yaml)

Puts the update in front of a reviewer as a pull request against the workflows branch.
