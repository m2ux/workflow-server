---
metadata:
  version: 1.0.0
---

## Capability

Whether the work-package change fragment under the target path references the issue.

## Inputs

### changes_fragment

*(optional)* The changelog fragment written for this work package, when one was produced — the body checked for the issue reference.

### issue_url

The full issue URL whose verbatim (or equivalent GitHub-reference) presence in the fragment body is verified.

## Outputs

### fragment_references_issue

`true` when the located fragment body contains `{issue_url}` verbatim; `false` when it does not; `null` when no `changes/` directory exists at the `{target_path}` root (skip).

## Protocol

### 1. Locate Fragment

- If no `changes/` directory exists at the `{target_path}` repository root, set `{fragment_references_issue}` = null and skip the remaining steps.
- Otherwise, locate the fragment that ties to this issue/PR/work package (created or matched by [changes-folder](./changes-folder.md)).

### 2. Verify Issue Reference

- Read the located fragment body and check whether it contains `{issue_url}` verbatim, or an equivalent reference in either of the [Changes Fragment Issue Reference](../../resources/strategic-review.md#changes-fragment-issue-reference) forms.
- Set `{fragment_references_issue}` = true when the reference is present, false when it is absent.
