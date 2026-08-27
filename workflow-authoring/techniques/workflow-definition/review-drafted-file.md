---
metadata:
  version: 1.1.0
---

## Capability

Detection of content a drafted file removes that no removals inventory accounted for.

## Inputs

### current_file

The manifest entry just drafted — full path, action, kind and the one-line statement of its change.

### yaml_file

The authored file at that entry's path, as just written.

### operation_type

The classified operation for the request — create, update or review.

### impact_analysis_path

*(optional)* Absolute path to the impact report whose removals inventory the comparison is measured against. Absent on a run with no existing definition to assess, where there is nothing to compare.

## Outputs

### has_unflagged_removals

True when `{operation_type}` is `update` and the drafted file removes material that the removals inventory does not account for; false otherwise, including whenever there is no committed content to compare against.

### impact_analysis

The removals inventory carrying a row for every observed reduction, each stating where it happened, what drops, what survives and the stage that raised it. Reads as the `#### artifact` for `impact-analysis.md` at the shape [Template](../../resources/impact-analysis.md#template) declares, so the writer persists it into the numbered instance intake created.

## Protocol

### 1. Compare Against Committed Content

- When `{operation_type}` is `update`, diff `{yaml_file}` against the committed content at the same path and take the material it drops as the run's observed reduction
- Read the removals inventory at `{impact_analysis_path}` and set `{has_unflagged_removals}` true for any observed reduction the inventory does not name
- When `{operation_type}` is `create` there is no committed content and no inventory, so nothing is compared and `{has_unflagged_removals}` is false

### 2. Compose the Row Each Uninventoried Reduction Needs

- For every observed reduction the inventory does not name, add a row to `{impact_analysis}`'s removals inventory carrying the location, what drops, what survives, and `Raised at` naming the stage that observed it — the drafting pass for a file, or the remediation round for an audit fix
- Carry the inventory's existing rows through unchanged, so the value persists as the whole inventory rather than the new rows alone
- When `{has_unflagged_removals}` is false there is nothing to add, and `{impact_analysis}` carries the inventory exactly as read

## Rules

### a-removal-is-inventoried-or-restored

A reduction the inventory does not name leaves this operation with a row composed for it. It reaches the file when the operator keeps the draft, and is discarded when the operator restores the content — so the inventory ends the run naming every removal the run actually made. Content no finding and no manifest entry calls for is preserved, not removed quietly.
