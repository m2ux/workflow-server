---
metadata:
  version: 1.0.0
---

## Capability

Apply the approved cleanup — removing the identified artifacts — to the source, then commit the changelog fragment and the strategic-review artifacts on the security feature branch.

## Inputs

### strategic_review_doc

The strategic review document listing the identified artifacts to remove.

## Outputs

### cleanup_commit

A commit on `{branch_name}` carrying the applied cleanup (identified artifacts removed when approved), the `changes/` changelog fragment, and the strategic-review artifacts.

## Protocol

### 1. Apply Cleanup

- Remove the artifacts identified in `{strategic_review_doc}` and record the actions taken in `{strategic_review_doc}`.

### 2. Commit Changes

- Commit the `changes/` fragment and the strategic-review artifacts on `{branch_name}` inside `{target_path}` as `{cleanup_commit}`.
