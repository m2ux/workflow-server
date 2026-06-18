---
metadata:
  version: 1.0.0
---

## Capability

Submit the security fix to the private fork: confirm the `security` remote points at a private repository, ensure every commit is GPG-signed, and push the feature branch to the `security` remote only. This group decomposes the submission into ordered operations: [verify-security-remote](./verify-security-remote.md), [verify-commit-signatures](./verify-commit-signatures.md), and [push-secure-commits](./push-secure-commits.md).
