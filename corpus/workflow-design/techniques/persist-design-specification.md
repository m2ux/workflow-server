---
metadata:
  version: 1.5.0
---

## Capability

Durable planning-folder review surface for the accumulated design specification.

## Inputs

### accumulated_design

*(optional)* The assembled design specification, from the dimension capture on a create run or the update synthesis on an update run. Absent where the specification is assembled from the dimensions that ran for the mode instead.

## Outputs

### design_specification

The design specification for this run: purpose and the dimension deltas, at the shape [Template](../resources/design-specification.md#template) declares.

#### artifact

`design-specification.md`

#### audience

`human`

## Protocol

### 1. Assemble Specification

- Assemble `{design_specification}` from `{accumulated_design}` when bound (create elicitation or update synthesis); otherwise from the elicited dimensions that ran for this mode
- Include only facts this artifact homes per the `canonical-home-map` and the sections it carries, [Template](../resources/design-specification.md#template) and [Rules](../resources/design-specification.md#rules) — purpose and dimension deltas
- Link assumptions, impact, inventory, and other non-home content; do not restate them

### 2. Mirror Decisions To README

- Mirror key decisions into the planning README Design Decisions section as links to this artifact (`single-source-and-link` — do not restate the full spec in the README)
