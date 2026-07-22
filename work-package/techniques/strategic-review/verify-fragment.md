---
metadata:
  version: 1.0.0
---

## Capability

Whether the work-package change fragment under the target path references the issue.

## Inputs

### target_path

Target repository root, checked for a `changes/` folder and the located fragment.

### issue_url

The full issue URL whose verbatim (or equivalent GitHub-reference) presence in the fragment body is verified.

### issue_number

The work-package issue number, surfaced in the remediation guidance (`Closes: #{issue_number}`) when the reference is absent.

## Outputs

### fragment_references_issue

`true` when the located fragment body contains `{issue_url}` verbatim; `false` when it does not; `null` when no `changes/` directory exists at the `{target_path}` root (skip).


## Protocol

### 1. Locate Fragment

- If no `changes/` directory exists at the `{target_path}` repository root, set `{fragment_references_issue}` = null and skip the remaining steps.
- Otherwise, locate the fragment that ties to this issue/PR/work package (created or matched by [changes-folder](./changes-folder.md)).

### 2. Verify Issue Reference

- Read the located fragment body and check whether it contains `{issue_url}` verbatim, or an equivalent GitHub issue reference matching `github\.com/.+/issues/[0-9]+` or `(Fixes|Closes|Resolves):?\s+#[0-9]+`.
- Set `{fragment_references_issue}` = true when the reference is present, false when it is absent.
- When false, surface the remediation guidance: add a `Closes: #{issue_number}` line or the full `{issue_url}`, commit, and re-run.
