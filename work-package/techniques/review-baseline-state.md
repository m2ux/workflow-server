---
metadata:
  version: 1.4.0
---

## Capability

Review-mode baseline for PR evaluation — expected changes against requirements and the base↔PR authored surface.

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

- Apply [view-pr](../../meta/techniques/github-cli-protocol/view-pr.md)(*repo_path*=`{component_git_dir}`); set `{$base_branch}` from `{base_branch}`.
- Check out `{$base_branch}` inside `{target_path}` to analyse the pre-change state: `git -C {target_path} checkout {$base_branch}`.
- Capture the base commit SHA for reference and record it as `{base_sha}`: `git -C {target_path} rev-parse HEAD`.

### 2. Document Expected Changes

- Based on `{requirements}` and the baseline analysis, document what changes SHOULD be made to fulfil the requirements.
- Record this as `{expected_changes}` — it becomes the reference for evaluating whether the actual PR delivers what the requirements ask for.

### 3. Capture Authored Surface

- Check out the PR branch to continue the workflow.
- Apply [list-pr-files](../../meta/techniques/github-cli-protocol/list-pr-files.md)(*repo_path*=`{component_git_dir}`); set `{changed_files}` from the op output.
- Note the base↔PR diff as `{base_pr_diff}` using a fresh three-dot range: `git -C {target_path} diff {$base_branch}...HEAD`.

### 4. Merge-In Guard

- When HEAD is a merge commit or the branch contains merges of `{$base_branch}`, recompute the three-dot set against a freshly resolved merge-base and **log** the merge-in.
- When the authored surface is a document describing code that lives outside it — a specification, a design record, an interface note — re-read its claims against the recomputed base. A merge-in moves that code without touching the document, so the pair drifts with nothing in the diff to show it, and the diff is where a review looks.

## Rules

### review-mode-only

This technique applies only when the work package is in review mode. In normal (authoring) mode there is no PR to baseline against, and the technique is skipped.

### authoritative-authored-surface

`{changed_files}` comes from [list-pr-files](../../meta/techniques/github-cli-protocol/list-pr-files.md). This list is authoritative: it defines the PR's authored surface, and downstream scoping uses it as-is.

### merge-in-guard

When HEAD is a merge commit or the branch has merged `{$base_branch}` in, recompute the diff with a fresh three-dot range against the merge-base and log that a merge-in was detected. Logging is the guard's whole action on code; where the authored surface is a document describing code outside it, the merge-in also sends that document back to be re-read against the new base, since the code it describes can move without appearing in the diff.

### baseline-before-evaluation

Capture `{base_sha}` and `{expected_changes}` before forming any judgement about the PR — the expected-changes reference must be derived from requirements independently of what the PR actually did, so the evaluation is not anchored to the implementation.
