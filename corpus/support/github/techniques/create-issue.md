---
metadata:
  version: 1.0.0
---

## Capability

Raise an issue carrying a title, body and labels, and confirm it persisted before returning its number.

## Inputs

### title

Issue title.

### body

Issue body markdown.

### labels

*(optional)* Comma-separated label names to apply at creation.

## Outputs

### issue_number

The issue number.

### issue_url

HTML URL of the issue.

## Protocol

### 1. Resolve Coordinates

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).

### 2. Create Issue

1. Write `{body}` to a temp file, so a body carrying quotes, backticks or newlines reaches the API as written.
2. `gh api repos/{owner}/{repo}/issues -f title="{title}" -F body=@<file>`, adding one `-f "labels[]=<name>"` per name in `{labels}` when it is set.
3. Set `{issue_number}` from `.number` and `{issue_url}` from `.html_url`.

### 3. Confirm It Persisted

1. `gh api repos/{owner}/{repo}/issues/{issue_number} --jq .number` and check it answers with `{issue_number}`.
   > A number read off a response and never read back is a number the caller records for an issue that may not be there. Where the confirmation fails, leave `{issue_number}` and `{issue_url}` unset, so the caller carries an unsatisfied issue rather than a fabricated one.
