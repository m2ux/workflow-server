---
metadata:
  version: 1.0.0
---

## Capability

Apply the approved cleanup (removing identified artifacts) to the source, then commit the changes-folder fragment and the strategic-review artifacts on the feature branch. This is the group's terminal operation; no separate commit step follows.

## Inputs

### branch_name

Feature branch the cleanup and the artifact commit land on; inherited from the [strategic-review](./TECHNIQUE.md) group root.

### strategic_review_doc

The strategic review document listing the identified artifacts to remove (when the user approves) and committed alongside the changelog fragment.

## Outputs

### cleanup_commit

A commit on `{branch_name}` carrying the applied cleanup (identified artifacts removed when approved), the `changes/` changelog fragment, and the strategic-review artifacts, produced via [manage-git](../../../meta/techniques/manage-git/TECHNIQUE.md)::[artifact-commits](../../../meta/techniques/manage-git/artifact-commits.md). The group's terminal output; no separate commit step follows.

## Protocol

### 1. Apply Cleanup

- Apply cleanup (removing identified artifacts) when user approves
- Use edit tool for cleanup modifications

### 2. Commit Changes

- Apply [manage-git](../../../meta/techniques/manage-git/TECHNIQUE.md)::[artifact-commits](../../../meta/techniques/manage-git/artifact-commits.md) to commit the `changes/` fragment and the strategic-review artifacts on `{branch_name}`. This is the protocol's final phase; no separate commit step follows.
