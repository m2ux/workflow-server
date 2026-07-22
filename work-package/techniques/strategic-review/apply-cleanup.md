---
metadata:
  version: 1.2.0
---

## Capability

Approved cleanup on source, with changes-folder fragment committed on the feature branch.

## Inputs

### branch_name

Feature branch the cleanup commit lands on.

### target_path

Target repository root — restore and commit scope for source cleanup and the `changes/` fragment.

### base_ref

*(optional)* Git ref to restore whole-file or hunk removals from (typically the PR base / default branch). Required when any cleanup path is restored from base rather than edited in place.

### strategic_review_doc

The strategic review document listing the identified artifacts to remove when the user approves.

## Outputs

### cleanup_commit

SHA of the feature-branch commit carrying the applied cleanup (identified artifacts removed when approved) and the `changes/` changelog fragment when present. Empty when there was nothing to commit.

## Protocol

### 1. Apply Cleanup

- Apply cleanup (removing identified artifacts) when the user approves.
- Use the edit tool for targeted in-place cleanup modifications.
- When whole files or hunks should match the base again, resolve `{base_ref}` (bound value, else the PR base / default branch as in [review-scope](./review-scope.md)) and Apply [manage-git](../manage-git/TECHNIQUE.md)::[restore-paths-from-ref](../manage-git/restore-paths-from-ref.md) with `{target_path}`, `{base_ref}`, the paths to restore, and `{interactive}` true only when hunk-selective restore is required.

### 2. Commit Changes

- Apply [manage-git](../manage-git/TECHNIQUE.md)::[commit-paths](../manage-git/commit-paths.md) with `{target_path}`, `{branch_name}`, the cleaned source paths plus any `changes/` fragment under `{target_path}`, and a Conventional Commits message for the cleanup. This is the protocol's final phase; no separate source commit step follows.
