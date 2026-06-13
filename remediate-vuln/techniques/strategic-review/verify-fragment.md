---
metadata:
  version: 1.0.0
---

## Capability

Maintain the target repository's `changes/` changelog fragment for this fix — create one matching sibling fragments when the repo uses a `changes/` folder and no fragment yet ties to this work, omitting any public issue reference.

## Outputs

### changes_fragment

The `changes/` changelog fragment for this fix, created under the `{target_path}` repository's `changes/` folder only when the repo uses a `changes/` folder and none already ties to this work; matches sibling fragments' filename convention and section structure.

## Protocol

### 1. Verify Fragment

- If a `changes/` directory exists at the `{target_path}` repository root, read its existing fragments as the format template; if none exists, skip this op.
- Determine whether this work already has a matching fragment; create one new fragment only when none does.
- Match the sibling fragments' filename convention and section structure, and commit it on `{branch_name}` when appropriate.
