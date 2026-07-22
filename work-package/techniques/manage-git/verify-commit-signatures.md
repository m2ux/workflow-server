---
metadata:
  version: 1.0.0
---

## Capability

Feature-branch GPG signature hygiene before push — every commit signed.

## Outputs

### commits_signed

Boolean — `true` when every commit on `{branch_name}` carries a valid GPG signature.


## Protocol

### 1. Verify Commit Signatures

- Inside `{target_path}`, check every commit on `{branch_name}` for a GPG signature.
- When any commit reports no signature, rebase and sign it before proceeding.
- Set `{commits_signed}` to `true` once every commit carries a valid signature.
