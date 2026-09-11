---
metadata:
  version: 1.1.0
---

## Capability

Change brief for a new workflow, elicited one design dimension at a time.

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

### 1. Select the Dimension Set

- Take the create set, in its stated order, from [Mode Dimension Sets](../../resources/elicitation-guide.md#mode-dimension-sets) — do not restate or reorder the list here

### 2. Capture Each Dimension

- For each dimension in that order, surface the anchor questions from [Dimensions](../../resources/elicitation-guide.md#dimensions) and record the user's answers at the Capture depth that section states for the dimension
- Omit a question already settled by an answer to an earlier dimension
- Where an answer the user did not give would have to be invented, record the gap as an open judgement instead of choosing for them

### 3. Assemble the Change Brief

- Fold the captures into `{change_brief}` at the shape [Template](../../resources/change-brief.md#template) declares
- Record each open judgement as a row of the brief's judgements table and set `{open_judgements_count}` to the number of rows

## Rules

### judgement-not-invention

An unsettled design question is recorded as an open judgement, never resolved by picking a plausible default. A brief that reads as complete because its gaps were filled silently is worse than one that names them.
