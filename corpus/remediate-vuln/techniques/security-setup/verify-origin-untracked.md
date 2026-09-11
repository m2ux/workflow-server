---
metadata:
  version: 1.0.0
---

## Capability

Confirm the current branch does not track the public `origin` remote, so no later push can reach a public destination.

## Outputs

### origin_untracked

Boolean — `true` when the current branch in `{target_path}` has no upstream on `origin`.

## Protocol

### 1. Verify Origin Untracked

- Inside `{target_path}`, inspect the current branch's upstream and confirm it is not set to a branch on `origin`.
- Set `{origin_untracked}` to `true` when the branch tracks no `origin` upstream; otherwise surface the misconfiguration — an `origin` upstream is a public-disclosure path — and stop.
