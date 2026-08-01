---
metadata:
  version: 1.2.1
---

## Capability

View an existing pull request via REST.

## Inputs

### pr_number

Pull request number.

### field_projection

*(optional)* `gh api --jq` expression selecting fields from the pull object. When unset, the full pull JSON is returned.

## Protocol

### 1. Fetch Pull

1. Apply [resolve-repo-coordinates](./TECHNIQUE.md#resolve-repo-coordinates).
2. `gh api repos/{$owner}/{$repo}/pulls/{pr_number}` with `--jq {field_projection}` when `{field_projection}` is set.
