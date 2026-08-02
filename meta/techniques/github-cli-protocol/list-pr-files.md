---
metadata:
  version: 1.1.0
---

## Capability

List files changed on a pull request via REST.

## Inputs

### pr_number

Pull request number.

## Outputs

### changed_files

Ordered list of changed file paths (each `.filename` from the pulls files endpoint).

### changed_file_entries

Ordered list of changed-file records from the same endpoint: `path` (`.filename`), `status`, `additions`, `deletions`.

## Protocol

### 1. List Files

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).
2. `gh api repos/{owner}/{repo}/pulls/{pr_number}/files --paginate`.
3. Set `{changed_file_entries}` from each item's `.filename`, `.status`, `.additions`, `.deletions`.
4. Set `{changed_files}` to the `.filename` list in the same order.
