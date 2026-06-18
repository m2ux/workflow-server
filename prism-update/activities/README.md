# Activities

> prism-update workflow — 5 activities (linear pipeline with a verify → apply-updates retry loop)

Each activity's authoritative definition — steps, checkpoints, transitions — lives in its `NN-<id>.toon` file (served by `get_activity`). This README is orientation only.

## Activity Sequence

| # | Activity | Role |
|---|----------|------|
| 00 | **[Discover Changes](00-discover-changes.toon)** | Diff upstream prisms/ against current resources and categorize what changed |
| 01 | **[Review Changes](01-review-changes.toon)** | Present the change set at a user checkpoint to confirm scope and exclusions |
| 02 | **[Apply Updates](02-apply-updates.toon)** | Import resource changes, then bring skill routing and docs into line with them |
| 03 | **[Verify Consistency](03-verify.toon)** | Confirm no stale references, routing mismatches, or count/index errors remain |
| 04 | **[Commit and Submit](04-commit-and-submit.toon)** | Land the update as a feature branch and open a pull request |

## Flow

```
discover-changes → review-changes → apply-updates → verify → commit-and-submit
                                          ↑              │
                                          └── (if has_issues) ──┘
```

## Activity Details

### 00 — [Discover Changes](00-discover-changes.toon)

Diffs the upstream prisms directory against current workflow resources, categorizing each prism as new, modified, renamed, or deleted and classifying new prisms by family. The import then proceeds against a well-understood scope.

### 01 — [Review Changes](01-review-changes.toon)

Presents the discovered changes to the user for approval at a blocking checkpoint, where they can confirm the full set, adjust exclusions, or abort. The result is a user-approved change set ready for import.

### 02 — [Apply Updates](02-apply-updates.toon)

Applies the approved change set across resources, skill routing, and documentation, in that order, so the catalog, every routing table, and all docs reflect the current resource state with no stale prism name references.

### 03 — [Verify Consistency](03-verify.toon)

Checks content integrity against upstream, stale name references, prompt-guide routing accuracy, resource count alignment, and duplicate indices. A non-blocking checkpoint surfaces the findings; if issues remain, the flow loops back to apply-updates to address them.

### 04 — [Commit and Submit](04-commit-and-submit.toon)

Ensures a feature branch, pushes the commits, and opens a pull request against the workflows branch — putting the update in front of a reviewer.
