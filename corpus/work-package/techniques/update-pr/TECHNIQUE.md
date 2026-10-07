---
metadata:
  version: 2.8.1
---

## Capability

PR finalization for review — body update and ready mark, or consolidated review-mode commentary.

## Inputs

### branch_name

*(optional)* The feature branch whose commits and PR are being updated. Absent when the run has not opened one.

### pr_number

The PR number being updated

### planning_folder_path

Path to the planning folder holding the implementation summary and artifacts the body draws from

### host_repo_path

Path to the repo root; used with `.engineering/` (in-tree or linked worktree) to resolve the engineering link URL

### target_path

*(optional)* Path to the target checkout (where the PR lives), from which the target repo URL is resolved. Absent when the run has not opened that checkout.

### pr_template_variant

*(optional, enum: `initial` | `final`)* Which PR body template to render

#### default

`final`

## Outputs

### body_conforms

True once the rendered body passes every rule in `rules.pr-body-conformance`; false otherwise

### body_findings

List of `{ rule_id, detail }` entries, one per failed conformance rule; empty when the body conforms

## Rules

### pr-body-conformance

A rendered body satisfies every criterion in [Rules](../../resources/pr-description.md#rules), which is their home — the guide that lays out the body owns what a conforming body looks like. Each failure is one finding named by the criterion it breaks.

### posting

- review-comment-verbatim: The `post-review-comment` op posts the confirmed `{review_summary}` to the PR byte-for-byte — never re-rendering, paraphrasing, or summarizing it. The summary is authored to [review-mode](../../resources/review-mode.md#review-comment-template); posting is a transport step, not a re-authoring one. This is distinct from `render`, which updates the PR description body from a template.

### remote-git-runs-on-the-host-shell

Every technique here that reaches the remote runs under `manage-git.host-shell-for-remote-git`.
