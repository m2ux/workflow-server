---
metadata:
  version: 1.1.0
---

## Capability

Durable record of what a remediation round changed, per finding, with the post-edit validation result.

## Inputs

### selected_findings

The findings selected for repair, each naming the file, the construct and the corrective action its criteria entry prescribes.

### impact_analysis_path

Absolute path to the impact report whose removals inventory is the approval basis for what the run deletes.

### remediation_round

The remediation round these fixes belong to, which a row added by this round names as the stage that raised it.

## Outputs

### fixes_applied

Per-finding record of the file edited, the change made, and the schema-validation result for each affected file after the edit. An entry whose finding was resolved without an edit records that instead.

### impact_analysis

The removals inventory carrying a row for every reduction this round applied that it did not already name, each stating where it happened, what drops, what survives, and `remediation round N` as the stage that raised it. Reads as the `#### artifact` for `impact-analysis.md` at the shape [Template](../../resources/impact-analysis.md#template) declares.

## Protocol

### 1. Record What Changed

- For each entry in `{selected_findings}`, record the file edited, the change made, and the validation result for that file after the edit
- Record a collateral change — anything altered that no finding named — as its own line against the finding whose fix caused it, so it is visible in the durable record rather than absorbed into it

### 2. Inventory What the Round Removed

- Read the removals inventory at `{impact_analysis_path}` and compare it against the reductions this round applied
- For each reduction the inventory does not already name, add a row to `{impact_analysis}` carrying the location, what drops, what survives, and `remediation round {remediation_round}` as the stage that raised it
- Carry the inventory's existing rows through unchanged, so the value persists as the whole inventory rather than this round's rows alone
- Refuse a reduction whose row cannot be composed — one whose surviving home is unknown — and restore the content instead, so nothing leaves the definition without a record of where it went

## Rules

### every-change-is-in-the-record

A change absent from the record is a change nobody can review. Record what actually happened, including an edit that turned out wider than its finding called for, rather than the edit the finding described.

### a-removal-is-inventoried-or-refused

The removals inventory is the approval basis, so it is a complete list of what the run removed rather than what it set out to remove. A reduction this round applies is inventoried with the round named against it, or it is refused and the content restored. A round that deletes content the inventory never names leaves the operator approving a list that no longer describes the change.
