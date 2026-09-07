---
metadata:
  version: 1.0.0
---

## Capability

Target repository `changes/` changelog fragment for this work package when the repo uses that convention.

## Inputs

### issue_platform

The issue tracker the work package's ticket lives in.

### issue_number

The work-package issue number, used to form the `Closes: #{issue_number}` / `Fixes: #{issue_number}` reference.

### issue_url

The full issue URL, used as the reference form when sibling fragments use that style.

## Outputs

### changes_fragment

The `changes/` changelog fragment for this work package, written under the `{target_path}` repository's `changes/` folder (absent when the repo does not use that convention) — matching sibling fragments' filename convention and section structure, and containing a CI-conformant GitHub issue reference.

## Protocol

### 1. Changes Folder

- If `changes/` exists at the `{target_path}` repository root, read sibling fragments as the format template
- Create one new fragment only when none already ties to this issue/PR/work package
- Match filename convention (e.g. `type.issue.ext`) and section structure of existing entries
- REQUIRED: reference the GitHub issue for this work package from `{issue_number}` and `{issue_url}`. When `{issue_platform}`=github, include `Closes: #{issue_number}` or `Fixes: #{issue_number}` (or the full `{issue_url}` form when sibling fragments use that style). When `{issue_platform}`=jira, search for a paired GitHub tracker issue and reference it the same way; if none exists, record in `{changes_fragment}` that the fragment carries no GitHub reference and that the project's check-changes job will fail on it.
- Validate the completed fragment against the [Changes Fragment Issue Reference](../../resources/strategic-review.md#changes-fragment-issue-reference) forms
