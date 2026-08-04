---
metadata:
  version: 2.2.0
---

## Capability

Assemble the review's authoritative changed-file inventory artifact from already-resolved surface data. Does not call GitHub or run git diffs — the binding activity supplies PR leaves or the three-dot leaf first.

## Inputs

### review_target

PR reference or local diff spec identifying the change-set under review (identity only; classification already ran).

### base_ref

Base ref recorded on the inventory (three-dot base, or the PR cross-check base).

### has_pr_surface

Whether the target is a pull request with a postable review surface.

### pr_number

*(optional when `{has_pr_surface}` is false)* Pull-request number when the surface is a PR.

### head_sha

Head commit SHA of the authored surface.

### base_sha

*(optional)* Base or merge-base SHA when the producing leaf emitted it.

### base_branch

*(optional)* Base branch name when the PR leaf emitted it.

### changed_files

Ordered path list of the authoritative authored surface.

### changed_file_entries

*(optional)* Per-path status and line counts when the producing leaf emitted them; when unset, the inventory records paths from `{changed_files}` without per-file stats.

### planning_folder_path

Folder that receives `change-surface.md`.

### target_repo_path

Checkout under review — used only to map paths to crates and pallets for the preliminary inventory column.

## Outputs

### change_surface_inventory

The authoritative changed-file inventory: target identity, base and head refs, each changed file with its change kind and line counts when known, and a preliminary mapping of changed paths to crates and pallets.

#### artifact

`change-surface.md`

#### audience

`human`

### has_pr_surface

Echo of the intake classification so publish gates keep a single name.

### pr_number

*(optional when `{has_pr_surface}` is false)* Echo of the PR number for publish ops.

## Protocol

### 1. Require Surface Data

1. Require `{changed_files}` non-empty, or an explicit empty authored surface with `{head_sha}` set. When `{has_pr_surface}` is true, require `{pr_number}` and `{head_sha}`. When the surface is missing after the activity's transport steps, stop — a review against a guessed surface is worse than no review.

### 2. Map Paths

1. For each path in `{changed_files}` (and each row of `{changed_file_entries}` when present), derive change kind and line counts from the entry when available.
2. Map each path to a preliminary crate/pallet using layout under `{target_repo_path}` (seeds area derivation).

### 3. Record Inventory

1. Write `{change_surface_inventory}` under `{planning_folder_path}` as `change-surface.md` per [change-surface](../../resources/change-surface.md#template) and its [Rules](../../resources/change-surface.md#rules), filling it from `{review_target}`, `{has_pr_surface}`, `{pr_number}`, `{base_ref}`, `{base_branch}`, `{base_sha}`, `{head_sha}` and the mapped paths.
