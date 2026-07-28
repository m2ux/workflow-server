---
metadata:
  version: 1.0.0
---

## Capability

Change brief for an existing workflow, covering only the dimensions the change alters.

## Inputs

### change_category

The categorised change request — one or more of the categories in [Change Categories](../../resources/update-mode-guide.md#change-categories).

### structural_inventory

Baseline of the target's existing definition: file counts by kind, entity counts, activity ids in prefix order, and what the change touches.

### report_path

*(optional)* Absolute path to a findings register that is the change specification for this run. Empty when the change came from a user request rather than an audit.

## Outputs

### change_brief

The assembled change brief for an existing workflow: purpose, the **changed** members of the guide's update dimension set, and the judgements left open. Unchanged dimensions are absent. Shaped by [Template](../../resources/change-brief.md#template).

#### artifact

`change-brief.md`

### open_judgements_count

Number of design judgements recorded as unresolved in `{change_brief}`. Zero when the change request settled every one.

## Protocol

### 1. Load the Change Sources

- Load `{change_category}`, `{user_description}` and `{structural_inventory}`
- When `{report_path}` is non-empty, load that register and treat its rows as the change specification

### 2. Assemble the Changed Dimensions

- From the update set in [Mode Dimension Sets](../../resources/elicitation-guide.md#mode-dimension-sets), emit only the dimensions that change against the baseline and the change sources; an unchanged dimension is absent from `{change_brief}`, not reprinted from the baseline
- Derive each emitted dimension from the change sources and the baseline; prefer additive edits the sources name, and introduce no structural change the sources do not ask for
- Fold the emitted dimensions into `{change_brief}` at the shape [Template](../../resources/change-brief.md#template) declares, and set `{open_judgements_count}` to the number of judgements the sources leave unresolved
