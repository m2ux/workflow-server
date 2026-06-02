---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 3.0.0
  order: 14
  legacy_id: 14
---

# Manage Artifacts

## Capability

Manage planning artifacts in .engineering/artifacts/planning/ — create folders, enforce activity-based artifact prefixing, and organize documents.

## Rules

### activity-prefix

Artifact filenames are prefixed with the producing activity's `artifactPrefix` (server-computed from the activity filename). Techniques declare bare names (e.g., `code-review.md`); the prefix is applied at write time (e.g., `09-code-review.md`). This groups artifacts by activity and sorts them in workflow order.

### committed-to-parent

Planning artifacts are regular files in the parent repo (`.engineering/artifacts/`). They MUST be committed and pushed to the parent repo before any PR or issue references them via URL, otherwise the link will 404.

### push-before-linking

Any engineering link included in a PR body (📐 Engineering) MUST resolve to a committed file on the remote. Commit and push the planning folder BEFORE creating or updating the PR.
