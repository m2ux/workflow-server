---
metadata:
  version: 1.0.0
---

## Capability

Group the dimensions sharing a pipeline mode into ordered execution groups so each prism run can be triggered with the correct mode and lens set.

## Outputs

### execution_groups

Dimensions grouped by `pipeline_mode` for prism triggering: an array of `{ pipeline_mode, lenses, dimensions, analysis_focus, output_subdir }`.

## Protocol

- Group dimensions sharing a `pipeline_mode` into execution groups.
- Place each `full-prism` dimension in its own group (the 3-pass pipeline cannot be combined).
- Combine `portfolio` dimensions into a single group with `pipeline_mode` `portfolio` and the union of their lens indices; each lens writes its own artifact within the group's `output_subdir`.
- Record `{execution_groups}`: an array of `{ pipeline_mode, lenses, dimensions, analysis_focus, output_subdir }`, ordered `full-prism` groups first, then `portfolio` groups.
