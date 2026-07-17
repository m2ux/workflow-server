---
metadata:
  version: 1.0.0
---

## Capability

Persist the accumulated design specification elicited across the design dimensions into the planning folder so `spec-confirmed` can link the user to a durable review surface.

## Outputs

### specification_path

Absolute path to the written design-specification artifact. Interpolated into the `spec-confirmed` checkpoint message as a markdown link.

#### artifact

`design-specification.md`

## Protocol

### 1. Persist Specification

- Assemble the full elicited specification from the dimension-elicitation loop (purpose, activity list, activity model when elicited, checkpoints, artifacts, variables, techniques, rules — whichever dimensions ran for this mode)
- Persist it via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with `target_dir` `{planning_folder_path}` and bare filename `design-specification.md`
- Capture the written location as `{specification_path}`
- Mirror key decisions into the planning README Design Decisions section as links to this artifact (single-source-and-link — do not restate the full spec in the README)
