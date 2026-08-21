---
metadata:
  version: 2.0.0
---

## Capability

Collects the planned dimensions into the execution groups the analysis stage triggers, one run per group.

## Outputs

### execution_groups

An array of `{ pipeline_mode, lenses, dimensions, analysis_focus, output_subdir }`, ordered `full-prism` groups first, then `portfolio` groups.

## Protocol

### 1. Group by Pipeline Mode

- Group the dimensions of `{dimension_plan}` that share a `pipeline_mode`.  
  > A `full-prism` dimension takes a group of its own — its three passes run over one target and admit no second dimension.  
  > `portfolio` dimensions combine into one group carrying the union of their lens indices, each lens writing its own artifact under the group's `output_subdir`.

### 2. Record the Groups

- Record `{execution_groups}` in run order, `full-prism` groups ahead of `portfolio` groups.
