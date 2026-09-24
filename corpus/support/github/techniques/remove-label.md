---
metadata:
  version: 1.0.0
---

## Capability

Remove one label from an issue or pull request via REST.

## Inputs

### issue_number

Issue or pull request number.

### label_name

Label name to remove.

## Protocol

### 1. Resolve Coordinates

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).

### 2. Remove Label

1. Percent-encode `{label_name}` as a single path segment (`:` as `%3A`) and set `{$encoded_label}`.
2. `gh api --method DELETE repos/{owner}/{repo}/issues/{issue_number}/labels/{$encoded_label}`.
   > A missing label answers 404. That issue already lacks `{label_name}`, so the removal stands and the call stops.
