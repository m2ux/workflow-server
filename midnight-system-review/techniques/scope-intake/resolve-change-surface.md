---
metadata:
  version: 1.0.0
---

## Capability

Resolve the review target into the authoritative changed-file surface — the GitHub-listed file set for a pull request, or the three-dot merge-base diff for a local change-set — and record it as the change-surface inventory every downstream activity reads.

## Inputs

### review_target

PR reference (number or URL) or local diff spec identifying the change-set under review.

### base_ref

Base ref for the three-dot merge-base diff when the target is a local change-set, and the cross-check base for PR targets.

## Outputs

### change_surface_inventory

The authoritative changed-file inventory: target identity, base and head refs, each changed file with its change kind and line counts, and a preliminary mapping of changed paths to crates and pallets.

#### artifact

`change-surface.md`

### pr_number

The pull-request number, emitted when the target resolves to a PR. Consumed by the publish operations via implicit same-name binding.

### has_pr_surface

True when the target resolves to a pull request with a postable review surface; false for local change-sets. Gates the publish-decision checkpoint and the publish-review activity.

## Protocol

### 1. Classify Target

- Parse `{review_target}`: a PR number or GitHub PR URL selects PR mode; anything else (branch, ref range, working tree) selects local-diff mode.

### 2. Resolve PR Surface

- In PR mode, resolve the changed-file set from GitHub: `gh pr view` for head/base metadata and `gh pr diff --name-only` (equivalently the API file list) for the authoritative authored surface.
- Record the head and base SHAs, set `{has_pr_surface}` true, and emit `{pr_number}`.
  > If the PR cannot be resolved (not found, auth failure), report the failure and stop — a review against a guessed surface is worse than no review.

### 3. Resolve Local Surface

- In local-diff mode, compute the three-dot merge-base diff against `{base_ref}` (`git diff {base_ref}...HEAD --name-status` plus per-file stats) from `{target_repo_path}`.
- Set `{has_pr_surface}` false.

### 4. Record Inventory

- Write `{change_surface_inventory}` to the planning folder: target identity, refs, the changed-file table (path, change kind, lines added/removed), and the preliminary path-to-crate/pallet mapping that seeds area derivation.
