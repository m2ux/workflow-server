---
metadata:
  version: 1.0.0
---

## Capability

Maintain the target repository's `changes/` changelog fragment for this work package — create one matching sibling fragments and referencing the GitHub issue only when the repo uses a `changes/` folder and no fragment yet ties to this work.

## Inputs

### target_path

Target repository root, checked for a `changes/` folder.

### issue_platform

Issue tracker platform (`github` or `jira`) captured in start-work-package, used to decide how to reference the issue.

### issue_number

The work-package issue number, used to form the `Closes: #{issue_number}` / `Fixes: #{issue_number}` reference.

### issue_url

The full issue URL, used as the reference form when sibling fragments use that style.

## Outputs

### changes_fragment

The `changes/` changelog fragment for this work package, written under the `{target_path}` repository's `changes/` folder. Created only when the repo uses a `changes/` folder and no fragment yet ties to this work; matches sibling fragments' filename convention and section structure and contains a CI-conformant GitHub issue reference.

## Protocol

### 1. Changes Folder

- If `changes/` exists at the `{target_path}` repository root, read sibling fragments as the format template
- Create one new fragment only when none already ties to this issue/PR/work package
- Match filename convention (e.g. `type.issue.ext`) and section structure of existing entries
- REQUIRED: reference the GitHub issue for this work package using the variables already captured in start-work-package — do NOT re-search. When `{issue_platform}`=github, include `Closes: #{issue_number}` or `Fixes: #{issue_number}` (or the full `{issue_url}` form when sibling fragments use that style). When `{issue_platform}`=jira, search for a paired GitHub tracker issue and reference it the same way; if none exists, warn the user that the project's CI check-changes may fail and suggest creating a tracking GitHub issue or applying a skip-changes-check label.
- Validate the completed fragment against CI requirements: must contain a GitHub issue reference matching the regex `github\.com/.+/issues/[0-9]+` or `(Fixes|Closes|Resolves):?\s+#[0-9]+`
