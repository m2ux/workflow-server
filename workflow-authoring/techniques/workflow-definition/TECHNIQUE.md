---
metadata:
  version: 1.0.0
---

## Capability

Shared contract for the operations that classify, author and audit workflow definition files.

## Rules

### edit-surface-is-the-evidence

Definition files are read and written under `{target_path}`. The served catalog answers from the library checkout, which can lag the branch under change, so a claim taken from it is not evidence about the files this run edits.
