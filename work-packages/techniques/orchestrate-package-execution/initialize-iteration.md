---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Prepare the ordered list of packages not yet started and initialize the overall-progress indicator from the priority order and completed set.

## Inputs

### priority_order

Full priority order for reference

### completed_packages

Completed package names; arrives populated if provided

## Protocol

### 1. Initialize Iteration

- Derive `{remaining_packages}` from `{priority_order}` minus `{completed_packages}`
- Count the packages in `{priority_order}` as `{$total}` and `{completed_packages}` as `{$completed}`
- Set `{overall_progress}` to '`{completed}`/`{total}` complete'

## Outputs

### remaining_packages

Ordered list of packages not yet started

### overall_progress

Progress indicator (e.g., '3/7 complete')
