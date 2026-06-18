---
metadata:
  version: 1.0.0
---

## Capability

Before pushing, check every commit on the security feature branch for a valid GPG signature and re-sign any that lack one.

## Outputs

### commits_signed

Boolean — `true` when every commit on `{branch_name}` carries a valid GPG signature.

## Protocol

### 1. Verify Commit Signatures

- Inside `{target_path}`, check every commit on `{branch_name}` for a GPG signature.
- When any commit reports no signature, rebase and sign it before proceeding.
- Set `{commits_signed}` to `true` once every commit carries a valid signature.
