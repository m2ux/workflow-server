---
metadata:
  version: 1.0.0
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

## Protocol

### 1. Compare Against Committed Content

- When `{operation_type}` is `update`, diff `{yaml_file}` against the committed content at the same path and take the material it drops as the run's observed reduction
- Read the removals inventory at `{impact_analysis_path}` and set `{has_unflagged_removals}` true for any observed reduction the inventory does not name
- When `{operation_type}` is `create` there is no committed content and no inventory, so nothing is compared and `{has_unflagged_removals}` is false
