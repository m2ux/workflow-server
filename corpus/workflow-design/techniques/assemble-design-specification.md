---
metadata:
  version: 1.5.0
---

## Capability

The design specification for this run, assembled for linked review.

## Inputs

### accumulated_design

*(optional)* The accumulated design specification across the design dimensions that ran. Absent where the elicited dimensions are the only record of the design.

## Outputs

### design_specification

The design specification for this run: purpose and the dimension deltas, at the shape [Template](../resources/design-specification.md#template) declares.

#### artifact

`design-specification.md`

#### audience

`human`

## Protocol

### 1. Assemble Specification

- Assemble `{design_specification}` from `{accumulated_design}` when bound; otherwise from the elicited dimensions that ran
- Include only facts this artifact homes per the `canonical-home-map` and the sections it carries, [Template](../resources/design-specification.md#template) and [Rules](../resources/design-specification.md#rules) — purpose and dimension deltas
- Link assumptions, impact, inventory, and other non-home content; do not restate them
