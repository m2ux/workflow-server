---
metadata:
  version: 1.0.0
---

## Capability

In review mode, establish the baseline against which a PR is evaluated: check out the base branch (the PR target), capture its commit SHA, document the changes that SHOULD be made to fulfil the requirements, then return to the PR branch and record the base↔PR diff for later comparison.

## Inputs

### base_branch

Base branch the PR targets (the pre-change baseline to check out and diff against)

### requirements

The ticket requirements used to derive what changes the PR is expected to make

### target_path

Path to the target checkout where the git operations run

## Outputs

### base_sha

Commit SHA of the base branch at the time of analysis

### expected_changes

Reference description of the changes that should be made to fulfil the requirements — the yardstick for evaluating the actual PR

### base_pr_diff

The diff between the base branch and the PR branch, noted for later comparison

## Protocol

### 1. Checkout Baseline State

- Check out the `{base_branch}` inside `{target_path}` to analyse the pre-change state: `git -C {target_path} checkout {base_branch}`.
- Capture the base commit SHA for reference and record it as `{base_sha}`: `git -C {target_path} rev-parse HEAD`.

### 2. Document Expected Changes

- Based on `{requirements}` and the baseline analysis, document what changes SHOULD be made to fulfil the requirements.
- Record this as `{expected_changes}` — it becomes the reference for evaluating whether the actual PR delivers what the requirements ask for.

### 3. Return to PR Branch

- Check out the PR branch to continue the workflow.
- Note the diff between the base branch and the PR branch and record it as `{base_pr_diff}`: `git -C {target_path} diff {base_sha}..HEAD`.

## Rules

### review-mode-only

This technique applies only when the work package is in review mode. In normal (authoring) mode there is no PR to baseline against, and the technique is skipped.

### baseline-before-evaluation

Capture `{base_sha}` and `{expected_changes}` before forming any judgement about the PR — the expected-changes reference must be derived from requirements independently of what the PR actually did, so the evaluation is not anchored to the implementation.
