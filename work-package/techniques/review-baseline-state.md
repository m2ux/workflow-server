---
metadata:
  version: 1.1.0
---

## Capability

Review-mode baseline for PR evaluation — expected changes against requirements and the base↔PR authored surface.

## Inputs

### base_branch

Base branch the PR targets (the pre-change baseline to check out and diff against)

### requirements

The ticket requirements used to derive what changes the PR is expected to make

### target_path

Path to the target checkout where the git operations run

### pr_number

PR identifier, used to read the authoritative changed-files list via `gh pr view`

## Outputs

### base_sha

Commit SHA of the base branch at the time of analysis

### expected_changes

Reference description of the changes that should be made to fulfil the requirements — the yardstick for evaluating the actual PR

### changed_files

The authored surface of the PR — GitHub's changed-files list. The canonical set every downstream review finding is scoped to.

### base_pr_diff

The base↔PR diff (fresh three-dot `{base_branch}...HEAD`), noted for later comparison

## Protocol

### 1. Checkout Baseline State

- Check out the `{base_branch}` inside `{target_path}` to analyse the pre-change state: `git -C {target_path} checkout {base_branch}`.
- Capture the base commit SHA for reference and record it as `{base_sha}`: `git -C {target_path} rev-parse HEAD`.

### 2. Document Expected Changes

- Based on `{requirements}` and the baseline analysis, document what changes SHOULD be made to fulfil the requirements.
- Record this as `{expected_changes}` — it becomes the reference for evaluating whether the actual PR delivers what the requirements ask for.

### 3. Capture Authored Surface

- Check out the PR branch to continue the workflow.
- Record the authoritative changed-files list as `{changed_files}`: `gh pr view {pr_number} --json files --jq '.files[].path'`.
- Note the base↔PR diff as `{base_pr_diff}` using a fresh three-dot range: `git -C {target_path} diff {base_branch}...HEAD`.

### 4. Merge-In Guard

- When HEAD is a merge commit or the branch contains merges of `{base_branch}`, recompute the three-dot set against a freshly resolved merge-base and **log** the merge-in.


## Rules

### review-mode-only

This technique applies only when the work package is in review mode. In normal (authoring) mode there is no PR to baseline against, and the technique is skipped.

### authoritative-authored-surface

`{changed_files}` comes from GitHub's changed-files list (`gh pr view --json files`). This list is authoritative: it defines the PR's authored surface, and downstream scoping uses it as-is.

### merge-in-guard

When HEAD is a merge commit or the branch has merged `{base_branch}` in, recompute the diff with a fresh three-dot range against the merge-base and log that a merge-in was detected. The guard's sole action is to log.

### baseline-before-evaluation

Capture `{base_sha}` and `{expected_changes}` before forming any judgement about the PR — the expected-changes reference must be derived from requirements independently of what the PR actually did, so the evaluation is not anchored to the implementation.
