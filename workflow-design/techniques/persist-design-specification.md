---
metadata:
  version: 1.2.0
---

## Capability

Durable planning-folder review surface for the accumulated design specification.

## Outputs

### specification_path

Absolute path to the written design-specification artifact.

#### artifact

`design-specification.md`

## Protocol

### 1. Assemble Specification

- Assemble the specification from `{accumulated_design}` when bound (create elicitation or update synthesis); otherwise from the elicited dimensions that ran for this mode
- Include only facts this artifact homes per the [canonical-home map](./TECHNIQUE.md#canonical-home-map) and [design-specification](../resources/design-specification.md) — purpose and dimension deltas
- Link assumptions, impact, inventory, and other non-home content; do not restate them

### 2. Persist Specification Artifact

- Persist it via the calling activity's bound `manage-artifacts::write-artifact` step with *target_dir* `{planning_folder_path}` and bare filename `design-specification.md`, following [design-specification](../resources/design-specification.md#template)
- Capture the written location as `{specification_path}`

### 3. Mirror Decisions To README

- Mirror key decisions into the planning README Design Decisions section as links to this artifact ([single-source-and-link](./TECHNIQUE.md#single-source-and-link) — do not restate the full spec in the README)
