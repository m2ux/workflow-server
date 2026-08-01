---
metadata:
  version: 2.1.1
---

## Capability

View an existing issue via REST.

## Inputs

### issue_number

Issue number.

### field_projection

*(optional)* `gh api --jq` expression selecting fields from the issue object. When unset, the full issue JSON is returned.

## Outputs

### issue_record

The issue as a JSON object (full body, or the `{field_projection}` slice).

## Protocol

### 1. Fetch Issue

1. Apply [resolve-repo-coordinates](./TECHNIQUE.md#resolve-repo-coordinates).
2. `gh api repos/{$owner}/{$repo}/issues/{issue_number}` with `--jq {field_projection}` when `{field_projection}` is set; return the parsed object as `{issue_record}`.
