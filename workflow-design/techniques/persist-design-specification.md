---
metadata:
  version: 1.1.0
---

## Capability

Persist the accumulated design specification elicited across the design dimensions into the planning folder as a durable review surface.

## Outputs

### specification_path

Absolute path to the written design-specification artifact.

#### artifact

`design-specification.md`

## Protocol

### 1. Assemble Specification

- Assemble the full elicited specification from the elicited dimensions (purpose, activity list, activity model when elicited, checkpoints, artifacts, variables, techniques, rules — whichever dimensions ran for this mode)

### 2. Persist Specification Artifact

- Persist it via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with `target_dir` `{planning_folder_path}` and bare filename `design-specification.md`
- Capture the written location as `{specification_path}`

### 3. Mirror Decisions To README

- Mirror key decisions into the planning README Design Decisions section as links to this artifact (single-source-and-link — do not restate the full spec in the README)
