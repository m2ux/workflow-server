---
metadata:
  version: 1.0.0
---

## Capability

List files changed on a pull request via REST.

## Inputs

### pr_number

Pull request number.

## Outputs

### changed_files

Ordered list of changed file paths (each `.filename` from the pulls files endpoint).

## Protocol

### 1. List Files

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).
2. `gh api repos/{owner}/{repo}/pulls/{pr_number}/files --paginate --jq '.[].filename'`; set `{changed_files}` to the resulting path list.
