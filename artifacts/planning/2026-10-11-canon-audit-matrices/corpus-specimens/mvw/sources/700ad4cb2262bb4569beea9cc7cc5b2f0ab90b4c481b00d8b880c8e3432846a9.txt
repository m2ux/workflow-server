---
metadata:
  version: 1.0.0
---

## Capability

Inside the target checkout, register the private fork as a git remote named `security`, creating it when absent and updating it when present, so all subsequent git operations have a private destination.

## Outputs

### security_remote_configured

Boolean — `true` when a `security` remote pointing at `{private_fork_url}` is registered inside `{target_path}`.

## Protocol

### 1. Configure Security Remote

- Inside `{target_path}`, register `{private_fork_url}` as a remote named `security`: add it when absent, update its URL when it already exists.
- For a monorepo, register the same `security` remote inside the relevant submodule so submodule pushes also target the private fork.
- Confirm the remote resolves with `` `git -C {target_path} remote -v` `` and set `{security_remote_configured}` to `true`.
