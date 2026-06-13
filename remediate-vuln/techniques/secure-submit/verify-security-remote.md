---
metadata:
  version: 1.0.0
---

## Capability

Confirm the `security` remote is configured inside the target checkout and points at the private fork, so the upcoming push has a verified private destination.

## Outputs

### security_remote_verified

Boolean — `true` when the `security` remote inside `{target_path}` resolves to `{private_fork_url}`.

## Protocol

### 1. Verify Security Remote

- Inside `{target_path}`, read the `security` remote URL and confirm it resolves to `{private_fork_url}`.
- Set `{security_remote_verified}` to `true` on a match; otherwise surface the mismatch and stop.
