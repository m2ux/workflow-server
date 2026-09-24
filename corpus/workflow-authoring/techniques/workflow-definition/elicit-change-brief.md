---
metadata:
  version: 1.1.0
---

## Capability

Change brief for a new workflow, assembled from the dimension captures.

## Inputs

### design_dimensions

The create-mode dimensions in guide order.

### dimension_captures

The answers recorded for those dimensions. Empty when no person was asked.

## Outputs

### change_brief

The assembled change brief for a new workflow: purpose, the dimension captures the guide's create set calls for, and the judgements left open. Shaped by [Template](../../resources/change-brief.md#template).

#### artifact

`change-brief.md`

#### audience

`human`

### open_judgements_count

Number of design judgements recorded as unresolved in `{change_brief}`. Zero when every dimension settled.

## Protocol

### 1. Assemble the Change Brief

- Fold `{dimension_captures}` into `{change_brief}` at the shape [Template](../../resources/change-brief.md#template) declares, in `{design_dimensions}` order
- Omit a question already settled by an earlier capture
- Where `{dimension_captures}` has no answer a dimension needs, record the gap as an open judgement
- Set `{open_judgements_count}` to the number of open-judgement rows

## Rules

### judgement-not-invention

An unsettled design question is recorded as an open judgement, never resolved by picking a plausible default. A brief that reads as complete because its gaps were filled silently is worse than one that names them.
