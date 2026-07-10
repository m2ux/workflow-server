---
metadata:
  version: 1.0.0
---

## Capability

Confirm the configured push remote exists inside the target checkout and points at a private repository, so an upcoming push has a verified non-public destination.

## Inputs

### push_remote

The git remote to verify (e.g. `security`).

### private_fork_url

*(optional)* Expected URL of the private repository backing `{push_remote}`. When supplied, the remote URL must resolve to it exactly; when absent, the remote's repository visibility must still verify as private.

## Outputs

### push_remote_verified

Boolean — `true` when `{push_remote}` inside `{target_path}` resolves to a private repository (and to `{private_fork_url}` when supplied).

### push_remote_url

The URL `{push_remote}` resolves to, surfaced for the user-facing isolation confirmation.

## Protocol

### 1. Verify Push Remote

- Inside `{target_path}`, read the `{push_remote}` remote URL and capture it as `{push_remote_url}`.
- When `{private_fork_url}` is supplied, confirm `{push_remote_url}` resolves to it; otherwise verify the repository's visibility is private.
- Set `{push_remote_verified}` to `true` on success; otherwise surface the mismatch and stop — do not proceed to any push.
