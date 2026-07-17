---
metadata:
  version: 1.1.3
---

## Capability

Persist the accumulated design specification as a decision surface: purpose plus dimension deltas only.

## Outputs

### specification_path

Absolute path to the written design-specification artifact.

#### artifact

`design-specification.md`

## Protocol

### 1. Assemble Specification

- Assemble from `{accumulated_design}` when bound (create elicitation or update synthesis); otherwise from the elicited dimensions that ran for this mode
- Shape: **purpose** (what outcome stays / what this update does) + **dimension deltas** only (activity list, checkpoints, artifacts, variables, techniques, rules — each as a short table or bullet of what changes). Omit encyclopedia restatement of unchanged dimensions

### 2. Persist Specification Artifact

- Persist it via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with *target_dir* `{planning_folder_path}` and bare filename `design-specification.md`
- Capture the written location as `{specification_path}`

### 3. Mirror Decisions To README

- Add a short pointer under the planning README Design Decisions section linking this artifact (single-source-and-link — do not restate the spec body)
