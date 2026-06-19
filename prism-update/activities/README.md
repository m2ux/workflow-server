# Activities

> prism-update workflow — 5 activities (linear pipeline with a verify → apply-updates retry loop)

Each activity's authoritative definition — steps, checkpoints, transitions — lives in its `NN-<id>.yaml` file (served by `get_activity`). This README is orientation only.

## Activity Sequence

| # | Activity | Role |
|---|----------|------|
| 00 | **[Discover Changes](00-discover-changes.yaml)** | Diff upstream prisms/ against current resources and categorize what changed |
| 01 | **[Review Changes](01-review-changes.yaml)** | Present the change set at a user checkpoint to confirm scope and exclusions |
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

Presents the discovered changes to the user for approval at a blocking checkpoint, where they can confirm the full set, adjust exclusions, or abort. The result is a user-approved change set ready for import.

### 02 — [Apply Updates](02-apply-updates.yaml)

Applies the approved change set across resources, skill routing, and documentation, in that order, so the catalog, every routing table, and all docs reflect the current resource state with no stale prism name references.

### 03 — [Verify Consistency](03-verify.yaml)

Checks content integrity against upstream, stale name references, prompt-guide routing accuracy, resource count alignment, and duplicate indices. A non-blocking checkpoint surfaces the findings; if issues remain, the flow loops back to apply-updates to address them.

### 04 — [Commit and Submit](04-commit-and-submit.yaml)

Ensures a feature branch, pushes the commits, and opens a pull request against the workflows branch — putting the update in front of a reviewer.
