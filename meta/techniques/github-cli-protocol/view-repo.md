---
metadata:
  version: 1.0.1
---

## Capability

View repository merge settings via REST.

## Outputs

### squash_merge_supported

True when the repository allows squash merges (`.allow_squash_merge`).

## Protocol

### 1. Fetch Repository

1. Apply [resolve-repo-coordinates](./TECHNIQUE.md#resolve-repo-coordinates).
2. `gh api repos/{$owner}/{$repo} --jq .allow_squash_merge`; set `{squash_merge_supported}` from the result.
